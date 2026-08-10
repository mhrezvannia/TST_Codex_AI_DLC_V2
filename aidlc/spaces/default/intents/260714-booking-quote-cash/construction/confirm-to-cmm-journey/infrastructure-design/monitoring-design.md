# Monitoring Design - U04 Confirm to CMM Journey

## Metrics and Traces

Booking records confirm latency/result, outbox pending/claimed/retry/permanent counts, oldest lag/claim age, attempts, producer terminal latency/timeout, topic/partition/offset, and relay batch duration. Kafka/SR monitoring records subject fingerprint/version/compatibility, source/DLT partition count, broker availability, consumer assignment, lag, retry, and DLT recovery. CMM records mapping outcome, duplicate/stale/applied revision, Reference validation, receipt/journey/status-outbox commit, DB pool, and JVM resources.

Trace/correlation links confirm transaction, outbox event ID/logical key, producer metadata, source partition/offset, CMM listener, external validation, and apply transaction. Event payloads, tokens, customer attributes, and connection strings are excluded from logs; safe event/booking/equipment IDs are permitted.

## Gates and Alerts

| Signal | Blocking threshold |
|---|---|
| confirm API | p95 <=500 ms, p99 <=1 s, zero Kafka wait |
| CMM apply | p95 <=2 s |
| source lag | zero within 30 s after workload |
| relay claim | no `IN_PROGRESS` older than 30 s plus one schedule interval |
| DLT | empty for happy run; age <=5 min and count <=100 otherwise |
| pools/JVM | wait p95 <100 ms, <=10 DB connections/service, RSS <=768 MiB |
| contract | exact canonical version 1/BACKWARD; legacy or unknown blocks |

The fixed journey run uses ten warm-ups and 100 unique confirmations at concurrency five. Any unexpected error, duplicate logical event/journey, missing topic/DB fact, noop publisher, unassigned listener, OOM, or restart fails the run.

## Evidence

Evidence captures schema export/cutover fingerprints, topic configs, consumer-group assignment/lag, raw event envelopes, DB receipts/journeys/outbox rows, producer metadata, DLT headers, replay audit, Docker/pool stats, and restart/lease-recovery timelines with command/time/exit/hash.

## Source Coverage

Monitoring verifies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U04 `business-logic-model.md`.
