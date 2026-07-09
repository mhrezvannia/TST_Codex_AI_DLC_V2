# Anomaly Config

## Inputs

Anomaly detection consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local Anomaly Signals

| Signal | Baseline | Anomaly |
| --- | --- | --- |
| Readiness blocked count | 0 after provisioning | Any required blocked check after deployment window |
| BFF 503 rate | 0 after services healthy | Any sustained upstream unavailable response |
| Auth denial rate | Expected only for unauthorized users | Sudden spike for local reference admin |
| Seed apply failures | 0 after services healthy | Any failed seed operation |
| Contract live failures | 0 after services healthy | Any live provider failure |
| Outbox event freshness | Under 5 minutes | Freshness over threshold or growing backlog |

## Detection Method

Before hosted observability is stable, anomaly detection is evidence-file based:

- `artifacts/readiness/local-readiness.json`
- `artifacts/contracts-live-verification.json`
- `artifacts/seed-apply-attempt.json`

After the observability profile is running, promote these to Prometheus/Grafana alert expressions.
