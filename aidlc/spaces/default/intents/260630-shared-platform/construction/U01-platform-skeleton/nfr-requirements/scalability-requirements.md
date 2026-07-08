# Scalability Requirements - U01 Platform Skeleton

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` establishes separately buildable backend services, frontend apps, shared packages, contracts, infrastructure folders, and Docker Compose runtime definitions. `business-rules.md` fixes module boundaries, app separation, BFF-only access, and local/on-prem service definitions. `requirements.md` fixes the on-prem Docker Compose target, maintainability NFRs, local reproducibility, and the first gated walking skeleton.

## Scaling Posture

U01 must create separable boundaries, not final autoscaling. Later units can scale and test capacity independently only if the skeleton avoids hidden coupling at the workspace, service, app, package, and runtime layers.

## Structural Scalability Requirements

| Area | Requirement |
|---|---|
| Backend services | `identity-service` and `reference-data-service` must be separate service roots with independent hexagonal modules. |
| Domain isolation | `domain-core` modules must remain framework-free and adapter-free. |
| Frontend apps | `apps/auth` and `apps/reference-data` must be separate App Router apps with their own BFF routes. |
| Shared packages | `@erp/*` packages must expose stable public placeholders without creating bidirectional app dependencies. |
| Contracts | OpenAPI, Avro, Pact/message-pact, and examples must have predictable paths for later parallel contract evolution. |
| Runtime | Docker Compose service definitions must isolate PostgreSQL, Keycloak, Kafka, Schema Registry, service containers, frontend apps, Nginx, and observability components. |

## Capacity Planning Hooks

- Compose profiles must support core services separately from optional observability components.
- Service health checks must distinguish unavailable dependencies from application process failures.
- Root build scripts must allow changed-area or service/app-specific CI expansion later.
- Contract artifact paths must allow downstream review without introducing runtime stubs.
- Seed and smoke hooks from later units must be able to run against deterministic local service boundaries.

## Growth Assumptions

- MVP starts with two backend services and two frontend apps.
- Future downstream modules consume APIs/events but do not share databases.
- Reference sets and events grow over time, but U01 only reserves contract and runtime seams for later scaling.
- Final production load profile remains open and must be validated in later performance planning.

## Scaling Triggers for Later Units

| Trigger | Later action enabled by U01 |
|---|---|
| Reference read latency approaches p95 target | U03/U06 can profile provider/admin APIs through stable service/BFF boundaries. |
| Event freshness exceeds 60 seconds | U04/U10 can tune outbox publisher and broker behavior through isolated messaging adapter/runtime services. |
| CI time becomes excessive | U08 can split backend/frontend/contract jobs using stable root scripts and package boundaries. |
| Local environment becomes heavy | Compose profiles can separate core and optional observability services. |

## Non-Goals

- No Kubernetes, Helm, public-cloud autoscaling, or AWS managed scaling.
- No final throughput or concurrency target beyond preserving measurement and scaling seams.
- No shared database scaling strategy for downstream modules, because consumers must use APIs and events.

