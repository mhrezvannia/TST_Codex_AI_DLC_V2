# Delivery Planning Questions - W2-04 Container Journey & Track-Trace

## Source Alignment

These decisions use `requirements.md`, `stories.md`, refined `mockups.md`,
application `components.md`, `unit-of-work.md`,
`unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and
`team-practices.md`. The unit DAG constrains valid paths; the questions select
the economic sequence and ownership model.

## Q1 - Sequencing Heuristic

- A. Hybrid walking-skeleton first, then risk/value within the DAG (recommended) - B01 proves PB-01; B02 and B03 follow their distinct lifecycle and access risks.
- B. Pure risk-first.
- C. Pure value-first.
- D. Pure WSJF rank.
- X. Other.
- `[Answer]:` A. Hybrid walking-skeleton first, then risk/value within the DAG (recommended).

## Q2 - WSJF Scoring

- A. No invented numeric WSJF; use transparent qualitative value, time-criticality, risk reduction, and size (recommended).
- B. Use equal-weight 1-5 WSJF estimates despite absent business weights.
- C. Supply custom weights.
- X. Other.
- `[Answer]:` A. No invented numeric WSJF; use transparent qualitative comparison (recommended).

## Q3 - Bolt Granularity

- A. One approved Unit per Bolt (recommended) - preserves unit gates and distinct confidence hypotheses.
- B. Bundle U02 and U03 after U01.
- C. Slice across Units.
- X. Other.
- `[Answer]:` A. One approved Unit per Bolt (recommended).

## Q4 - Parallel Construction

- A. Conditional parallelism (recommended) - B01 is gated first; B02/B03 implementation may run concurrently, but live Compose acceptance is serialized and final visual acceptance waits for W2-02 merge plus integration sync.
- B. Strictly sequential B01 -> B02 -> B03.
- C. Start all three Bolts concurrently despite the hard DAG.
- X. Other.
- `[Answer]:` A. Conditional parallelism with serialized live acceptance (recommended).

## Q5 - External Dependencies

- A. Record bounded owner gates (recommended) - W2-02 merge/sync, Booking contract co-sign, Identity/Reference Data availability, and exclusive Wave A stack slot; W2-03 stays informed.
- B. Treat all dependencies as already resolved.
- C. Block all construction until every Wave A intent completes.
- X. Other.
- `[Answer]:` A. Record bounded owner gates (recommended).

## Q6 - Earliest Risks

- A. Contract/migration/atomicity first in B01; lifecycle ordering/recovery in B02; least-privilege/degradation in B03 (recommended).
- B. UI polish first.
- C. Final acceptance mechanics first.
- X. Other.
- `[Answer]:` A. Contract/migration/atomicity first, then lifecycle and access risks (recommended).

## Per-Bolt Proposal

| Bolt | Unit | Walking skeleton | Definition of Done | Confidence hypothesis | Owner |
| --- | --- | --- | --- | --- | --- |
| B01 | U01 PB-01 Journey-to-Booking Walking Skeleton | Yes | U01 live DoD and migration proof pass; gated approval before dependents | The real broker/database/API/UI/contracts path works without placeholders and can evolve safely | W2-04 stream-aligned intent mob; CMM driver, Booking/contract/UI/platform/security/release review hats |
| B02 | U02 Ordered Lifecycle and Observable Rejections | No | U02 live DoD passes, including recovery and Booking dispositions | The lifecycle remains ordered, explicit, idempotent, and useful to both UIs under retries and invalid input | Same intent mob; CMM driver with Booking contract/consumer and quality review |
| B03 | U03 Authorized Degraded Journey Access | No | U03 live DoD passes, including Identity and Reference Data failure behavior | Least privilege and degraded reads remain safe and actionable without cached authorization or accepted-state mutation | Same intent mob; CMM driver with Identity/Reference Data and security/UI review |

Global post-Bolt gate: after W2-02 merges and W2-04 synchronizes integration,
the release reviewer exclusively controls `linercore-wave-a` for final visual and
broker-to-database-to-Booking acceptance; demo guards and both audits run there.

## Plan Approval

- A. Approve Plan (recommended).
- B. Revise Plan.
- `[Answer]:` A. Approve Plan (recommended).
