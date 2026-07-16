# Monitoring Design - U05 Returned Status Detail

## End-to-End Signals

CMM exports status-outbox count/oldest lag/claim age/attempt/producer metadata. Kafka exports source/DLT config, consumer assignment/lag/retry/recovery. Booking exports mapping result, duplicate/stale/applied counts, upsert latency, projection age, detail p50/p95/p99, active pollers/BFF QPS, poll stop/exhaustion, Hikari wait, and JVM resources. Browser marks confirm response and visible matching status with monotonic time.

Trace correlation links Booking confirmation/event ID, CMM movement/status event, Kafka partition/offset, Booking receipt/projection, BFF detail, and browser render. Raw event records, tokens, customer data, and unrestricted stack traces are redacted.

## Thresholds and Alerts

The 100-journey concurrency-five run must finish within ten minutes, return source lag to zero within 30 seconds, display matching status p95 <=5 seconds, and keep detail p95 <=500 ms. Any unexpected error, duplicate projection, stale overwrite, poll overlap, more than 30 attempts, pool wait p95 >=100 ms, connections >10, RSS >768 MiB, OOM/restart, or non-empty happy-path DLT fails.

Panels distinguish CMM publish delay, broker/consumer lag, Booking apply failure, stale business fact, local detail unavailability, and browser polling exhaustion. Kafka/CMM outage must retain the previous persisted detail and show pending/delayed rather than empty/fake status.

## Evidence

Evidence cross-checks source status outbox, broker envelope/key/offset, Booking receipt/projection ordering tuple, detail JSON, browser screenshot/live-region mark, DLT/replay headers, metrics, raw timings, and restart recovery under one correlation and event identity.

## Source Coverage

Monitoring verifies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U05 `business-logic-model.md`.
