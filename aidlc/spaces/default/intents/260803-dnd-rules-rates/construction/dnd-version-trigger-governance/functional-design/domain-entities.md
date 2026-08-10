# Domain Entities - dnd-version-trigger-governance

## Ubiquitous Language

This model refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`.

- **Draft:** the only mutable D&D terms version.
- **Approved version:** immutable commercial authority within its inclusive effective window.
- **Successor:** a new Draft linked to an Approved predecessor.
- **Applicable trigger:** metadata-only fixed movement evidence attached to a fresh W2 pricing result.
- **Presentation version:** exact requested history version, or the latest version when omitted.
- **AgreementVersion relationship:** read-only links from one exact AgreementVersion to exact D&D terms versions.

## Entities & Aggregates

| Aggregate/entity | Identity | U02 behavior |
| --- | --- | --- |
| `DndTerms` | `DndTermsId` | Enforces one Draft, ordered versions and predecessor/successor links |
| `DndTermsVersion` | `DndTermsVersionId` | Optimistic revision, immutable approval, successor creation |
| `DndTermsActivity` | `ActivityId` | Create/update/approve/successor actor/time/correlation/reason evidence |
| `StandardPricingReceipt` | `(STANDARD_PRICING, idempotencyKey)` | Stores enriched terminal bytes and immutable original-request evidence |
| `ApplicableDndRuleType` | Value equality | Rule type and fixed start/end codes/qualifiers only |
| `DndTermsRelationshipItem` | Exact terms/version ids | Read-only basis, applicability, terms and lifecycle projection |

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| Terms aggregate | `DndTermsId` | `dndTermsId` | W3 admin contract | Stable across versions |
| Terms version | `DndTermsVersionId` | `dndTermsVersionId` | W3 admin/provider contract | Direct history selector |
| Version number | positive integer | `versionNumber` | Charge lifecycle | Monotonic within aggregate |
| Lifecycle | `DRAFT`, `APPROVED` | `lifecycle` | W3 terms contract | Effective state is separately derived |
| Row version | non-negative long | `rowVersion` | Optimistic concurrency | Required on Draft mutation/approval |
| Predecessor | optional version id | `predecessorVersionId` | W3 lineage | Approved source for successor |
| Trigger list | ordered list | `applicableDndRuleTypes[]` (`pricing.v1`) | Additive W3/W2 field | Required W2 property, metadata only |
| Basis version | exact id | `pricingBasisVersionId` | W2/W3 additive evidence | All-or-none fresh evidence |
| Pricing date | `LocalDate` | `pricingEffectiveDate` | ISO 8601 | Original requested departure date |
| Original request facts | typed port/lane/equipment | `pricingPol`, `pricingPod`, `pricingTradeLane`, `pricingEquipmentType` | W2 receipt persistence | Immutable validation evidence |
| Relationship basis | `AgreementVersionId` | `agreementVersionId` | Existing Charge agreement | Authorizes before query |

## Contract Fidelity Check

- Contract fields missing: none.
- Renamed fields: none; database snake_case maps at adapters only.
- Shape mismatch: none; `applicableDndRuleTypes` is an ordered array of structured objects, never `List<String>` or commercial rate data.
- Legacy compatibility: pre-W3 terminal receipts remain replayable, but they cannot prove a later D&D request if required exact evidence is absent.
- U01 remains exclusive contract/fixture owner; this Unit changes runtime behavior only.

## Invariants & Validation

- A version belongs to exactly one aggregate; cross-aggregate history selection returns not found.
- One Draft maximum is enforced by aggregate and database uniqueness.
- Approved state and immutable commercial fields never change.
- Inclusive overlap under the full key cannot be admitted, including concurrent approval.
- Trigger items derive fixed bounds from rule type and contain no free days/daily rate.
- Standard release requires exact namespace, key, owner and `IN_PROGRESS`; terminal rows cannot be deleted by it.

## Lifecycle / State

Aggregate state is the combination of ordered immutable Approved versions plus zero or one Draft. Commands are revise Draft, approve Draft and create successor Draft from Approved. Derived effective state for Approved versions is Scheduled, Effective or Expired based on the requested/as-of date; it is not a stored lifecycle mutation.

Standard receipt state remains absent -> in-progress -> completed, with owned handled-release back to absent and database-time crash takeover. Replay is read-only.

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from contracts/DCSA (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]: A - approved Application Design and the U01 contract fix all U02 canonical names.`
