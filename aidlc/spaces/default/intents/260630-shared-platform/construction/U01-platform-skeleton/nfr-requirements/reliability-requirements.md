# Reliability Requirements - U01 Platform Skeleton

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines local runtime composition, failure handling, health endpoint conventions, CI scripts, and walking-skeleton support. `business-rules.md` fixes runtime services, optional observability profile behavior, health responses, validation rules, and scope constraints. `requirements.md` fixes NFR-005, NFR-011, NFR-016, NFR-017, C-002, C-006, and C-009.

## Availability and Readiness Baseline

U01 must make service/app readiness observable and testable. It does not define final SLA/SLO or HA/DR because production load profile, data residency, and disaster recovery remain open questions in `requirements.md`.

## Health Requirements

| Component | Health behavior required by U01 |
|---|---|
| Backend service skeletons | Reserve common liveness/readiness endpoint shape. |
| Frontend BFF apps | Reserve app/BFF health route shape. |
| PostgreSQL | Compose health checks must support service startup ordering. |
| Keycloak | Compose health checks must support auth-dependent smoke paths. |
| Kafka and Schema Registry | Compose health checks must support event path readiness. |
| Nginx | Routing must be compatible with app/BFF readiness. |
| Observability profile | May be optional locally and must not block core smoke checks. |

## Fault Tolerance Requirements

- Required runtime dependencies must wait or fail fast with clear diagnostics.
- Optional observability services must be profile-gated in local development.
- Health checks must avoid expensive business queries.
- Standard error envelopes must include correlation id so failures can be traced.
- CI scripts must expose deterministic compile/type/test entry points so failures are reproducible.

## Data Durability and Consistency Hooks

- U01 must create PostgreSQL and Kafka/Schema Registry runtime placeholders compatible with later durability requirements.
- U01 must reserve contract and event folders so U04/U07/U08 can add schema compatibility and publication reliability checks.
- U01 must not bypass service-owned datastores or encourage shared database coupling.
- Later U04 must implement at-least-once publication, retries, dead-letter or failure handling, and operator visibility; U01 only prepares the messaging runtime seam.

## Smoke and Promotion Requirements

- Local smoke hooks must be able to run against the Docker Compose core profile.
- Staging promotion must require successful E2E, contract, smoke, and health checks once later units implement them.
- The first Construction Bolt must remain gated and must prove auth, reference read/write, persistence, event publication, frontend access, CI, and observability basics.
- Smoke failures must be diagnosable through correlation id and consistent error envelope conventions.

## Recovery and Degradation

| Scenario | U01 reliability behavior |
|---|---|
| Required container unhealthy | Dependent services wait or fail fast. |
| Optional observability profile disabled | Core functional smoke path can still run locally. |
| Backend service missing dependency | Readiness fails; liveness may still indicate process is up. |
| Frontend BFF cannot reach backend | Health/readiness and UI error envelopes can surface dependency unavailable with correlation id. |
| Kafka/SR unavailable | Event-path smoke checks fail once implemented; reference-only local startup remains clear about missing event dependency. |

## Non-Goals

- No final production SLA/SLO.
- No full HA/DR or backup/restore implementation.
- No publisher retry/dead-letter implementation; U04 owns that behavior.
- No production-grade deployment automation; U10 owns deployment readiness descriptors.

