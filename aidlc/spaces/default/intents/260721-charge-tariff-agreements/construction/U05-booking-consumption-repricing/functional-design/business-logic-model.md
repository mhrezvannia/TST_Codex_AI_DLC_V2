# Business Logic Model — U05 Booking Consumption and Repricing

## Scope and upstream contract

This design implements the `U05-booking-consumption-repricing` boundary in
`unit-of-work.md` and its US-06–US-11 allocation in
`unit-of-work-story-map.md`. It consumes FR-401–FR-507 and the UI/security
constraints in `requirements.md`, Booking components C09–C11/C14 from
`components.md`, the existing port/aggregate methods in
`component-methods.md`, and the bilateral interaction and resilience policy in
`services.md`.

The slice extends the existing Booking service, Booking app, PricingPort, and
`POST /api/bookings/{id}/price`. It does not introduce a service, route,
automatic reconfirm-time pricing, Booking-page redesign, or client-side pricing
authority. Charge remains the only source of amounts and commercial version
identities.

## Binding decisions

| Decision | Functional consequence |
| --- | --- |
| Persist `requestedDepartureDate` as a typed Booking field | Price/Reprice copies a stored business date; it never calls `LocalDate.now()` or accepts an unpersisted price-time date. A legacy Booking without the field remains readable but cannot be priced until the existing amend command supplies it. |
| Separate `pricingAmendmentSeq` from general `revision` | Every amendment advances `revision`; only a changed canonical pricing fingerprint advances `pricingAmendmentSeq` and marks `REPRICE_REQUIRED`. |
| Derive the Charge key inside Booking | The outbound idempotency key is exactly `<bookingRef>:<pricingAmendmentSeq>`, where `bookingRef` is the Booking's immutable `bookingNumber`. A browser token is never the commercial idempotency authority. |
| Persist provider truth, not reconstructed truth | New successes append the complete enriched Charge response. Booking performs structural and arithmetic validation but never recalculates or invents a price. |
| Preserve legacy evidence honestly | A flattened `quotedAmounts` snapshot stays readable as a named legacy entry; it is not converted into synthetic lines or inserted into the new table. |
| Keep the remote call outside the local write transaction | Booking freezes a request, calls Charge through the resilience policy, then locks/reloads and conditionally commits the outcome. |
| Keep lifecycle and pricing eligibility separate | Existing `BookingStatus` remains the general lifecycle/compatibility state; additive `PricingStatus` determines whether Price, Reprice, Confirm, or Reconfirm is eligible. |

## Canonical pricing input and fingerprint

`PricingInput.from(Booking)` materializes every field sent by
`ChargePricingRequest`: booking reference, trade lane, POL, POD, equipment type,
customer/party, commodity, reefer and dangerous-goods facts, both dates, and
the quantities object containing equipment quantity, TEU, and amendment
sequence. The compatibility `effectiveDate` equals `requestedDepartureDate`.
The canonical serializer uses stable field order, explicit null
representation, normalized strings, decimal-free integer quantities, and ISO
`yyyy-MM-dd` dates.

The SHA-256 `pricingInputFingerprint` covers that complete canonical value,
including `quantities.amendmentSeq`.
Correlation, actor, timestamps, general Booking revision, and display-only
attributes are excluded. The effective date is serialized in the outbound body
even though its value is derived from requested departure. This makes retry
bodies byte-identical and prevents non-pricing metadata changes from requesting
a new commercial result.

## Amendment workflow

The existing `/api/bookings/{id}/amend` route evolves additively from an
attributes map to `BookingAmendment(attributes, requestedDepartureDate?)`.
`Booking.applyAmendment(...)` replaces the one-size-fits-all call to the current
`Booking.amended(...)`; it preserves the established confirmed lifecycle while
also supporting a pre-price input correction.

1. Authorize the existing Booking amend action and load the aggregate.
2. Build the proposed typed state. `requestedDepartureDate` is accepted only as
   a persisted Booking amendment, including from the compact editor inside the
   existing pricing region.
3. Compute the old and proposed canonical pricing fingerprints while holding
   the proposed body's amendment sequence at the aggregate's current value.
4. Increment general `revision` once for every accepted amendment.
5. If fingerprints differ, increment `pricingAmendmentSeq` once, rebuild the
   final canonical input/fingerprint with that new sequence, and set
   `pricingStatus=REPRICE_REQUIRED`. Retain all history but remove the previous
   result's current-authority designation; the UI labels it “Previous price”.
6. If fingerprints are equal, preserve `pricingAmendmentSeq`, fingerprint,
   current snapshot pointer, and pricing status.
