# Architecture Review — Iteration 1 — U05 Booking Consumption and Repricing

## Verdict

**NOT-READY**

The design is directionally aligned with the U05 vertical slice and the U04
provider contract, but a developer still has to invent lifecycle, transaction,
idempotency, legacy-response, and Booking API behavior. Those gaps affect the
required first-price, Reprice, confirmation-blocking, and replay paths and must
be resolved before implementation.

## Review basis

Reviewed:

- all five U05 Functional Design artifacts in this directory;
- U05 in `unit-of-work.md` and `unit-of-work-story-map.md`;
- FR-401–FR-407 and FR-501–FR-507;
- C09–C11/C14, Booking methods, and the bilateral service sequence;
- the final U04 pricing-provider/manual-case contract;
- current Booking service, persistence, controller, adapter, codec, and Booking
  detail UI seams.

Graphify and codebase-memory were used before fallback file inspection. The
current code evidence includes `BookingApplicationService.requestPricing`,
`Booking.amended`, `Booking.reconfirmed`, `JdbcBookingRepository`,
`BookingSnapshotCodec`, `BookingApiController.price`,
`ChargePricingPortAdapter`, and `BookingValidationPanel`.

## Blocking findings

### 1. The requested-departure amendment flow cannot execute against the current lifecycle

Evidence:

- `business-logic-model.md` and `frontend-components.md` require a legacy or
  current Booking with no `requestedDepartureDate` to correct it through the
  existing amend route in the pricing region before first Price.
- The current `Booking.amended(...)` permits only `CONFIRMED` or `RECONFIRMED`
  and always moves the aggregate to `AMENDED`
  (`services/booking-service/domain-core/.../Booking.java:205`).
- The current first-price UI enables Price only for `VALIDATED`, while the
  design does not define what general `BookingStatus` a pre-price date edit
  retains or enters.

Consequently, a `VALIDATED` Booking missing the date cannot use the proposed
editor. Simply adding `VALIDATED` to `Booking.amended(...)` would move it to
`AMENDED`, which is not the existing first-price state and would blur the
confirmed-booking amendment lifecycle.

Required remediation:

Define an exact amendment transition matrix for the same existing route. For
each allowed starting `BookingStatus`, state the resulting general status,
`pricingStatus`, `revision`, `pricingAmendmentSeq`, current-snapshot treatment,
and enabled next actions. A pre-first-price input correction must remain a
priceable Booking correction without pretending that a confirmed Booking was
amended; a post-confirm pricing change must retain the established
`CONFIRMED/RECONFIRMED → AMENDED → RECONFIRMED` lifecycle. Name the typed command
or aggregate method that implements each case.

### 2. “Reconfirm remains unchanged” permits bypassing required repricing/manual blocking

Evidence:

- The current `Booking.reconfirmed(...)` checks only that general status is
  `AMENDED` (`Booking.java:211`); it does not inspect a pricing fingerprint,
  pricing sequence, current snapshot, or manual-required state.
- U05 marks a pricing-affecting amendment `REPRICE_REQUIRED` and requires
  `MANUAL_PRICING_REQUIRED` to block automatic confirmation, while
  `business-rules.md` says reconfirm remains the existing lifecycle transition.

After a pricing-affecting amendment, the current reconfirm path can therefore
advance directly to `RECONFIRMED` without explicit Reprice. The same bypass is
possible after an outage/no-rate/ambiguity outcome unless a new guard is
specified.

Required remediation:

Keep reconfirm lifecycle-only and free of Charge calls, but define an additive
eligibility guard. Reconfirm must require a current authoritative pricing state
whose snapshot sequence/fingerprint matches current Booking inputs. It must
reject `REPRICE_REQUIRED`, `MANUAL_PRICING_REQUIRED`, validation, outage,
conflict, malformed, denied, and in-progress current states. Define the exact
behavior for a non-pricing amendment, where the previous price may remain
current and reconfirmable.

### 3. Phase-C atomicity and Booking-local in-flight idempotency are asserted, not designed

Evidence:

- The current `BookingApplicationService.requestPricing(...)` is not
  transactional and performs the Charge call, Booking save, and audit directly
  (`BookingApplicationService.java:227`). Annotating that method would hold a DB
  transaction across the remote call, which the design correctly forbids.
- U05 promises a short locked completion transaction, but does not name a
  separate Spring-proxied completion collaborator or `TransactionTemplate`
  boundary. A self-invoked `@Transactional` helper would not create the claimed
  transaction.
- Phase A promises a local in-flight/replay decision, but the V3 model adds only
  `booking_pricing_snapshots`; it defines no Booking pricing operation receipt,
  claim, owner, or state. The existing `booking_idempotency` seam is not selected
  or specified for this use.
