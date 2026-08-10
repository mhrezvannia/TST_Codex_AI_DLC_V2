# Business Rules - U03 Agreement Pricing

## Request and Eligibility Rules

| ID | Rule | Outcome when false |
|---|---|---|
| BR-U03-001 | Booking may price only a `VALIDATED` aggregate whose validation fingerprint still matches the current canonical fields. | 409 invalid/stale transition; no Charge call. |
| BR-U03-002 | The request media type, body fields, `Idempotency-Key`, and `X-Correlation-Id` must match `pricing.v1.yaml`. | 400 `PRICING_BAD_REQUEST`. |
| BR-U03-003 | `quantities.amendmentSeq` is required, non-negative, and must equal the sequence encoded by `bookingRef:amendmentSeq`. | 400 `PRICING_BAD_REQUEST`. |
| BR-U03-004 | Equipment quantity and TEU are positive integers; dates are valid ISO dates; POL/POD are canonical UN/LOCODE values. | 422 `PRICING_VALIDATION` after syntactic validation. |
| BR-U03-005 | Automatic agreement pricing requires exactly one highest-specificity approved active agreement for party, lane, commodity, and effective date. | Manual diagnostic and 422; no charges. |
| BR-U03-006 | Multiple equal highest-specificity agreements are never resolved by database order, latest date, or ID. | `AMBIGUOUS_ACTIVE_AGREEMENT`. |
| BR-U03-007 | W1 uses agreement pricing first and an explicit no-match tariff adapter second. `NO_RATE` is valid only after both return no authority. | 404 `NO_RATE` and manual records. |

## Idempotency and Concurrency Rules

- The canonical idempotency key is `bookingRef:amendmentSeq`; a unique constraint also protects `(booking_ref, amendment_seq)`.
- Request hash covers the complete canonical business body, not correlation ID, owner token, timestamps, or transport headers.
- Claim state is `IN_PROGRESS -> COMPLETED | MANUAL`; terminal state is immutable.
- `IN_PROGRESS` has a ten-second owner lease. Claim and completion use separate `REQUIRES_NEW` transactions and calculation runs outside both.
- Same key/hash in terminal state replays persisted business data without recalculation, duplicate manual cases, or changed timestamps.
- Same key/hash under a live lease returns 409 `PRICING_IN_PROGRESS`.
- Same key/different hash or booking/amendment collision returns 409 `IDEMPOTENCY_CONFLICT`.
- Expired claim takeover is one compare-and-set on prior owner and lease. Completion is fenced by current owner token; stale owners cannot write a result or manual case.
- Exactly one Charge manual case may exist per pricing request. It is committed only with a `MANUAL` terminal completion.

## Agreement and Amount Rules

- Agreement status must be approved and validity must contain `effectiveDate`; every selected term validity must also contain it.
- The selected agreement must match exact party, trade lane, and commodity semantics required by the request. Commodity ineligibility returns 422 `COMMODITY_NOT_ELIGIBLE`.
- Each term persists an explicit `category` enum: `FREIGHT`, `SURCHARGE`, or `LOCAL`. Category is never inferred from charge-code text.
- Every W1 agreement term and result line uses ISO 4217 `USD`. Mixed or unsupported currencies are a validation/manual outcome, not a converted amount.
- Amounts use `BigDecimal`, are non-negative, and serialize to two fractional digits. No guessed exchange rate, default amount, or partial line list is allowed.
- Result lines are stable by charge code then term ID. At least one line is required for a 200 response.
- `applicableDndRuleTypes` is present and empty in W1. Hard-coded trigger types are forbidden until the later D&D agreement model owns them.
- `pricingBasis` is `AGREEMENT` for the W1 happy path; `TARIFF` remains contract-compatible but not operationally claimed.

## Booking State and Retry Rules

- `VALIDATED -> PRICED` is the durable automatic success path; request/UI busy state is not persisted as aggregate `PRICING_PENDING`.
- Any terminal no-rate, reached-service manual/validation outcome, timeout/503 exhaustion, or circuit-open outcome enters explicit `MANUAL_PRICING` with no `PricingSnapshot`.
- Booking creates one operator work item per booking/amendment. Reached-Charge outcomes link pricing request and correlation IDs; transport/circuit outcomes do not claim a Charge case exists.
- Confirm is allowed only from `PRICED`; `VALIDATED` while a request is busy and `MANUAL_PRICING` always block it.
- Booking retries at most once, only on timeout or 503, with identical body/key/correlation. No 4xx response is retried.
- The Charge circuit opens after five failed operations and permits one half-open probe after 30 seconds. Circuit-open creates a Booking-only manual work item.
- A returned result applies only if booking ID, amendment sequence, revision, and reference fingerprint still match the captured request.

## Error and Security Rules

- Status/code mapping is exact: 400 `PRICING_BAD_REQUEST`; 404 `NO_RATE`; 409 `IDEMPOTENCY_CONFLICT|PRICING_IN_PROGRESS`; 422 `PRICING_VALIDATION|COMMODITY_NOT_ELIGIBLE`; 503 `PRICING_UNAVAILABLE`.
- Every error contains `code`, safe `message`, and `correlationId`; no stack trace, SQL, host, raw upstream body, party attributes, or request snapshot is exposed.
- Booking sends service identity server-side. Browser code never sends internal credentials or calls Charge directly.
- Authorization is checked before Charge pricing data is disclosed. Idempotent replay does not bypass authorization.

## UI Rules

- Price is the one primary action only in `VALIDATED`; it has a stable request-local busy state while the command runs.
- `PRICED` detail shows basis, reference, itemized charge code/category/amount/currency, and a derived display total without hiding lines.
- `MANUAL_PRICING` shows the exact safe reason, correlation ID, and operator work-item status; it never displays stale or fallback amounts.
- In-progress/conflict, no-rate, validation, and unavailable states are visually and semantically distinct.

## Source Coverage

Rules refine U03 from `unit-of-work.md`, US-W1-003/US-W1-004 in `unit-of-work-story-map.md`, pricing and failure acceptance in `requirements.md`, Booking/Charge ownership in `components.md`, exact methods in `component-methods.md`, and HTTP/retry/manual boundaries in `services.md`.
