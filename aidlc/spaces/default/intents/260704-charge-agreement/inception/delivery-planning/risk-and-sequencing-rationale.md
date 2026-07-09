# Risk and Sequencing Rationale - Charge & Customer Agreement

## Heuristic

Sequencing uses walking-skeleton-first, then dependency/value-first delivery. This follows the affirmed `team-practices.md` walking skeleton stance and the `unit-of-work-dependency.md` DAG.

## Rationale

| Bolt | Why this order |
| --- | --- |
| B01 | Highest integration risk is whether the repo can host a new service/UI locally without breaking Shared Platform. |
| B02 | Domain/application rules should be proven before persistence and API adapters. |
| B03 | Backend persistence/API must be stable before UI work relies on it. |
| B04 | UI is the user's visible functional outcome and depends on backend/API/reference integration. |
| B05 | Runtime evidence and Booking handoff should verify real behavior after implementation. |

## Risk Handling

| Risk | Sequencing response |
| --- | --- |
| Docker unhealthy | Do host-runtime skeleton first; do not block domain/UI construction. |
| Scope creep into RMS | Keep advanced pricing out of all Bolts. |
| UI remains view-only | B04 Definition of Done requires create/edit/approve/lookup. |
| Booking dependency unresolved | B03/B05 require active lookup API and examples. |

## Dependency Validation

The Bolt order respects the DAG: U01 before U02, U02 before U03, U03 before U04/U10, U04 before U05, U05 before U06/U09, U06 before U07, and U08 late after runnable behavior exists.