7. Persist Booking state and audit in one local transaction. No Charge call or
   new pricing outbox event occurs in this workflow.

| Starting `BookingStatus` | Pricing input changed? | Resulting general status | Resulting pricing status/currentness | Next action |
| --- | --- | --- | --- | --- |
| `VALIDATED` | yes | `VALIDATED` | `REPRICE_REQUIRED`; no prior current snapshot | Price (first-price label) |
| `VALIDATED` | no | `VALIDATED` | unchanged | Price when otherwise eligible |
| `PRICED` (not confirmed) | yes | `VALIDATED` | `REPRICE_REQUIRED`; old price becomes Previous | Reprice |
| `PRICED` | no | `PRICED` | existing price remains current | Confirm |
| `MANUAL_PRICING` | yes | `VALIDATED` | `REPRICE_REQUIRED`; prior failure becomes history/evidence | Price/Reprice |
| `MANUAL_PRICING` | no | `MANUAL_PRICING` | `MANUAL_PRICING_REQUIRED` remains current | correct pricing input/authority |
| `CONFIRMED` or `RECONFIRMED` | yes | `AMENDED` | `REPRICE_REQUIRED`; prior price becomes Previous | Reprice, then Reconfirm |
| `CONFIRMED` or `RECONFIRMED` | no | `AMENDED` | current price/fingerprint/sequence retained | Reconfirm without Charge |
| `AMENDED` | yes | `AMENDED` | `REPRICE_REQUIRED` | Reprice, then Reconfirm |
| `AMENDED` | no | `AMENDED` | unchanged | depends on current pricing eligibility |

`DRAFT`, `VALIDATION_BLOCKED`, `PRICING_PENDING`, and `EXCEPTION` reject this
pricing-region amendment. First-price date correction therefore remains
`VALIDATED`; it does not pretend a previously confirmed Booking was amended.

An initial W2 Booking starts at `pricingAmendmentSeq=0`. A legacy Booking missing
that field decodes as zero. Adding its first requested departure or changing any
other pricing field advances the sequence to one. Creation may supply the typed
date, but the codec does not invent it for older rows.

## Explicit Price/Reprice workflow

### Phase A — capture and claim the operation

`BookingPricingOperationCoordinator.captureAndClaim(...)` is a separate Spring
bean with a public `@Transactional` method; it is not a self-invoked helper on
`BookingApplicationService`.

1. Authenticate `request-pricing`; load Booking and reject absence.
2. Reject a missing requested departure or incomplete/invalid pricing input as
   422 Booking validation. Do not call Charge or create a Charge case.
3. Freeze `bookingId`, provider `bookingRef`, revision, pricing sequence,
   fingerprint, canonical body, correlation, body hash, and exact outbound key
   `<bookingRef>:<pricingAmendmentSeq>`.
4. Validate the browser request `idempotencyKey` for additive compatibility but
   never use it as Charge authority. The Booking-local storage key is
   `P|<outboundKey>`; the receipt separately stores the exact outbound key.
5. Look up `P|<outboundKey>` before applying new-attempt priceability. A matching
   `COMPLETED` receipt replays its immutable pricing-command outcome even when
   current general status is already `PRICED`; this is the lost-successful-200
   path. The service assembles that outcome into the current Booking view when
   current pricing sequence/fingerprint still match, so a later non-pricing
   revision is not rolled back in the response. A body/booking/operation mismatch
   is 409 `IDEMPOTENCY_CONFLICT`.
6. For an absent or due-retry receipt, require an explicit priceable pair:
   pre-confirm `VALIDATED` with `UNPRICED`/`REPRICE_REQUIRED`; post-confirm
   `AMENDED` with `REPRICE_REQUIRED`; or `MANUAL_PRICING`/manual-required retry
   when policy permits. `PRICED`, `CONFIRMED`, `RECONFIRMED`, and non-pricing
   `AMENDED` with a still-current price do not issue a redundant Charge request.
7. Claim/reload the row in existing `booking_idempotency` with
   `operation=PRICE`, canonical body hash, `IN_PROGRESS`/`COMPLETED`/`RETRYABLE`
   state, 15-second lease, owner, and
   incremented fencing token. A valid live lease returns local
   `PRICING_IN_PROGRESS`; an expired lease is fenced and taken over. A
   different operation/booking/body is 409 `IDEMPOTENCY_CONFLICT`.
8. `COMPLETED` replays its stored command status/outcome/evidence and normalized
   headers. `RETRYABLE` replays its recorded outcome until `nextAttemptAt`, then
   may be reclaimed with a higher fence and the same provider key/body. This
   prevents a local outage/circuit result from permanently shadowing Charge.
   Otherwise return the frozen operation/fence to the non-transactional caller.

