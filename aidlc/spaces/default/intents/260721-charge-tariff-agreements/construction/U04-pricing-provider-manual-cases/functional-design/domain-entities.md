# Domain Entities — U04 Pricing Provider and Manual Cases

## Ubiquitous Language

- **PricingRequest**: the existing bilateral v1 booking-time request, identified by `bookingRef:amendmentSeq` and hashed from its complete body.
- **Business date**: `dates.requestedDepartureDate`; never the wall clock. Equal `effectiveDate` is retained compatibility input only.
- **Pricing authority**: exactly one Approved W2 AgreementVersion with exact links, otherwise exactly one Approved standalone RateVersion per required category.
- **PricingResult**: immutable successful itemisation with exactly three source-attributed USD lines and one total.
- **Terminal receipt**: the durable public HTTP outcome for one key/hash, including exact serialized response bytes.
- **ManualPricingCase**: read-only OPEN Charge evidence that automatic authority was missing or ambiguous. It is not a quote or workflow task.
- **Domain reason**: exact Charge outcome evidence (`NO_RATE` or one ambiguity code), distinct from public envelope code and Booking state.

## Entities & Aggregates

### PricingRequest aggregate input

The record retains all existing body fields plus transport correlation. Its derived `pricingRequestId` is exactly `bookingRef:amendmentSeq`. The idempotency key is verified against that ID; it is not separately accepted as business identity. All three W2 rates are `PER_CONTAINER`, so the calculator uses `equipmentQuantity`; retained `teu` remains hashed and contract-valid but unused in this thin slice.

### ResolvedPricingAuthority value

This discriminated value is either:

- `AgreementAuthority(agreementVersionId, baseRateVersion, surchargeRateVersion, localRateVersion)`; or
- `TariffAuthority(baseRateVersion, surchargeRateVersion, localRateVersion)`.

It can be constructed only after uniqueness/lifecycle/date/applicability checks and stores the three sources in fixed category order. There is no incomplete form or generic attributes map.

### PricingResult and PricingLine

`PricingResult` owns three immutable `PricingLine` values plus total and provenance. Each line owns rate category, legacy category, charge code, `PER_CONTAINER`, equipment quantity, source unit Money, rounded amount Money, and source RateVersion identity. Result currency is derived from all lines and is USD.

### PricingTerminalReceipt

The aggregate maps one idempotency key/body hash to claim ownership and one immutable terminal. A terminal owns schema version, pricing request ID, domain terminal code, HTTP status, exact response snapshot, correlation, completion time, and optional case ID. It is the replay authority; `PricingResult` reconstruction is not.

### ManualPricingCase

The entity is generated or retrieved by canonical request/reason key and always has `status=OPEN`. It owns safe request-context evidence, not money or mutable workflow fields. Existing legacy rows may have nullable new columns and usually have `legacy:<caseId>` keys; U01 assigns the earliest row for each prior request/reason the canonical key. U04 must reuse that canonical winner unchanged, with `legacyEvidence=true` and unavailable nullable fields. Newly inserted U04 rows are complete.

## Field-Level Schema (canonical names)

### Existing request and derived identity

