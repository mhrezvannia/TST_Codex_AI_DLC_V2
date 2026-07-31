# User Story Plan Questions - W2-04 Container Journey & Track-Trace

## Planning Context

This plan is derived from `requirements.md`, the brownfield
`business-overview.md` and `component-inventory.md`, and the affirmed
`team-practices.md`. It will not introduce EDI, public DCSA APIs, multi-leg
routing, fleet/depot, M&R, or shared-shell/package redesign.

## Questions

### Q1. Persona set

Which persona set should anchor the stories?

- A. Equipment Control as primary; Customer Service as read-only secondary; Platform Operator/Release Reviewer as supporting evidence persona (recommended)
- B. Equipment Control and Customer Service only; keep evidence outside stories
- C. One generic Operations User plus Release Reviewer
- X. Other (please specify)
- `[Answer]:` A. Equipment Control as primary; Customer Service as read-only secondary; Platform Operator/Release Reviewer as supporting evidence persona (recommended)

### Q2. Breakdown approach

How should the story map be decomposed?

- A. By end-to-end operational workflow, with each story remaining a vertical slice across applicable service/UI seams (recommended)
- B. By persona, grouping all Equipment Control work before Customer Service work
- C. By bounded context, grouping CMM, Booking, Identity, and evidence separately
- X. Other (please specify)
- `[Answer]:` A. By end-to-end operational workflow, with each story remaining a vertical slice across applicable service/UI seams (recommended)

### Q3. Rejection granularity

How should duplicate and out-of-sequence behavior be represented?

- A. Two independent Must Have stories because each has a distinct trigger, reason code, recovery, and unchanged-state proof (recommended)
- B. One combined rejection story covering both 409 outcomes
- C. Acceptance criteria inside the happy-path capture story only
- X. Other (please specify)
- `[Answer]:` A. Two independent Must Have stories because each has a distinct trigger, reason code, recovery, and unchanged-state proof (recommended)

### Q4. Evidence actor

Should the broker-to-database-to-Booking and UI/audit proof be a stakeholder
story rather than an unowned technical task?

- A. Yes; assign it to the Release Reviewer/Auditor persona and trace it to FR-14/AC-11/AC-12 (recommended)
- B. No; keep it as a non-story delivery checklist only
- C. Split broker/database proof and UI/audit proof into separate reviewer stories
- X. Other (please specify)
- `[Answer]:` A. Yes; assign it to the Release Reviewer/Auditor persona and trace it to FR-14/AC-11/AC-12 (recommended)

### Q5. MoSCoW treatment

How should priority be recorded for this fixed vertical intent?

- A. Mark every stated W2-04 slice story Must Have and record all named exclusions as Won't Have; do not create optional scope (recommended)
- B. Mark core journey/capture/projection Must Have and responsive/degraded/evidence coverage Should Have
- C. Use Must/Should/Could across the stated slice to create an internal fallback scope
- X. Other (please specify)
- `[Answer]:` A. Mark every stated W2-04 slice story Must Have and record all named exclusions as Won't Have; do not create optional scope (recommended)

## Planned Generation

After answers are confirmed, generate three personas plus approximately nine
workflow-based stories. Every story will use the standard persona/action/value
format, 3-6 Given/When/Then criteria, MoSCoW priority, FR/AC traceability,
dependencies, relationships, and an INVEST note. The canonical full timeline
remains CMM-owned; Booking receives only its latest per-container projection.
