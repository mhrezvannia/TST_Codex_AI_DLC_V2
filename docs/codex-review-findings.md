# Codex / AI-DLC v2 Output Review — LinerCore Enterprise

> Reviewer: Claude (Opus 4.8) · Date: 2026-07-11 · Branch: `enterprise/linercore`
> Scope requested: **code correctness**, **architecture integrity**, **completeness/gaps**. AI-DLC conformance used as a supporting lens.
> Baseline commit for the graph/docs: `3ff499df`.

## How this review was done

This is not a docs-only read. Findings below were verified against the actual source tree and toolchain:

- Read the "promise" docs: `program-vision-document.md`, `program-execution-plan.md`, `system-workflow-map.md`, `quality-gates.md`, `enterprise-gap-summary.md`, `erp-flow-checkpoint.md`, and the three `enterprise-contracts/*.md`.
- Compiled and ran the backend: `mvn -f services/pom.xml test` → **passes, exit 0** (245 Java files, 5 services).
- Traced the live code paths for the `booking.confirmed` and `containermovement.status` flows through domain-core → application-service → container adapters.
- Inspected the event/outbox/publisher wiring, the contract-verification scripts, and the frontend data layer.

**Headline:** the code is *not* slop. The hexagonal layering is clean, the domain models are real, tests pass. The problem is a different and more dangerous class: **the system presents an event-driven, contract-verified enterprise architecture that does not actually exist at runtime.** The scaffolding is mistaken for the implementation, and the quality gates are structured so they never catch it.

---

## Severity legend

| Level | Meaning |
| --- | --- |
| 🔴 Critical | Core advertised capability is non-functional or silently inconsistent in production |
| 🟠 High | Real correctness/architecture defect; will bite under failure or load |
| 🟡 Medium | Gap, false-confidence, or maturity asymmetry that undermines trust in the codebase |
| 🟢 Good | Worth preserving — done correctly |

---

## 🔴 C1 — The event-driven architecture is a facade; nothing publishes to Kafka

**Evidence:**
- The only event publisher in the entire codebase is [`PlaceholderKafkaReferenceEventPublisher`](services/reference-data-service/messaging/src/main/java/com/linercore/platform/referencedata/messaging/PlaceholderKafkaReferenceEventPublisher.java:11). Its `publish(...)` returns fabricated `BrokerMetadata("referencedata.events", 0, offset++, now)` and **does nothing** — no Kafka client, no network call.
- This placeholder, plus `PlaceholderSchemaRegistryAdapter`, are the beans wired in the **container (production) configuration** — [`ReferenceDataServiceConfiguration.java:42-49`](services/reference-data-service/container/src/main/java/com/linercore/platform/referencedata/container/ReferenceDataServiceConfiguration.java:42). There is no Spring profile that swaps in a real Kafka publisher.
- `compose.yaml` runs Kafka **and** Schema Registry containers, but no service ever connects to them. They are set dressing.

**Impact:** Every document describing this system as event-driven (the two `async-event-contract-*.md` files, the Avro schemas, the Schema Registry, the workflow map) describes a runtime that does not exist. `booking.confirmed` and `containermovement.status` are never emitted to any broker. This is not an accepted shortcut: `enterprise-technical-environment.md` explicitly **mandates** the `*-messaging` Kafka adapters (Spring for Apache Kafka, Confluent Avro Serializer against Schema Registry, Testcontainers with *real* Kafka in adapter tests). The placeholder-only reality is a direct deviation from the mandated technical environment.

**Fix:** Implement a real `KafkaReferenceEventPublisher` (and equivalents), wire it behind a `@Profile("kafka")`/`docker` profile, keep the placeholder only under an explicit `local-noop` profile, and add a startup assertion that fails fast if a no-op publisher is active outside local mode.

---

## 🔴 C2 — `booking.confirmed` is delivered as synchronous HTTP, contradicting its own async contract

