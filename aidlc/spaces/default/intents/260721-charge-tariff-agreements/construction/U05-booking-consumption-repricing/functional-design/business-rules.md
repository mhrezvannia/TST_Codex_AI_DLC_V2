# Business Rules — U05 Booking Consumption and Repricing

## Rule register

These rules refine U05 in `unit-of-work.md` and
`unit-of-work-story-map.md`, trace to `requirements.md`, and bind the Booking
parts of `components.md`, `component-methods.md`, and `services.md`.

### Pricing-input authority

| Rule | Binding behavior |
| --- | --- |
| BR-U05-001 | `requestedDepartureDate` is stored on Booking and is the only commercial resolution date. |
| BR-U05-002 | Outbound `effectiveDate` is retained only for compatibility and must equal `requestedDepartureDate`. |
| BR-U05-003 | Booking and adapter code must not use the server clock as a missing-date default. |
| BR-U05-004 | A legacy Booking without the date is readable, but Price/Reprice fails Booking validation before a provider call. |
| BR-U05-005 | The existing Booking amend command is the only UI write seam for correcting the date; the price command does not accept an ad-hoc business date. |
| BR-U05-006 | The pricing fingerprint covers every outbound pricing-request value and excludes actor, correlation, clock time, UI selection, and non-pricing attributes. |

### Revision, key, and explicit repricing

| Rule | Binding behavior |
| --- | --- |
| BR-U05-010 | General Booking `revision` advances for every accepted amendment. |
| BR-U05-011 | `pricingAmendmentSeq` starts at zero and advances exactly once when the canonical pricing fingerprint changes. |
| BR-U05-012 | Non-pricing amendments do not advance the pricing sequence and do not expose Reprice. |
| BR-U05-013 | The Charge idempotency key is exactly `bookingRef:pricingAmendmentSeq`, where provider `bookingRef` is the immutable Booking number; it is derived server-side. |
| BR-U05-014 | A retry or replay uses the byte-identical body and key; a different body under that key is a conflict. |
| BR-U05-015 | The existing `/api/bookings/{id}/price` command means Price before the first result and Reprice after a pricing-input change. |
| BR-U05-016 | `reconfirm` remains lifecycle-only and never implicitly invokes Charge. |
| BR-U05-017 | Reprice uses current persisted Booking inputs, not a historically selected snapshot. |
| BR-U05-018 | `applyAmendment` leaves a pre-price `VALIDATED` Booking `VALIDATED`; a confirmed/reconfirmed Booking becomes `AMENDED`; non-pricing changes preserve current pricing authority. |
| BR-U05-019 | Confirm/Reconfirm requires `PRICED` or `LEGACY_PRICED` whose sequence/fingerprint matches current Booking input; every manual, reprice-required, validation, outage, denied, malformed, conflict, changed, or in-progress state is rejected without a Charge call. |
| BR-U05-019A | Price/Reprice is allowed only for pre-confirm `VALIDATED` unpriced/reprice-required, post-confirm `AMENDED` reprice-required, or an explicit manual/outage retry; a current price cannot be redundantly priced. |

### Provider truth and snapshot integrity

| Rule | Binding behavior |
| --- | --- |
| BR-U05-020 | A W2 success is accepted only when the complete enriched provider set is present; partial enrichment is malformed. |
| BR-U05-021 | An accepted W2 success contains exactly three lines in BASE/OFR, SURCHARGE/BAF, LOCAL/THC order, one USD total, pricing basis/ref, exact source rate-version IDs, and optional agreement-version ID only when applicable. |
| BR-U05-022 | Booking validates structure, scale, currency, identities, and total consistency but never recalculates, substitutes, rounds, or fabricates a provider amount. |
| BR-U05-023 | A successful result appends one typed immutable snapshot; it never updates or deletes an earlier snapshot. |
| BR-U05-024 | An identical insert for an existing `(booking_id, pricing_request_id)` is a replay; divergent content is a conflict. |
| BR-U05-025 | Completion may commit only if Booking revision, pricing sequence, and fingerprint still equal the frozen operation. |
| BR-U05-026 | A racing amendment causes `BOOKING_CHANGED`; the provider response is not attached to the newer Booking state. |
| BR-U05-027 | Legacy flattened values remain stored/readable but are never backfilled or interpreted as W2 lines/source versions. |
| BR-U05-028 | A live 200 with all W2 additive fields absent and all legacy required fields valid becomes `LegacyPriced`, uses the unchanged embedded flattened snapshot path, inserts no typed row, and remains legacy-confirmation eligible. |
| BR-U05-029 | Any mixture of present and absent W2 enrichment is malformed; it cannot fall back to `LegacyPriced`. |

