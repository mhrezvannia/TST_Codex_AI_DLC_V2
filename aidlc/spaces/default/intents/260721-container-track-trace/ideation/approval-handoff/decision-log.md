# Ideation Decision Log - W2-04

## Source coverage

This log consolidates the approved [`intent-statement.md`](../intent-capture/intent-statement.md),
[`scope-document.md`](../scope-definition/scope-document.md),
[`intent-backlog.md`](../scope-definition/intent-backlog.md),
[`competitive-analysis.md`](../market-research/competitive-analysis.md),
[`feasibility-assessment.md`](../feasibility/feasibility-assessment.md),
[`constraint-register.md`](../feasibility/constraint-register.md),
[`team-assessment.md`](../team-formation/team-assessment.md), and reviewed
[`wireframes.md`](../rough-mockups/wireframes.md).

## Approved decisions

| ID | Stage | Decision | Rationale / consequence |
|---|---|---|---|
| D-01 | Intent Capture | Deliver the complete thin container journey as a `feature` intent | The valuable outcome crosses UI, API, domain, persistence, Kafka, Booking, and live evidence |
| D-02 | Intent Capture | Manual movement capture is a Container Movement shared-shell form plus API | Equipment control needs an operational workflow and observable recovery, not API-only evidence |
| D-03 | Intent Capture | Freeze DCSA T&T v2.2 domain language and preserve the producer-owned v1 `moveCode` wire field | Rich domain naming must not silently break existing contracts |
| D-04 | Market Research | Extend LinerCore and reuse DCSA standards assets | Existing W0/W1 seams fit the slice; suites/connectivity belong to later intents |
| D-05 | Feasibility | Proceed with controlled integration and acceptance risk | Existing bidirectional event seams are viable if atomicity, idempotency, migrations, and live proof are enforced |
| D-06 | Scope Definition | Keep PB-01 through PB-04 as one mandatory vertical release | Removing persistence, rejection, Booking, UI, or evidence would make the result untrustworthy or unobservable |
| D-07 | Scope Definition | Exclude EDI, public APIs, multi-leg routing, fleet/depot/M&R, D&D, predictive ETA, cloud expansion, and procurement | Prevents adjacent bounded contexts entering through implementation convenience |
| D-08 | Team Formation | Use one role-based stream-aligned intent mob | Preserves end-to-end accountability without inventing named people or horizontal handoffs |
| D-09 | Rough Mockups | Use canonical list/detail routes and one combined expected/actual timeline | Supports navigation, recovery, operational comparison, and shareable detail |
| D-10 | Rough Mockups | Capture inline/responsively with server-authoritative duplicate/sequence rejection | Values remain recoverable and unchanged state is visible and testable |
| D-11 | Approval Handoff | GO to Inception without asserting unsupported budget, named staffing, capacity, or dates | Approval authorizes risk-controlled work; commitments not supplied remain explicit dependencies |
| D-12 | Approval Handoff | Final visual/live acceptance waits for W2-02 synchronization and a serialized Wave A slot | Protects shared UI ownership, evidence integrity, and manager demo port 8088 |
| D-13 | Approval Handoff | Preserve the historical W1 waiver/BLOCKED record as history, separate from later PASS evidence | Audit history must never be rewritten to manufacture success |

## Deferred decisions

- Audit retention duration and privacy-response policy remain organization
  policy inputs for NFR Requirements.
- Named staffing, budget, calendar dates, and stack-slot timing remain delivery
  coordination inputs, not inferred commitments.
- External connectivity, public Track & Trace, multi-leg routing, fleet/depot/
  M&R breadth, and suite procurement stay with their owning future intents.
- Any producer envelope or field change requires separate compatibility
  evidence and producer/consumer co-sign; no such change is approved here.

## Change control

A proposal that alters the thin lifecycle, event envelope, shared UI ownership,
cross-module delivery mode, exclusions, live-proof gate, or W1 evidence history
returns to the accountable owner and an explicit scope/contract decision. It
cannot be absorbed silently during Inception or Construction.
