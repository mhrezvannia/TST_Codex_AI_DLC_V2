# Mob Composition - W2-03 Charge Tariffs & Agreements

This role plan supports the vertical boundary in [`scope-document.md`](../scope-definition/scope-document.md), the sequence in [`intent-backlog.md`](../scope-definition/intent-backlog.md), and the conditional release risks in [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md).

## Recommended Topology

Use one stream-aligned W2-03 intent mob with an accountable Product/value role and rotating specialist hats. Shared Platform, identity/shell, and reference-data owners interact as established service providers/reviewers; they do not take over Charge ownership. No separate database, backend, frontend, or QA delivery team is created.

## Working Mob

| Hat | Active contribution | Mandatory review points |
|---|---|---|
| Driver | Implements the current vertical outcome | Rotates when real contributors are assigned |
| Primary navigator | Holds acceptance outcome and next smallest step | Every implementation session |
| Charge domain | Commercial invariants and operational workflow | Rate/agreement/calculation/UI decisions |
| Booking domain | Consumer contract, snapshots, reprice/manual projection | Any Booking seam change |
| Architecture/contract | Boundaries, additive evolution, impact analysis | Contract/migration/cross-service changes |
| Data/migration | Schema ownership and upgrade safety | Migration authoring and acceptance |
| Frontend/UX/accessibility | Charge pages, Booking breakdown, responsive states | Every UI-bearing outcome |
| Quality/security | Tests, authorization, evidence sufficiency | Before each outcome gate |
| Release review | Compose/demo guard/live/audits | Before and during acceptance only |

Actual people and concurrency are intentionally unspecified. Hats may be combined only after real skill and independence are assessed.

## RACI Matrix

| Decision/deliverable | Product | Charge domain | Booking domain | Architect | Engineering mob | Quality/Security | Release review | User/gate approver |
|---|---|---|---|---|---|---|---|---|
| Scope/value boundary | A/R | C | C | C | I | C | I | A at AI-DLC gate |
| Charge semantics/UI | C | A/R | I | C | R | C | I | I |
| Booking contract/snapshot | C | C | A/R | C | R | C | I | I |
| Architecture/migration ownership | I | C | C | A | R | C | I | I |
| Test/evidence strategy | C | C | C | C | R | A/R | C | I |
| Live Compose and demo protection | I | I | I | C | R | C | A/R | I |
| Scope change | R | C | C | C | I | C | C | A |
| Release completion claim | C | C | C | C | I | R | A/R | A at final gate |

Legend: A = Accountable, R = Responsible, C = Consulted, I = Informed. Where the user is marked A, the operational role still owns preparation and recommendation; the user owns the formal gate decision.

## Interaction and Handoff Agreement

- Prefer live mob/pair collaboration for contract semantics, migrations, cross-module snapshots, degraded paths, and UI accessibility.
- Use asynchronous decision records, artifact links, exact test evidence, and a visible parking lot because locations/time zones are unknown.
- A vertical outcome remains with the mob from contract/migration through UI/evidence; it is not handed across horizontal queues.
- Shared Platform/reference/auth owners are consulted through stable interfaces. Any requested change to their owned surfaces requires explicit producer/consumer review.
- Serialize final live acceptance on `linercore-wave-a`; pre-guard failure stops the session.

## Decision Cadence

| Gate | Accountable role | Required participants | Evidence |
|---|---|---|---|
| Scope/requirement | Product | Charge, Booking, Architecture, Quality | Approved artifacts and traceability |
| Contract/migration | Architecture | Charge, Booking, Data, Quality/Security | Impact analysis and executable tests |
| UI page | Charge domain | Frontend/UX, Quality, Product | `ui-ux-pro-max`, master/session compliance, Playwright states |
| Proto-outcome | Product | Working mob and Quality | Vertical tests and evidence |
| Live acceptance | Release review | Charge, Booking, Quality/Security | Guards, isolated Compose, UI proof, both audits |
| AI-DLC stage/phase | User | Lead role recommendation | Stage artifacts, sensors, open risks |

## Capacity and Escalation Rules

- Do not promise dates until real assignees, utilization, and Docker access are confirmed.
- Limit work in progress to the smallest vertical outcome supported by the dependency graph.
- Escalate contract breaks, destructive migration proposals, ownership expansion, or manager-demo risk immediately.
- If a critical skill is absent, pause the affected outcome and propose a targeted reviewer/enabling engagement; do not create a permanent new team by default.

## Upstream Coverage

The `scope-document` requires one accountable vertical release. The `intent-backlog` determines the risk-first mob sequence. The `feasibility-assessment` supplies the specialist review points and the Docker-capable release dependency.