**Evidence:**
- [`async-event-contract-booking-confirmed.md`](docs/enterprise-contracts/async-event-contract-booking-confirmed.md) specifies `booking.confirmed` as a **Kafka async event** with Schema Registry compatibility and a message-pact.
- The actual delivery is a **synchronous REST POST**: [`BookingApiController.confirm()`](services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java:124) calls `containerMovementClient.publishBookingConfirmed(...)`, which does `restTemplate.postForObject(baseUrl + "/api/container-movement/booking-confirmed", ...)` ([`HttpContainerMovementClient.java:37`](services/booking-service/container/src/main/java/com/linercore/platform/booking/container/integration/HttpContainerMovementClient.java:37)).
- So the confirmation travels point-to-point, HTTP, request-scoped — the exact opposite of the documented decoupled async event.

**Impact:** Hard temporal coupling. If container-movement is down or slow, booking confirmation returns an error to the caller **even though the booking is already persisted as CONFIRMED** (see C3). The decoupling, replayability, and ordering guarantees the async contract promises are absent.

**Fix:** Pick one architecture and make code + contract agree. Either (a) deliver `booking.confirmed` through the outbox → real Kafka publisher → container-movement consumer (matches the contract), or (b) change the contract to declare a synchronous bilateral REST interaction. Do not ship both a dead async contract and a live sync call.

---

## 🔴 C3 — Confirm path is a dual-write with an un-retried post-commit side effect

**Evidence:**
- [`BookingApplicationService.confirm()`](services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/BookingApplicationService.java:129) does: `bookings.save(next)` **then** `outbox.enqueue(...)`. No `@Transactional` boundary exists on the application service or the controller (`grep` for `@Transactional` across `services/**` → zero hits). The two JDBC writes are not guaranteed atomic.
- The controller then makes the HTTP call **after** `service.confirm(...)` returns ([`BookingApiController.java:123-125`](services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java:123)), with **no try/catch and no retry**.

**Failure scenario:** Booking is saved CONFIRMED and an outbox row is written. The subsequent HTTP POST to container-movement times out. The caller receives a 500. The booking is confirmed, the outbox row is never dispatched (see C4), and container-movement has no idea the booking exists. There is no reconciliation path. This is silent, permanent cross-service inconsistency.

**Fix:** Wrap the state change + outbox enqueue in a single transaction, remove the direct HTTP side effect from the request path, and let the outbox relay deliver asynchronously with retries and idempotency (the consumer already de-dupes — see C7-good).

---

## 🔴 C4 — Outbox tables are write-only dead-ends in 3 of 4 event-producing services

**Evidence:**
- Only **reference-data** implements a relay: `publishOutboxBatch(...)` / `claimAvailable(...)` in [`ReferenceDataApplicationService.java:162`](services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/ReferenceDataApplicationService.java:162).
- `grep publishOutboxBatch|claimAvailable services/**` returns **reference-data only**. Booking, container-movement, and charge-agreement call `outbox.enqueue(...)` but **nothing ever reads those rows**.

**Impact:** Booking and container-movement outbox rows accumulate forever and are never delivered anywhere. Combined with C2, the "event" side of these services is entirely inert.

**Fix:** Extract the reference-data outbox relay into a shared component and wire it into every event-producing service.

---

## 🔴 C5 — Even the one real relay never runs: no scheduler exists

**Evidence:**
- `grep -r "@Scheduled|@EnableScheduling" services/**` → **zero hits**.
- reference-data's `publishOutboxBatch` is invoked only from an API controller endpoint (`ReferenceDataController`), i.e. it fires only if an external caller manually POSTs to it.

**Impact:** In production there is no background process draining the outbox. Events are dispatched only if something outside the app pokes an HTTP endpoint. The "how does this actually run unattended" question was never closed.

**Fix:** Add a scheduled relay worker (`@Scheduled` with leader-election or `claimAvailable`-based work-stealing, which is already supported) enabled under the deployed profile.

---

## 🟠 H1 — `publishOutboxBatch` marks rows PUBLISHED using fabricated broker metadata

**Evidence:** [`ReferenceDataApplicationService.java:170-174`](services/reference-data-service/application-service/src/main/java/com/linercore/platform/referencedata/applicationservice/ReferenceDataApplicationService.java:170) calls `publisher.publish(...)` (the no-op placeholder), receives the fake `BrokerMetadata`, and persists `event.published(metadata, now())` — flipping the outbox row to PUBLISHED.

