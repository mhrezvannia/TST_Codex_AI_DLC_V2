# Risk and Sequencing Rationale - W4-01 Module List-Detail Uplift

## Source Alignment

The rationale uses `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. It applies the accepted hybrid heuristic: walking-skeleton-first, then risk/value progression, supported by lightweight WSJF-style comparison without overriding hard dependencies, external gates, or ownership rules.

## Heuristic and Scoring Model

The supporting score is `(0.40 x user/business value + 0.40 x risk reduction + 0.20 x time criticality) / relative job size`, using comparable 1-5 inputs. Higher scores support earlier delivery. The numbers are planning estimates, not mathematical truth; the affirmed walking-skeleton gate, one-active-slice capacity, and external readiness remain binding.

| Bolt | Value | Risk reduction | Time criticality | Size | Score | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| B01 Reference route skeleton | 5 | 5 | 5 | 3 | 1.67 | Highest leverage: tests architecture, auth, shell, edge, provider and live evidence early |
| B02 Reference completion | 4 | 3 | 4 | 3 | 1.20 | Completes the proven pattern and satisfies the only unit-DAG dependency |
| B03 Charge uplift | 5 | 4 | 4 | 4 | 1.10 | High business value and regression risk; follows pattern stabilization |
| B04 CMM/Booking uplift | 5 | 5 | 3 | 5 | 0.92 | Highest absolute complexity/risk but largest size and most external exits |

## Why This Sequence

1. **B01 first:** The team practice explicitly requires a gated Reference Data list-to-detail walking skeleton. It proves the most cross-cutting assumptions with the smallest end-to-end live path.
2. **B02 second:** U02 has the only hard topology edge and depends on U01. Completing Reference depth prevents the shared interaction grammar from being validated only on a happy path.
3. **B03 third:** Charge tests reuse against a mature BFF/provider, lifecycle actions, rates, manual evidence, Reference options, and retirement behavior. It is valuable but does not justify parallel WIP before the Reference pattern is accepted.
4. **B04 fourth:** CMM adds a new deployable, v2 contract/security assertion, movement command, Booking seam, event truth, and operational poison/replay exit. Preflight happens earlier, but implementation waits until the shared pattern and Charge transfer are proven.

## Topology Versus Economic Ordering

`unit-of-work-dependency.md` has one edge only: U02 depends on U01; U01, U03, and U04 are roots. B03-after-B02 and B04-after-B03 are deliberate economic/capacity gates from `team-practices.md`, the single-driver agreement, reuse learning, and risk containment. They are not retroactively added to the unit DAG and do not imply source-code dependencies.

## Key Risks and Earliest Treatment

| Risk | Likelihood | Impact | Earliest treatment | Stop condition |
| --- | --- | --- | --- | --- |
| W2-02 shared shell/registry/primitives unavailable | Medium | Critical | Preflight before B01 | B01 cannot start; no local fork |
| Real session/Identity/edge trust contract fails | Medium | Critical | B01 contract/security tests | Stop B01; no local-user/browser authority |
| Reference capability/history/freshness gaps | Medium | High | B01/B02 provider fixtures | Unsupported behavior absent; required path blocks |
| Charge BFF/provider query/action drift | High | High | Preflight during B01/B02; resolve before B03 | B03 blocked or affected segment explicitly unavailable |
| Missing Charge D&D/queue identifiers/filters | Medium | Medium | Contract evidence before B03 | No synthesis/client merge; conditional region stays blocked |
| CMM frontend/v2/assertion capability absent | High | Critical | Preflight before B04, beginning during B01 | B04 cannot start without approved contracts |
| CMM event poison/replay control absent | High | Critical | Owner decision and operator design before B04 | B04/intent cannot complete |
| Shared environment/demo/audit contention | Medium | High | Reserve serialized slots before each demo | No live PASS claim without guarded slot |
| Named human capacity/review windows unknown | High | High | Resolve before Construction entry | No dates or B01 start |
| Scope expansion from blocked controls/links | Medium | High | Product/domain review every Bolt | Keep absent/BLOCKED; change control required |

## Confidence Ladder

| After Bolt | Confidence earned |
| --- | --- |
| B01 | Platform, auth, ownership and live evidence path are viable |
| B02 | Reference operational states/actions/recovery are complete and reusable as interaction evidence |
| B03 | The pattern handles mature commercial provider complexity without regression or simulation |
| B04 | A new deployable and cross-module/event journey work truthfully end to end |

## Alternatives Rejected

- Pure WSJF override: would ignore affirmed walking-skeleton and sequential-capacity decisions.
- Parallel module Bolts: increases shared-pattern divergence and exceeds the single core Driver agreement.
- CMM-first: attacks the largest seam before shell/route/provider conventions are proven.
- One giant Bolt: removes early confidence gates and makes rollback/review/evidence attribution opaque.
- Horizontal frontend/backend/test Bolts: violates approved vertical units and permits layer-local false completion.

## Sequencing Decision

Use B01 -> B02 -> B03 -> B04, with B01 separately approved and every consuming external exit checked before entry. Preparatory work can move risk forward, but cannot be reported as a shipped Bolt or used to bypass the sequence.
