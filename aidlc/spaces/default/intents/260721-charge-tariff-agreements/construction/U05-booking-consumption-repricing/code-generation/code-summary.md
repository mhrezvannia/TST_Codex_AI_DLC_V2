# Code Summary — U05 Booking Consumption and Repricing

## Outcome

U05 implements Booking-owned consumption of the U04 Charge pricing provider,
durable first-price and explicit Reprice orchestration, immutable current/prior
pricing evidence, confirmation guards, and the focused pricing region on the
existing Booking detail page. Booking preserves Charge-authored amounts,
ordered line items, basis, references, versions, and negative outcomes without
recalculating or fabricating money.

The approved plan has 38 of 40 items complete. Step 2 remains open because the
approved Resilience4j 2.2.0 artifacts are not cached and both configured Aliyun
and direct Maven Central access time out, preventing dependency convergence,
license, and vulnerability evidence. Step 39 remains open because the complete
Maven/Vitest/coverage/build/live-stack aggregate cannot run in this environment.
These limitations are recorded as blockers rather than inferred PASS results.

## Files Created or Modified

### Booking domain and application

- Added typed immutable pricing lines, automatic/manual/failure outcomes,
  current/prior history projections, legacy pricing evidence, and confirmation
  eligibility.
- Extended `Booking` and `PricingSnapshot` additively so typed pricing evidence
  coexists with pre-W2-03 flattened snapshots.
- Added fixed-order pricing-input canonicalization and SHA-256 fingerprints.
- Added Booking-local receipt/history/snapshot ports and
  `BookingPricingOrchestrator` with short capture, provider call outside the
  database transaction, fenced completion, stale-owner replay, and stable
  history reads.
- Added plain Resilience4j retry and circuit behavior: two raw calls only for
  timeout/503, five-of-five opening, 30-second wait, one half-open probe, and
  process-local breaker disclosure.

### Persistence, HTTP, security, and telemetry

- Added the sole Booking V3 migration with append-only typed pricing snapshots,
  operation receipt/claim/fence state, idempotency-key widening, constraints,
  and stable cursor indexes; V1/V2 remain unchanged.
- Added JDBC pricing receipt and snapshot repositories plus additive
  typed/legacy codecs and Docker-gated migration, repository, restart, and
  concurrency tests.
- Replaced the legacy provider identity with configured
  `X-LinerCore-Service-Id` and `X-LinerCore-Service-Token`; browser subject
  assertions and actor identity are not forwarded to Charge.
- Added bounded HTTP admission, timeouts, response-size handling, synchronous
  cleanup, and low-cardinality redacted pricing telemetry.
- Extended `BookingApiController` with authorize-before-lookup Price/Reprice
  behavior and additive current/prior/manual/failure response evidence.

### Contracts, BFF, and Booking UI

- Added `contracts/openapi/booking-pricing.v1.yaml`, Booking-BFF pricing Pact
  fixtures, and catalog/provider validation while preserving the U04 provider
  contract.
- Hardened the Booking BFF price route and schemas with fixed routing,
  session-derived Booking identity, strict allowlisting, correlation
  preservation, cancellation/body/media bounds, and no browser-visible service
  credential.
- Added `BookingPricingPanel` to the existing Booking detail pricing region
  with ordered itemization, exact totals, source attribution, bounded
  current/prior selection, explicit Reprice, and loading/empty/legacy/manual/
  denied/conflict/unavailable states.
- Added keyboard focus restoration, live announcements, reduced-motion and
  responsive styles, and `data-testid` hooks without modifying `packages/ui`,
  the shared shell, navigation, typography, tokens, or palette.

### Evidence and U06 handoff

- Added deterministic preservation, performance-input, and rollback-policy
  evaluators with tests.
- Recorded the exact previous-image compatibility predicate and the
  source-ready/live-evidence-blocked ledger.
- Added `docs/u05-booking-consumption-u06-handoff.md` and
  `artifacts/u05/u06-handoff.json` with release-valid U06 evidence cells.

## Key Decisions

1. Booking treats Charge as the sole pricing authority. It stores and renders
   provider evidence but never reconstructs totals or source versions.
2. Pricing is a three-part operation: capture and claim in a short transaction,
   perform the bounded provider call without a Booking connection, then
   complete under owner/input/revision fencing.
3. Provider idempotency remains `bookingRef:amendmentSeq`; retries reuse the
   same serialized body and key, while pricing-affecting amendments advance the
   sequence and non-pricing edits do not trigger pricing.
4. Known price, no-rate manual, ambiguity manual, denied, malformed,
   validation, conflict, in-progress, timeout, unavailable, and circuit-open
   remain distinct Booking outcomes.
