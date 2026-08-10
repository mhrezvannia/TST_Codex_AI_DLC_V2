# Code Generation Plan — U05 Booking Consumption and Repricing

## Purpose and boundaries

Implement the Booking-owned half of the W2-03 pricing flow: consume the U04
Charge provider through the existing `PricingPort`, persist immutable typed
snapshots, expose explicit first-price/Reprice behavior, preserve legacy
snapshots, and render current/prior evidence in the existing Booking detail
pricing region.

This plan does not redesign Booking routes, the shared shell, `packages/ui`,
navigation, tokens, typography, or palette. It does not modify Charge pricing
authority, reconstruct provider money, add manual quote/case-resolution
workflow, or relabel denied/malformed/conflict/in-progress/provider failures as
`NO_RATE`.

Active test strategy: **Standard** — component unit files with 5–8 focused
cases, integration stubs for database/HTTP boundaries, contract tests, and an
explicit U06 handoff for release-valid live evidence.

## Implementation plan

### Baseline, dependencies, and persistence

- [x] **Step 1 — Freeze the U05 change boundary and preservation baseline.** Record the current Booking V1/V2 migration hashes, pricing contract/catalog hashes, legacy snapshot fixtures, existing `/api/bookings/{id}/price` behavior, manager `8088`, Wave A `18088`, and the dirty-worktree ownership inventory. Confirm no planned edit targets Charge implementation, `packages/ui`, shared shell/navigation, or unrelated Booking pages. **Trace:** US-13; FR-501, FR-701–FR-703; NFR-004, NFR-005, NFR-010.
- [ ] **Step 2 — Add only the approved resilience dependencies.** Update `services/booking-service/application-service/pom.xml` with `io.github.resilience4j:resilience4j-retry:2.2.0` and `resilience4j-circuitbreaker:2.2.0`; add no Spring starter, AOP, TimeLimiter, bulkhead library, rate limiter, registry server, or shared-platform abstraction. Capture dependency convergence, license, and vulnerability evidence. **Trace:** US-11; FR-406, FR-501; NFR-004, NFR-007, NFR-010; BR-U05-040–045.
- [x] **Step 3 — Add the sole U05 Booking migration.** Create `services/booking-service/dataaccess/src/main/resources/db/migration/V3__booking_pricing_snapshots.sql` exactly from the reviewed schema: append-only `booking_pricing_snapshots`, final cursor index, Booking-local operation receipt/claim/fence columns, idempotency-key widening and constraints, with no legacy backfill or V1/V2 rewrite. **Trace:** US-08–US-11; FR-502–FR-507; NFR-002, NFR-003, NFR-005.
- [x] **Step 4 — Add deterministic migration/catalog tests.** Create or extend `BookingMigrationCatalogTest`, `BookingPreparedSchemaContractTest`, and Docker-gated `BookingFlywayPostgresTest` to verify exact V1–V3 order/checksums, 128→192 key widening, receipt/snapshot constraints, FK/index names, legacy-row preservation, clean upgrade, restart, and rejection of duplicate `(booking_id, amendment_seq, pricing_request_id)` evidence. Target 5–8 deterministic cases per test component and record Testcontainers skips as blocked, never PASS. **Trace:** FR-502, FR-503, FR-505; NFR-002, NFR-003, NFR-005, NFR-008.

### Domain model and application orchestration

