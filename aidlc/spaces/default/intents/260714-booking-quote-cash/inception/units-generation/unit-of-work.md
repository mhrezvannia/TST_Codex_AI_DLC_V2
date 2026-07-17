<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). This template enforces VERTICAL units with end-to-end DoDs. -->

# Units of Work - W1-01 Booking Quote-to-Cash

## Source Alignment

These units consume `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. They preserve the existing Booking, Charge, CMM, Reference Data, `platform-messaging`, `@erp/ui`, Kafka, Schema Registry, and PostgreSQL boundaries. The seven unit names map one-to-one to US-W1-001 through US-W1-007.

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit after the skeleton moves one thin capability through every layer it needs (UI -> API -> domain -> persistence -> any cross-module seam), and its Definition of Done is an **observed end-to-end behavior on the running stack** - never "layer X tests pass" and never "without live proof." A unit whose DoD can be met without running the app is mis-sliced.

## Units

| Unit | Name | Vertical scope (layers it cuts) | Complexity | Definition of Done (observed on live stack) |
|---|---|---|---|---|
| U01 | `booking-draft-skeleton` | Booking UI/BFF -> HTTP API -> domain -> Booking DB | M | On Compose, an agent creates the one-leg/one-equipment draft, the row persists through restart, and `/bookings/{bookingId}` renders it after refresh with health green. |
| U02 | `reference-validation` | Booking UI/BFF -> command API -> domain -> live Reference Data HTTP seam -> Booking DB | M | On Compose, active seeded references move the draft to validated; an inactive/unknown reference identifies the exact field and blocks pricing/confirmation; Reference Data outage is retryable and never falls back to demo data. |
| U03 | `agreement-pricing` | Booking UI/BFF -> Booking API/domain/DB -> real Charge HTTP API/domain/DB | XL | On Compose, a validated booking obtains and persists one itemized agreement quote through real `POST /pricing-requests`; NO_RATE and timeout/503 produce explicit manual state with no guessed amount; warmed p99 is <=800 ms. |
| U04 | `confirm-to-cmm-journey` | Booking UI/BFF -> Booking transaction/outbox -> real Kafka/SR -> CMM consumer/domain/DB/outbox | XL | On Compose, confirm atomically commits one revision/event, publishes canonical `booking.confirmed`, performs no Booking-to-CMM HTTP call, and CMM consumes it into exactly one journey plus one pending canonical status event. |
| U05 | `returned-status-detail` | CMM outbox -> real Kafka/SR -> Booking consumer/projection/API -> Booking UI | L | On Compose, CMM publishes canonical `containermovement.status`, Booking commits one ordered/deduped projection, and detail renders the returned status within p95 five seconds with pending/unavailable/retry states. |
| U06 | `replay-restart-safety` | Real broker redelivery/replay -> Booking/CMM transactions -> service DBs -> stable Booking UI | L | On Compose, duplicate, stale, out-of-order, rollback, DLT replay, and two service restarts retain one logical quote, confirmation, journey, and latest projection; persisted detail remains queryable. |
| U07 | `live-release-acceptance` | Full Booking UI -> Booking -> Reference/Charge -> Kafka/SR -> CMM -> Kafka/SR -> Booking/UI plus quality/audit gates | M | One repeatable run on Compose with PostgreSQL host port 55432 proves the complete journey, exact topic records, DB effects, latency samples, migration preservation, accessible desktop/mobile UI, blocking quality, and green `aidlc-audit` plus `erp-fidelity-audit` evidence under `artifacts/`. |

## Cross-Module Seams In This Intent

- **U02 Reference validation:** real Booking-to-Reference HTTP with active/inactive/unavailable observations; a stub or cached demo response cannot satisfy the DoD.
- **U03 Pricing:** owns `pricing.v1.yaml`, Pact/provider fixtures, examples/catalog entries, and the real Booking-to-Charge v1 HTTP call. Charge owns idempotent calculation/manual cases; Booking owns the immutable snapshot and operator work item.
- **U04 Confirmation:** owns canonical `booking.confirmed` Avro/AsyncAPI/resources/serde changes and exercises the real topic plus CMM consumer. It reuses `KafkaGenericRecordPublisher`, `ConfluentSchemaRegistrar`, and `ScheduledOutboxRelay`; a noop publisher cannot satisfy the DoD.
- **U05 Status return:** owns canonical `containermovement.status` Avro/AsyncAPI/resources/serde changes and exercises the real CMM-to-Booking topic plus Booking projection/UI. A fixture-only consumer cannot satisfy the DoD.
- **U06 Replay:** uses service-owned DLTs, receipt tables, deterministic event identity, and real persisted state; it does not add a shared inbox database or generic consumer relay.
- **U07 Acceptance:** observes every real seam together and retains the local-only schema exception and broker-security waiver without claiming non-local TLS/SASL/ACL completion.

## Dependency DAG

```yaml
units:
  - name: booking-draft-skeleton
    depends_on: []
  - name: reference-validation
    depends_on: [booking-draft-skeleton]
  - name: agreement-pricing
    depends_on: [reference-validation]
  - name: confirm-to-cmm-journey
    depends_on: [agreement-pricing]
  - name: returned-status-detail
    depends_on: [confirm-to-cmm-journey]
  - name: replay-restart-safety
    depends_on: [returned-status-detail]
  - name: live-release-acceptance
    depends_on: [replay-restart-safety]
