# Monitoring Design — U06 Isolated Acceptance and Preservation

## Inputs and evidence posture

This design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.
U06 consumes existing Prometheus/Grafana/OpenTelemetry/Jaeger and container
logs; it adds evidence collectors, not a production monitoring service.

## Required signals

Closed observability IDs are LATENCY, TERMINAL_OUTCOME, BASIS,
MANUAL_FALLBACK, REPLAY_CONFLICT, and REDACTION. Each live scenario records
before/after metric deltas, bounded labels, safe correlated logs, and trace
links. Missing telemetry is BLOCKED and cannot be inferred from API success.

Resource proof captures pool/lock/query plans, GC/heap/RSS, container CPU/
restart/OOM, worker count, HTTP connections, pending futures, response/buffer
sizes, artifact bytes, and readiness probes. Three identical post-warm-up
cycles use 60-second quiescence; cycle three and two-transition rules match the
approved NFR designs.

Harness gates are pricing workers 10, browser workers 4, pending futures 14,
writer queue 256, response 1 MiB, command log 32 MiB, ordinary artifact 64 MiB,
non-trace logs 512 MiB, trace 2,048 entries/64 MiB compressed/256 MiB
expanded/32 MiB entry/20:1 ratio, raw trace temp 512 MiB, run root 2 GiB, and
free-disk reserve 5 GiB. Any limit breach is BLOCKED before expansion.

## Log, trace, and screenshot hygiene

Scans prohibit cookies, authorization/service tokens, passwords, owner tokens,
session/storage state, raw customer/party bodies, SQL parameters, and
unnecessary commercial values. Minimal access-controlled oracle files may
contain expected/observed amounts. Metric labels never contain identifiers,
correlations, or money.

Every scan finding has severity, artifact/path, scenario, and manual
disposition. Unsafe traces are discarded and the cell is BLOCKED; access
control alone never makes unsafe evidence acceptable.

## Gate dashboards and manifest

The human report derives from machine records and shows ordered gate state,
closed-ID coverage, manager before/after equality, readiness/restart/restore,
commercial/performance distributions, browser/a11y/visual state, security,
observability, quality, audits, and redaction. It cannot assign PASSED.

Raw monotonic JSONL is authoritative. Summaries recompute count/errors/min/
median/p95/p99/max, uniqueness, receipt/case/replay flags, and itemization
oracle. Available-but-slow is FAILED; unavailable is BLOCKED.

## Incident and retry handling

Transient readiness probes retry only inside their monotonic deadline.
Assertion failures are never rerun into green. A later attempt uses a new run
ID linked to the immutable prior manifest. Manager drift is preserved and never
auto-repaired; evidence crash recovery reconciles ledger/artifacts before any
new gate proceeds.
