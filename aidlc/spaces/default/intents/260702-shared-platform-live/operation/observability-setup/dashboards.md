# Dashboards

## Inputs

This dashboard plan consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Existing Assets

- `infrastructure/observability/grafana/dashboards/shared-platform-overview.json`
- `infrastructure/observability/grafana/provisioning/dashboards/dashboards.yml`
- `infrastructure/observability/grafana/provisioning/datasources/datasources.yml`

## Dashboard Layout

Shared Platform Overview:

- Runtime readiness: prerequisites, blocked services, Compose profile status.
- Auth: session checks, bypass state, authorization denials.
- Reference Data BFF: request count, error count, latency, upstream service unavailable responses.
- Reference Data service: list/detail/mutation rates, validation failures, history reads.
- Outbox: pending events, publish retries, failed events, `reference_event_freshness_seconds`.
- Contracts and seed: last live contract status, last seed apply result.

## Validation

`node scripts/smoke-observability.mjs` passed and verified six required observability files.
