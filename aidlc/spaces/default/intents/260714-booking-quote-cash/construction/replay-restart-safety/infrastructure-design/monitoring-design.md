# Monitoring Design - U06 Replay and Restart Safety

## Recovery Measurements

The harness records monotonic stop, start, dependency health, service liveness/readiness, Flyway completion, listener assignment, relay resumption, query success, replay publish, consumer apply, and visible UI marks. It samples Docker CPU/RSS/restart, Hikari active/wait, outbox claim age/lag, producer attempts, consumer lag/retries, DLT count/age, duplicate/stale dispositions, and exact business row counts.

Structured recovery logs use run ID, component, fault seam, correlation/event ID, safe coordinates, state transition, duration, and result. Commands/environment/tokens/connection strings/raw customer payloads are redacted. Evidence hashes detect tampering; U07 later provides external signing.

## Acceptance Thresholds

The duplicate/stale driver publishes 100 records at concurrency 10, completes within two minutes with disposition p95 <=500 ms, preserves exact business counts, and drains source lag within 30 seconds. Crashed outbox claims recover after lease plus retry; service RTO is <=60 seconds after dependency health; corrected replay becomes visible within five seconds.

Any unexpected error, duplicate business effect, stale overwrite, receipt/effect mismatch, missing audit, failed tamper/auth test, pool wait p95 >=100 ms, connections >10/service, RSS >768 MiB, OOM, unbounded DLT, or migration/hash drift fails. Fault/evidence writes are outside measured application transactions.

## Dashboards and Evidence

Recovery panels present service readiness timeline, relay/consumer lag, claim lease recovery, duplicate/stale/replay disposition, DLT age/count, migration version/checksum, and state-count deltas. Raw JSONL/CSV, database/topic snapshots, command exits, and before/after hashes are preserved under the run ID.

## Source Coverage

Monitoring verifies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U06 `business-logic-model.md`.
