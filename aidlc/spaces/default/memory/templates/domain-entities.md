<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces contract/DCSA field fidelity and typed value objects. -->

# Domain Entities — <unit / module>

## Ubiquitous Language

<The domain terms used, defined once, matching the vision doc and the knowledge-base dictionary. If a term has a DCSA equivalent, state it.>

## Entities & Aggregates

<Each aggregate, its identity, and the value objects it composes. Model relationships as the domain requires (arrays of legs, lines of equipment) — do NOT flatten a to-many relationship to a scalar, and do NOT hide real fields in a Map/attributes bag.>

## Field-Level Schema (canonical names)

<Table. Every field with its canonical name, type, and the standard it comes from. The canonical name MUST match the published contract (contracts/…) or the DCSA field. Flag any place the current code diverges.>

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| e.g. routing | `List<RoutingLeg>` | `routing[]` (booking.confirmed.avsc) | DCSA Booking | ordered legs, not a flat origin/dest |
| e.g. port | `UnLocode` (VO) | `loadUnLocode` / `dischargeUnLocode` | UN/LOCODE | 5-char, validated |
| e.g. container no. | `EquipmentReference` (VO) | `equipmentId` | ISO 6346 | not `attributes.containerId` |

## Contract Fidelity Check

<Explicitly diff this entity against its authoritative contract/schema. List: fields in the contract but missing here; fields renamed; type/shape mismatches (array vs scalar, VO vs string). Target state: zero divergence. If divergence is intentional and deferred, name the future intent.>

## Invariants & Validation

<Business invariants enforced in the domain (hand-written builders/entities, framework-free per the tech-env). Reference validation that must hit live reference data.>

## Lifecycle / State

<State machine if the aggregate has one: states, allowed transitions, and the events each transition emits.>

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from contracts/DCSA (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]:`
