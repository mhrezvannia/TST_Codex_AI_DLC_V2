# Domain Entities - dnd-exact-historical-calculation

## Ubiquitous Language

This model refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`.

- **Validated booking pricing evidence:** immutable typed Standard receipt plus exact source versions.
- **Agreement evidence:** one exact AgreementVersion and its preserved source RateVersions.
- **Tariff evidence:** ordered BASE/SURCHARGE/LOCAL RateVersions represented by the existing deterministic composite id.
- **Exact match:** equality across every echoed authority/applicability field; no nearest/current semantics.
- **Calculation:** pure immutable outcome from exact terms, port zone and qualified movements.

## Entities & Aggregates

| Entity/value | Identity | Composition |
| --- | --- | --- |
| `ValidatedBookingPricingEvidence` | `pricingRequestId` | Booking, discriminated authority, basis ref/version/date, POL/POD, lane, equipment, ordered source ids |
| `AgreementPricingEvidence` | `AgreementVersionId` | Exact AgreementVersion plus preserved RateVersion ids |
| `TariffPricingEvidence` | deterministic composite id | Ordered BASE/SURCHARGE/LOCAL RateVersion ids |
| `QualifiedMovement` | `movementEventId` | Move code, EMPTY/LADEN qualifier, event instant |
| `DndCalculation` | immutable result id/value | Exact terms/source/timezone and one charge line |
| `DndChargeLine` | value within calculation | Charge code, currency, free/elapsed/chargeable days, flat rate, amount |

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| Receipt identity | `PricingRequestId` | `pricingRequestId` (`pricing.dnd-request`) | W2/W3 bilateral | Exact Standard terminal identity |
| Basis | discriminated enum | `pricingBasis` | W2-03 | `AGREEMENT`/`TARIFF` |
| Reference | typed id | `pricingRef` | W2-03 | Exact stored response value |
| Basis version | typed id | `pricingBasisVersionId` | W3 additive evidence | AgreementVersion or tariff composite |
| Effective date | `LocalDate` | `pricingEffectiveDate` | ISO 8601 | Immutable receipt date |
| Port | `UnLocode` | `portLocationCode` | UN/LOCODE | Exact derived-side match |
| Timezone | `ZoneId` | `portTimeZoneId` | IANA TZDB | Result evidence |
| Trade lane | `TradeLaneCode` | `tradeLane` | Reference Data | Exact immutable match |
| Equipment type | `EquipmentTypeCode` | `equipmentType` | Platform reference | Exact immutable match |
| Movement instant | `Instant` | `eventDateTime` | RFC 3339 | Canonicalized with `Instant.toString()` for fingerprint |
| Source versions | ordered typed ids | `sourceRateVersionIds[]` | W2-03 preserved authority | No unordered set/map |
| Advertised trigger | structured value | `applicableDndRuleTypes[]` | `pricing.v1` | Requested rule and fixed bounds must be an exact member |
| Calculation days | non-negative integers | `elapsedDays`, `chargeableDays` | W3 result | Port-local formula |
| Rate/amount | `Money` | `flatDailyRate`, `amount`, `currency` | ISO 4217 | Scale two |

## Contract Fidelity Check

- Missing contract fields: none.
- Renamed fields: none.
- Type/shape divergence: none; source versions are ordered typed identifiers and charge result remains exactly one structured item.
- Agreement/Tariff differences are discriminated rather than represented with fabricated nullable ids.
- The UI projection is a subset of the same canonical result evidence and introduces no alternate calculation model.

## Invariants & Validation

- Validated evidence is constructed only from one exact immutable successful Standard receipt.
- Agreement and Tariff evidence are mutually exclusive and complete for their discriminator.
- Applicability comparisons use typed canonical values; no case-folded free-text fallback exists beyond boundary normalization defined by contract.
- Both movements match fixed rule bounds and event order before calculation.
- `ZoneId` is a validated value from Reference Data; the calculator accepts no raw/optional timezone string.
- Calculation values are non-negative and internally consistent: amount equals rate times chargeable days.

## Lifecycle / State

Historical evidence and calculations are immutable values. New successor pricing produces a new Standard receipt/evidence and a new D&D calculation; it does not transition or rewrite an old calculation. A completed D&D receipt replays unchanged.

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from contracts/DCSA (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]: A - the signed U01 contract and approved Application Design fix every historical/calculation field.`