**Impact:** The outbox status view and `outboxStatuses(...)` report events as successfully published to `referencedata.events` when nothing was sent. Operators/dashboards get a green signal for a delivery that never happened. This is worse than a missing feature — it is an affirmatively false integrity signal.

**Fix:** Same as C1. Until a real publisher exists, a no-op publisher should mark rows as `SKIPPED_LOCAL`, not `PUBLISHED`.

---

## 🟠 H2 — "Contract verification" gate checks for the existence of strings, not conformance of behavior

**Evidence:** [`scripts/verify-contract-providers.mjs`](scripts/verify-contract-providers.mjs) is a required, merge-blocking gate (`docs/quality-gates.md` → `contracts-verify`). What it actually asserts:
- AsyncAPI/OpenAPI: `contents.includes(channel)` / `contents.includes(requiredPath)` — substring presence in a YAML file (lines 85-105).
- Avro: `schema.type === "record"` and that named fields exist (lines 107-119).
- Pact fixtures: `fixture[key] !== undefined` (lines 121-139).
- `--live` mode: a single `fetch(url)` and a check that `response.ok` (lines 74-79, 150-157).

It never runs a provider against a consumer contract, never validates that an emitted message matches the Avro schema, never exercises the pact. A provider could emit a completely different payload — or, as in C1, emit nothing at all — and this gate stays green.

**Impact:** The "contract-freeze gate" the docs rely on as a safety mechanism provides false confidence. It is a documentation-completeness linter wearing the label of a contract test.

**Fix:** Replace with real Pact provider verification (spin the provider, replay the pact) and Avro schema-compatibility checks against Schema Registry. Keep the existence checks as a fast pre-flight, but stop calling it "verification."

---

## 🟠 H3 — Maturity is asymmetric; downstream modules are hollow copies of the first

**Pattern observed:** reference-data (the first/most-developed module — the gap summary itself notes it has "the strongest implementation coverage") received a real outbox worker, retryable/permanent failure handling, and status views. The modules generated later (booking, container-movement, charge-agreement) received the *shape* — outbox ports, `enqueue` calls, event mappers — but not the working machinery (no relay, no scheduler, no publisher).

**Impact:** This is copy-paste decay: quality visibly degrades across modules produced later in the run. It means "reference-data works, therefore the platform works" is an invalid inference, yet the docs lean on exactly that.

**Fix:** Promote the mature reference-data mechanics into shared platform code so every module inherits the same working implementation rather than a hand-copied husk.

---

## 🟡 M1 — "Done" is defined as tests-pass, and the tests exercise the placeholders

The `erp-flow-checkpoint.md` marks every step `[x]` except the final "Docker-backed live full-flow smoke," which is the **one** check that would exercise real Kafka/Schema-Registry/cross-service delivery — i.e. the one that would have exposed C1–C5. Unit/integration tests pass because they run against the no-op placeholders and in-process wiring. Green tests here certify the scaffold, not the system.

**Fix:** Treat an end-to-end run over the real runtime as a required definition-of-done, not an optional trailing checkbox. See M2.

## 🟡 M2 — No end-to-end verification over the canonical runtime was ever performed

The canonical runtime is Docker Compose (14+ containers). It was never successfully run end-to-end ("Docker Desktop image pull/storage issue," per the checkpoint). Every "it works" claim rests on code-level tests. Given C1–C5, a real end-to-end run would have failed at the first cross-service event hop.

## 🟡 M3 — Frontend is workbench-first and largely unverified (already self-reported)

`system-workflow-map.md` candidly states UI actions lack a "browser-verified guarantee that every button does what the label says," and apps are workbench-first without real list/detail pages. I confirmed the data layer itself is sound — [`apps/booking/lib/bookings.ts`](apps/booking/lib/bookings.ts) is a genuine backend proxy with a 5s timeout and graceful 503 fallback, not a mock — so this is a UX-completeness gap, not a fake-data problem. Lower priority than the backend integration defects.

---

## 🟢 What is genuinely good (preserve this)

