# Performance Test Instructions - Shared Platform MVP

## Scope and Inputs

Performance validation is not a full Standard-strategy execution requirement in this stage, but the generated units include performance-relevant surfaces:

| Surface | Source unit | Performance concern |
| --- | --- | --- |
| Reference-data provider list/detail APIs | U03, U06 | Lookup latency, bounded pagination, filter cost. |
| Reference-data outbox status and publish batch | U04 | Claim throughput, retry backlog, event freshness. |
| Auth app BFF routes | U05 | Redirect/session route latency and low error rate. |
| Local seed and smoke validators | U09 | Deterministic startup checks and bounded waits. |
| Observability descriptors | U10 | Metric visibility for latency, outbox depth, and freshness. |

## Commands

Run baseline static/readiness checks:

```powershell
node scripts/smoke-local.mjs
node scripts/smoke-observability.mjs
docker compose --profile observability config --quiet
```

When Docker services and Java images are available, run a local load baseline:

```powershell
docker compose --profile observability up --build
```

Then exercise these endpoints with the team's preferred load tool:

| Endpoint | Baseline target |
| --- | --- |
| `GET /reference-data/api/reference-sets` through Nginx/BFF | p95 under 300 ms at local developer load. |
| `GET /reference-data/api/reference-sets/currencies/records` | p95 under 500 ms with default seed data. |
| `GET /auth/api/auth/session` | p95 under 300 ms with placeholder session state. |
| Reference-data service outbox status endpoint | p95 under 500 ms for bounded status queries. |

## Evidence Expectations

Record performance evidence with:

| Evidence | Required content |
| --- | --- |
| Command and environment | Host, Docker version, service profile, seed version. |
| Load shape | Duration, concurrency, request mix, data volume. |
| Results | p50, p95, p99, throughput, error rate, CPU/memory if available. |
| Observability | Prometheus/Grafana/Jaeger screenshots or exported metric samples for latency and outbox freshness. |

Fail the performance gate when p95 latency regresses by more than 10 percent against the accepted baseline, or when error rate is above 1 percent for local baseline traffic.
