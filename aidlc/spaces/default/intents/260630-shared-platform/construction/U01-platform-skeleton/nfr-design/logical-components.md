# Logical Components - U01 Platform Skeleton

## Source Trace

This component view derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

It bridges U01 NFR design to later infrastructure design by identifying logical components, failure domains, blast radius, shared resources, and isolation boundaries.

## Component Inventory

| Component | Type | Primary NFR role |
|---|---|---|
| Workspace root | Build/control plane | Stable scripts, package discovery, CI entry points. |
| `identity-service` skeleton | Backend deployable | Authorization boundary and future service health. |
| `reference-data-service` skeleton | Backend deployable | Canonical reference API boundary and future event handoff. |
| `apps/auth` | Frontend/BFF deployable | Auth/session UI and server-side auth route boundary. |
| `apps/reference-data` | Frontend/BFF deployable | Reference admin UI and BFF service-call boundary. |
| `@erp/*` packages | Shared package boundary | Shared UI/types/config/client conventions. |
| PostgreSQL services | Local data dependency | Service-owned persistence placeholders. |
| Keycloak | Identity dependency | OIDC provider for local/auth flows. |
| Kafka and Schema Registry | Event dependency | Reference-change event and schema runtime seam. |
| Nginx | Edge/router | Browser ingress and app/BFF routing. |
| Docker Compose profiles | Runtime orchestration | Local reproducibility and optional observability separation. |
| Contract folders | Integration artifact boundary | OpenAPI/Avro/Pact examples and compatibility gates. |

## Failure Domains

| Failure domain | Blast radius |
|---|---|
| Frontend app failure | Affects that app's UI/BFF only if routes stay separated. |
| Backend service failure | Affects capabilities owned by that service; other services remain independently diagnosable. |
| PostgreSQL failure | Affects service-owned persistence for dependent service. |
| Keycloak failure | Affects auth/session and protected route readiness. |
| Kafka/SR failure | Affects event path and event smoke, not basic reference read path unless configured as required. |
| Nginx failure | Affects browser ingress to frontend/BFF paths. |
| Optional observability failure | Degrades telemetry locally but must not block core local smoke. |

## Isolation Strategy

- Keep service-owned databases private to services.
- Keep browser traffic behind frontend/BFF routes.
- Keep domain modules independent from adapters and frameworks.
- Keep downstream module artifacts contract-only.
- Keep optional observability behind a Compose profile for local development.

## Shared Resources

Shared resources are explicit and governed: root scripts, shared `@erp/*` packages, Nginx routing, Docker Compose networks, contract artifact folders, and observability conventions. They must not become hidden coupling between service internals.

