# Shared Infrastructure - U10 Observability Deployment

## Shared Dependencies

U10 coordinates Nginx, Vault references, image registry conventions, Docker Compose profiles, ELK-compatible logs, Prometheus/Grafana metrics, Jaeger/OpenTelemetry tracing, health endpoints, smoke runner, and deployment records.

## Access Boundaries

Dashboard links are internal/operator-authorized. Browser code receives no observability credentials, broker credentials, Vault values, raw tokens, or secret claims. Public-cloud managed observability and Kubernetes-only descriptors are out of MVP scope.

## Cross-Unit Contracts

U02/U03/U04/U05/U06 emit health/log/metric/trace signals. U08 supplies gate/smoke evidence. U09 supplies local Compose/seed smoke substrate. U10 standardizes deployment readiness and operational visibility.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