### Failure meaning and manual pricing

| Rule | Binding behavior |
| --- | --- |
| BR-U05-030 | Charge `NO_RATE` maps to Booking `MANUAL_PRICING_REQUIRED`, preserves provider request/case/correlation evidence, and has no total. |
| BR-U05-031 | Only `AMBIGUOUS_AGREEMENT_AUTHORITY`, `AMBIGUOUS_BASE_RATE`, `AMBIGUOUS_SURCHARGE_RATE`, and `AMBIGUOUS_LOCAL_RATE` map a Charge `PRICING_VALIDATION` response to manual-required; the exact ambiguity reason is retained. |
| BR-U05-032 | Exhausted timeout, exhausted 503, and open circuit map to Booking-local manual-required outage evidence; they never create or imply a Charge OPEN case. |
| BR-U05-033 | Denied, malformed, semantic validation, idempotency conflict, Booking-changed, and in-progress responses retain distinct Booking codes and are not relabeled manual-required. |
| BR-U05-034 | Manual-required or any unpriced current state blocks automatic confirmation and renders no current total. Historical priced snapshots remain evidence only. |
| BR-U05-035 | Provider in-progress honors a validated, bounded `Retry-After`; concurrent UI commands are disabled while one request is active. |

### Resilience

| Rule | Binding behavior |
| --- | --- |
| BR-U05-040 | Each raw Charge HTTP call has a two-second timeout. |
| BR-U05-041 | Retry applies only to timeout and 503 and permits two raw calls total. |
| BR-U05-042 | The outer circuit records one operation only after the retry policy completes. |
| BR-U05-043 | The circuit window is five, minimum calls five, failure threshold 100%; it opens after five consecutive post-retry failed operations. |
| BR-U05-044 | The open wait is 30 seconds with one half-open probe; success closes, failure reopens and restarts the wait. |
| BR-U05-045 | 4xx and valid domain outcomes do not increment the circuit failure count. |
| BR-U05-046 | Circuit state is process-local and resets on service restart; no distributed counter is claimed. |

### Security, audit, and observability

| Rule | Binding behavior |
| --- | --- |
| BR-U05-050 | Browser actor/idempotency values do not authorize or define the provider identity; the Booking service uses the existing trusted service subject. |
| BR-U05-051 | Correlation propagates UI/BFF → Booking → Charge → Booking evidence without exposing customer payloads or commercial values in logs/metric labels. |
| BR-U05-052 | A separate transactional capture bean claims/fences the existing Booking idempotency row; the HTTP call has no DB transaction; a separate transactional completion bean locks/reloads and commits Booking state, snapshot/evidence, audit, and local terminal receipt atomically. |
| BR-U05-053 | Audit identifies booking, pricing request, sequence, outcome, correlation, actor/service identity, and safe source IDs, not line amounts. |
| BR-U05-054 | U05 introduces no pricing outbox event; existing lifecycle outbox behavior is unchanged. |
| BR-U05-055 | The browser command idempotency token is compatibility input only; the server-derived Charge key is outbound authority and `P|<ChargeKey>` is the Booking-local receipt identity. |
| BR-U05-056 | Charge-terminal success/no-rate/ambiguity/conflicts complete the local receipt; timeout/503/circuit and recoverable denied/malformed/Booking-changed outcomes are `RETRYABLE`, replay recorded evidence until `nextAttemptAt`, then permit a higher-fence same-key/body attempt. |
| BR-U05-057 | Receipt lookup/replay precedes new-attempt priceability, so an identical retry can replay a lost successful 200 after Booking is already `PRICED`; only an absent/due-retry receipt applies the new-attempt status guard. |
| BR-U05-058 | Completion stores one schema-v1 canonical application `PricingCommandReceiptPayload`, not the container Booking DTO; 200 replay combines immutable commercial outcome with the current Booking view only when current price markers match. |
| BR-U05-059 | Provider `PRICING_IN_PROGRESS` releases the local receipt as `RETRYABLE` until normalized provider `Retry-After`, then permits a higher-fence identical-key/body call. |
| BR-U05-060 | Claim, expired takeover, retryable release, and completion are row-locked compare-and-set transitions; only matching IN_PROGRESS owner/fence can release or complete. |

## State-transition rules

