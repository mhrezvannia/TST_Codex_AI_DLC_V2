# Delivery Planning Questions - Charge & Customer Agreement

## Q1. Which sequencing heuristic applies?

A. Walking-skeleton-first, then dependency/value-first vertical slices.
B. UI-only first.
C. Docker recovery first.
D. Advanced pricing first.
E. Production deployment first.
X. Other (please specify)

[Answer]: A

## Q2. What Bolt granularity should be used?

A. Bundled related units per Bolt with testable demos.
B. One file per Bolt.
C. Entire module in one Bolt.
D. One meeting per Bolt.
E. No Bolts.
X. Other (please specify)

[Answer]: A

## Q3. Can Bolts run in parallel?

A. Keep construction sequential until the walking skeleton and backend API are stable; parallelize docs/event seam later if useful.
B. All Bolts in parallel immediately.
C. No construction allowed.
D. Only UI in parallel.
E. Only Docker work in parallel.
X. Other (please specify)

[Answer]: A