- [x] **Step 5 — Extend the Booking pricing domain without recalculation.** Replace the flattened-only `PricingSnapshot` representation with additive typed immutable line, total, basis, reference, version attribution, request/correlation, requested-departure, amendment, revision, and timestamp evidence while retaining a distinct legacy representation. Validate exact decimal/currency arithmetic structurally but never recalculate Charge amounts. **Trace:** US-06–US-08; FR-402, FR-502, FR-503; NFR-003, NFR-005.
- [x] **Step 6 — Add domain outcome and lifecycle types.** Model known price, `MANUAL_PRICING_REQUIRED` with preserved `NO_RATE` versus ambiguity reason, denied, malformed, validation, conflict, in-progress, timeout, unavailable, and circuit-open outcomes; model current/prior snapshot selection and confirmation eligibility without inventing a total. **Trace:** US-08–US-11; FR-404–FR-407, FR-507; NFR-002, NFR-003.
- [x] **Step 7 — Add domain unit tests.** Extend `PricingSnapshotTest`/`BookingTest` (or add focused equivalents) with 5–8 cases each for typed immutability, ordered lines, exact decimals, legacy read-only behavior, no-total manual outcomes, confirmation blocking, and unchanged prior snapshots after Reprice. **Trace:** US-08–US-11; FR-502, FR-503, FR-505, FR-507; NFR-003, NFR-008.
- [x] **Step 8 — Canonicalize pricing inputs and identities.** Add application-owned fixed-order UTF-8 JSON canonicalization and JDK SHA-256 fingerprints for all `pricing.request` fields; retain provider idempotency key `bookingRef:amendmentSeq`, reuse identical serialized body/key across retry, and distinguish pricing-input changes from revision-only changes. **Trace:** US-09, US-11; FR-407, FR-504, FR-505; NFR-002, NFR-003.
- [x] **Step 9 — Define Booking-local operation receipt ports.** Add inward-facing claim/read/complete repository contracts with database time, owner token, input hash, immutable response projection, due/reclaim state, row/revision fence, and explicit stale-owner result. Do not reuse process locks or read/write Charge persistence. **Trace:** US-08–US-11; FR-501, FR-505; NFR-002, NFR-007, NFR-010.
- [x] **Step 10 — Implement the short capture transaction.** In `BookingApplicationService` or a focused pricing service, authorize before lookup, lock/read Booking revision and pricing inputs, detect amendment sequence, claim/replay/fence the local operation receipt, and commit before the provider call so no database connection is held over HTTP. **Trace:** US-09, US-13; FR-501, FR-504, FR-505; NFR-002, NFR-004, NFR-007.
- [x] **Step 11 — Execute Charge outside database transactions.** Extend `PricingPort`/`ChargePricingPortAdapter` so exactly one logical operation calls the U04 provider with the captured body/key/correlation and returns a typed outcome; retry must reuse the identical bytes and must not hold a Booking transaction, connection, permit, or detached future beyond its bounded attempt. **Trace:** US-06, US-07, US-11; FR-401–FR-407, FR-501; NFR-001, NFR-002, NFR-007.
- [x] **Step 12 — Implement the fenced completion transaction.** Re-lock Booking by expected row/revision/amendment, verify receipt owner and input hash, append exactly one immutable typed snapshot or Booking-local manual/outage evidence, update the current cursor/confirmation guard, and complete the receipt atomically; stale owners must roll back and replay the winner. **Trace:** US-08–US-11; FR-502, FR-505, FR-507; NFR-002, NFR-003.
- [x] **Step 13 — Implement exact provider-to-Booking projections.** Map 200 to typed price, 404 `NO_RATE` and 422 ambiguity to distinct manual-required evidence, and preserve denied, malformed, validation, conflict, in-progress, timeout, 503, circuit-open, and unexpected-response semantics without relabeling or fabricated money. **Trace:** US-10, US-11; FR-404–FR-406, FR-507; NFR-002, NFR-004.
- [x] **Step 14 — Implement pricing-affecting amendment detection.** Advance amendment sequence and expose Reprice only when a captured `pricing.request` field changes; non-pricing edits generate no pricing request, while revision-only changes obey the reviewed same-key due/reclaim rule. **Trace:** US-09; FR-504, FR-505; NFR-002, NFR-003.
- [x] **Step 15 — Enforce confirmation eligibility.** Update Booking confirmation guards so only a current valid automatic snapshot for the current pricing inputs/amendment can satisfy pricing; manual-required, stale, in-progress, denied, malformed, conflict, timeout, unavailable, and circuit-open evidence block confirmation without altering reconfirm lifecycle semantics. **Trace:** US-09–US-11; FR-504, FR-507; NFR-002, NFR-003.
- [x] **Step 16 — Add bounded pricing-history reads.** Add a stable cursor or documented cap ordered by amendment sequence, created time, and pricing request ID; expose current plus prior typed/legacy snapshots without unbounded reads or mutation. **Trace:** US-08, US-09; FR-502, FR-503, FR-505; NFR-007.
- [x] **Step 17 — Add application-layer unit tests.** Extend `BookingApplicationServiceTest` and add focused pricing orchestration tests (5–8 cases per component) for capture/call/complete separation, authorization ordering, exact retry body/key, first-price, pricing/non-pricing amendment, winner replay, stale-owner rollback, manual/outage evidence, confirmation block, and history preservation. **Trace:** US-08–US-11, US-13; FR-404–FR-407, FR-501–FR-507; NFR-002, NFR-004, NFR-008.

### Data access, codec, and concurrency

