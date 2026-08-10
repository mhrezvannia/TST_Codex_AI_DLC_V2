# Domain Entities - dnd-author-price-walking-skeleton

## Ubiquitous Language

This model refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`.

- **D&D terms:** one Charge-owned aggregate whose immutable commercial snapshots are `DndTermsVersion`.
- **Rule type:** one of the three bilateral MVP detention/demurrage meanings.
- **Movement bounds:** fixed DCSA T&T v2.2 move codes and EMPTY/LADEN qualifiers derived from rule type.
- **Pricing basis evidence:** immutable W2-03 Agreement or Tariff receipt/version evidence echoed by the caller.
- **Port-local day:** calendar date obtained by applying the authoritative IANA port timezone to an event instant.
- **Receipt claim:** namespaced idempotency ownership record fenced by owner token and database time.

## Entities & Aggregates

| Aggregate/entity | Identity | Composed values and relationship |
| --- | --- | --- |
| `DndTerms` aggregate root | `DndTermsId` | Ordered `DndTermsVersion` history; at most one Draft; references basis/version ids, never embeds W2 aggregates |
| `DndTermsVersion` entity | `DndTermsVersionId` + version number | Rule bounds, basis lineage, applicability, `FreeDays`, `Money`, `EffectiveWindow`, lifecycle, predecessor, row version, actor/correlation facts |
| `DndTermsActivity` entity | `ActivityId` | Aggregate/version id, action, actor, time, correlation, bounded change reason |
| `DndPricingReceipt` aggregate | `(DND_PRICING, DndIdempotencyKey)` | Fingerprint, claim owner/lease, immutable terminal payload, request/result ids and completion time |
| `DndEvaluationEvidence` entity | `AttemptId` | Disposition, correlation, request identity and only source/calculation facts that exist |
| `DndCalculation` value | Value equality | Terms ids, timezone, elapsed/chargeable days, one `DndChargeLine`, calculated time |

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| Rule type | `DndRuleType` | `dndRuleType` (`pricing.v1`) | Bilateral W3 contract | Three fixed values |
| Standard receipt identity | `PricingRequestId` | `pricingRequestId` (`pricing.dnd-request`) | W2/W3 bilateral | Exact immutable booking-time receipt |
| Booking identity | `BookingReference` | `bookingRef` | LinerCore pricing contract | Required request/result field |
| Start/end move | `DndMovementBounds` | `moveTypeCode` | DCSA T&T v2.2 | `DISC`, `GTOT`, `GTIN` only as mapped |
| Empty qualifier | `EmptyIndicator` | `emptyIndicatorCode` | DCSA-aligned | `EMPTY` or `LADEN` |
| Port | `UnLocode` | `portLocationCode` | UN/LOCODE | Five-character uppercase code |
| Timezone | `ZoneId` | `portTimeZoneId` (`pricing.dnd-result`) | IANA TZDB | Read from Reference Data LOCATION |
| Pricing basis | `PricingBasis` | `pricingBasis` (`pricing.v1`) | W2-03 | `AGREEMENT` or `TARIFF` |
| Basis reference | `PricingReference` | `pricingRef` | W2-03 | Exact echoed authority reference |
| Basis version | `PricingBasisVersionId` | `pricingBasisVersionId` | Additive W3 evidence | AgreementVersion id or deterministic tariff composite |
| Effective date | `LocalDate` | `pricingEffectiveDate` | ISO 8601 | Echoed from immutable Standard receipt |
| Equipment | `EquipmentReference` | `equipmentId` | Platform/ISO 6346 where applicable | Part of bilateral key |
| Closing event | `MovementEventId` | `endMovement.movementEventId` | DCSA-aligned | Part of bilateral key |
| Start movement | `QualifiedMovement` object | `startMovement.movementEventId`, `.moveTypeCode`, `.emptyIndicatorCode`, `.eventDateTime` | DCSA T&T/RFC 3339 | Structured required request object |
| End movement | `QualifiedMovement` object | `endMovement.movementEventId`, `.moveTypeCode`, `.emptyIndicatorCode`, `.eventDateTime` | DCSA T&T/RFC 3339 | Structured required request object; closing id echoed in result |
| Free days | `FreeDays` | `freeDays` | W3 rule contract | Non-negative integer |
| Daily rate | `Money` | `flatDailyRate`, `currency` | ISO 4217 | Non-negative scale two; USD MVP |
| Amount | `Money` | `amount`, `currency` | ISO 4217 | Exact multiplication, including 0.00 |
| D&D request/result identity | `DndPricingRequestId` | `dndPricingRequestId` | `pricing.dnd-result` | Required immutable terminal result id |
| Source-version evidence | discriminated Agreement/Tariff value | `sourceAgreementVersionId` and/or ordered `sourceRateVersionIds[]` | W2-03 preserved authority | Only applicable discriminator fields exist |
| Calculation time | `Instant` | `calculatedAt` | RFC 3339 | Required result field |
| Effective window | `InclusiveDateRange` | `effectiveFrom`, `effectiveTo` | ISO 8601 | Approval overlap is inclusive |
| Correlation | `CorrelationId` | `correlationId` | LinerCore boundary | Bounded and safe |

## Contract Fidelity Check

- Contract fields missing from model: none. The table explicitly covers request receipt/booking identity, both structured movement objects, result/closing identity, discriminated source-version evidence and calculation time in addition to applicability/money/version fields.
- Renamed canonical fields: none; internal typed value objects preserve wire names at adapters.
- Shape mismatches: none; movements remain distinct structured start/end objects, source evidence is discriminated, and `charges[]` remains an exactly-one-item array of `DndChargeLine`.
- Intentional deferred fields: none within U01's published schema. Booking runtime trigger is behavior, not a missing field, and belongs to W3-02.
- Existing W2-03 fields and required sets remain unchanged; generated provider/consumer models and fixtures are the executable comparison.

## Invariants & Validation

- Aggregate identity and every version/activity/attempt identity are explicit and immutable.
- Bounds and side are derived from `DndRuleType`; arbitrary pairs cannot enter the aggregate.
- Approved versions are immutable; Draft approval uses optimistic row version plus the full-key overlap lock.
- Value objects reject blank/oversized/control-bearing ids, invalid UN/LOCODE, negative/free-day or money values, invalid dates and unsupported currency.
- Exact pricing evidence and timezone require live adapters; the domain never queries another service database or stores generic attributes maps.
- Receipt namespace, key, fingerprint, owner token and status must all match for completion.

## Lifecycle / State

`DndTermsVersion`: `DRAFT -> APPROVED`. No reverse or in-place Approved mutation exists. U02 adds the approved-source-to-successor-Draft command while preserving this state machine.

`DndPricingReceipt`: absent -> `IN_PROGRESS` -> `COMPLETED`. An expired owner may be replaced under database time; an owned handled failure may release to absent. Only `COMPLETED` is replayable.

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from contracts/DCSA (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]: A - approved contracts and Application Design supply every canonical name used by U01.`