- The design repeatedly includes an “existing outbox event/change” in the
  atomic write, but the current pricing path emits no outbox event and U05 names
  no pricing event type, mapper, schema, or deduplication key.

Required remediation:

Specify the concrete capture/call/complete collaborators and the Spring
transaction boundary. The completion collaborator must lock/reload, perform the
freshness check, append or compare the immutable snapshot/evidence, update the
Booking projection, and write audit atomically. Either define the exact existing
`booking_idempotency` claim/replay/in-progress use (including separation of the
browser command token from the server-derived Charge key), or remove the claim
of a Booking-local in-flight guard and state that Charge is the only concurrent
claim authority. Either remove the unsupported outbox assertions or define the
exact pricing event contract and dedupe behavior.

### 4. A complete legacy provider response has no persistence or state-transition path

Evidence:

- `business-logic-model.md` explicitly permits a complete response with all W2
  enrichments absent to follow the retained legacy decoder.
- U04 can replay an untouched complete pre-V4 legacy terminal response.
- The U05 result algebra defines only typed `Priced` as a success, the new table
  accepts typed W2 snapshots, and legacy handling is otherwise described only
  as reading an already embedded flattened Booking snapshot. No path says what
  happens when the live client receives a valid legacy 200 now.

Required remediation:

Define the exact all-additive-fields-absent result variant, persistence target,
Booking/pricing status transition, confirmation eligibility, replay behavior,
and API/history rendering. If it uses the existing embedded flattened snapshot
path, say so and preserve it byte/value-for-value without synthetic W2 lines or
source versions. If it is rejected, reconcile that with the approved
application-design rule “absent means legacy decode” and U04 legacy terminal
replay. Keep partial enrichment malformed in either case.

### 5. The Booking command HTTP/BFF contract is not precise enough to implement the required distinct outcomes

Evidence:

- The current `POST /api/bookings/{id}/price` returns a `BookingResponse`
  directly and requires the request-body idempotency key
  (`BookingApiController.java:113`); it has no response-status/header mapping
  for the new algebra.
- U05 lists operator states but does not bind each result to an exact Booking
  HTTP status, response body/code, failure-evidence shape, or `Retry-After`
  behavior. It is unclear whether no-rate/ambiguity/outage are successful
  command completions returning a Booking projection or propagated errors.
- `Changed` appears inside `PricingPortResult`, although Booking freshness is
  determined only after the port returns in Phase C.

Required remediation:

Add one exact controller/BFF mapping table for priced, legacy priced, no-rate,
each ambiguity, exhausted timeout, exhausted 503, circuit open, denied,
malformed, Booking validation, provider validation, body/key conflict,
in-progress, snapshot conflict, and Booking changed. Specify HTTP status,
Booking `pricingStatus`, stable code, body evidence, `Retry-After` validation and
forwarding, and whether the current Booking view is returned. Separate remote
`PricingPortResult` variants from local completion results such as
`BOOKING_CHANGED`. Preserve the existing route and additive response
compatibility.

## Non-blocking risks and implementation controls

1. The append replay comparison should name every compared immutable column and
   compare canonical snapshot bytes; database-generated `created_at` must not
   make an otherwise identical replay divergent.
2. Repository-only immutability leaves SQL update/delete technically possible.
   At minimum, integration tests should prove the production repository exposes
   only append/read and never updates an existing typed row.
3. Resilience4j circuit state is process-local and resets on restart. Record
   this operational scope and test per-instance behavior; do not imply a
   distributed five-failure counter.
4. History reads are unbounded in the current design. Apply a documented safe
   cap or pagination strategy before history can grow without limit, while
   retaining deterministic ordering.
5. `TIMESTAMP` matches the existing Booking schema, but JDBC conversion must be
   explicitly UTC for `pricedAt`/`createdAt` evidence.

## Confirmed strengths

- The latest fingerprint design covers the complete request, including
  amendment sequence, and rebuilds after a pricing-affecting change.
- The W2 snapshot now retains exact ordered lines, source IDs,
  `applicableDndRuleTypes`, totals, requested departure, version provenance, and
  the successor-window proof obligation.
- Retry/circuit composition, no-clock date authority, no Charge case for local
  outage, and no fabricated price are consistent with U04 and upstream design.
- UI work remains inside the existing Booking pricing region, uses accessible
  state/focus/table semantics, introduces no shared-package/shell redesign, and
  leaves responsive/theme/Playwright PASS evidence to U06.
- The W1 waiver and DS dependencies are not rewritten as real PASS claims.
