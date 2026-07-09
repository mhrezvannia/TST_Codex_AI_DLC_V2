# NFR Validation Matrix

## Inputs

This matrix consumes `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and `dashboards`.

## Matrix

| NFR | Target | Evidence | Status |
| --- | --- | --- | --- |
| Local readiness | 100% pass before demo deployment | `artifacts/readiness/local-readiness.json` | Blocked |
| BFF availability | 99% successful local validation requests | Runtime load test | Blocked |
| BFF latency | p95 under 500 ms locally | Runtime load test | Blocked |
| Contract correctness | 100% offline provider verification | `node scripts/verify-contract-providers.mjs` | Passed |
| Seed dry-run correctness | 0 validation failures | `node scripts/seed-local.mjs --dry-run ...` | Passed |
| Auth bypass safety | bypass denied outside local/test profile | Auth tests | Passed |
| Observability config | required local files and signals present | `node scripts/smoke-observability.mjs` | Passed |
| Outbox event freshness | under 5 minutes after runtime healthy | Runtime outbox metric | Blocked |

## Assessment

Performance validation cannot be completed until local runtime provisioning is complete. Configuration and non-runtime quality checks are sufficient to proceed with documented blockers, but not sufficient to claim performance readiness.
