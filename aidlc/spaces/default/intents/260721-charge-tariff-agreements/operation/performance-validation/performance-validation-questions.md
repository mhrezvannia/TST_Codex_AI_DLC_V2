# Performance Validation Questions - W2-03

## Context

The six Units' `performance-requirements`, `scalability-requirements`,
`performance-design`, and `scalability-design` already define exact fixtures,
concurrency, warm-up, scenario populations, percentiles, resource gates, and
failure semantics. The approved `dashboards` are not installed, and Deployment
Execution produced no candidate. Therefore no live latency, throughput,
resource, or auto-scaling result can currently be measured.

## Questions

### Q1. What should Performance Validation do in the current no-deploy state?

A. Plan and record BLOCKED results (recommended) - produce the executable plan
and target-vs-actual matrix, but do not attempt load against manager ports,
direct services, an alternate topology, or an absent candidate.

B. Attempt Wave A anyway - bypass blocked deployment prerequisites and start
or mutate the isolated stack from this stage.

C. Use unit/evaluator timing - treat build/test durations as live performance
evidence.

X. Other (please specify)

[Answer]: A. Plan and record BLOCKED results (recommended)

### Q2. Which load model should be authoritative?

A. Requirement-bound fixed populations (recommended) - use exact 10-client,
large-fixture, warm-up, fresh-sample, contention, and three-cycle populations
from the unit NFRs.

B. Generic ramp/spike/soak - replace the approved deterministic acceptance
populations with generic load-test patterns.

C. One smoke request - use a single request per journey.

X. Other (please specify)

[Answer]: A. Requirement-bound fixed populations (recommended)

### Q3. How should throughput and capacity be reported?

A. Observed local values only (recommended) - record achieved throughput
alongside latency and resources, with no production forecast or minimum RPS
invented beyond the approved fixed workload.

B. Production capacity forecast - extrapolate local results into future RPS
and infrastructure size.

C. Omit throughput - report percentiles without sample duration or rate.

X. Other (please specify)

[Answer]: A. Observed local values only (recommended)

### Q4. How should unavailable versus slow behavior be classified?

A. Preserve BLOCKED versus FAIL (recommended) - unavailable Docker, writer,
browser, or required telemetry is BLOCKED; an available candidate exceeding a
threshold or producing wrong evidence is FAIL.

B. Mark unavailable as FAIL - treat missing capability as measured performance
failure.

C. Mark unavailable as PASS - accept design/unit evidence as a substitute.

X. Other (please specify)

[Answer]: A. Preserve BLOCKED versus FAIL (recommended)

### Q5. What should happen to stress, soak, and auto-scaling validation?

A. Defer explicitly (recommended) - no auto-scaling topology or representative
production traffic exists; add admission criteria for a later approved
capacity exercise.

B. Simulate results on paper - provide predicted scaling times and saturation
points.

C. Add cloud auto-scaling now - create new cloud infrastructure and tests.

X. Other (please specify)

[Answer]: A. Defer explicitly (recommended)

## Confirmation

The consolidated answer set was confirmed before artifact generation.
