# Performance Design - U06 Replay and Restart Safety

## Recovery Measurement

Node/PowerShell harness records monotonic stop/start/health/query/replay marks and business counts. Duplicate/stale driver publishes 100 records concurrency10; replay driver records DLT/source coordinates and visible result. Docker stats, Kafka lag, Hikari and migration timers are sampled.

Acceptance enforces duplicate p95500ms/two-minute run, lag zero30s, crashed claim lease+retry, service RTO60s, corrected replay within five seconds, pools/RSS/no errors. Fault/evidence writes occur outside measured application transactions.

## Source Coverage

Design realizes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U06 `business-logic-model.md`.
