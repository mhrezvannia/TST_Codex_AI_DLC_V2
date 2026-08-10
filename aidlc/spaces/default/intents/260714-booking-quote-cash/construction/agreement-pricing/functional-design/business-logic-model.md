# Business Logic Model - U03 Agreement Pricing

## Scope and Inputs

U03 implements the vertical agreement-pricing slice in `unit-of-work.md` and US-W1-003/US-W1-004 from `unit-of-work-story-map.md`. It satisfies FR-W1-003, FR-W1-004, FR-W1-010 and the pricing performance/security requirements in `requirements.md`. The design preserves C02/C05/C06/C10/C11 ownership in `components.md`, realizes the pricing claim and HTTP methods in `component-methods.md`, and follows the Booking-to-Charge boundary and failure containment in `services.md`.

## End-to-End Pricing Workflow

### 1. Booking captures one immutable request

1. Pricing is accepted only for a persisted `VALIDATED` Booking whose reference-validation fingerprint still matches its canonical customer, routing, equipment, voyage, and commodity fields.
2. Booking derives `amendmentSeq` from the persisted aggregate revision, composes `Idempotency-Key = bookingId + ':' + amendmentSeq`, and creates a canonical request using the exact OpenAPI fields: `bookingRef`, `tradeLane`, `pol`, `pod`, `equipmentType`, `partyId`, `commodityCode`, `reeferIndicator`, `dgIndicator`, `dates`, and `quantities`.
3. `quantities` contains positive `equipmentQuantity`, positive `teu`, and required non-negative `amendmentSeq`. Booking sends the same body, idempotency key, and correlation ID on its single permitted retry.
4. Booking captures expected revision/fingerprint and performs the remote operation without persisting aggregate `PRICING_PENDING`. Busy is a request/UI state; a process crash leaves the Booking durably `VALIDATED`, so the same key can safely resume. No database transaction or row lock is held while Charge is called.

### 2. Charge validates and claims the request

`PricingApiController` accepts only `POST /pricing-requests` with `application/vnd.api.v1+json`, required `Idempotency-Key`, and required `X-Correlation-Id`.

1. The adapter validates body structure, canonicalizes a request hash from the business body, and verifies that the header is exactly `bookingRef:quantities.amendmentSeq`.
2. A short `REQUIRES_NEW` claim transaction inserts a unique `StoredPricingRequest` in `IN_PROGRESS` with request hash, booking/amendment identity, owner token, start time, and a ten-second lease.
3. Existing same-key/same-hash terminal state returns `REPLAY` with the persisted immutable result or error business outcome.
4. Existing same-key/same-hash unexpired state returns 409 `PRICING_IN_PROGRESS`.
5. Same key with another hash, or another key for the same booking/amendment, returns 409 `IDEMPOTENCY_CONFLICT`.
6. For an expired lease, one contender performs a compare-and-set takeover using the prior owner token and lease instant. Only the winner receives `CLAIMED`.

The claim commits before calculation. No agreement query, amount calculation, manual-case write, or outbound call runs inside the claim transaction.

### 3. Charge resolves commercial authority

The engine loads all approved, active agreements for `partyId` and `dates.effectiveDate`, then filters exact trade lane and commodity compatibility. It computes the existing specificity score, but does not call `max` and silently choose one candidate:

1. No active agreement proceeds to the explicit no-tariff result. `TariffPricingPort` is invoked second; its W1 adapter returns no match because W2-03 owns tariff data.
2. Exactly one candidate at the highest specificity becomes the pricing authority.
3. More than one highest-specificity candidate is `PRICING_VALIDATION`; the engine creates no charges and prepares one Charge manual diagnostic with reason `AMBIGUOUS_ACTIVE_AGREEMENT`.
4. The chosen agreement must remain approved and active for the effective date, contain applicable terms, match commodity eligibility, and contain only supported USD terms.

### 4. Charge calculates the immutable result

For each applicable agreement term, ordered by charge code then stable term ID:

1. Select quantity from the typed request according to term basis (`PER_EQUIPMENT`, `TEU`, or the established unit default where supported).
2. Multiply the persisted decimal unit amount by the positive integer quantity using `BigDecimal`; no binary floating-point calculation or rounding guess is allowed.
3. Produce `ChargeLine(chargeCode, category, amount, currency)` from persisted term fields. Every W1 line is USD and has exactly two fractional digits at the API boundary.
4. Return `pricingBasis = AGREEMENT`, `pricingRef = agreementId`, a non-empty deterministic line list, and `applicableDndRuleTypes = []` for W1.

