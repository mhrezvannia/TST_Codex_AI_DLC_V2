# SLO Config

## Inputs

SLOs consume `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local SLOs

| SLO | Target | Measurement |
| --- | --- | --- |
| Local readiness | 100% pass before demo deployment | `artifacts/readiness/local-readiness.json` |
| Reference Data BFF availability | 99% successful BFF requests during local validation window | BFF HTTP status metrics |
| Reference Data BFF latency | p95 under 500 ms locally | Prometheus histogram |
| Auth bypass safety | 100% denial outside local/test profiles | Auth guard tests and runtime config |
| Contract correctness | 100% offline provider contract verification | `node scripts/verify-contract-providers.mjs` |
| Seed correctness | 100% seed dry-run validation | `node scripts/seed-local.mjs --dry-run ...` |
| Event freshness | Pending reference events below 5 minutes after runtime is healthy | Outbox metric `reference_event_freshness_seconds` |

## Error Budget Policy

If local readiness is `failed`, stop deployment. If readiness is `blocked`, complete provisioning before deployment. If live contracts or seed apply fail after services are healthy, do not promote.
