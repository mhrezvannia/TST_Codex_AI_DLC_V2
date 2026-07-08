# Scalability Design - U01 Platform Skeleton

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`scalability-requirements.md` requires separable backend services, frontend apps, shared packages, contract folders, Docker Compose services, and capacity-planning hooks. `business-logic-model.md` establishes workspace, backend, frontend, local runtime, and convention workflows.

## Scaling Architecture

U01 supports future scaling through isolation, not autoscaling. Each deployable or package boundary can be built, tested, observed, and scaled independently later.

## Boundary Design

| Boundary | Scaling purpose |
|---|---|
| `identity-service` | Central authorization service; can scale independently from reference APIs. |
| `reference-data-service` | Canonical reference domain/API service; can scale around provider/admin workload. |
| `apps/auth` | Separate auth/session frontend and BFF. |
| `apps/reference-data` | Separate reference administration frontend and BFF. |
| `@erp/*` packages | Shared UI/types/client helpers without app-to-app coupling. |
| Contract folders | API/event artifacts evolve independently from runtime services. |
| Compose profiles | Core services separate from optional observability. |

## Load Distribution Pattern

Nginx is the local/on-prem routing boundary. Backend services and frontend apps remain separate containers in Docker Compose so later infrastructure design can map them to deployment units without changing logical ownership.

## Capacity Hooks

- Stable scripts support affected-path CI and service-specific test expansion.
- Health endpoints distinguish process and dependency readiness.
- Seed/smoke hooks target service/API/BFF paths, keeping future load tests aligned with real boundaries.

## Non-Goals

No Kubernetes, Helm, public-cloud autoscaling, final partitioning, or final throughput target is designed in U01.