```

## Unit Ownership and Constraints

### U01 `booking-draft-skeleton`

- Complete the Next.js list/create/detail route skeleton, Booking create/read API, contract-shaped routing/equipment domain, and JDBC persistence.
- Own the Booking V1 baseline and single additive W1 V2 migration, including all W1 command, receipt, projection, outbox, index, and backfill structures. Later Booking units consume these structures and do not co-own migration files.
- Establish BFF correlation/local identity propagation, accessible form/focus behavior, root frontend quality commands, and the stable detail DTO extension points used by later slices.

### U02 `reference-validation`

- Extend the same routes and detail state with live customer/location/voyage/equipment validation through the existing Reference Data port.
- Persist validated/blocked state through U01-owned Booking schema, enforce local/non-local identity guards, and prove failure containment without changing Reference Data ownership.

### U03 `agreement-pricing`

- Freeze and implement the exact pricing OpenAPI/Pact/example/catalog contract, including media type, headers, typed quantities/dates, result, and standard errors.
- Implement Charge V1 baseline plus additive V2 pricing claim/idempotency structures and the fenced ten-second claim/completion flow.
- Extend Booking command/domain/UI through the real Charge seam with bounded retry/circuit behavior, immutable quote/manual state, and confirm blocking.

### U04 `confirm-to-cmm-journey`

- Freeze canonical `booking.confirmed`, service resources, mappers, listeners, and compatibility proof under the approved local-subject exception.
- Extend Booking confirmation UI/API/domain/outbox using stable RFC4122 UUIDv5 identity and one logical event per revision; remove the normal sync CMM handoff.
- Implement CMM V1 baseline plus additive V2 journey/receipt/revision/outbox structures, transactional consume/reconcile/status enqueue, bounded retries, DLT, and shared relay publication.

### U05 `returned-status-detail`

- Freeze canonical `containermovement.status`, service resources, mappers, listeners, and compatibility proof.
- Extend CMM status publication and Booking transactional receipt/projection ordering using U01-owned schema structures.
- Extend the Booking composite detail API and UI with bounded polling, success announcement, pending/unavailable/retry states, and collapsed Audit transport detail.

### U06 `replay-restart-safety`

- Add focused duplicate/stale/out-of-order/rollback/replay tests and live controls across Charge, Booking, and CMM without altering business ownership.
- Prove V1-to-V2 migrations from captured W0 data, checksums/backfills, two restarts, and restore/forward-repair without destructive database reset.
- Capture outbox/consumer lag, dedupe, DLT, pricing, and end-to-end latency evidence from the real runtime.

### U07 `live-release-acceptance`

- Make backend, frontend, domain-purity, contracts, coverage, readiness, and no-noop checks blocking.
- Drive one continuous user journey and indexed screenshots/topic/database/performance evidence on the real Compose stack.
- Run the two required intent detectors and retain all evidence paths needed for merge to `integ/main-reconciled`.

## Exit Gate

W1-01 is not `complete` until U01 through U07 have been driven as one continuous flow on the real Docker Compose runtime, PostgreSQL uses host port 55432, exact canonical records are observed on both topics, persisted state survives restart/replay, and `aidlc-audit` plus `erp-fidelity-audit` are green with indexed evidence under `artifacts/`.

## Open Questions

None. The user approved the binding-template correction from capability-layer units to seven vertical story units. Economic sequencing remains a Delivery Planning decision even though the story prerequisites make the dependency topology strict.

## Review History

The independent capability-decomposition review first returned NOT-READY for shared Booking migration ownership, an unsupported projection-to-CMM hard edge, and inconsistent US-W1-005 ownership. Iteration 2 returned READY after those three findings were corrected. A subsequent deterministic `required-sections` firing exposed that the reviewed capability decomposition violated the binding vertical-unit template. The user approved this replacement vertical decomposition; the prior reviewer verdict therefore applies only to the superseded decomposition, not this corrected body.

## Source Coverage

The final vertical slices implement the ownership in `components.md`, callable boundaries in `component-methods.md`, runtime topology in `services.md`, dependency constraints in `component-dependency.md`, and ADR/governance decisions in `decisions.md`. They cover every FR/NFR in `requirements.md` and exactly one primary user outcome from `stories.md` per unit.

## Review - Recovery Final

Verdict: READY

**Independence:** Non-independent inline recovery review, explicitly selected by the user after the two configured independent iterations were exhausted and a later deterministic template failure required replacement of the reviewed body.

### Findings

- **Vertical slicing:** PASS. U01 is a running-stack walking skeleton; U02-U07 each extend an observable user/reviewer outcome across every layer and real seam it needs. No contract, backend, UI, migration, or evidence layer is accepted alone.
- **Implementability and ownership:** PASS. Booking owns one V1/V2 migration chain in U01; Charge and CMM migration files have one owning slice; later units consume structures without co-owning files. Contract/catalog sections are assigned to the slice that exercises them and the strict DAG serializes shared-file evolution.
- **Dependency correctness:** PASS. Both fenced YAML mirrors declare the same seven unique names and immediate hard business prerequisites. All references resolve, no self-edge/cycle exists, and no economic heuristic or critical path is selected.
- **Story and requirement coverage:** PASS. US-W1-001 through US-W1-007 map one-to-one to U01-U07; every FR-W1-001 through FR-W1-014 and NFR-W1-001 through NFR-W1-010 is represented by the matrix and live DoDs.
- **Architecture fidelity:** PASS. Separate service databases remain intact; normal Booking/CMM delivery is Kafka-only; pricing/reference seams remain owned HTTP calls; publishers reuse shared messaging; consumers are thin transactional service-local adapters; local-only exception/waiver scope remains explicit.
- **Verification:** PASS. The latest `required-sections` and `upstream-coverage` firings pass for all three artifacts, and independent local YAML parsing confirms identical, complete, acyclic mirrors.

### Residual Risks

- The non-independent recovery verdict does not replace the historical independent review record; the stage gate must expose this limitation.
- U01 creates all additive Booking W1 structures before later behavior uses them. Construction must keep those structures inert until their owning vertical slice is enabled and prove the frozen V1-to-V2 upgrade/backfill/restart path.
