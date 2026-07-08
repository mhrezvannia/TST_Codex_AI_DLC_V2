# Observability Profile

U10 provides local/on-prem observability descriptors for Shared Platform operations.

## Local Profile

Run optional observability services with Docker Compose:

```bash
docker compose --profile observability up prometheus grafana jaeger otel-collector elasticsearch kibana
```

The profile includes:

- Prometheus scrape configuration for apps and backend services.
- Grafana datasource/dashboard provisioning.
- Jaeger and OpenTelemetry collector wiring.
- ELK-compatible local services for log search experiments.
- A readiness profile describing required operational signals.

## Safe Telemetry Rules

- Use `X-Correlation-Id` at trusted boundaries.
- Logs must include timestamp, level, service/app, environment, operation, correlation id, result, and safe error code where applicable.
- Mask tokens, passwords, credentials, cookies, secret claims, restricted payloads, and production identifiers.
- Correlation ids and event ids are valid in logs/traces/status views, but not as high-cardinality metric labels.
- Non-local secrets must be Vault references, never literal values.

## Validation

```bash
node scripts/smoke-observability.mjs
docker compose config --quiet
```

Live dashboard, trace, and log ingestion checks require running the Compose profile on a host with Docker resources available.