- [x] **Step 18 — Extend `BookingSnapshotCodec` additively.** Encode the reviewed schema-v1 typed snapshot in fixed field order and decode both new typed and pre-W2-03 flattened snapshots; reject partial/invalid enriched identity without synthesizing missing versions or money. **Trace:** US-08; FR-502, FR-503; NFR-003, NFR-005.
- [x] **Step 19 — Implement JDBC snapshot history and receipt repositories.** Use parameterized SQL, database time, owner-token and row/revision predicates, append-only inserts, stable cursor pagination, and no cross-service SQL; preserve service-owned Booking credentials and Hikari max 10/acquisition timeout 2 seconds. **Trace:** US-08–US-11; FR-501–FR-505; NFR-002, NFR-003, NFR-007, NFR-010.
- [x] **Step 20 — Add codec and repository tests.** Extend `BookingSnapshotCodecTest` with 5–8 legacy/new/partial/decimal cases and add Docker-gated JDBC tests for claim winner, live in-progress, lease takeover, stale completion rollback, duplicate suppression, append-only snapshots, revision fence, cursor stability, and restart replay. **Trace:** US-08–US-11; FR-502, FR-503, FR-505; NFR-002, NFR-003, NFR-005, NFR-008.
- [x] **Step 21 — Add five-family concurrency integration stubs.** Cover same key/body duplicates, same key/conflicting body, owner expiry/takeover, concurrent amendment/reprice, and half-open probe contention using real PostgreSQL where available; compile and classify Docker absence as blocked evidence. **Trace:** US-09, US-11; FR-407, FR-504, FR-505; NFR-002, NFR-007.

### Charge HTTP client, resilience, and service security

- [x] **Step 22 — Replace the prohibited legacy service identity.** Update `HttpChargePricingClient` to send configured `X-LinerCore-Service-Id` and `X-LinerCore-Service-Token`, preserve/validate correlation, never send `X-LinerCore-Actor-Id` or browser subject assertions, and fail closed when trusted credentials are absent outside the approved local seam. **Trace:** US-13; FR-501; NFR-004, NFR-009.
- [x] **Step 23 — Enforce bounded HTTP resources.** Configure max 10 total/per-route connections, fair 10-permit admission with 100 ms acquire, connect timeout 500 ms, response/overall deadline 2 seconds, 64 KiB response cap, synchronous cancellation/body closure, and no detached executor/future. Preserve Tomcat 32 threads/32 accept queue/64 connections. **Trace:** US-11; FR-406, FR-501; NFR-001, NFR-007.
- [x] **Step 24 — Configure plain Resilience4j decorators.** Compose `CircuitBreaker(Retry(raw call))`; retry only typed timeout/503 for two raw calls total, record only post-retry timeout/503 as circuit failures, ignore all 4xx/domain/denied/malformed/cancellation outcomes, open after 5/5 failures at 100%, wait 30 seconds, and allow one half-open probe. Disclose that breaker state is process-local and resets on restart. **Trace:** US-11; FR-406; NFR-002, NFR-007; BR-U05-040–045.
- [x] **Step 25 — Implement durable due-time projection.** Persist the reviewed local retry/due outcome for timeout/503, normalized provider in-progress, occupied/open circuit, denied/malformed, changed inputs, and revision-only changes; an occupied half-open probe must reject or defer until `probeStartedAt + 5s` and cannot create an unbounded retry loop. **Trace:** US-11; FR-406, FR-407; NFR-002, NFR-007.
- [x] **Step 26 — Add HTTP/security/resilience tests.** Extend `HttpChargePricingClientTest` and `ChargePricingPortAdapterTest`, and add deterministic-clock resilience tests (5–8 cases per component) for trusted headers/no identity forwarding, correlation, exact response decoding, two-attempt timeout/503 only, resource release, 64 KiB cap, five-operation opening, 30-second wait, one probe, ignored outcomes, process restart reset, and no duplicate local snapshots. **Trace:** US-06, US-07, US-10, US-11, US-13; FR-401–FR-407, FR-501; NFR-001, NFR-002, NFR-004, NFR-008, NFR-009.

### Booking API, contracts, and BFF

