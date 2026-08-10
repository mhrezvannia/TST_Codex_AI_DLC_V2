# Anomaly Config - W1-01

## Static Guardrails

The local W1 stack does not yet have enough production-like history for machine-learned anomaly detection. Static guardrails are the operational baseline:

| Signal | Guardrail |
|---|---|
| Booking nginx path | Any failure blocks release proof. |
| Booking confirm to visible CMM status | p95 must stay within the configured live-proof target. |
| Charge pricing | Any sustained 5xx increase during proof requires investigation. |
| Outbox and relay state | No stale `IN_PROGRESS`, stuck pending rows, duplicate logical events, or happy-path DLT entries. |
| Schema Registry | No unknown schema fingerprints or incompatible subject changes. |
| Docker runtime | No required observability image pull failure during a full proof run. |

## Future Anomaly Detection

After a production baseline exists, enable anomaly detection for:

| Metric | Detector |
|---|---|
| Booking API p95/p99 latency | Seasonality-aware band with static hard threshold |
| Charge pricing error rate | Error-rate anomaly plus absolute 5xx ceiling |
| Event freshness | Projection freshness anomaly and stale-event ceiling |
| Outbox backlog | Sudden backlog growth and stuck-row ceiling |
| JVM memory and GC | Trend anomaly plus OOM/restart hard failure |
| PostgreSQL connection pool wait | Wait-time anomaly and p95 hard threshold |

## Source Coverage

This anomaly plan uses `monitoring-design.md` blocking thresholds, `performance-design.md` latency ceilings, `reliability-design.md` replay/restart state checks, `security-design.md` schema and evidence controls, and `infrastructure-services.md` runtime boundaries.