| Current condition | Command/event | Next condition | Prohibited side effect |
| --- | --- | --- | --- |
| no typed price, valid input | Price success | `PRICED` | overwrite legacy/history |
| `VALIDATED` | date/pricing correction | general `VALIDATED`; pricing `REPRICE_REQUIRED` | false confirmed-amend lifecycle/clock default |
| `PRICED` (pre-confirm) | non-pricing amend | general/pricing remain `PRICED` | sequence advance/provider call |
| `PRICED` (pre-confirm) | pricing-input amend | general `VALIDATED`; pricing `REPRICE_REQUIRED` | implicit pricing/history deletion |
| `CONFIRMED`/`RECONFIRMED` | non-pricing amend | general `AMENDED`; pricing remains `PRICED` and current | provider call/sequence advance |
| `CONFIRMED`/`RECONFIRMED` | pricing-input amend | general `AMENDED`; pricing `REPRICE_REQUIRED` | direct Reconfirm/history deletion |
| `REPRICE_REQUIRED` | Reprice success | `PRICED` with new current snapshot | prior snapshot mutation |
| any priceable state | no-rate/ambiguity | `MANUAL_PRICING_REQUIRED` | partial snapshot/total |
| any priceable state | exhausted provider outage | `MANUAL_PRICING_REQUIRED` with Booking-local outage | Charge case claim |
| `AMENDED` + current matching price | Reconfirm | `RECONFIRMED`, same price/sequence | Charge call/pricing sequence change |
| `AMENDED` + stale/manual/error price | Reconfirm | reject `PRICING_REQUIRED` | lifecycle bypass |
| complete legacy provider 200 | completion | general `PRICED`; pricing `LEGACY_PRICED` | typed-row/synthetic-version creation |

For the three completion rows, general status is origin-sensitive: a
pre-confirm success becomes `PRICED` and manual becomes `MANUAL_PRICING`; a
post-confirm Reprice success or manual outcome remains general `AMENDED` until
the guarded Reconfirm. The same rule applies to `LEGACY_PRICED`.

## Validation precedence

Validation executes in this order so failures are deterministic:

1. authenticated Booking action and Booking existence;
2. typed Booking input completeness and requested-departure validity;
3. canonical body/key creation and transactional local receipt claim/fence;
4. circuit/retry/provider transport;
5. response media, schema, identity, order, money, and total validation;
6. locked Booking freshness check;
7. idempotent snapshot/evidence plus audit/terminal-receipt persistence.

An earlier failure prevents every later side effect. In particular, invalid
Booking input creates no Charge receipt/case, and malformed success creates no
Booking snapshot.

## UI rules within the existing Booking pricing region

- The region shows persisted requested departure and offers its amendment
  control there; no Booking route, shell, navigation, typography, palette, or
  shared `packages/ui` primitive changes.
- Price/Reprice has an accessible name, prevents duplicate activation while
  busy, retains focus, and announces pending/success/failure changes through an
  existing polite live region.
- The current typed price defaults selected. History selection is labeled with
  amendment sequence, priced time, and Current/Previous/Legacy status.
- Itemisation uses a caption and explicit code/category/basis/quantity/unit
  rate/amount/currency headers. The total has a programmatic label.
- At narrow widths, the existing region may horizontally scroll with a visible
  label or render the same labeled fields per line; values and order do not
  disappear.
- Manual, validation, denied, conflict, in-progress, and outage states use text
  plus semantic status—not color alone—and never show a current numeric total.
- State remains route/form/component-local because RTK is absent; no new state
  framework is introduced.

## Compatibility and preservation rules

- `BookingSnapshotCodec` dual-reads schema-v1 embedded flattened pricing and
  schema-v2 Booking state. Migration V3 performs no destructive payload rewrite
  and no speculative backfill.
- A newly received complete legacy provider 200 uses the same embedded flattened
  persistence and renders as `LEGACY_PRICED`; it is not a W2 acceptance result.
- Legacy confirmation uses aggregate `currentPriceAmendmentSeq` and
  `currentPriceInputFingerprint` markers set at legacy completion; it never
  claims those fields exist in the flattened legacy payload.
- Existing create/amend/reconfirm/price routes remain. The amend request evolves
  additively with optional typed requested departure while retaining legacy
  attributes.
- Existing W0-01, W0-02, W1-01, W2-01, and W2-02 behavior is regression-protected.
  The W1 waiver remains a waiver and is never restated as a real PASS.
- Booking UI changes are confined to the existing pricing region required for
  the Booking-visible breakdown; Charge design additions remain solely in the
  existing Charge page override and no new design-system record is created here.
