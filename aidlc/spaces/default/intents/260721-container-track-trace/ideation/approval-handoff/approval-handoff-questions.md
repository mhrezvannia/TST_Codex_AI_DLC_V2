# Approval & Handoff Questions - W2-04

These questions compile the approved intent, feasibility, scope, team, and
rough-mockup decisions into the Ideation-to-Inception gate. They authorize a
risk-controlled initiative; they do not assert named staff, budget, capacity,
calendar dates, or an acceptance-stack reservation that has not been supplied.

## Q1. Intent and scope agreement

- A. Approve the complete thin vertical slice and its explicit exclusions as
  stated in `intent-statement.md` and `scope-document.md` (recommended)
- B. Request a scope change before Inception
- C. Reject the initiative
- X. Other (please specify)
- `[Answer]:` A. Approve the complete thin vertical slice and exclusions.

## Q2. Critical risks and mitigations

- A. Acknowledge the critical risks and require their stated controls and exit
  evidence, including atomic state/outbox behavior, contract fidelity, W2-02
  synchronization, serialized acceptance, demo protection, and immutable W1
  waiver history (recommended)
- B. Return to Feasibility to change risk treatment
- C. Accept risks without the stated controls
- X. Other (please specify)
- `[Answer]:` A. Acknowledge the critical risks and require every stated control and exit proof.

## Q3. Budget and resource commitment

- A. Authorize delivery with the existing repository/tooling and role-based mob;
  treat named staffing, budget, and schedule as uncommitted inputs rather than
  blockers or invented promises (recommended)
- B. Pause until named staffing and a budget are supplied
- C. Authorize vendor procurement before Inception
- X. Other (please specify)
- `[Answer]:` A. Authorize delivery with existing tooling and a role-based mob without inventing commitments.

## Q4. Rough mockup alignment

- A. Accept the reviewed `READY` list/detail/timeline/capture concept as the
  shared vision, subject to refined design and final W2-02 synchronization
  (recommended)
- B. Request concept changes before Inception
- C. Remove the Container Movement UI from this vertical slice
- X. Other (please specify)
- `[Answer]:` A. Accept the reviewed `READY` concept subject to refinement and W2-02 synchronization.

## Q5. Market and investment rationale

- A. Accept extend-LinerCore plus DCSA standards reuse as sufficient investment
  rationale for this internal carrier capability; defer suite/connectivity
  procurement to its owning future intent (recommended)
- B. Require additional procurement research before Inception
- C. Replace the slice with a suite-buying initiative
- X. Other (please specify)
- `[Answer]:` A. Accept extend-LinerCore plus DCSA standards reuse as the investment rationale.

## Q6. Mob readiness and scheduling

- A. Approve the role-based stream-aligned mob and dependency-gated sequence;
  confirm role coverage before Construction and reserve the Wave A stack only
  for serialized final acceptance after W2-02 merges (recommended)
- B. Pause until named people and fixed calendar dates are committed
- C. Split delivery into horizontal teams
- X. Other (please specify)
- `[Answer]:` A. Approve the role-based mob and dependency-gated sequence.

## Upstream source map

The gate compiles the approved [`intent-statement.md`](../intent-capture/intent-statement.md),
[`scope-document.md`](../scope-definition/scope-document.md), and
[`intent-backlog.md`](../scope-definition/intent-backlog.md). Its investment
decision comes from [`competitive-analysis.md`](../market-research/competitive-analysis.md).
Risk acknowledgement is grounded in
[`feasibility-assessment.md`](../feasibility/feasibility-assessment.md) and
[`constraint-register.md`](../feasibility/constraint-register.md). Resource
authorization follows [`team-assessment.md`](../team-formation/team-assessment.md),
and the visual decision accepts the reviewed [`wireframes.md`](../rough-mockups/wireframes.md).