| Field | Type / value object | Canonical name (source) | Standard | Notes |
|---|---|---|---|---|
| Booking reference | nonblank string | `bookingRef` (`pricing.v1.yaml`) | Existing bilateral contract | Part of request ID |
| Lane | stable ID string | `tradeLane` | LinerCore Reference Data | Agreement discriminator |
| Origin/destination | `UnLocode` | `pol`, `pod` | UN/LOCODE | Exact five-character contract pattern |
| Equipment | stable ID/code | `equipmentType` | LinerCore Reference Data | Exact discriminator |
| Party/customer | stable party ID | `partyId` | LinerCore Reference Data | Customer authority identity |
| Commodity | stable code | `commodityCode` | Existing contract | Retained/hashed/validated; not W2 agreement discriminator |
| Special flags | boolean | `reeferIndicator`, `dgIndicator` | Existing contract | Retained in hash/context; no extra rate dimension in thin slice |
| Compatibility date | `LocalDate` | `dates.effectiveDate` | Existing contract | Must equal requested departure |
| Business date | `LocalDate` | `dates.requestedDepartureDate` | W2-03 | Sole authority date |
| Equipment count | positive integer | `quantities.equipmentQuantity` | W2-03 | Used on all lines |
| TEU | positive integer | `quantities.teu` | Existing contract | Retained/hash only |
| Amendment | non-negative integer | `quantities.amendmentSeq` | Existing contract | Part of request ID |
| Request identity | string ≤128 | `pricingRequestId` | W2-03 derived | exact `bookingRef:amendmentSeq` |
| Correlation | string 1–128 | `correlationId` | Platform tracing | Transport/header-derived |

### Successful public result

| Field | Type / value object | Canonical name (source) | Standard | Notes |
|---|---|---|---|---|
| Booking reference | string | `bookingRef` | Existing pricing v1 | Retained |
| Authority kind | enum | `pricingBasis` | Existing pricing v1 | AGREEMENT or TARIFF |
| Authority reference | string | `pricingRef` | Existing pricing v1 | Exact agreement version or tariff hash |
| Lines | ordered list, size 3 | `charges[]` | Existing pricing v1 | BASE, SURCHARGE, LOCAL order |
| D&D types | list | `applicableDndRuleTypes[]` | Existing pricing v1 | Retained empty in this slice |
| Total | numeric Money amount | `total` | W2-03 additive | scale two; sum rounded lines |
| Currency | `CurrencyCode` | `currency` | ISO 4217 | USD |
| Business date | `LocalDate` | `requestedDepartureDate` | W2-03 additive | exact request value |
| Provider request ID | string | `pricingRequestId` | W2-03 additive | exact terminal identity |
| Correlation | string | `correlationId` | W2-03 additive | exact request correlation |
| Pricing timestamp | `Instant` | `pricedAt` | W2-03 additive | first completion UTC |
| Agreement source | optional stable ID | `agreementVersionId` | W2-03 additive | agreement result only |

### Successful public line

| Field | Type / value object | Canonical name (source) | Standard | Notes |
|---|---|---|---|---|
| Charge code | enum/code | `chargeCode` | Existing pricing v1 | OFR, BAF, THC |
| Legacy category | enum | `category` | Existing pricing v1 | FREIGHT, SURCHARGE, LOCAL |
| Rounded amount | JSON number | `amount` | Existing pricing v1 | non-negative, scale two |
| Currency | `CurrencyCode` | `currency` | Existing pricing v1 | USD |
| Rate category | enum | `rateCategory` | W2-03 additive | BASE, SURCHARGE, LOCAL |
| Charge basis | enum | `basis` | W2-03 additive | PER_CONTAINER |
| Quantity | positive integer | `quantity` | W2-03 additive | equipment quantity |
| Unit rate | JSON number | `unitRate` | W2-03 additive | source rate, scale ≤2 |
| Source identity | stable ID | `sourceRateVersionId` | W2-03 additive | exact immutable version |

### Public error additions

| Field | Type | Canonical name | Notes |
|---|---|---|---|
| Envelope code/message/correlation | existing required strings | `code`, `message`, `correlationId` | unchanged |
| Domain reason | optional enum string | `reasonCode` | populated for terminal manual outcome |
| Request identity | optional string | `pricingRequestId` | populated for claimed terminal manual outcome |
| Case identity | optional string | `manualCaseId` | populated for claimed terminal manual outcome |

### U01 V4 persistence consumed unchanged