5. Confirmation requires a current automatic snapshot matching the current
   pricing input and amendment. Manual, stale, pending, and provider-failure
   evidence remains fail-closed.
6. Previous-image rollback is eligible only when drained, validate-only/
   read-only, hash-equal, legacy-preserving, SELECT-only, and the exact
   `incompatible_u05_rows` predicate returns zero; otherwise recovery is
   forward repair.

## Traceability

| Scope | Implementation |
|---|---|
| US-06 / US-07 | Typed consumption of the U04 provider and exact line/version evidence |
| US-08 / US-09 | Durable first Price, immutable history, amendment detection, and explicit Reprice |
| US-10 / US-11 | Manual/no-rate, ambiguity, outage, retry, circuit, replay, and confirmation guards |
| US-13 | Trusted Booking-to-Charge identity, authorize-first API, correlation, and redaction |
| US-14 / US-15 | Existing Booking pricing region, responsive states, keyboard/focus/live-region evidence |
| FR-501–FR-507 | Capture/call/complete, receipts, snapshots, history, repricing, and exact outcomes |
| FR-701–FR-705 | Preservation, isolated runtime ownership, rollback policy, and U06 evidence ledger |
| NFR-001–NFR-010 | Resource bounds, integrity, compatibility, accessibility, telemetry, and ownership |

## Validation Evidence

| Check | Result |
|---|---|
| Booking domain regression tests | PASS — 21/21 |
| Booking migration/catalog/schema static tests | PASS — 10/10 |
| U05 preservation/performance/rollback evaluators | PASS — 7/7 with `--test-isolation=none` |
| Booking TypeScript type-check | PASS |
| Booking lint | PASS — zero warnings/errors |
| Contract catalog validation | PASS — 15 contracts |
| Contract provider verification | PASS — 199/199 checks; live provider skipped |
| Application/data-access focused static compilation | PASS — workspace static runner |
| Scoped `git diff --check` | PASS — line-ending warnings only |
| Booking Maven reactor and controller/resilience execution | BLOCKED — Resilience4j artifacts unavailable from timed-out repositories |
| Dependency convergence, license, and vulnerability checks | BLOCKED — same Maven resolution failure |
| Docker/PostgreSQL migration, concurrency, restart, and query-plan evidence | BLOCKED — Docker/Testcontainers unavailable |
| Booking Vitest component/BFF execution | BLOCKED before discovery — esbuild `spawn EPERM` |
| Production build and changed-line coverage ≥80% | UNOBSERVED |
| Isolated Compose, Playwright, live bilateral/provider/Pact, performance, and release audits | DEFERRED to U06 handoff |

## Deviations and Residual Work

- Resilience4j integration is source-complete, but no full Maven claim is made:
  the two approved 2.2.0 dependencies are absent from the local cache, the
  configured mirror times out, and an isolated official-Central settings file
  also times out.
- PostgreSQL-backed migration, receipt claim/takeover, stale-owner fencing,
  append-only snapshot, five-family race, restart, and cursor-plan tests exist
  and compile but have not executed against a live database.
- Booking BFF and component test sources contain 12 and 7 focused cases
  respectively, but Vitest cannot create the esbuild child process in the
  Windows sandbox. Type-check and lint remain green.
- The worktree contains prior U01–U04 and unrelated program changes. U05
  reconciliation is scoped to Booking pricing, its additive consumer
  contracts, local trusted configuration, U05 scripts/docs/artifacts, and the
  existing Booking pricing region.
- U06 owns demo-guard and isolated Compose evidence, live bilateral
  correlation/credential proof, PostgreSQL concurrency/restart/query plans,
  measured performance, the browser width/theme/keyboard/state matrix,
  changed-line coverage, provider/Pact execution, `aidlc-audit`, and
  `erp-fidelity-audit`.

## Completion Assessment

U05 is source-ready for mandatory architecture review. Its domain,
application, persistence, HTTP/security, contract, BFF, UI, telemetry, and
evaluator seams are implemented with green deterministic checks available in
this environment. All unavailable aggregate and live evidence is isolated in
the explicit U06 handoff and remains fail-closed.

## Review

### Iteration 1

**Verdict: NOT-READY**

The authorization-before-lookup ordering, bounded BFF boundary, receipt fencing
shape, and honest environmental ledger are directionally sound, but the wired
runtime does not implement the typed U04-consumption and transaction semantics
claimed by this summary.

#### Source-level blocking findings

