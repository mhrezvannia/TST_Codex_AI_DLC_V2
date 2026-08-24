# Ideation Decision Log — W4-01 Module List-Detail Uplift

## Sources and Status

Sources: `intent-statement.md`, `scope-document.md`, `intent-backlog.md`, `competitive-analysis.md`, `feasibility-assessment.md`, `constraint-register.md`, `team-assessment.md`, and `wireframes.md`.

All decisions below were confirmed through structured user questions and approved stage gates unless marked “Due in Inception.”

## Intent Decisions

| ID | Decision | Rationale / consequence | Status |
|---|---|---|---|
| D-01 | W4-01 outcome requires three module uplifts | Partial module parity does not close the shell/product gap | Approved |
| D-02 | Slices merge independently Ref → Charge → Container; intent closes after all | Limits WIP while preserving integrated exit | Approved |
| D-03 | Build Container canonical route directly from W2-04 truth | No app exists, but service/contracts do | Approved |
| D-04 | Reuse current BFF/domain behavior and mature Charge routes | Avoids business-capability rewrite | Approved |
| D-05 | Unsupported provider behavior remains visibly blocked | No mocks or simulated success count as complete | Approved |
| D-06 | Product owner decides gates after domain/UI/a11y/quality review | Preserves customer and seam accountability | Approved |

## Market and Investment Decisions

| ID | Decision | Rationale / consequence | Status |
|---|---|---|---|
| D-07 | Benchmark current surfaces plus SAP TM, Oracle OTM, CargoWise, DCSA, and WCAG | Establishes table stakes without copying suite scope | Approved |
| D-08 | Audience is bounded internal operators/reviewers | No speculative TAM claim | Approved |
| D-09 | Differentiate on domain truth and one-shell continuity | Feature breadth and novelty are not the goal | Approved |
| D-10 | Build the composition layer; no suite replacement | Reuses closed services/shared UI and minimizes switching cost | Approved |
| D-11 | Compare commercial models qualitatively | Enterprise quote estimates are not reliable or needed | Approved |

## Feasibility and Constraint Decisions

| ID | Decision | Rationale / consequence | Status |
|---|---|---|---|
| D-12 | Use existing integrations/monorepo stack only | No new adapter/framework/business service required | Approved |
| D-13 | Preserve existing auth/authz/audit/privacy controls plus accessibility | No new certification or regulated-data category inferred | Approved |
| D-14 | No new AWS services/accounts | W4-01 is infrastructure-neutral unless later evidence triggers review | Approved |
| D-15 | Provider or mount gaps block affected behavior, not independent slices | Maintains truth and flow without intent-wide simulation | Approved |
| D-16 | No known organizational freeze; verify dependency and reviewer availability | Avoids invented blocker or schedule | Approved |
| D-17 | Production hosting details remain deferred absent topology change evidence | Prevents speculative infrastructure design | Approved |

## Scope and Delivery Decisions

| ID | Decision | Rationale / consequence | Status |
|---|---|---|---|
| D-18 | Core list/detail/action/state/cross-link loops are Must | They deliver the approved operational value | Approved |
| D-19 | Saved views, bulk, global search, new actions/integrations defer | Protects thin vertical scope | Approved |
| D-20 | Sequence combines dependency and risk reduction | Reference proves pattern; Charge proves reuse; Container resolves missing app | Approved |
| D-21 | No fixed calendar date or monetary ceiling invented | Program-wave window is the supported constraint | Approved |
| D-22 | New capability requires explicit change control | Prevents adjacency-driven scope creep | Approved |

## Team Decisions

| ID | Decision | Rationale / consequence | Status |
|---|---|---|---|
| D-23 | One sequential stream-aligned W4-01 mob | Reduces duplicated shell/UI decisions | Approved |
| D-24 | No external vendor/AWS Professional Services | Current roles/stack are sufficient | Approved |
| D-25 | Documentation-first hybrid with focused mob/pair sessions | Supports seam learning and cross-time-zone review | Approved |
| D-26 | Product owner plus seam owners hold decisions | Aligns value and technical ownership | Approved |
| D-27 | Handle gaps by pairing with owners | Avoids new teams and local forks | Approved |
| D-28 | Confirm named people, utilization, and calendars in Delivery Planning | Role-level commitment is not a schedule | Due in Inception |

## UX Decisions

| ID | Decision | Rationale / consequence | Status |
|---|---|---|---|
| D-29 | Shell navigation and exact deep links are canonical entries | Direct module ports are not the product journey | Approved |
| D-30 | One shared low-fidelity grammar with three domain hierarchies | Coherence without erasing domain meaning | Approved |
| D-31 | Detail hierarchy is identity/status/actions → tabs → audit | Optimizes repeated operational work | Approved |
| D-32 | Narrow tables keep priority columns with intentional labelled scroll | Preserves dense comparison and exact record access | Approved |
| D-33 | Full operational state map and WCAG AA notes are mandatory | Accessibility and recovery are product correctness | Approved |
| D-34 | Reject marketing UI, alternate palette/fonts, and bulk-action advice | Conflicts with LinerCore and W4-01 scope | Approved |
| D-35 | Run detailed tasks 21→22→23 only after Requirements and Stories approval, in one parked Refined Mockups stage | Binding execution-guide boundary | Approved |

## Decisions Due in Inception

- Provider-supported filters, columns, sort/page behavior, actions, and per-module applicable states.
- Actor/permission/read-only/denied matrices.
- Canonical route registry, exact record parameters, safe return context, and redirects.
- Exact domain field/relationship/status/event vocabulary.
- Shared-component gaps and owning UI-platform changes.
- Named delivery/reviewer assignments and calendars.

## Change Rule

Any decision change must identify affected upstream artifact, requirements/stories, domain/provider contract, shell/shared-UI ownership, Unit/DAG impact, and live evidence. A changed decision returns to the appropriate approval gate.
