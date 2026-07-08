# Delivery Planning Questions - Shared Platform MVP

> Stage: Delivery Planning
> Intent record: `260630-shared-platform`
> Source context: `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`.

## Q1. Sequencing heuristic

Which sequencing heuristic should drive Bolt planning?

A. Walking-skeleton first, then risk/contract readiness for the remaining Bolts (recommended)
B. Pure WSJF score for every Bolt
C. Value-first by visible UI workflows
X. Other (please specify)

[Answer]: A. Skeleton + risk (Recommended)

## Q2. WSJF/scoring model

How should scoring be represented?

A. Lightweight qualitative score per Bolt: business value, risk reduction, time criticality, job size, and rationale; no false precision (recommended)
B. Full numeric WSJF with explicit weights and computed score
C. No scoring; prose rationale only
X. Other (please specify)

[Answer]: A. Qualitative score (Recommended)

## Q3. Bolt granularity

What Bolt granularity should the delivery plan use?

A. Bundled related units into about 5 Bolts, with the first Bolt as a thin gated walking skeleton across core layers (recommended)
B. One Bolt per unit, about 10 Bolts
C. Two or three large Bolts only
X. Other (please specify)

[Answer]: B. 10 Bolts, refined by follow-up to allow Bolt 1 as a thin multi-unit walking skeleton while preserving finer-grained later Bolts

## Q4. Parallelism stance

Can multiple Bolts run in parallel through Construction?

A. Serial until the walking skeleton is approved, then allow parallel work only for independent DAG branches when gates permit (recommended)
B. Fully sequential for all Bolts
C. Parallel from the first Bolt
X. Other (please specify)

[Answer]: A. After skeleton (Recommended)

## Q5. External dependency handling

Which dependency handling should the plan assume?

A. Explicit dependency map for Keycloak, Kafka/SR, on-prem runners, Vault/Nginx/observability, seed-data decisions, and downstream contract reviewers, with workarounds where possible (recommended)
B. Treat all dependencies as available and revisit only if blocked
C. Block Construction until every external dependency is fully confirmed
X. Other (please specify)

[Answer]: A. Explicit map (Recommended)

## Q6. Earliest risk focus

Which risks should be tackled earliest after the walking skeleton?

A. Identity/authz edge, reference invariants, Kafka/outbox/schema compatibility, BFF token safety, CI contract gates, observability correlation (recommended)
B. Reference admin UI polish and responsive layouts first
C. Deployment automation first, before service/API behavior
X. Other (please specify)

[Answer]: A. Platform risks (Recommended)

## Follow-up F1. Walking skeleton with 10-Bolt preference

How should the first gated walking skeleton work with the 10-Bolt preference?

A. Keep about 10 total Bolts, but let Bolt 1 include thin slices across core units to prove end-to-end architecture (recommended)
B. Make Bolt 1 only the platform skeleton unit
C. Keep exactly one unit per Bolt and defer walking-skeleton validation until several Bolts are complete
X. Other (please specify)

[Answer]: A. Thin multi-unit Bolt (Recommended)
