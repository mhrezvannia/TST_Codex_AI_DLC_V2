# Architecture Review — Iteration 2 — U05 Booking Consumption and Repricing

## Verdict

**READY**

The revised design closes every iteration-1 blocker and the two defects found
during iteration-2 verification. It now gives an implementer exact lifecycle,
transaction, fencing, replay, persistence, legacy-compatibility, HTTP/BFF, and
UI behavior without expanding the W2-03 slice.

## Iteration-1 finding disposition

| Iteration-1 finding | Final disposition |
| --- | --- |
| Requested-departure amendment did not fit the lifecycle | **Closed.** `BookingAmendment`/`applyAmendment` has an exact pre-confirm/post-confirm matrix. A `VALIDATED` correction remains `VALIDATED`; confirmed changes retain `AMENDED`. |
| Reconfirm could bypass Reprice/manual state | **Closed.** Confirm/Reconfirm has a server-side current-pricing guard, remains lifecycle-only, and preserves `AMENDED` through post-confirm pricing outcomes until explicit Reconfirm. |
| Transaction, local idempotency, and outbox behavior were asserted | **Closed.** Separate public transactional capture/completion Spring beans, lock/fence checks, V3 receipt fields, exact receipt states, and “no pricing outbox” are explicit. |
| Complete legacy provider 200 had no path | **Closed.** `LegacyPriced` has an exact all-additive-fields-absent discriminator, existing flattened persistence path, lifecycle projection, and honest UI representation. |
| Booking HTTP/BFF outcomes were not exact | **Closed.** The status/code/body/`Retry-After` matrix, response codec, and remote-vs-local result split are explicit. |

## Iteration-2 closure verification

### 1. Lifecycle and pricing eligibility

The design now distinguishes general `BookingStatus` from additive
`PricingStatus`, defines every relevant amendment pair, and makes completion
origin-sensitive:

- pre-confirm date correction remains `VALIDATED`;
- pre-confirm success/manual becomes general `PRICED`/`MANUAL_PRICING`;
- post-confirm success, manual, or legacy success remains general `AMENDED`;
- a non-pricing confirmed amendment retains current pricing authority;
- Confirm/Reconfirm requires a matching `PRICED` or `LEGACY_PRICED` authority
  and never calls Charge implicitly.

This is consistent with the brownfield `VALIDATED → PRICED → CONFIRMED →
AMENDED → RECONFIRMED` seam and closes the bypass found in iteration 1.

### 2. Transaction and concurrency boundary

`BookingPricingOperationCoordinator.captureAndClaim` and
`BookingPricingCompletionService.complete` are separate public transactional
Spring beans. The Charge call occurs between them without a DB transaction.
Completion locks/reloads, checks revision/sequence/fingerprint and receipt
owner/fence, then atomically writes snapshot/evidence, Booking state, audit, and
the terminal/retryable receipt. U05 adds no pricing outbox event.

The local receipt has `IN_PROGRESS`, `COMPLETED`, and `RETRYABLE` states.
Charge-terminal success/no-rate/ambiguity/conflict is replayable; outage and
circuit/recoverable outcomes stop shadowing Charge at `nextAttemptAt` and are
reclaimed only with a higher fence and the identical provider body/key.
Provider `PRICING_IN_PROGRESS` explicitly releases the receipt to `RETRYABLE`
until the normalized `Retry-After` time. Row-locked compare-and-set transitions
require the matching owner and fence for release or completion, so a stale
worker cannot mutate a newer claim.

### 3. Lost-response replay and response representation

Receipt lookup now occurs after canonical freeze but before new-attempt
priceability. An identical call can therefore replay a lost successful 200 even
after Booking is already `PRICED`; only an absent or due-retry receipt applies
the new-operation status guard.

The receipt stores an application-owned schema-v1
`PricingCommandReceiptPayload`, not the container `BookingResponse` DTO. The
data-access codec canonically serializes the immutable pricing outcome and the
current price sequence/fingerprint markers. On a 200 replay,
`BookingPricingResponseAssembler` combines that outcome with the current
Booking/history view only when those markers still match, and the controller
uses normal DTO serialization. Error replay uses the stored status, code, and
evidence. This preserves current non-pricing and movement state without making
mutable commercial truth authoritative or reversing the application/container
dependency.

### 4. Physical key and snapshot compatibility

V3 widens `booking_idempotency.idempotency_key` from the brownfield 128 limit to
`VARCHAR(192)` and stores the exact provider key in `VARCHAR(160)`. The local
`P|<bookingRef:amendmentSeq>` identity therefore accommodates U04's maximum
128-character provider identity without truncation. Typed snapshots retain all
W2 provider fields; complete legacy responses stay on the embedded flattened
path; partial enrichment is malformed. Explicit migration/repository proofs
cover the maximum provider key plus prefix and verify that production snapshot
ports expose no update/delete path.

### 5. HTTP, history, resilience, and UI contract

The Booking/BFF table now specifies exact 200/403/409/422/502 behavior,
manual-required completed-command semantics, normalized integer
`Retry-After`, and distinct denied/malformed/validation/conflict/in-progress
codes. History is stable-cursor paged at 20/default and 100/maximum. JDBC time
conversion is UTC. The cursor is base64url canonical JSON `{a,t,id}` and uses
the exact descending tuple predicate on
`(amendment_seq, created_at, pricing_request_id)`. Circuit state is explicitly
per process and reset on restart, not represented as a distributed counter.

UI work remains confined to the existing Booking pricing region, uses the
existing amend/price/reconfirm routes, exposes server capability flags, and
retains accessible focus, announcement, table, evidence, narrow-width, and
history-loading behavior.

## Remaining findings

None. The latest artifacts now specify the former implementation controls:
provider in-progress retry timing, row-locked fence transitions, legacy
aggregate price markers, exact cursor encoding/predicate, maximum-key migration
proof, and no-update/no-delete snapshot repository evidence.

## Confirmed preservation and evidence posture

- The complete W2 result retains ordered lines, source IDs,
  `applicableDndRuleTypes`, total, date, basis/reference, agreement attribution,
  correlation, and successor-window proof.
- No clock fallback, fabricated amount/version, Charge case for local outage,
  implicit reconfirm pricing, new route/service, shared-shell/navigation change,
  or `packages/ui` redesign is introduced.
- U06 still owns Compose/live/DB/correlation/Playwright and width/theme evidence;
  this Functional Design makes no premature PASS claim.
- The W1 waiver and W2-02 design-system dependencies remain explicit and are
  not rewritten as real PASS results.