- [x] **Step 27 — Keep the explicit Booking price/Reprice command.** Extend `BookingApiController` so `POST /api/bookings/{id}/price` performs first-price or explicit Reprice under authorization, accepts no provider-controlled money, returns current outcome/history metadata, and keeps authorization before Booking existence/state access. **Trace:** US-08–US-11, US-13; FR-501–FR-507; NFR-004.
- [x] **Step 28 — Extend Booking read models additively.** Return current/prior typed or legacy pricing snapshots, manual/outage evidence, confirmation eligibility, and stable history cursor without removing existing Booking fields or routes. Keep reconfirm lifecycle-only. **Trace:** US-08–US-11; FR-502–FR-507; NFR-003, NFR-005.
- [x] **Step 29 — Add controller/security contract tests.** Add 5–8 cases for unauthorized-before-not-found, first price, Reprice, current/prior history, legacy decode, manual/no-total, exact negative outcomes, conflict/in-progress guidance, and malformed input; use real serializers rather than hand-authored success bytes. **Trace:** US-08–US-11, US-13; FR-404–FR-407, FR-501–FR-507; NFR-004, NFR-005, NFR-008.
- [x] **Step 30 — Synchronize public contract evidence additively.** Update the Booking OpenAPI/catalog/Pact consumer fixtures and provider verification only where U05 fields/outcomes require it; preserve U04 `pricing.v1` bytes/statuses, validate legacy and enriched snapshots, and prove all-or-none line/total/version attribution plus the distinct negative outcome matrix. **Trace:** US-06–US-11; FR-402–FR-407, FR-502–FR-507; NFR-005, NFR-008.
- [x] **Step 31 — Harden the Booking BFF price route.** Update `apps/booking/app/api/bookings/[bookingId]/price/route.ts` and `apps/booking/lib/bookings.ts` with fixed path/permission policy, session-derived subject propagation only to Booking, strict Zod allowlist/redaction, cancellation/origin/body/media limits, correlation preservation, and exact typed outcome mapping. Never expose the Charge service token to the browser. **Trace:** US-08–US-11, US-13; FR-501, FR-507, FR-605; NFR-004, NFR-009.
- [x] **Step 32 — Add BFF/schema/client tests.** Extend `apps/booking/lib/bookings.test.ts` and add route tests with 5–8 cases each for authorization, first-price/Reprice payloads, legacy/enriched decode, no-rate/ambiguity/outage distinction, redaction, cancellation, correlation, malformed upstream, and no browser-service credential leakage. **Trace:** US-08–US-11, US-13; FR-404–FR-407, FR-501–FR-507; NFR-004, NFR-005, NFR-008, NFR-009.

### Existing Booking detail pricing region

- [x] **Step 33 — Implement the current/prior pricing evidence region only.** Extend `apps/booking/app/bookings/[bookingId]/page.tsx` with a focused Booking pricing component that renders ordered charge code/category/basis/quantity/unit rate/amount/currency lines, exact total, pricing basis/reference, agreement/rate version attribution, request/correlation/timestamp, and a bounded current/prior selector. Use existing `@erp/ui` primitives/tokens and the canonical shared shell. **Trace:** US-08, US-09, US-14; FR-502, FR-503, FR-505, FR-605; NFR-003, NFR-006, NFR-010.
- [x] **Step 34 — Implement explicit Reprice and state UX.** Show Reprice only for pricing-affecting amendments; add `data-testid` to interactive controls; cover skeleton/loading, empty/unpriced, legacy, populated, validation, pending/in-progress, success, manual no-rate, ambiguity, denied, conflict, timeout/unavailable/circuit, and retry states. Manual states show evidence and no amount/confirmation/manual-quote controls. Preserve values, announce async outcomes, and restore focus after commands/dialogs. **Trace:** US-09–US-11, US-14; FR-504–FR-507, FR-605, FR-606; NFR-004, NFR-006.
- [x] **Step 35 — Add component and interaction tests.** Add focused Booking pricing-region tests (5–8 cases per component/file) for exact itemisation/current-prior history, Reprice visibility, legacy decode, no fabricated manual total, confirmation block, error recovery, keyboard-only selection/command flow, focus restoration, live regions, reduced motion, and narrow table/record rendering. Include test configuration updates only if the existing Vitest setup cannot cover the new files. **Trace:** US-08–US-11, US-14, US-15; FR-502–FR-507, FR-605, FR-606; NFR-006, NFR-008.

### Observability, configuration, verification, and handoff

