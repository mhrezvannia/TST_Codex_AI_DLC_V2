# RAID Log — W3-04 Booking Request Completeness

## Inputs and Scoring

This log synthesizes `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` with the feasibility code/environment review. Risk score is Likelihood (1–5) × Impact (1–5). Scores 15–25 are High, 8–14 Medium, and 1–7 Low.

## Risks

| ID | Risk | L | I | Score | Owner | Treatment / evidence |
|---|---|---:|---:|---:|---|---|
| R-01 | Equipment request and physical assignment remain conflated in one domain/API/UI type, causing regressions or fabricated IDs | 4 | 5 | 20 High | Booking | Separate lifecycle semantics in frozen model; quantity >1/no-ID domain, API, UI, event, and live tests |
| R-02 | Legacy snapshot codec drops or misclassifies records because it currently assumes quantity `1` plus valid `equipmentId` | 4 | 5 | 20 High | Booking | New snapshot version; deterministic upcast/incomplete outcomes; representative migration corpus; idempotent ledger/retry proof |
| R-03 | Cargo cutoff/documentation deadline are derived locally because current typed voyage data exposes only carrier number and scheduled departure/arrival | 4 | 5 | 20 High | Shared Platform + Booking | Add typed authoritative voyage fields/contracts/seeds and degraded handling; block full-schedule claim until live proof |
| R-04 | UI, REST, domain, persistence, pricing, and event names diverge as the field dictionary expands | 4 | 4 | 16 High | Booking + architect | One versioned field dictionary and mapping matrix; contract/generated-type checks; end-to-end round-trip evidence |
| R-05 | Pricing silently uses old defaults/attributes or loses quantity/date/party/commodity fidelity | 3 | 5 | 15 High | Booking + Charge | Exact Pact fixtures, captured live request, repricing mutation tests, quantity-scaled result |
| R-06 | `booking.confirmed` is widened with PII/cargo or fails Avro serialization when identifier is absent | 3 | 5 | 15 High | Booking + CMM | Preserve published schema/boundary; nullable/omitted identifier serde and live consumer proof; compatibility gate |
| R-07 | New required fields make old drafts unreadable rather than explicitly incomplete and correctable | 3 | 4 | 12 Medium | Booking | Separate read/draft tolerance from confirmation completeness; preserve input; clear correction journey |
| R-08 | Reference Data or Charge degradation loses user-entered work or permits stale confirmation | 3 | 4 | 12 Medium | Booking | Explicit stale/degraded/retry states, cached-display provenance, server revalidation before confirm |
| R-09 | PII-linked customer/party facts leak through logs, errors, traces, analytics, or event payloads | 3 | 5 | 15 High | Booking + compliance/security | Data classification/flow review, allowlisted logging, masking tests, authorization and event-schema evidence |
| R-10 | Scope expands into SI/eBL, multi-leg, reefer/DG, assignment, or external portal expectations | 3 | 4 | 12 Medium | Product owner | Trace every requirement/story to in-scope dictionary; route additions to future intents |
| R-11 | No fixed delivery constraint is mistaken for unlimited capacity | 2 | 3 | 6 Low | Delivery lead | Revalidate team capacity/timeline at Delivery Planning and expose explicit scope/date tradeoffs |
| R-12 | Program geography remains unresolved when production retention/residency/FMC controls must be finalized | 2 | 5 | 10 Medium | Program/compliance | Track external dependency; prevent geography claims; gate affected production rollout on program decision |

## Assumptions

| ID | Assumption | Owner | Validation point | If false |
|---|---|---|---|---|
| A-01 | W0-02, W1-01, W2-02, and W2-03 remain closed and their live contracts are available | Delivery lead | Scope Definition / Delivery Planning | Reopen dependency and sequencing plan |
| A-02 | Booking, Shared Platform, Charge, and CMM owners can review the cross-module changes | Delivery lead | Team Formation | Adjust schedule or contributor assignment; do not bypass review |
| A-03 | Existing Compose environments can run the expanded live proof without new infrastructure services | Platform | Infrastructure Design / live rehearsal | Right-size existing services or explicitly reopen infra posture |
| A-04 | Current `booking.confirmed` nullable identifier semantics are accepted by the live CMM consumer | Booking/CMM | Contract and live consumer test | Add backward-compatible consumer fix before producer rollout |
| A-05 | No change freeze or higher-priority Wave 3 conflict constrains W3-04 | Delivery lead | Delivery Planning | Re-sequence units/intent without weakening DoD |
| A-06 | No PCI/HIPAA data enters the approved field dictionary | Product/compliance | Requirements approval | Reclassify data and repeat compliance analysis |
| A-07 | No monetary/calendar constraint beyond feature/Standard is currently imposed | Product owner | Delivery Planning | Present explicit scope/date/cost decision at a gate |

## Issues

| ID | Current issue | Severity | Owner | Resolution required |
|---|---|---|---|---|
| I-01 | Current `EquipmentAssignment` and create validation require a physical ISO container ID and quantity exactly `1` | High | Booking | Replace with request semantics while preserving later assignment and legacy compatibility |
| I-02 | Both standalone and shell Booking create forms implement the obsolete physical-ID/quantity-one rule | High | Booking UI | Converge on one canonical shared-shell field model and validators |
| I-03 | Current legacy snapshot canonicalization depends on a physical identifier and may return incomplete/null | High | Booking data | Implement versioned safe upcast and explicit incompleteness |
| I-04 | Typed Reference Data `Voyage` lacks cargo cutoff and documentation deadline | High | Shared Platform | Add authoritative fields across model/OHS/event/seeds or obtain approved scope revision |
| I-05 | Several new commercial facts are not yet typed across Booking; some existing pricing facts remain in generic attributes | High | Booking | Freeze dictionary and replace attributes-only mappings with owned typed shapes |
| I-06 | Program trade/regulatory footprint and physical residency/DR sites remain unresolved | Medium | Program | Resolve before affected production compliance gate; not inside W3-04 |

## Dependencies

| ID | Dependency | Type | Owner | Required outcome |
|---|---|---|---|---|
| D-01 | W0-02 canonical Reference Data | Closed upstream | Shared Platform | Live party/commodity/location/voyage/equipment types plus additive cutoff/deadline contribution |
| D-02 | W1-01 live booking spine | Closed upstream | Booking | Preserve create/validate/price/confirm/event live path |
| D-03 | W2-02 shared shell/design system | Closed upstream | LinerCore/W2-02 | Reuse one shell and approved primitives; later Refined Mockups review |
| D-04 | W2-03 pricing provider | Closed upstream | Charge | Exact party/commodity/date/quantity behavior and failure semantics |
| D-05 | Booking → Pricing bilateral contract | Live contract | Booking + Charge | Compatible Pact/provider fixtures and no guessed defaults |
| D-06 | `booking.confirmed` async contract | Live contract | Booking + CMM | BACKWARD schema, optional identifier, full routing/equipment quantity |
| D-07 | Program trade/regulatory-footprint decision | External/TBD | Program/compliance | Residency, retention, DR, and FMC applicability when geography is fixed |

## RAID Exit Conditions

- High risks have named owners, executable mitigations, and linked acceptance evidence.
- I-01 through I-05 are resolved or deliberately carried into approved Requirements/Application Design with no hidden default.
- A-01 through A-07 are revalidated at their named stages.
- D-01 through D-06 are proven on the live stack; D-07 remains visible and cannot be silently assumed.
