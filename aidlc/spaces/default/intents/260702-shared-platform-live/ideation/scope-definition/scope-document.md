# Scope Document - Shared Platform Local Functionality

## Purpose

This scope document consumes `intent-statement`, `feasibility-assessment`, and `constraint-register`. It defines the boundary for making the existing Shared Platform scaffold locally functional and integration-ready before moving to Charge & Customer Agreement, Customer Booking, and Container Movement Management.

The goal is not another scaffold. The goal is a locally runnable platform slice where authenticated or explicitly bypassed local users can operate reference data through the UI/BFF/backend path, apply seeds to live services, verify authorization and event publication behavior, and provide stable contracts for downstream modules.

## Minimum Viable Scope

The minimum viable scope is complete when the Shared Platform can prove these outcomes on a local workstation or approved self-hosted runner:

| Outcome | Evidence |
| --- | --- |
| Local runtime baseline | Java 21, Maven 3.9+, Node/Yarn, and Docker runtime checks are documented and executable. |
| Compose stack | Docker Compose can build or run backing services and app/service processes with documented ports and health checks. |
| Backend services | `identity-service` and `reference-data-service` compile, test, and run locally. |
| Authentication and authorization | Local Keycloak bootstrap works; `identity-service` authorization is exercised; `AUTH_BYPASS=true` remains opt-in and local-only. |
| Reference-data operations | UI users can list, create, update, deactivate, inspect history, and view publication status for MVP reference sets. |
| BFF integration | `apps/auth` and `apps/reference-data` route handlers call real backend APIs for core flows instead of static placeholder data. |
| Seed apply mode | Seed loader applies data through service/admin APIs idempotently, with validation and failure reporting. |
| Events and contracts | Outbox, Kafka, Schema Registry, OpenAPI, Avro, Pact/provider or message tests align with running behavior. |
| Quality gates | Frontend checks and backend Maven tests pass locally or on the documented self-hosted runner. |

## In Scope

1. Local prerequisite checks and developer runbook updates for Java 21, Maven, Docker runtime, Node, Yarn, and environment variables.
2. Dockerfiles, Compose build contexts, or equivalent local dev profiles for backend services and Next.js apps where current Compose references unresolved images.
3. Backend compile/test/run baseline for `identity-service` and `reference-data-service`.
4. PostgreSQL persistence, migrations, repositories, and admin/API behavior needed for Shared Platform reference data and identity authorization.
5. Deterministic local Keycloak realm/client/user/role bootstrap.
6. Real auth flow through `apps/auth`, Keycloak, and `identity-service`, while keeping `AUTH_BYPASS=true` as a local-only fallback.
7. BFF clients and route handlers that connect `apps/reference-data` to `reference-data-service`.
8. Authorized UI mutation flows for reference data: create, update, deactivate, history, and publication status.
9. Service-backed seed apply mode with idempotency and clear dry-run/apply separation.
10. Transactional outbox, Kafka, Schema Registry, and event publication verification for reference-data changes.
11. OpenAPI, Avro, Pact/provider, and message contract checks aligned with live service behavior.
12. Shared Platform security evidence required by the constraint register, including OWASP/API/CIS coverage relevant to the local functional slice.
13. Health, logs, correlation id propagation, smoke scripts, and a local/on-prem operations runbook.

## Out of Scope

1. Charge & Customer Agreement runtime implementation.
2. Customer Booking runtime implementation.
3. Container Movement Management runtime implementation.
4. External finance integration beyond preserving downstream integration contracts.
5. Production deployment to a real on-prem environment beyond local/staging-ready descriptors and runbooks.
6. Public customer-facing identity, DCSA public track-and-trace, EDI intake, multi-entity, and multi-currency behavior.
7. Public cloud services, managed cloud databases, managed Kafka, AWS IAM, CDK, or CloudFormation.
8. Replacing the mandated Spring Boot, Next.js BFF, Keycloak, PostgreSQL, Kafka, Schema Registry, Docker Compose, and self-hosted runner stack.

## Capability Boundaries

| Capability | Must Have | Deferred |
| --- | --- | --- |
| Local platform runtime | Compose config/build/run, service health, documented startup | Production HA/DR topology |
| Identity | Local Keycloak bootstrap, auth callback, identity authorization checks | Enterprise SSO federation |
| Reference data | CRUD-like admin operations, status/history, PII-safe handling | Non-MVP reference sets beyond documented platform needs |
| Events | Outbox publication, Kafka topic/schema registration, message verification | Cross-module event choreography beyond stubs/contracts |
| Contracts | OpenAPI/Avro/Pact evidence usable by downstream modules | Full downstream consumer implementations |
| Quality | Frontend/backend tests and gate runner evidence | Performance certification beyond local smoke/load sanity |

## Value Stream Map

The functional value stream for this intent is:

```text
Developer starts local stack
  -> Keycloak and backing services become healthy
  -> Backend services compile, migrate, and run
  -> Auth BFF signs in or uses explicit local bypass
  -> Reference-data UI calls BFF routes
  -> BFF calls reference-data-service and identity-service
  -> Service persists validated changes
  -> Outbox publishes event through Kafka and Schema Registry
  -> UI/API exposes status/history
  -> Contract and quality gates verify the behavior
  -> Downstream module teams consume stable contracts and seeds
```

## Acceptance Criteria

1. A documented local command sequence starts or verifies all required Shared Platform processes and backing services.
2. The user can authenticate locally through Keycloak, or intentionally enable `AUTH_BYPASS=true` for development.
3. The reference-data UI is no longer view-only for authorized local users.
4. Create, update, deactivate, list, history, and publication-status flows call backend services and persist state.
5. Seed apply mode can load documented MVP reference data into live services and can be safely re-run.
6. Reference-data changes produce verifiable outbox/Kafka/Schema Registry behavior.
7. OpenAPI, Avro, Pact/provider, and message checks match the running services.
8. Frontend lint/type/test gates and backend Maven tests pass in the documented local or CI environment.
9. The final operation runbook explains startup, shutdown, health checks, smoke tests, logs, and known local-only switches.

## Dependencies and Constraints

The `constraint-register` is binding:

- Java 21 and Maven must be installed or provided by the runner before backend verification is complete.
- Docker Desktop or an approved Docker-compatible runtime must be running before Compose runtime evidence is possible.
- No public cloud services may be introduced.
- Browser traffic must go through the Next.js BFF.
- Keycloak handles authentication and `identity-service` handles authorization.
- Reference-data PII must remain owned by `reference-data-service`.
- Kafka, Avro, Schema Registry, and transactional outbox are the event transport baseline.
- The follow-on module order is fixed in project memory and should not be re-asked.

## Exit Decision

This intent is ready to exit only when Shared Platform is locally functional and integration-ready. If any local prerequisite is unavailable on the current machine, the implementation must still provide deterministic checks, scripts, configs, and CI/self-hosted runner evidence so the missing machine dependency is visible rather than hidden.