`BookingPricingReceiptCodec` in data access serializes an application-owned
`PricingCommandReceiptPayload(schemaVersion=1, outcome, pricingRequestId,
currentPriceSequence, currentPriceFingerprint, evidence, correlationId)` with
fixed property order, ISO UTC dates, plain decimal JSON numbers, and UTF-8. It
does not depend on the container `BookingResponse`. The immutable command
payload plus HTTP status, normalized header, correlation, and existing
`response_revision` are stored in the completion transaction. On 200 replay,
`BookingPricingResponseAssembler` loads current Booking/history and combines
the stored commercial outcome only when current price markers still match;
the existing controller then serializes the current additive `BookingResponse`.
Thus non-pricing revisions/movement changes remain current while price truth is
idempotent. Error replay uses stored status/code/evidence.

Receipt transitions use compare-and-set under row lock. Claim/takeover increments
the fence only from absent, due `RETRYABLE`, or expired `IN_PROGRESS` state.
Retryable release and completion both require `state=IN_PROGRESS`, matching
lease owner, and matching observed fence; they clear owner/lease. A losing/stale
worker writes nothing. Provider `PRICING_IN_PROGRESS` releases `RETRYABLE` with
`nextAttemptAt = now + normalized Retry-After`; before then it replays 409, and
after then the same key/body may take a higher fence.

### Phase B — call Charge with bilateral resilience

The adapter sends `POST /pricing-requests` with
`Content-Type`/`Accept: application/vnd.api.v1+json`, the established Booking
service identity, correlation ID, exact key, and canonical body.

The composition is `CircuitBreaker(Retry(two-second HTTP call))`:

- one raw call has a two-second deadline;
- only timeout and HTTP 503 are retryable;
- Retry makes at most two raw calls total and reuses the identical serialized
  body, idempotency key, authorization identity, and correlation ID;
- the outer circuit records one result after retries are exhausted;
- a count window of five, minimum five calls, and 100% failure threshold opens
  after exactly five consecutive failed operations;
- after 30 seconds it admits one half-open probe; success closes it, failure
  reopens it and restarts the wait;
- HTTP 4xx and valid Charge domain outcomes do not count as circuit failures.

The adapter decodes an enriched success only when every required W2 enrichment
is present. A complete legacy response may follow the retained legacy decoder.
A partial enrichment, wrong JSON type, non-finite/over-scale money, incorrect
three-line order, mixed currencies, total not equal to the sum of the received
line amounts, or identity mismatch is `MALFORMED_PROVIDER_RESPONSE`; Booking
does not repair it.

### Phase C — conditionally commit

`BookingPricingCompletionService` is a second injected Spring bean whose public
`@Transactional complete(frozenOperation, remoteResult)` method owns the short
write transaction. `BookingApplicationService.requestPricing` calls the capture
bean, performs the remote call with no DB transaction, then calls this completion
bean. After the remote operation returns, completion:

1. locks and reloads `booking_records` plus typed pricing history;
2. compares current `revision`, `pricingAmendmentSeq`, and fingerprint with the
   frozen values;
3. on mismatch returns `BOOKING_CHANGED`/409 and appends neither snapshot nor
   outcome evidence; the provider receipt remains safely replayable under its
   frozen key;
4. checks the local receipt owner/fence and rejects a stale worker;
5. on a valid success, inserts the immutable typed snapshot, makes its request
   ID the current pointer, and sets `pricingStatus=PRICED`. A pre-confirm
   operation moves general status to `PRICED`; a post-confirm operation preserves
   general `AMENDED` until explicit Reconfirm. It writes Booking state,
   audit, and terminal local receipt atomically; no new pricing outbox event is
   introduced by U05;
6. on a manual-required result, writes typed Booking-local evidence, clears no
   historical snapshots, and sets `pricingStatus=MANUAL_PRICING_REQUIRED`. A
   pre-confirm operation uses compatibility general status `MANUAL_PRICING`; a
   post-confirm operation preserves general `AMENDED`. It
   writes audit and local receipt atomically. No-rate/ambiguity is `COMPLETED`
   because Charge owns a terminal receipt; timeout/503/circuit is `RETRYABLE`
   with the permitted next-attempt time because Charge created no terminal case;
7. on another distinct failure, records/returns exact API evidence without
   changing it into `MANUAL_PRICING_REQUIRED`. Provider/body conflict and
   snapshot conflict are `COMPLETED`; provider denied/malformed and local
   `BOOKING_CHANGED` are `RETRYABLE` after their stated recovery condition.