1. **The production provider path is legacy and cannot preserve the U04 typed
   result.** `BookingServiceConfiguration.bookingPricingPort` wires
   `ChargePricingPortAdapter`, whose `requestPricing(PricingAttempt)` delegates
   to `PricingPort.super.requestPricing`. That default invokes the legacy
   `(Booking, idempotencyKey, correlationId)` overload and deliberately returns
   `PricingPortResult.LegacyPriced` on success; the focused adapter test asserts
   that legacy outcome. `HttpChargePricingClient` likewise deserializes the
   reduced legacy `PricingResponse` and drops/fabricates reviewed fields
   (`basis=null`, `quantity=1`) rather than preserving ordered typed lines,
   unit rates, totals, source rate versions, agreement version, provider
   timestamps, and D&D rule types. This contradicts FR-501/FR-502, the exact
   outcome-preservation claim, and the typed Booking OpenAPI/runtime contract.

2. **The fenced input is not the request sent to Charge.**
   `BookingPricingOrchestrator` captures `PricingInput.canonicalBytes()` and its
   fingerprint, but the legacy adapter reconstructs a different
   `ChargePricingRequest` from `Booking`; `HttpChargePricingClient` reconstructs
   the body again. That path uses the internal booking ID as `bookingRef`,
   booking revision as `amendmentSeq`, hard-coded quantities, and the current
   request instant for both pricing dates. Therefore receipt conflict/fencing
   protects one byte model while Charge receives another, and the claim that
   retries reuse the captured serialized body is false.

3. **There is no atomic short capture transaction.**
   `BookingPricingOrchestrator.capture` is not transactional.
   `JdbcBookingRepository.findByIdForUpdate` executes `SELECT ... FOR UPDATE`
   without a surrounding service transaction, while
   `JdbcPricingOperationReceiptRepository.claim` opens its own transaction.
   The booking read/lock and receipt claim are therefore not one atomic capture
   boundary; the row lock can be released before the claim, invalidating the
   documented concurrency model and leaving an amendment race between captured
   input and ownership.

4. **Price success and confirmation state diverge.**
   Receipt completion appends only `typedSnapshot` history and never attaches
   the result to `booking_records`; the currently wired success is
   `LegacyPriced`, so it is not appended at all. Nevertheless
   `PricingCommandResult.confirmationEligible()` returns true for
   `LEGACY_PRICED`. A Price response can thus advertise confirmation eligibility
   while a subsequent Confirm reloads an aggregate with no current pricing
   snapshot and rejects it. Current/prior history is also empty for that newly
   returned success. This breaks API/DB/runtime parity and the fail-closed
   confirmation invariant.

These are implementation defects, not evidence gaps; U06 live execution cannot
make this source READY. The provider mapping must consume the typed U04
contract from the captured bytes, capture must have a real transaction
boundary, and completion must atomically publish the same current/history state
that confirmation reads, with focused tests proving those paths.

#### Environment-dependent U06 evidence (non-source blockers)

Maven dependency convergence/security checks remain blocked by repository
timeouts; PostgreSQL/Testcontainers concurrency, restart, migration, and query
plans remain blocked by Docker absence; Booking Vitest remains blocked before
discovery by esbuild `spawn EPERM`. Isolated Compose, live bilateral/Pact,
Playwright, measured performance, changed-line coverage, and release audits
remain legitimate U06 evidence cells, but are separate from the four
source-level blockers above.

## Iteration 1 Remediation

The historical Iteration 1 review above is retained unchanged. The following
source remediation addresses each blocking finding without changing Charge
authority, shared UI, shell, navigation, tokens, palette, or another intent.

1. **Typed U04 production consumption.** `ChargePricingPortAdapter` no longer
   invokes the default legacy `PricingPort` path. `HttpChargePricingClient`
   decodes the complete additive U04 success contract and the adapter preserves
   provider line order, basis, quantity, unit rate, amount, currency, total,
   pricing basis/reference, agreement and source-rate versions, D&D rule types,
   provider request/correlation identity, requested-departure date, and
   `pricedAt`. Partial enrichment and inconsistent identity/arithmetic fail as
   `MALFORMED_PROVIDER_RESPONSE`. NO_RATE/ambiguity, validation, denied,
   conflict, in-progress, and transient outcomes remain distinct.
2. **Canonical request byte identity.** The provider client accepts the
   captured `byte[]`, provider idempotency key, and correlation directly.
   `RestTemplate` sends that byte array as the HTTP entity; no Booking or
   request DTO reconstruction remains in the provider path. Resilience retries
   re-invoke the same immutable `PricingAttempt`, so HTTP body bytes and the
   receipt/fingerprint bytes and key are identical across attempts.
