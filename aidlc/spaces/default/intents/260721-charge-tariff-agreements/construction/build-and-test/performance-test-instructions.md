# Performance Test Instructions — W2-03

## NFR targets

This artifact consumes all six `code-generation-plan` and `code-summary`
artifacts and every unit's
`performance-requirements.md`. Key targets include Rate reads p95 <=500 ms,
Rate commands p95 <=750 ms, BFF overhead p95 <=100 ms/p99 <=200 ms,
Agreement reads p95 <=750 ms and commands p95 <=1,000 ms, fresh Charge pricing
p99 <=800 ms for Agreement/Tariff/no-rate subtypes, and Booking-local
capture/history targets of p95 <=500/750 ms. These are isolated acceptance
targets, not production SLOs.

## Execution and evidence

- Run deterministic performance-evaluator tests for U02–U05 and U06. A green
  evaluator proves schema/threshold derivation, not runtime performance.
- Measured pricing requires concurrency 10, prescribed warm-up and sample
  counts, unique non-replayed identities, raw samples, nearest-rank
  percentiles, itemisation oracles, resource telemetry, and isolated Wave A.
- Record p50/p95/p99/max, throughput/error counts, DB/pool/lock evidence,
  heap/RSS/GC/CPU, environment versions, commit, seed, and exact scenario
  counts.
- Missing Docker, native writer, live services, or complete raw evidence is
  `BLOCKED`; partial samples cannot satisfy a target.

## Resource and regression gates

Any OOM/restart, deadlock, pool timeout, unbounded result/history, N+1 query,
unexpected outcome, duplicate/replayed measurement identity, or monotonic
retained-state growth fails the relevant cell. Runtime regression greater than
10% against an approved comparable baseline fails; without such a baseline,
report actual target-versus-observed evidence only.
