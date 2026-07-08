# Component Dependency - Shared Platform MVP

## Source Trace

This dependency design traces to `requirements.md`, `stories.md`, `team-practices.md`, and `application-design-questions.md`. Brownfield `architecture.md` and `component-inventory.md` inputs are not applicable for this greenfield intent.

## Dependency Matrix

| Component | Depends on | Dependency type | Direction rule |
|---|---|---|---|
| `apps/auth` | Nginx, `@erp/*`, Keycloak via BFF, `identity-service` | HTTP/BFF/session | Browser never receives tokens. |
| `apps/reference-data` | Nginx, `@erp/*`, `reference-data-service`, `identity-service` | HTTP/BFF | Consumes APIs only. |
| `reference-data-service` | PostgreSQL, Kafka, Schema Registry, Vault, `identity-service`, observability | DB, async producer, authz, telemetry | Owns DB; publishes events. |
| `identity-service` | PostgreSQL, Keycloak, Vault, observability | DB, OIDC/JWKS, telemetry | Keycloak authn, identity-service authz. |
| Kafka/SR | Platform hosts/storage | Platform infrastructure | No domain dependency on consumers. |
| Future downstream consumers | `reference-data-service`, Kafka/SR, `identity-service` | Contract only | Not implemented in this workflow. |

## Backend Internal Dependency Rules

Mandated service module inclusion:

```text
service container
  includes application adapter
  includes dataaccess adapter
  includes messaging adapter
  includes application-service
  includes domain-core
  includes published-language
```

Binding compile-time dependency direction is:

```text
container -> application
container -> dataaccess
container -> messaging
application -> application-service
dataaccess -> application-service
messaging -> application-service
application-service -> domain-core
published-language -> no service internals
domain-core -> common-domain only
```

Rules:

- Domain core has no Spring, JPA, Kafka, Jackson, or Lombok.
- Application service defines input/output ports.
- Adapters implement output ports and translate infrastructure formats.
- Dependencies point inward.
- Inbound and outbound adapters do not depend on each other.
- No circular dependencies.

## Data Flow - Reference Admin Change

```text
apps/reference-data UI
  -> BFF route handler
  -> reference-data-service admin REST API
  -> authorization check with identity-service
  -> application service validates command
  -> domain aggregate enforces invariant
  -> PostgreSQL transaction persists record + audit + outbox
  -> response returns updated record/status
  -> outbox worker publishes Avro event to Kafka
  -> status projection updates pending/published/failed state
```

## Data Flow - Sign In and Authorization

```text
apps/auth
  -> Keycloak OIDC redirect/callback
  -> BFF establishes HttpOnly-cookie session
  -> identity-service evaluates roles/permissions
  -> apps/auth or apps/reference-data renders authorized/read-only/denied state
```

## Data Flow - Future Consumer Contract

```text
Future downstream module
  -> reference-data-service provider REST API
  -> receives canonical reference data

reference-data-service
  -> Kafka referencedata.<entity>.changed
  -> future downstream consumer local replica
```

No future downstream runtime component is built here.

## Shared Resources

| Resource | Shared by | Ownership/guardrail |
|---|---|---|
| Kafka broker | Producers/consumers | Platform-owned infrastructure; schemas govern payloads. |
| Schema Registry | Event producers/consumers | Platform-owned; compatibility enforced. |
| Keycloak | Apps/services | Authentication provider; identity-service owns authz domain. |
| Nginx | Frontend apps/API edge | Platform edge; backend services not exposed directly to browsers. |
| Vault | Services/apps | Platform secret store; least-privilege access. |
| Observability stack | All components | Platform-owned telemetry backplane. |
| PostgreSQL | Per service | No shared database; each service owns schema/database. |

## Coupling Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Reference data UI couples to backend DTO internals. | Use `@erp/transformers` and BFF models. |
| Consumers depend on database tables. | Contract-only integration and architecture review blocker. |
| Generic reference model hides aggregate-specific invariants. | Use aggregate modules with explicit invariant services. |
| Identity logic duplicates across apps/services. | Centralize decision API in `identity-service`. |
| Event publication silently fails. | Transactional outbox, status projection, retries, operator visibility. |
| Browser token exposure. | HttpOnly cookies, BFF route handlers, `proxy.ts`, no direct browser API calls. |
