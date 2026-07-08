# Infrastructure Design Memory

## Interpretations
- 2026-07-01T11:45:00Z - U01 infrastructure design is a workspace/runtime scaffold, not a production platform buildout: define local/on-prem Compose, Nginx, registry/tag, health, telemetry, CI alias, and shared resource conventions that later units specialize without introducing AWS, Kubernetes-only descriptors, or business-domain behavior.
- 2026-07-01T11:55:00Z - U02 infrastructure design deploys identity-service as a stateless Spring Boot authorization service backed by owned PostgreSQL and Keycloak metadata/token validation dependencies; infrastructure must support fail-closed readiness, audit durability, Vault-referenced secrets, and low-latency decision telemetry without exposing token material.
- 2026-07-01T12:05:00Z - U03 infrastructure design deploys reference-data-service as one stateless Spring Boot bounded context over owned PostgreSQL: API scale is horizontal, canonical writes remain transactional, U02 authorization is a protected dependency, U04 owns publisher workers, and database/query infrastructure must support bounded indexed list/detail/history paths.
- 2026-07-01T12:15:00Z - U05 infrastructure design deploys apps/auth as a separate Next.js App Router/BFF behind Nginx: OIDC and token exchange stay server-side, sessions use secure HttpOnly cookies, Keycloak and identity-service are server-only dependencies, and route protection is lightweight while backend authorization remains authoritative.
- 2026-07-01T12:25:00Z - U04 infrastructure design separates reference API serving from outbox publisher work while preserving the reference-data-service boundary: PostgreSQL outbox rows are the durable queue, Kafka/SR are shared integration infrastructure, SKIP LOCKED-style claiming enables worker scale, and status telemetry exposes at-least-once publication health.
- 2026-07-01T12:35:00Z - U09 infrastructure design treats Docker Compose as the deterministic local/CI substrate: core services and optional observability are profile-separated, seed loader writes through approved paths after bounded health gates, seed packs are versioned/idempotent/local-only, and smoke checks prove API/BFF/event paths without database shortcuts.
- 2026-07-01T12:45:00Z - U06 infrastructure design deploys apps/reference-data as a separate Next.js App Router/BFF behind Nginx: all reference/admin/status/identity calls are server-side BFF calls, the app owns no canonical data, list/detail/status paths remain bounded, and event/history status failures stay non-blocking.
- 2026-07-01T12:55:00Z - U07 infrastructure design keeps contracts as repository/artifact evidence and optional read-only catalog views, not a deployed downstream platform: OpenAPI, Avro, examples, fixtures, compatibility status, findings, and freeze records are version-controlled and validated by runners that U08 later gates.
- 2026-07-01T13:05:00Z - U08 infrastructure design treats self-hosted GitHub Actions as the merge-control plane: changed-path classification selects scoped gate runners, all required gates emit redacted evidence, missing/unknown/improperly skipped gates fail aggregation, and public-cloud runners remain out of scope.
- 2026-07-01T13:15:00Z - U10 infrastructure design defines the on-prem readiness substrate: Compose profiles, Nginx routing, Vault references, deterministic image tags, health/readiness endpoints, smoke runner, JSON logs, Prometheus/Grafana metrics, ELK search, OpenTelemetry/Jaeger traces, and deployment evidence.

## Deviations

## Tradeoffs

## Open questions
