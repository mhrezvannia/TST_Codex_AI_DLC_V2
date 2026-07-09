# Load Test Plan

## Inputs

This plan consumes `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and `dashboards`.

## Preconditions

Run load tests only after:

- `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` returns `passed`.
- Keycloak, Identity, Reference Data, nginx, Kafka, and Schema Registry are listening.
- Live contracts pass.
- Seed apply passes.

## Scenarios

| Scenario | Endpoint/flow | Target |
| --- | --- | --- |
| Reference set list | `GET /reference-data/api/reference-sets` through nginx | p95 under 500 ms |
| Currency records list | `GET /reference-data/api/reference-sets/CURRENCY/records` | p95 under 500 ms |
| Authorization check | `GET /reference-data/api/permissions/reference-data` | p95 under 500 ms |
| Create reference record | BFF create form/API | no 5xx; validation errors explicit |
| Seed apply | `node scripts/seed-local.mjs --seed-file ...` | 0 failed rows |
| Live contracts | `node scripts/verify-contract-providers.mjs --live ...` | 0 failures |

## Suggested Tool

Use k6, autocannon, or Artillery after runtime is healthy. Keep first pass small:

- 5 virtual users
- 3 minute steady state
- 30 second warmup
- no destructive repeated writes without unique test codes

## Metrics

Measure:

- p50/p95/p99 latency
- request rate
- HTTP 4xx/5xx rate
- upstream 503 count
- outbox event freshness
- CPU/memory saturation if Docker metrics are available
