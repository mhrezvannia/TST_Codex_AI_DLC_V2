# Tech Stack Decisions - U01 Platform Skeleton

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines the backend module skeleton, frontend App Router/BFF skeleton, local Docker Compose runtime, shared package placeholders, and convention workflow. `business-rules.md` fixes prohibited dependency choices and validation rules. `requirements.md` makes Enterprise Technical Environment v1.1 binding through C-001 through C-006 and rejects public-cloud runtime services for this MVP.

## Decision Summary

U01 uses the mandated Enterprise Technical Environment stack without waiver. The skeleton must encode these decisions as workspace layout, dependency placeholders, scripts, and runtime descriptors so later units do not re-litigate the stack.

## Backend Stack

| Decision | Selection | Rationale |
|---|---|---|
| Language/runtime | Java 21 | Mandated by `requirements.md` C-003 and compatible with service skeleton. |
| Framework | Spring Boot 3.3 | Mandated backend framework for service containers and adapters. |
| Architecture | Hexagonal Maven modules | Required by U01 `business-rules.md` and NFR-014 for maintainability. |
| Database | PostgreSQL 15+ | Mandated service-owned datastore baseline. |
| Messaging | Kafka | Mandated event infrastructure for reference-change publication. |
| Schema registry | Confluent Schema Registry | Required for Avro schema registration and compatibility. |
| Event schema | Avro 1.11 | Mandated for typed reference-change events. |
| API contracts | OpenAPI | Required for provider/admin and identity contracts. |
| Contract testing | Pact/message-pact | Required by CI and contract quality gates. |

## Frontend Stack

| Decision | Selection | Rationale |
|---|---|---|
| Framework | Next.js App Router with React | Mandated for `apps/auth` and `apps/reference-data`. |
| Language mode | TypeScript strict mode | Required by NFR-015 and frontend quality gates. |
| Workspace/build | Turborepo with Yarn | Mandated monorepo/frontend package workflow; non-Yarn lockfiles are prohibited. |
| Styling | Tailwind | Approved frontend styling system. |
| Forms/validation | React Hook Form and Zod | Approved form and schema validation stack. |
| Client state | Zustand | Approved local state option. |
| Server data | TanStack Query | Approved async data/query package. |
| HTTP client | Axios through `@erp/api-core` | Centralizes BFF/API conventions and error envelope handling. |
| Shared UI/types | `@erp/ui`, `@erp/auth`, `@erp/shared-types`, `@erp/config`, `@erp/utils`, `@erp/transformers` | Stable package placeholders for later app work. |

## Runtime and Platform Stack

| Decision | Selection | Rationale |
|---|---|---|
| Local/runtime target | On-prem Docker Compose | Binding MVP runtime profile; supports local reproducibility. |
| Edge routing | Nginx | Expected platform integration. |
| Secrets | Vault references for non-local stages | Avoids committing staging/production secrets. |
| Identity provider | Keycloak 24 | Mandated authentication provider. |
| CI | GitHub Actions self-hosted runners | Expected integration for U08 quality gates. |
| Logs | ELK-compatible JSON logs | Required by NFR-012 and U10 observability. |
| Metrics/dashboards | Prometheus/Grafana | Required by NFR-012. |
| Traces | Jaeger through OpenTelemetry | Required by NFR-012 and U10 observability. |

## Prohibited Decisions

- No AWS/public-cloud runtime services in this MVP.
- No Kubernetes or Helm assumptions in U01.
- No custom authentication store.
- No direct browser-to-service calls.
- No shared database integration for consumers.
- No npm or pnpm lockfiles.
- No Redux Toolkit, SWR, CSS Modules, Styled Components, Emotion, jQuery, or Moment.js.
- No Charge, Booking, or Container Movement runtime services, UIs, or implementation stubs.

## Implementation Guidance for Later Units

- U02 and U03 must fill in service-specific domain/application behavior without breaking U01 module boundaries.
- U04 must attach messaging/outbox behavior to the Kafka/SR seam rather than bypassing service boundaries.
- U05 and U06 must implement app flows through BFF routes, not direct service calls.
- U07 and U08 must use the stable contract and CI script paths created by U01.
- U09 and U10 must extend Compose, seed, smoke, observability, and deployment readiness descriptors without changing the stack baseline.