- [x] **Step 36 — Add bounded Booking pricing telemetry and redaction tests.** Record low-cardinality operation latency/outcome, basis, first-price/Reprice, retry, circuit, replay, takeover/stale-owner, and manual/outage counts; propagate correlation without logging customer/booking IDs, request body/hash/key, service token, owner token, money, version IDs, snapshots, or record IDs as values/labels. **Trace:** US-11, US-13; FR-501, FR-507; NFR-004, NFR-009.
- [x] **Step 37 — Wire approved local/runtime configuration.** Update Booking local config, `compose.yaml`, and `infrastructure/env/wave-a.env.example` only for trusted bilateral service credentials and reviewed bounds; preserve non-local fail-closed secrets, service-owned DB credentials, Booking 512 MiB/JVM 55%, Hikari 2/10/2s, nginx `18088`, and manager `8088` isolation. **Trace:** US-13; FR-501, FR-703; NFR-004, NFR-007.
- [x] **Step 38 — Add preservation, performance, and rollback evaluators.** Add deterministic U05 scripts/tests that verify V1/V2 hashes, exact V3 catalog/checksum/schema, legacy snapshot decode, U01–U04 contract/behavior preservation, Booking route/security preservation, no manager targeting, exact `incompatible_u05_rows` rollback predicate, two-call/circuit resource bounds, history-query/no-spill input, and previous-image eligibility only when drained/read-only and zero incompatible rows. **Trace:** US-08–US-11; FR-701–FR-705; NFR-001–NFR-005, NFR-007.
- [ ] **Step 39 — Run source/static quality gates.** Run `mvn -f services/booking-service/pom.xml clean verify`; focused migration/domain/application/JDBC/controller/security/resilience tests; Booking Vitest, type-check, lint, and production build; `npm run contracts:validate`; `npm run contracts:verify`; U05 evaluators; dependency/license/vulnerability checks; changed-line coverage ≥80%; and `git diff --check`. Record Docker, esbuild/browser, missing pinned-toolchain, or coverage-tool absence as blocked rather than PASS. **Trace:** all U05 stories; FR-501–FR-507, FR-701–FR-706; NFR-001–NFR-010.
- [x] **Step 40 — Produce the U06 live-evidence handoff and final hygiene ledger.** Document the implemented seams, exact commands, blockers, hashes, ownership diff, and the only release-valid isolated Compose/demo-guard, live bilateral correlation, PostgreSQL concurrency/restart, successor-window Reprice, Booking breakdown/history, no-rate/manual, performance, Playwright 375/768/1024/1440 light/dark keyboard/state matrix, `aidlc-audit`, and `erp-fidelity-audit` cells. Confirm no Charge authority, `packages/ui`, shared-shell/nav/palette, new service/database, D&D, manual quote, or unrelated Booking change. **Trace:** US-06–US-15; FR-701–FR-706; NFR-001–NFR-010.

## Validation command set

Run commands from the workspace root and retain raw exit codes/output:

```powershell
mvn -f services/booking-service/pom.xml clean verify
npm --workspace apps/booking run test
npm --workspace apps/booking run typecheck
npm --workspace apps/booking run lint
npm --workspace apps/booking run build
npm run contracts:validate
npm run contracts:verify
npm run quality:gates
git diff --check
```

Use project-owned U05 evaluator commands added by Step 38. Docker/PostgreSQL,
isolated Compose, browser/Playwright, measured performance, manager-preservation,
and release-audit commands remain U06 evidence unless they are genuinely
available during U05. A skipped or unavailable cell is `BLOCKED`/`UNOBSERVED`,
never inferred green.

## Plan size and traceability summary

- **40 sequential implementation/verification steps**
- **Standard strategy:** named domain, application, codec/JDBC, HTTP/resilience,
  controller/security, BFF, and UI unit files with 5–8 cases per component,
  plus PostgreSQL/HTTP/live integration stubs
- **Primary stories:** US-08, US-09, US-10, US-11, US-13, US-14; U05 also
  consumes U04 outcomes supporting US-06 and US-07
- **Primary functional requirements:** FR-401–FR-407, FR-501–FR-507,
  FR-605–FR-606, and preservation/evidence FR-701–FR-706
- **NFR coverage:** NFR-001–NFR-010

## Open risks to preserve during implementation

1. The shared worktree contains U01–U04 and other active-program edits; U05
   ownership must be proven with a scoped diff rather than assuming a clean
   branch.
2. Docker/PostgreSQL, browser process creation, pinned security tooling, and
   changed-line coverage may be unavailable locally; these are evidence
   blockers, not permission to weaken tests or mark them PASS.
3. Booking-to-Charge stays fail-closed until the same trusted service ID/token
   is aligned at both ends. The browser/session subject must never become the
   provider service identity or receive the token.
4. Resilience4j circuit state is intentionally process-local and resets on
   restart. PostgreSQL receipts/fences own correctness; no distributed
   five-failure claim is allowed.
5. The minimum existing Booking pricing region is the only permitted Booking UI
   scope. Missing shared primitives or shell metadata remain W2-02 integration
   work and must not trigger a local redesign.
