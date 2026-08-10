# Alarms - W1-01

## Alert Policy

The local W1 environment should collect broad telemetry but alert only on user-impacting symptoms or release-proof blockers. Until production baselines exist, these alarms are local guardrails for the live-proof run rather than production paging rules.

| Alarm | Severity | Condition | Action |
|---|---|---|---|
| Booking nginx user path unavailable | P1 | `node scripts/w1-live-acceptance.mjs --probe http://localhost:8088/bookings` fails | Stop release claim; inspect nginx, Booking app, and service health. |
| Live manifest not PASS | P1 | `artifacts/w1-01-live/<run-id>/manifest.json` status is not PASS | Stop release claim; retain evidence and rerun with a new run ID after blocker removal. |
| Booking outbox stuck | P1 | `booking_outbox_pending_total > 0` for more than the relay lease window or any `IN_PROGRESS` row exceeds lease | Inspect relay scheduler, Kafka connectivity, and producer errors. |
| CMM relay stuck | P1 | `containermovement_outbox_pending_total > 0` beyond freshness target | Inspect CMM relay, returned-status topic, and Booking projection consumer. |
| Charge pricing server errors | P2 | Any sustained increase in 5xx pricing requests during live proof | Inspect charge service logs and reference-data dependency. |
| DLT on happy path | P1 | Any happy-path event lands in a DLT topic | Stop release claim; inspect schema, consumer, and business identity chain. |
| Docker observability image pull blocked | P2 | Compose start cannot pull required observability images | Fix Docker Desktop proxy/cache before rerunning full proof. |

## Escalation

P1 alerts block W1 completion and require a new live acceptance run after remediation. P2 alerts do not page a production on-call in this local environment, but they must be recorded in the operation artifacts and reviewed before a merge or release claim.

## Source Coverage

The alarms reflect `monitoring-design.md` blocking thresholds, `reliability-design.md` fail-fast run states, `performance-design.md` journey latency goals, `security-design.md` release evidence controls, and `infrastructure-services.md` component boundaries.