3. **Real capture transaction.** `BookingPricingCaptureService.capture` is a
   separate public `@Transactional` Spring bean. Authorization precedes
   disclosure, then Booking `SELECT ... FOR UPDATE` and receipt find/claim run
   in the same datasource transaction. The orchestrator invokes this proxied
   bean and performs the Charge call only after it returns, with no Booking
   transaction or connection held.
4. **Atomic fenced publication and fail-closed legacy.**
   `BookingPricingCompletionService.complete` is a separate public
   `@Transactional` bean. It locks/revalidates the current Booking input, runs
   the owner/fence receipt CAS, appends immutable typed history, and saves the
   aggregate's matching current typed snapshot in one transaction.
   `JdbcPricingOperationReceiptRepository` no longer publishes history as an
   isolated side effect. First-price publication initializes the aggregate
   pricing fingerprint/sequence markers, so confirmation and history observe
   the same typed authority. Both `PricingCommandResult` and the aggregate now
   treat legacy-only pricing as confirmation-ineligible.

### Focused remediation evidence

| Check | Result |
|---|---|
| Booking domain source compile | PASS — Maven offline domain-only compile |
| Application source compile with `artifacts/u05` compile-only Resilience seam | PASS |
| Data-access source compile against the compiled application seam | PASS |
| `HttpChargePricingClient` focused source compile | PASS |
| Typed preservation, exact negative mapping, and retry byte/key reuse | PASS — 3 focused tests |
| Capture boundary, atomic current/history publication, and legacy fail-closed guard | PASS — 3 focused tests |
| Full Booking Maven reactor | BLOCKED — approved Resilience4j 2.2.0 artifacts remain absent from the local cache; no repository retry was repeated |
| PostgreSQL/Testcontainers, Docker, Vitest/esbuild, live Compose and U06 acceptance | UNOBSERVED/BLOCKED as recorded in the historical evidence ledger |

The compile-only Resilience seam under `artifacts/u05/static-stubs` is not
production code and exists solely to compile and execute the focused
application tests while the approved Maven artifacts remain unavailable.

## Review

### Iteration 2

**Verdict: READY**

All four Iteration 1 blockers are resolved in production wiring and focused
tests:

1. **Typed U04 preservation — resolved.** The production
   `ChargePricingPortAdapter` now invokes
   `ChargePricingClient.quote(byte[], key, correlation)` directly rather than
   the legacy `PricingPort.super` path. The HTTP client consumes the additive
   U04 response, and the adapter preserves ordered lines, quantity, unit rate,
   amount, currency, source-rate versions, total, pricing basis/reference,
   agreement version, D&D rule types, provider timestamp, request identity, and
   correlation. Partial or inconsistent enrichment is rejected as malformed;
   `BookingPricingSnapshot` enforces order, total, currency, and
   agreement/tariff invariants.

2. **Captured bytes and key — resolved.** `PricingAttempt` defensively copies
   and validates the canonical bytes, fingerprint, and provider key. The
   adapter passes those bytes and `bookingRef:amendmentSeq` unchanged to the
   HTTP entity, and resilience retries re-invoke the same immutable attempt.
   The focused retry test verifies byte-equal bodies and identical keys.

3. **Atomic capture — resolved.** `BookingPricingCaptureService` is a separate
   public Spring bean with a public `@Transactional` method. Authorization runs
   before disclosure; Booking `SELECT ... FOR UPDATE` and receipt find/claim
   share that proxied datasource transaction. The orchestrator calls Charge
   only after capture returns, outside the Booking transaction.

4. **Atomic fenced publication and legacy fail-closed — resolved.**
   `BookingPricingCompletionService` is a separate public transactional bean.
   It locks and re-derives current Booking input, verifies revision/amendment/
   fingerprint, performs the owner/fence/hash receipt CAS, appends typed
   history, and saves the aggregate current typed snapshot in one transaction.
   The receipt repository no longer publishes history independently.
   `PricingCommandResult` and `Booking` both reject legacy-only confirmation,
   so the Price response and subsequent Confirm use the same typed authority.

The source architecture, ownership boundaries, authorization ordering,
transaction/fencing model, exact provider mapping, API/runtime shapes, and
legacy compatibility are ready for Build and Test.

Environment-dependent evidence remains separate and is not promoted to PASS:
the full Maven reactor and dependency/license/vulnerability checks remain
blocked by uncached Resilience4j artifacts and repository timeouts; live
PostgreSQL concurrency/restart/query-plan evidence remains blocked by Docker;
Booking Vitest remains blocked before discovery by esbuild `spawn EPERM`.
Isolated Compose, bilateral/Pact, Playwright, measured performance,
changed-line coverage, and release audits remain mandatory U06 evidence cells.
