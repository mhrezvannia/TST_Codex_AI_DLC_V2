# SLO Config - W1-01

## Local Live-Proof SLOs

These SLOs apply to the local W1 live proof. They are intentionally narrower than production SLOs because production traffic baselines do not exist yet.

| Journey | SLI | Local objective | Measurement |
|---|---|---|---|
| Booking page availability | Successful nginx Booking page probe divided by total probes | 100 percent during the release smoke window | `node scripts/w1-live-acceptance.mjs --probe http://localhost:8088/bookings` |
| Booking confirmation to visible CMM status | p95 elapsed time from booking confirmation to visible returned status | <= 5 seconds for live proof | Browser marks plus Booking/CMM event evidence |
| Booking API latency | p95 successful draft/detail/confirm request latency | <= 500 ms for draft/detail; confirm monitored with no errors | Prometheus HTTP histograms and acceptance raw samples |
| Charge pricing latency | p99 successful pricing calculation latency | <= 800 ms | Acceptance performance collector |
| Reference validation latency | p95 <= 1.5 seconds and p99 <= 2 seconds | Meets design threshold | Acceptance performance collector |
| Event relay correctness | Stuck outbox, duplicate logical event, happy-path DLT, and schema mismatch counts | Zero | Outbox tables, Kafka observers, Schema Registry subjects |
| Release evidence integrity | Manifest status and detached attestation verification | PASS with valid signature | `artifacts/w1-01-live/<run-id>/manifest.json` and attestation verifier |

## Production Baseline Deferred

Production SLOs are not declared as binding W1 commitments. A production rollout would first need at least 2 to 4 weeks of measured availability, latency, error rate, saturation, and business-correctness data. Candidate production targets should be set below observed baseline, with 30-day rolling windows and explicit error budget policy.

## Error Budget Policy

For W1 local proof, any failed P1 SLO consumes the entire local error budget and blocks the release claim. For future production:

| Budget remaining | Operating mode |
|---|---|
| More than 50 percent | Normal delivery |
| 25 to 50 percent | Increase deployment monitoring |
| Less than 25 percent | Prioritize reliability work and slow risky changes |
| 0 percent | Freeze feature releases until reliability is restored |

## Source Coverage

This SLO set is derived from `performance-design.md`, `security-design.md`, `reliability-design.md`, `monitoring-design.md`, and `infrastructure-services.md`. The current `deployment-execution` result is BLOCKED, so these SLOs are configured targets, not passed evidence.
