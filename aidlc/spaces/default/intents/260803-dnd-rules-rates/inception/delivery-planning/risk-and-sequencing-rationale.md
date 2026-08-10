# Risk and Sequencing Rationale - W3-01 D&D Rules and Rates

## Source alignment and selected heuristic

This rationale consumes approved `requirements.md`, `stories.md`, Refined `mockups.md`, Application Design `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and affirmed `team-practices.md`.

The selected heuristic is hybrid walking-skeleton-first plus risk-first. B01 applies the walking-skeleton principle to prove the smallest real cross-layer path. B02-B04 then retire lifecycle/replay, exact historical calculation, and failure/evidence risks in the only order allowed by the hard unit DAG. No Bolt deviates from the approved topology.

The project has no supplied economic values, cost-of-delay data, delivery durations or verified owner calendars. Accordingly, the comparison is ordinal and explanatory, not numeric WSJF. `High/Medium/Low` indicates relative value, time criticality and risk reduction within W3-01; `S/M/L/XL` is the approved relative size. These judgments do not claim a schedule or critical-path duration.

## Ordinal comparison

| Bolt | User/business value | Time criticality | Risk reduction | Size | Sequencing judgment |
| --- | --- | --- | --- | --- | --- |
| B01 | High | High | High | XL | First because it is the mandated solo skeleton and owns the irreversible migration/contract foundation plus first real UI/provider proof |
| B02 | High | High | High | XL | Second because historical calculation requires immutable successor/trigger evidence and W2 replay invariance |
| B03 | High | Medium | High | L | Third because it converts preserved lineage into exact Agreement/Tariff/timezone behavior before safety dispositions wrap that path |
| B04 | High | Medium | High | XL | Fourth because its error, concurrency and audit matrix must distinguish and preserve the complete success/historical behavior established by B03 |

A numeric WSJF score would imply unsupported precision and is therefore intentionally absent.

## Why four one-unit Bolts

- U01 cannot be bundled: the affirmed `team-practices.md` and approved Units artifacts require a solo, separately gated walking skeleton.
- U02-U04 each has an independently observed vertical outcome and engine-real evidence file. Bundling would weaken attribution and delay feedback without creating parallelism because every pair has a dependency path.
- Backend, UI, contract and test work remain inside the Bolt whose user-observable outcome exercises them. No horizontal migration, UI or hardening Bolt is introduced.
- Final coverage, scanner resolution, p99 decision, full viewport matrix and audits verify the integrated result and remain an exit gate rather than a fifth Bolt.

## Risk retirement by sequence

| Risk | Earliest retiring Bolt | Why it is placed there | Residual gate |
| --- | --- | --- | --- |
| W2-03 regression or unsafe receipt migration | B01 | U01 exclusively owns the ordered migration and additive contract/fixture chain | Existing fixtures green and bilateral manifest signed |
| Guessed/missing port timezone | B01 foundation; B03 breadth | First real path reads Reference Data; B03 proves UTC/local boundary breadth | Missing/malformed configuration fails closed |
| Shared-shell or Dialog divergence | B01 shell; B02 Dialog | UI proof waits for the merged W2-02 package revision | No Charge-local fork; route/package tests required |
| Overlap, mutable approval or trigger/replay drift | B02 | These are lifecycle prerequisites for historical calculation | Fresh/replay running-stack proof |
| Silent historical reselection or wrong day count | B03 | Complete exact evidence and numeric boundary matrix before failure breadth | Old/successor Agreement/Tariff and timezone evidence |
| Duplicate/partial/guessed charge or evidence disclosure | B04 | Safety matrix wraps the exact provider behavior proved by B03 | Exact signed error matrix, fencing and no-disclosure proof |
| Provisional p99 unsupported | B03 produces measurement | Calculation breadth supplies a meaningful warm-local sample | Named owners accept or revise at exit |
| Scanner unavailable or exit evidence incomplete | Integrated exit | Cross-cutting release fact, not a Unit outcome | Fail closed until execution or approved policy resolution |

## Parallelism rationale

The direct chain `U01 -> U02 -> U03 -> U04` has no unit-level parallel antichain. Bolts therefore execute sequentially. Inside one Bolt, the mob may run repository-safe Reference Data, Charge, contract, UI and focused-test workstreams concurrently only when their dependency contracts are stable, one owner controls protected files, and they converge into the same vertical live DoD. Guarded isolated Compose runs are serialized to prevent port, project-name, data and screenshot contamination.

## Replanning triggers

Replan rather than bypass when an external gate is unavailable, a predecessor live DoD is red, the W2-03 contract would break, the exact unit DAG changes, or the shared-package revision is absent. A change to unit boundaries returns to Units Generation through the engine; a timing fact from an owner may update dependency readiness without changing approved scope.