| Aggregate field | Physical column | Rule |
|---|---|---|
| Claim key/hash | `pricing_requests.idempotency_key`, `request_hash` | unique key, 64 lowercase hex hash |
| Ownership | `status`, `owner_token`, `lease_until` | fenced IN_PROGRESS claim |
| Exact bytes | `response_snapshot` | serialized public DTO/error, replay authority |
| Terminal reason/time | `terminal_code`, `correlation_id`, `completed_at` | immutable terminal evidence |
| Terminal HTTP/schema/request | `terminal_http_status`, `terminal_schema_version`, `terminal_pricing_request_id` | W2 requires 200/404/422, `pricing.v1`, exact ID |
| Case link | `manual_case_id` | required for MANUAL, absent for PRICED |
| Manual identity/reason | `manual_pricing_cases.case_id`, `pricing_request_id`, `reason_code` | immutable evidence |
| Manual request evidence | `booking_ref`, `amendment_seq`, `request_hash`, `correlation_id`, `opened_at`, `snapshot` | complete for new U04 rows |
| Manual state/dedupe | `status`, `dedupe_key` | OPEN only; canonical unique key |

## Contract Fidelity Check

- No existing request/result/line/error field is renamed or has its JSON type changed.
- Existing required arrays and enum values remain. A success still uses `charges[].category=FREIGHT` for OFR.
- New result/line/error fields are optional in the OpenAPI schema for legacy-consumer compatibility; a W2 provider success emits the full enriched set and Booking rejects partial enrichment.
- `amount`, `unitRate`, and `total` are JSON numbers, not formatted strings. UI formatting is presentation only.
- Error-specific reason/case/request fields are explicit typed properties because `additionalProperties:false` forbids an attributes bag.
- Current code diverges by exposing only old line/result fields, using a manual flag inside `PricingResult`, recovering booking ref from request ID, and replaying reconstructed domain results. U04 replaces those divergences; it does not keep two W2 response models.
- Current persistence columns and U01 V4 additions are used as designed; U04 adds no alternate receipt/case table and edits no migration.

## Invariants & Validation

1. `ResolvedPricingAuthority` is complete or absent; it cannot contain a null/duplicate category.
2. Agreement authority references exactly one W2 Approved AgreementVersion and its three linked Approved RateVersions.
3. Tariff authority references three unique standalone Approved RateVersions matched on the business date.
4. Result line order, codes, legacy categories, additive categories, quantities, currency, and IDs are deterministic.
5. Result total equals the scale-two sum of the three scale-two line amounts.
6. A receipt terminal is immutable and response snapshot is the replay source.
7. A newly inserted U04 manual receipt/case refer to the same pricing request ID, hash, reason, correlation, and first completion/open time. A canonical backfilled winner must match request ID/reason but may honestly lack the later hash/correlation/time fields and is never rewritten.
8. New manual evidence contains no commercial amount/rate/total and has no lifecycle fields beyond OPEN; legacy evidence is never parsed or synthesized to fill missing fields.
9. Repository reads use structured W2 columns; legacy commodity/snapshot JSON is never queried as authority.
10. Exact foreign IDs are stored; display labels remain BFF/UI enrichment only.

## Lifecycle / State

`PricingTerminalReceipt` transitions `IN_PROGRESS → COMPLETED` or `IN_PROGRESS → MANUAL` once; terminal states only replay. Lease takeover changes owner token/expiry only while IN_PROGRESS. `ManualPricingCase` is created OPEN and has no W2-03 transition.

## Open Questions

1. Any canonical field or type unresolved?
   - A. No; names and types above are bound to `pricing.v1.yaml`, U01 V4, and approved W2-03 design. **(Selected)**
   - B. Some field requires domain-owner resolution.
   - X. Other.
   - `[Answer]: A — no unresolved field or type ambiguity.`

## Upstream Coverage

This entity model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It binds the U04 unit to U01 V4 storage, U01 RateVersion, U03 AgreementVersion/link authority, and the additive bilateral pricing contract. It covers FR-301–FR-307, FR-401–FR-407 and FR-604 without taking U05 Booking snapshot ownership.