The API has no total field; Booking may derive display totals only from the persisted lines and must not replace them with one aggregate map.

### 5. Charge completes with owner fencing

A second short `REQUIRES_NEW` transaction accepts sealed `PricingTerminalOutcome` (`Priced` or `Manual`) and compares key, `IN_PROGRESS`, owner token, and current lease ownership:

- Success writes status `COMPLETED`, immutable response JSON, completion time, and correlation identity.
- `NO_RATE` or a reached-service manual outcome writes status `MANUAL` and exactly one `ManualPricingCase` in the same transaction, then returns the corresponding contract error with no charges.
- If completion updates zero rows, the stale worker rereads the winner. A terminal same-hash winner is replayed; otherwise the stale result is discarded.
- Unexpected calculation failure does not invent a terminal business result. The lease expires for takeover and the adapter returns 503 `PRICING_UNAVAILABLE`.

### 6. Booking applies success or manual outcome

Booking calls Charge with a two-second timeout and Resilience4j policy: one retry only for timeout or 503, no retry for any 4xx, circuit opens after five failed operations, and one half-open probe is allowed after 30 seconds.

After the call, a Booking transaction locks or compare-and-sets the same booking/amendment version:

- 200: persist the complete immutable `PricingSnapshot`, transition `VALIDATED|MANUAL_PRICING -> PRICED`, close any work item for that exact attempt only if policy permits, and append one lifecycle/audit fact.
- 404 `NO_RATE` or reached Charge manual result: persist no pricing snapshot, transition to `MANUAL_PRICING`, and upsert one Booking-owned work item linked by pricing request ID and correlation ID.
- timeout, terminal 503, or circuit-open: persist no pricing snapshot, transition to `MANUAL_PRICING`, and upsert only the Booking work item. No Charge case is assumed.
- 400/422: preserve no partial quote, transition to `MANUAL_PRICING` with the exact safe reason and correlation ID, and block Confirm.
- 409 in-progress/conflict: do not create a false manual business result. In-progress preserves `VALIDATED` (or the existing manual state), returns retry-after bounded by the ten-second lease, and exposes explicit Retry; conflict returns a corrective error and preserves prior state. No durable pending state can be orphaned.
- If the Booking revision/fingerprint changed during the call, discard the remote result for this aggregate and return 409 `BOOKING_CHANGED`.

## Result Matrix

| Charge/transport outcome | Charge terminal state | Booking state | Persisted Booking quote | Work ownership |
|---|---|---|---|---|
| One valid agreement and applicable USD terms | `COMPLETED` | `PRICED` | Full immutable line/result snapshot | None |
| No agreement and no W1 tariff | `MANUAL` / 404 `NO_RATE` | `MANUAL_PRICING` | None | Charge diagnostic + Booking work item |
| Equal highest-specificity agreements | `MANUAL` / 422 `PRICING_VALIDATION` | `MANUAL_PRICING` | None | Charge diagnostic + Booking work item |
| Same key/hash terminal replay | Existing terminal | Existing equivalent state | Byte-equivalent business data | No duplicate |
| Live same key/hash claim | `IN_PROGRESS` / 409 | `VALIDATED` or existing manual state | None | None; explicit retry after lease |
| Timeout/503 exhausted or circuit open | Claim may be absent/in-progress | `MANUAL_PRICING` | None | Booking work item only |
| Changed request/key collision | Existing state / 409 | Existing state | Unchanged | None |

## Performance and Observability Flow

Measure warmed end-to-end Booking-to-Charge latency around the real Compose HTTP seam. The p99 acceptance threshold is 800 ms; the two-second timeout is a containment ceiling, not the performance target. Metrics separate claim latency, agreement query, calculation, completion, HTTP retry, circuit state, and Booking apply time. Logs carry correlation ID, booking ID, amendment sequence, request hash prefix, owner token prefix, and stable result code, while excluding body snapshots and party data.

## Source Coverage

The workflow implements U03 in `unit-of-work.md`, maps US-W1-003/US-W1-004 from `unit-of-work-story-map.md`, satisfies `requirements.md`, preserves owners from `components.md`, realizes claim/API/client signatures in `component-methods.md`, and follows the synchronous Booking-to-Charge flow in `services.md`.
