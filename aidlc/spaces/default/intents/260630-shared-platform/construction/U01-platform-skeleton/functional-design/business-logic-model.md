# Business Logic Model - U01 Platform Skeleton

## Source Trace

This U01 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Unit Purpose

U01 establishes the buildable Shared Platform skeleton that later units attach to. It does not implement business-domain behavior for Charge, Booking, or Container Movement. Its logic is setup, convention enforcement, local runtime orchestration, and walking-skeleton enablement for `reference-data-service`, `identity-service`, `apps/auth`, `apps/reference-data`, shared packages, contracts, and infrastructure folders.

## Workspace Initialization Workflow

```text
Create workspace structure
  -> create backend service module folders
  -> create frontend app folders
  -> create shared packages folders
  -> create contracts and infrastructure folders
  -> add root build scripts and CI script aliases
  -> add Docker Compose baseline
  -> verify compile/type-check placeholders
```

Decision points:

| Decision | Rule |
|---|---|
| Backend service folder exists? | Create mandated hexagonal skeleton if missing. |
| Frontend app folder exists? | Create App Router starter layout if missing. |
| Shared package exists? | Create package placeholder with build/type config if missing. |
| Runtime service is optional observability? | Place behind Compose profile placeholder. |
| Contract artifact path missing? | Create contracts directory with OpenAPI/Avro layout. |

## Backend Skeleton Workflow

For each backend service, U01 defines the module shape only:

```text
service-root
  -> domain-core
  -> application-service
  -> application
  -> dataaccess
  -> messaging
  -> published-language
  -> container
```

Processing sequence:

1. Root Maven build declares modules and shared Java version.
2. `domain-core` depends only on `common-domain`.
3. `application-service` depends on `domain-core`.
4. Inbound/outbound adapters depend on `application-service`.
5. `container` wires adapters and application service.
6. Published-language contains outward DTO/client/schema placeholders and no service internals.

## Frontend Skeleton Workflow

U01 defines both frontend apps:

```text
apps/auth
  app/
  app/api/
  components/
  providers/
  services/
  hooks/
  lib/
  schemas/
  transformers/
  constants/
  proxy.ts

apps/reference-data
  same App Router/BFF structure
```

Shared package placeholders:

- `packages/ui`
- `packages/api-core`
- `packages/auth`
- `packages/transformers`
- `packages/shared-types`
- `packages/config`
- `packages/utils`

## Local Runtime Composition Workflow

```text
docker compose up
  -> PostgreSQL containers become healthy
  -> Keycloak container becomes healthy
  -> Kafka and Schema Registry become healthy
  -> backend service containers start
  -> frontend app containers start
  -> Nginx routes frontend/BFF traffic
  -> optional observability profile starts ELK/Prometheus/Grafana/Jaeger placeholders
```

Failure handling:

- If a required runtime service is unhealthy, dependent containers wait or fail fast.
- Optional observability services must not block local functional smoke tests.
- Secrets use local development values only; production/staging point to Vault paths later.

## Shared Convention Workflow

The skeleton defines conventions used by later units:

| Convention | Functional behavior |
|---|---|
| Correlation id | Generate if missing, propagate through REST headers, logs, audit/outbox placeholders, and events. |
| Error envelope | Standard API error shape with code, message, correlation id, details, timestamp. |
| Health endpoint | Common liveness/readiness path and response fields. |
| Logging fields | JSON fields include timestamp, level, service, correlationId, message. |
| Config naming | Environment-specific config keys use consistent service/app prefixes. |
| Contract layout | OpenAPI and Avro artifacts have predictable paths for CI gates. |
| CI scripts | Root scripts call backend and frontend compile/type/test tasks consistently. |

## Walking Skeleton Support

U01 enables Bolt 1 by making the minimal end-to-end slice attachable:

- `identity-service` can add one authorization decision.
- `reference-data-service` can add one reference create/read path.
- Kafka/SR can accept one reference event schema.
- `apps/auth` and `apps/reference-data` can render thin routes.
- CI can run one smoke path.
- Observability can verify one correlation id path.

## Non-Goals

- No full reference aggregate implementation.
- No full role/permission matrix.
- No production-grade deployment automation.
- No downstream Charge, Booking, or Container Movement runtime code.
