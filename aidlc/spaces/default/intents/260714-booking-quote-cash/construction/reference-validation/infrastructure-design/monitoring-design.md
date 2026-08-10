# Monitoring Design - U02 Reference Validation

## Metrics and Traces

Booking records validation total/provider/set/outcome timers, executor active/queued/rejected, semaphore available/wait/timeout, per-request fan-out, HTTP status/timeout, late-result discard, fingerprint conflict, and transactional apply. Reference Data records set/code/status query latency, result size, active/inactive/missing outcome, DB pool wait, and rate/authorization failures.

Traces connect BFF, Booking capture, each bounded Reference call, and apply transaction under correlation ID. Payloads, tokens, customer attributes, and unrestricted reference responses are not logged. Metric labels use bounded set name/outcome/status only; entered codes stay in sanitized audit evidence rather than labels.

## Gates and Alerts

The fixed harness sends 100 validations at concurrency 10 against >=100 records per set. It fails on any unexpected error, p95 >1.5 seconds, p99 >2 seconds, more than four concurrent calls/request, more than ten outbound calls/instance, queue >20, Hikari wait p95 >=100 ms, connections >10, or RSS >768 MiB. Overload tests require typed 503 before provider invocation and no partial Booking mutation.

Operational panels distinguish provider outage, local saturation, invalid business references, authorization denial, and stale apply conflict. Booking liveness must remain green during provider outage; readiness/configuration and dependency signals are displayed separately.

## Evidence

Evidence contains raw monotonic timings, executor/semaphore samples, provider request counts, Docker stats, Hikari snapshots, before/after Booking hashes, safe audit rows, and outage/restart timelines. Restart mid-evaluation must leave no partial state and recover accepted capacity within 60 seconds after dependencies are healthy.

## Source Coverage

Monitoring verifies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U02 `business-logic-model.md`.