The append operation is idempotent. A primary-key collision with byte-equivalent
snapshot/correlation metadata is a no-op replay; different content for the same
identity is `PRICING_SNAPSHOT_CONFLICT` and is never overwritten.

Canonical replay comparison covers booking ID, request ID, amendment sequence,
Booking revision, schema version, exact canonical snapshot bytes, and
correlation ID. Database-generated `created_at` is excluded. All JDBC timestamp
conversion is UTC.

### Complete legacy provider success

The remote algebra has a separate `LegacyPriced` variant when every W2 additive
field is absent and every legacy required field/type is valid. It applies the
unchanged brownfield flattening transform and persists the exact resulting
`PricingSnapshot/quotedAmounts` in `booking_records.snapshot`; it inserts no V3
typed row, sets `pricingStatus=LEGACY_PRICED`, and is
eligible for the existing confirmation lifecycle. The local PRICE receipt
stores/replays the exact Booking response. API/history renders one explicit
Legacy snapshot with stored values and unavailable provenance. Any partial W2
enrichment remains `MALFORMED_PROVIDER_RESPONSE`. General status becomes
`PRICED` before first confirmation and remains `AMENDED` after a post-confirm
Reprice, matching the W2 success rule.

## Outcome projection

| Charge/client outcome | Booking state/evidence | Operator semantics | Charge OPEN case |
| --- | --- | --- | --- |
| Complete 200 agreement/tariff result | append snapshot; `PRICED` | show exact 3 lines, total, basis/ref and source versions | no |
| Complete legacy 200 | persist unchanged flattened snapshot; `LEGACY_PRICED` | show explicit Legacy evidence, no invented versions | no |
| 404 `NO_RATE` | `MANUAL_PRICING_REQUIRED`, reason/request/case/correlation evidence, no new snapshot | automatic confirmation blocked; no total | created/replayed by Charge |
| 422 `PRICING_VALIDATION` with an agreement/rate ambiguity reason | same manual state, preserve exact ambiguity reason | ambiguity is not relabeled no-rate | created/replayed by Charge |
| exhausted timeout or 503 | Booking-local `MANUAL_PRICING_REQUIRED` outage evidence, attempt count and correlation, no snapshot | later explicit Reprice allowed | no |
| circuit open | Booking-local manual state with circuit state and next probe time | no provider call; explicit retry after policy permits | no |
| 403 denied | `PRICING_DENIED`; no snapshot/manual relabel | correct authorization | no |
| malformed transport/provider response | `PRICING_PROVIDER_INVALID`; no snapshot/manual relabel | support/retry after defect correction | no |
| Booking semantic validation, including missing date | `PRICING_VALIDATION`; no Charge call | amend Booking input | no |
| Charge 422 non-authority validation | `PRICING_VALIDATION`; preserve code/details | correct input; no ambiguity relabel | no |
| 409 body conflict | `PRICING_CONFLICT`; no overwrite | resolve changed body/key invariant | no |
| provider in progress | `PRICING_IN_PROGRESS`; honor bounded `Retry-After` | keep one operation busy | no |
| Booking changed after remote call | `BOOKING_CHANGED`; no append | reload then explicit Price/Reprice | no additional case |

Manual-required evidence contains no amount or total. Prior priced history is
still inspectable but cannot be presented as the current price for confirmation.

## Read and history workflow

The Booking repository loads the current Booking projection, ordered typed
snapshots (`amendment_seq DESC, created_at DESC, pricing_request_id DESC`), and
any embedded legacy pricing payload. The query model exposes current/prior typed
entries plus at most one read-only “Legacy snapshot” entry. It never treats the
legacy entry as enriched and never fabricates basis, line, rate-version, or
agreement-version data.

The existing Booking detail route selects the current typed snapshot by default.
Selecting a historical entry is client-local display state; it changes no
Booking or Charge data. Reprice always operates on current Booking inputs, never
the selected historical entry. Existing `reconfirm(...)` remains lifecycle-only
and never calls PricingPort. `confirmed(...)` and `reconfirmed(...)` add the
same pricing-eligibility guard: current pricing must be `PRICED` or
`LEGACY_PRICED`; W2 uses the current typed snapshot plus aggregate current-price
markers, while legacy uses only aggregate `currentPriceAmendmentSeq` and
`currentPriceInputFingerprint` because the flattened payload contains neither.
Those markers must match current aggregate input, and no
manual/outage/validation/conflict/malformed/denied/in-progress evidence may be
current. A non-pricing amendment preserves that match and is reconfirmable; a
pricing amendment cannot bypass Reprice.

