# User Stories Plan & Questions — W2-03 Charge Tariffs & Agreements

## Upstream Basis

This plan derives from the reviewed [`requirements.md`](../requirements-analysis/requirements.md), brownfield [`business-overview.md`](../../../../codekb/TST_Codex_W2-03/business-overview.md), [`component-inventory.md`](../../../../codekb/TST_Codex_W2-03/component-inventory.md), and affirmed [`team-practices.md`](../practices-discovery/team-practices.md). The existing rough flow and Charge page record constrain personas and interactions; they do not authorize shared-shell, navigation, Booking-page, or `packages/ui` redesign.

## Proposed Story Plan

- **Personas:** three human personas already evidenced upstream — Pricing Analyst, Booking Desk Operator, and Charge Reader/Auditor. Charge and Booking services are collaborating systems, not invented human personas.
- **Format:** standard role/goal/benefit statement; concrete Given/When/Then acceptance criteria; requirement IDs, dependencies, and INVEST notes.
- **Breakdown:** end-to-end workflow slices across rate authority, agreement lifecycle, Booking price consumption, repricing, and manual-pricing evidence.
- **Expected size:** approximately 14–16 independently reviewable stories. This keeps lifecycle and failure branches testable without decomposing into component tasks.
- **Prioritization:** direct W2-03 pricing, versioning, Booking consumption, repricing, and no-rate outcomes are Must Have. Supporting operator-read/audit and UX-state coverage remain at least Should Have where they do not independently determine the vertical proof.

## Questions

### Q1 — Interaction Mode

How should these planning questions be answered?

- A. Answer the six questions in two compact batches **(Recommended)**
- B. Review one question at a time

[Answer]: A — Answer the six questions in two compact batches (Recommended).

### Q2 — Persona Set

Which persona model should drive the stories?

- A. Pricing Analyst + Booking Desk Operator + Charge Reader/Auditor **(Recommended)** — matches the approved upstream actor model; Pricing Analyst also approves versions.
- B. Pricing Analyst + Booking Desk Operator only — folds read/audit needs into analyst stories.
- C. Add a separate Commercial Approver — expands the actor model and contradicts the resolved rough-mockup boundary unless requirements are reopened.

[Answer]: A — Pricing Analyst + Booking Desk Operator + Charge Reader/Auditor (Recommended).

### Q3 — Breakdown Approach

How should stories be grouped?

- A. End-to-end workflow slices **(Recommended)** — rate → agreement → Booking price, then reprice and no-rate branches.
- B. Persona-by-persona — clearer ownership but duplicates cross-domain outcomes.
- C. Domain area — simpler backlog grouping but risks hiding the live vertical proof.

[Answer]: A — End-to-end workflow slices (Recommended).

### Q4 — Granularity

What story size should be targeted?

- A. About 14–16 outcome stories **(Recommended)** — lifecycle and failure branches remain independently testable.
- B. About 8 larger stories — shorter backlog but weaker INVEST independence.
- C. More than 20 UI/API/component stories — more detailed but prematurely task-oriented.

[Answer]: A — About 14–16 outcome stories (Recommended).

### Q5 — Priority Policy

How should MoSCoW priority be applied?

- A. All direct vertical outcomes Must; supporting read/audit and UX proof Should unless required by a Must acceptance path **(Recommended)**
- B. Mark every W2-03 story Must — simple but gives no delivery signal.
- C. Make only the primary agreement happy path Must — under-prioritizes tariff fallback, repricing, and no-rate commitments.

[Answer]: A — Direct vertical outcomes Must; supporting read/audit and UX proof Should unless required by a Must acceptance path (Recommended).

### Q6 — Acceptance Style

How should acceptance criteria be written?

- A. Given/When/Then with requirement IDs and observable UI/API/persistence evidence **(Recommended)**
- B. Concise bullet outcomes without scenarios — easier to scan but less executable.
- C. Detailed implementation tasks — useful later, but inappropriate for product stories.

[Answer]: A — Given/When/Then with requirement IDs and observable UI/API/persistence evidence (Recommended).

## Ambiguity Check

All six answers are explicit, use one enumerated choice, and contain none of the ambiguity signals “mix of”, “not sure”, “depends”, or “probably”. They do not contradict one another or the reviewed requirements. No follow-up question is required.
