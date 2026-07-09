# Load Test Results

## Inputs

These results consume `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and `dashboards`.

## Result

Status: BLOCKED

Live load tests were not executed because the deployment health report shows local runtime is blocked:

- Java unavailable
- Maven unavailable
- Docker daemon unavailable
- Keycloak not listening
- Identity service not listening
- Reference Data service not listening
- nginx not listening
- Kafka and Schema Registry not listening

## Executed Validation

Available performance-adjacent checks:

- `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json`: blocked, 7 passed / 3 blocked / 0 failed.
- `node scripts/smoke-observability.mjs`: passed.
- Frontend TypeScript and tests passed in Build and Test.

## Next Execution

After runtime is healthy, run the plan in `load-test-plan.md` and update this file with actual latency, throughput, error rate, and saturation results.