Typed history is fetched 20 entries at a time (maximum 100) with a stable
`(amendment_seq, created_at, pricing_request_id)` cursor. This bounds the Booking
detail response without changing ordering or losing older history. `nextCursor`
is base64url canonical JSON `{a,t,id}`. The next descending page applies
`(amendment_seq, created_at, pricing_request_id) < (:a,:utcTimestamp,:id)` and
returns the same DESC order, preventing gaps/duplicates.

## Booking HTTP and BFF contract

The existing price route remains. Successful command outcomes return an
additively extended `BookingResponse`; error outcomes retain the existing
`ApiErrorResponse(code,message,correlationId)` and may add safe
`pricingEvidence`. The BFF forwards these statuses/bodies exactly.

| Outcome | HTTP | `pricingStatus` / stable code | Body/current Booking view | `Retry-After` |
| --- | --- | --- | --- | --- |
| W2 priced | 200 | `PRICED` | extended Booking view with typed history | none |
| complete legacy priced | 200 | `LEGACY_PRICED` | Booking view with Legacy snapshot | none |
| no rate | 200 | `MANUAL_PRICING_REQUIRED` / reason `NO_RATE` | persisted Booking view, provider request/case/correlation, no current total | none |
| any of four authority ambiguities | 200 | `MANUAL_PRICING_REQUIRED` / exact ambiguity reason | persisted Booking view and Charge case evidence, no current total | none |
| timeout or 503 exhausted | 200 | `MANUAL_PRICING_REQUIRED` / `PRICING_PROVIDER_TIMEOUT` or `PRICING_PROVIDER_UNAVAILABLE` | persisted Booking-local outage view, no Charge case/total | none |
| circuit open | 200 | `MANUAL_PRICING_REQUIRED` / `PRICING_CIRCUIT_OPEN` | persisted local circuit/next-probe view | none |
| human action denied before call | 403 | `FORBIDDEN` | error only; no mutation/provider call | none |
| Charge denies Booking service | 502 | `PRICING_PROVIDER_DENIED` | error only; current Booking not returned | none |
| malformed provider success/transport | 502 | `PRICING_PROVIDER_INVALID` | error plus safe correlation; no append | none |
| Booking input validation | 422 | `PRICING_VALIDATION` | error with safe field evidence; no provider call | none |
| provider non-authority validation | 422 | `PRICING_VALIDATION` plus exact reason | error only; no manual relabel | none |
| body/key or local receipt conflict | 409 | `IDEMPOTENCY_CONFLICT` | error only | none |
| provider/local operation in progress | 409 | `PRICING_IN_PROGRESS` | error only | normalized delta seconds |
| snapshot identity conflict | 409 | `PRICING_SNAPSHOT_CONFLICT` | error only | none |
| Booking changed during call | 409 | `BOOKING_CHANGED` | local completion error; no remote-result variant or append | none |

Provider `Retry-After` is accepted only as integer delta seconds 1–30; missing,
malformed, zero, negative, date-form, or greater values normalize to one second.
Local in-progress uses remaining lease seconds clipped to 1–15. Booking emits
the normalized value and the BFF forwards only that value, never the raw header.

## Scenario proof obligations

- First price for a known agreement persists and renders the provider payload
  field-for-field.
- Complete tariff fallback does the same with the deterministic tariff ref.
- An amendment moving requested departure into an Approved successor-agreement
  window yields that successor agreement/version-linked lines and retains the
  original snapshot unchanged.
- A pricing-affecting amendment advances only `pricingAmendmentSeq`, exposes
  Reprice, appends a new result, and retains the old result.
- A non-pricing amendment advances Booking revision without exposing Reprice.
- Missing date is rejected before Charge; no clock fallback is observable.
- No-rate, ambiguity, timeout, 503, and circuit-open states render no total and
  block automatic confirmation with the correct evidence ownership.
- Denied, malformed, validation, conflict, and in-progress remain distinct.
- Two simultaneous completions cannot append two divergent snapshots, and a
  Booking amendment racing completion yields `BOOKING_CHANGED`.
- A baseline flattened record remains readable before and after V3 migration.
- A maximum-length valid provider key plus `P|` persists without truncation in
  the widened 192-character local primary-key column.
- Repository integration proves production snapshot ports expose no update or
  delete and that replay cannot alter canonical bytes or historical rows.
- Per-instance circuit tests record that Resilience4j state is process-local and
  resets on restart; no distributed five-failure counter is claimed.