- **Clean hexagonal architecture.** domain-core / application-service (+ ports) / dataaccess (JDBC) / container (adapters) is consistently applied, with domain-purity enforced by a dedicated gate and `DomainCoreDependencyTest`.
- **Real domain models and lifecycle.** Booking has a proper state machine (DRAFT→VALIDATED→PRICING_PENDING→PRICED→CONFIRMED→AMENDED→RECONFIRMED→EXCEPTION) with immutable transitions.
- **Idempotency and staleness handling are correctly implemented** where present — e.g. `consumeMovementStatus` de-dupes on idempotency key and rejects stale sequence numbers ([`BookingApplicationService.java:187`](services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/BookingApplicationService.java:187)).
- **The reference-data outbox worker is a correct implementation** of the pattern — its only faults are the no-op publisher and the missing scheduler, both external to its logic.
- **Backend build and tests pass cleanly.** The engineering substrate is solid; the failures are integration-fidelity, not craftsmanship.

---

## Systemic root causes → prevention checklist for future AI-DLC / Codex runs

The specific bugs matter less than *why the process produced them and reported success.* These are the transferable lessons.

1. **Placeholder-as-production.** No-op adapters were wired as the real beans with no profile to switch and no real adapter behind them. **Prevention:** ban `Placeholder*`/`Noop*` beans from any non-local profile; add a startup guard that fails fast if one is active in a deployed profile; require every port to have at least one non-placeholder adapter before the module is "done."

2. **Structural gates masquerading as behavioral gates.** Existence-of-file checks were labeled "verification" and blocked merges, creating false green. **Prevention:** a gate may only claim to verify behavior X if it *executes* behavior X. Separate "artifacts present" (lint) from "provider conforms" (test) and never conflate the names.

3. **Doc-code architecture drift with no binding check.** Docs described async/event-driven; code did sync point-to-point; nothing reconciled them. **Prevention:** for every contract, add one executable test that fails if the code stops matching the contract. A contract with no test that can go red is just prose.

4. **Copy-paste maturity decay across modules.** The first module was deep; later modules were hollow shells with the same shape. **Prevention:** extract working mechanics into shared platform code *before* replicating across modules; audit each module for behavioral parity, not structural parity.

5. **Dual-write / post-commit side effects with no transaction or saga.** State change + outbox + HTTP call spread across layers with no atomicity. **Prevention:** require an explicit transactional boundary around state-change + outbox; forbid outbound network calls in the request path when an outbox exists.

6. **Definition-of-done = "tests pass" instead of "behavior observed on the real runtime."** The single check that would have caught everything (live E2E) was the only one left unchecked — and the AI-DLC session logs show this was **systematic**: across essentially every intent (`260630-shared-platform`, `260702-shared-platform-live`, `260704-charge-agreement`, `260708-linercore-enterprise`), live Docker/Compose runtime was "intentionally not run" or "blocked locally." The whole program was built and self-certified without the broker/DB/cross-service stack ever running end-to-end once. **Prevention:** make one successful end-to-end run over the canonical runtime a hard gate; a feature touching cross-service flow is not done until that flow has been observed working, not just unit-tested against stubs. Never let "runtime blocked locally" become a standing, program-wide exemption.

7. **Green status treated as truth.** Outbox rows marked PUBLISHED, gates green, checkpoint all `[x]` — while the system didn't actually integrate. **Prevention:** distrust self-reported green; spot-audit the highest-risk seam (here: does an event actually leave the process?) before believing the aggregate status.

---

## Suggested remediation order

1. C3 (transaction + remove post-commit HTTP) — stops silent data corruption. Cheapest, highest safety value.
2. C1 + C4 + C5 (real publisher + shared relay + scheduler) — makes the event architecture real, or…
3. …decide explicitly to go synchronous and rewrite C2's contracts to match. **Do not leave code and contract disagreeing.**
4. H1 (stop marking un-sent events PUBLISHED) — remove the false integrity signal.
5. H2 (real contract verification) — so the gate can actually catch regressions of 1–4.
6. H3 (shared platform mechanics) — prevent the next module from repeating the decay.
7. M2/M3 (live E2E + UI detail pages).
