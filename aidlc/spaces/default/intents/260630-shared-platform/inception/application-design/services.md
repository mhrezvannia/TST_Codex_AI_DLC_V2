# Services - Shared Platform MVP

## Source Trace

This service design follows `requirements.md`, `stories.md`, `team-practices.md`, and `application-design-questions.md`. Brownfield-only `architecture.md` and `component-inventory.md` inputs are not applicable. Enterprise Technical Environment v1.1 mandates on-premises Docker Compose, Java/Spring microservices, PostgreSQL, Kafka/Confluent Schema Registry, Keycloak 24, Nginx, and Next.js App Router/BFF.

## Service Topology

```text
Browser
  |
  v
Nginx edge
  |
  +--> apps/auth BFF -----> identity-service -----> Keycloak 24
  |
  +--> apps/reference-data BFF -----> reference-data-service
                                  \-> identity-service

reference-data-service ---> PostgreSQL owned datastore
reference-data-service ---> transactional outbox ---> Kafka + Schema Registry
identity-service -------> PostgreSQL owned datastore

Future downstream modules consume REST/OpenAPI and Kafka/Avro contracts only.
```

## Backend Services

### `reference-data-service`

Responsibilities:

- Canonical owner of nine MVP reference sets.
- REST/OpenAPI admin and provider APIs.
- Transactional outbox and Kafka/Avro producer.
- Event publication status and freshness visibility.
- Audit and classification for sensitive reference data.

Lifecycle:

- Runs as a Spring Boot 3.3 Java 21 container.
- Built with mandated hexagonal multi-module Maven skeleton.
- Deployed through Docker Compose on on-prem hosts.
- Emits structured JSON logs, metrics, and traces.

Scaling:

- Stateless HTTP container instances can scale horizontally.
- Outbox publisher must coordinate claims to avoid duplicate concurrent publishing.
- PostgreSQL and Kafka capacity remain platform-managed on-prem resources.

### `identity-service`

Responsibilities:

- Carrier authorization model and authorization decision API.
- Role/permission catalog and assignments.
- Authorization and role-change audit.
- Keycloak token/claims integration adapters.

Lifecycle:

- Runs as a Spring Boot 3.3 Java 21 container.
- Built with mandated hexagonal multi-module Maven skeleton.
- Deployed through Docker Compose on on-prem hosts.

Scaling:

- Stateless decision API can scale horizontally.
- Role assignment writes rely on owned PostgreSQL persistence.
- Keycloak availability is an external dependency to monitor.

## Frontend Apps

### `apps/auth`

Responsibilities:

- Sign-in, callback, sign-out, access-denied, session display, request-access path.
- BFF route handlers for OIDC/session operations.
- Use HttpOnly cookies, CSRF protection, strict CSP, `proxy.ts` route protection.

Lifecycle:

- Runs as a Next.js App Router app behind Nginx.
- Uses `@erp/auth`, `@erp/api-core`, `@erp/ui`, `@erp/shared-types`.

### `apps/reference-data`

Responsibilities:

- Reference admin and lookup workspace.
- BFF calls to `reference-data-service` and `identity-service`.
- Contract/developer views for OpenAPI, authorization API, Avro events, examples, compatibility.
- Mobile read-only lookup by default.

Lifecycle:

- Runs as a Next.js App Router app behind Nginx.
- Uses TanStack Query for server state, Zustand for bounded UI state, RHF/Zod for forms.

## Platform Services

| Platform service | Role in application design |
|---|---|
| Nginx | Edge routing, TLS termination, WAF/rate limiting baseline. |
| Keycloak 24 | Authentication provider and token issuer. |
| Kafka | Shared event bus for reference-change events. |
| Confluent Schema Registry | Avro schema registry and compatibility enforcement. |
| PostgreSQL 15+ | Per-service owned relational datastore. |
| Vault | Secret storage for service credentials and OIDC/Kafka/DB secrets. |
| ELK | Central structured log aggregation. |
| Prometheus/Grafana | Metrics and dashboards. |
| Jaeger/OpenTelemetry Collector | Distributed tracing. |

## Orchestration Patterns

- Synchronous interactions use REST/OpenAPI.
- Asynchronous reference notifications use event choreography through Kafka.
- `reference-data-service` is the sole producer of reference-change events.
- The transactional outbox coordinates persistence-to-event publication.
- No cross-service distributed transaction is introduced in this workflow.
- No Saga is needed inside Shared Platform MVP because no multi-service business transaction is implemented.

## Service Communication Contracts

| Interaction | Pattern | Contract | Consistency |
|---|---|---|---|
| `apps/auth` to `identity-service` | REST via BFF | OpenAPI | Strong request/response. |
| `apps/reference-data` to `reference-data-service` | REST via BFF | OpenAPI | Strong request/response for admin/read APIs. |
| `apps/reference-data` to `identity-service` | REST via BFF | OpenAPI | Strong request/response for permission/session needs. |
| `reference-data-service` to Kafka | Async producer | Avro + Schema Registry | Eventual, at-least-once. |
| Future modules to `reference-data-service` | REST | OpenAPI | Strong reads. |
| Future modules from Kafka | Async consumer | Avro/message-pact | Eventual, idempotent. |

## Service Guardrails

- Services do not read each other's databases.
- Browser clients do not call backend APIs directly.
- Events include common Avro envelope and correlation id.
- Every exposed API has contract tests.
- Charge, Booking, and Container Movement runtime services are not part of this workflow.
