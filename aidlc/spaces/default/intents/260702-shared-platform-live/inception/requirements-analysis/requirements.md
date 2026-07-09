# Requirements - Shared Platform Local Functionality

## Intent Analysis

This requirements specification consumes `intent-statement`, `scope-document`, `business-overview`, `architecture`, `code-structure`, and `team-practices`.

The user is trying to move the existing Shared Platform from scaffold/read-only/demo state to a locally functional and integration-ready platform foundation. The target outcome is not a broader LinerCore MVP yet; it is the foundation required before building Charge & Customer Agreement, Customer Booking, and Container Movement Management.

The current codebase already contains Next.js BFF apps, Java service skeletons, OpenAPI/Avro contracts, Compose descriptors, seed validation, and quality scripts. Requirements therefore focus on completing real runtime behavior, wiring, persistence, authorization, event publication, and quality evidence.

## Requirement Summary

| Area | Requirement count | Backlog trace |
| --- | --- | --- |
| Local runtime and packaging | 4 | U01, U02 |
| Backend services | 5 | U03, U05, U08 |
| Authentication and authorization | 5 | U04, U12 |
| Reference-data UI and BFF | 7 | U05, U06 |
| Seed data | 3 | U07 |
| Events and contracts | 5 | U08, U09 |
| Quality, security, operations | 7 | U10, U11, U12 |

## Functional Requirements

### Local Runtime and Packaging

| ID | Requirement | Acceptance criteria | Trace |
| --- | --- | --- | --- |
| FR-001 | The repository shall provide a deterministic prerequisite check for Node, Yarn, Java 21, Maven 3.9+, Docker runtime, required ports, and required env vars. | Given a local developer machine, when the check runs, then it reports pass/fail per prerequisite and distinguishes missing tools from code failures. | `scope-document`, `team-practices`, U01 |
| FR-002 | Docker Compose shall be able to start backing services needed by Shared Platform: PostgreSQL, Keycloak, Kafka, Schema Registry, and Nginx. | Given Docker is running, when the documented Compose command runs, then backing services become healthy or report actionable failures. | `architecture`, `code-structure`, U01 |
| FR-003 | App and service images referenced by Compose shall be buildable from this repository or replaced by documented local dev profiles. | Given no prebuilt local images exist, when the developer follows the local runtime path, then `identity-service`, `reference-data-service`, `apps-auth`, and `apps-reference-data` can run. | `business-overview`, `architecture`, U02 |
| FR-004 | The local runbook shall document startup, shutdown, health checks, smoke checks, ports, and known local-only switches. | Given a new contributor, when they follow the runbook, then they can reproduce the local readiness state without reading source code. | `team-practices`, U11 |

### Backend Services

| ID | Requirement | Acceptance criteria | Trace |
| --- | --- | --- | --- |
| FR-005 | `identity-service` shall compile and pass Maven tests under Java 21. | Given Java 21 and Maven are available, when `mvn -f services/pom.xml test` runs, then identity modules pass their tests. | `code-structure`, U03 |
| FR-006 | `reference-data-service` shall compile and pass Maven tests under Java 21. | Given Java 21 and Maven are available, when `mvn -f services/pom.xml test` runs, then reference-data modules pass their tests. | `code-structure`, U03 |
| FR-007 | `reference-data-service` shall expose health, list, detail, create, update, deactivate, validate, history, and event-status behavior through backend APIs. | Given the service is running, when API requests exercise each operation, then persisted state, history, and status responses are returned as specified. | `architecture`, U05, U08 |
| FR-008 | Backend data access shall persist reference data, changes, authorization data, and outbox state in PostgreSQL for local runs. | Given a local stack restart, when previously applied seed or mutation data is queried, then state remains available unless explicitly reset. | `scope-document`, U05 |
| FR-009 | Backend services shall keep `domain-core` independent from frameworks, persistence, messaging, and web adapters. | Given quality gates run, when domain-core purity is checked, then no Spring/JPA/Kafka/Jackson/Lombok/dataaccess/messaging dependency is detected. | `team-practices`, U10 |

### Authentication and Authorization

| ID | Requirement | Acceptance criteria | Trace |
| --- | --- | --- | --- |
| FR-010 | Local Keycloak shall be bootstrapped with realm, clients, users, roles, and redirect URIs required by `apps/auth`. | Given Compose starts Keycloak, when bootstrap runs, then local users can authenticate without manual admin-console setup. | `scope-document`, U04 |
| FR-011 | `apps/auth` shall complete a local OIDC sign-in flow and expose a safe session summary. | Given a local user signs in, when `/session` and `/api/auth/session` are opened, then subject, roles, permissions, and correlation id are visible without exposing tokens. | `architecture`, U04 |
| FR-012 | `identity-service` shall make authorization decisions for reference-data read/write/admin actions. | Given a subject token reference and requested action, when `/internal/identity/authorize` is called, then allow/deny decision, reason, policy version, and correlation id are returned. | `business-overview`, U04 |
| FR-013 | `apps/reference-data` shall obtain permission state through BFF-to-identity-service integration, not static local defaults. | Given an authenticated user opens the workbench, when permissions load, then mutation actions reflect identity-service authorization. | `architecture`, U04, U06 |
| FR-014 | `AUTH_BYPASS=true` shall remain opt-in and local-only. | Given a non-local profile or production-like runtime, when bypass is enabled, then configuration/tests fail before startup or gate completion. | `team-practices`, U12 |

### Reference-Data UI and BFF

| ID | Requirement | Acceptance criteria | Trace |
| --- | --- | --- | --- |
| FR-015 | `apps/reference-data` shall list all nine MVP reference sets through a BFF route backed by backend service data. | Given services are running, when the workbench loads, then the set list and record counts come from `reference-data-service`. | `scope-document`, U05, U06 |
| FR-016 | The workbench shall support search, include-inactive filtering, paging, and selected-record detail. | Given records exist, when a user searches or toggles inactive records, then the table and detail panel update from backend responses. | `wireframes` via `scope-document`, U06 |
| FR-017 | Authorized users shall create reference records through the UI/BFF/backend path. | Given `reference-data:write` permission, when create is submitted with valid data, then the record is persisted, history is written, and status is shown. | `scope-document`, U05, U06 |
| FR-018 | Authorized users shall update reference records with optimistic version handling. | Given a selected record and valid version, when edit is submitted, then the service persists the update; stale versions produce a visible error. | `architecture`, U05, U06 |
| FR-019 | Authorized users shall deactivate reference records as a status change, not hard delete. | Given a selected active record, when deactivate is submitted with a reason, then status becomes inactive, history records the operation, and an event is enqueued. | `scope-document`, U05, U06 |
| FR-020 | Unauthorized users shall see read-only state with explicit reason and request-access path. | Given a user lacks write permission, when they open the workbench, then create/edit/deactivate actions are disabled or denied with reason and correlation id. | `business-overview`, U04, U06 |
| FR-021 | The UI shall display history, correlation id, event id, and publication status for selected records. | Given a record has changes or publication attempts, when selected, then detail/history/status panels show current information without relying on static fixture text. | `architecture`, U08 |

### Seed Data

| ID | Requirement | Acceptance criteria | Trace |
| --- | --- | --- | --- |
| FR-022 | Seed validation shall continue to validate all required reference sets, roles, local users, dependencies, and fingerprints. | Given the MVP seed pack, when dry-run validation executes, then invalid shape, missing sets, duplicate natural keys, and invalid local users are reported. | `code-structure`, U07 |
| FR-023 | Seed apply mode shall apply data through service/admin APIs, not only local JSON validation. | Given services are running, when apply mode runs, then reference records, roles, and local users are created or updated through live endpoints. | `scope-document`, U07 |
| FR-024 | Seed apply mode shall be idempotent. | Given apply mode has already run, when it runs again with the same seed pack, then unchanged records are skipped and changed records are updated without duplicate active keys. | `team-practices`, U07 |

### Events and Contracts

| ID | Requirement | Acceptance criteria | Trace |
| --- | --- | --- | --- |
| FR-025 | Reference-data mutations shall enqueue transactional outbox events. | Given create/update/deactivate succeeds, when outbox status is queried, then an event exists with record id, set, operation, schema subject, correlation id, and pending/published status. | `architecture`, U08 |
| FR-026 | Outbox publication shall publish Avro-compatible messages to Kafka and register/check schemas in Schema Registry. | Given Kafka and Schema Registry are healthy, when publication runs, then messages are published or retry/failure state is recorded with reason. | `scope-document`, U08 |
| FR-027 | Event publication status shall be visible through backend APIs and the UI/BFF path. | Given publication succeeds or fails, when a user views record detail, then published/retrying/failed status is shown. | `architecture`, U08 |
| FR-028 | OpenAPI contracts shall match running backend behavior. | Given provider checks run, when OpenAPI-defined endpoints are exercised, then requests/responses match documented schemas. | `business-overview`, U09 |
| FR-029 | Avro and message contract checks shall validate event compatibility for the nine reference sets. | Given event schemas and fixtures, when message checks run, then changed-event payloads are compatible with the contract catalog. | `code-structure`, U09 |

## Non-Functional Requirements

| ID | Requirement | Acceptance criteria | Trace |
| --- | --- | --- | --- |
| NFR-001 | Security: all mutating reference-data operations shall require authorization and shall carry correlation id. | Unauthorized mutations return denial; authorized mutations produce audit/history/correlation evidence. | `scope-document`, `team-practices` |
| NFR-002 | Privacy: Party/Customer PII shall remain owned by `reference-data-service` and shall not be copied into downstream module stores by this intent. | Code/design review shows consumers receive references/contracts, not duplicated PII stores. | `scope-document` |
| NFR-003 | Reliability: local health and smoke checks shall fail loud with actionable component status. | When a service is down, smoke output identifies the unhealthy dependency and does not report false success. | `architecture`, U11 |
| NFR-004 | Testability: every requirement shall map to at least one unit, integration, contract, smoke, or quality-gate check. | Requirements-to-tests matrix in later stages contains no unverified requirement. | `team-practices`, U10 |
| NFR-005 | Accessibility: reference-data admin flows shall meet WCAG 2.1 AA baseline for keyboard navigation, headings, landmarks, focus handling, and non-color status. | UX tests or checklist verify keyboard-only operation and screen-reader labels for core screens. | `scope-document` |
| NFR-006 | Observability: mutating flows shall propagate correlation id through BFF, backend, outbox, logs, and status responses. | A smoke scenario can trace one mutation by correlation id across UI/API/log/status evidence. | `scope-document`, U11 |
| NFR-007 | Maintainability: backend services shall preserve hexagonal module boundaries and frontend apps shall use workspace packages rather than duplicated ad hoc utilities. | Quality checks and code review find no domain-core impurity or duplicated client/auth primitives. | `code-structure`, `team-practices` |

## Constraints

1. No public cloud services or managed cloud substitutions.
2. Docker Compose is the local/on-prem topology.
3. Browser traffic must go through Next.js BFF route handlers/server-side code.
4. Keycloak handles authentication and `identity-service` handles authorization.
5. Backend services target Java 21/Spring Boot 3.3 and Maven multi-module layout.
6. Frontend uses Yarn/Turborepo, TypeScript strict mode, Next.js App Router, React, and approved `@erp/*` packages.
7. Events use Kafka, Avro, Schema Registry, and transactional outbox.
8. Full quality gates include backend Maven tests.
9. Production promotion requires separate manual approval.

## Assumptions

| ID | Assumption | Rationale | Validation |
| --- | --- | --- | --- |
| A-001 | Java 21 and Maven can be installed locally or provided by self-hosted runner. | Required for backend tests. | `java -version`, `mvn -version`, backend gate result. |
| A-002 | Docker Desktop or approved Docker runtime is available. | Required for Compose proof. | `docker info`, Compose health checks. |
| A-003 | Existing Java service skeleton can be evolved without changing domain boundaries. | Reverse engineering shows appropriate module split. | Application design and backend tests. |
| A-004 | Keycloak bootstrap can be deterministic through realm import or admin API. | Compose already declares Keycloak. | Auth implementation smoke test. |
| A-005 | Static BFF data can be replaced incrementally with backend clients. | Current BFF route shape already mirrors target API concepts. | BFF integration tests. |

## Out of Scope

1. Charge & Customer Agreement runtime implementation.
2. Customer Booking runtime implementation.
3. Container Movement Management runtime implementation.
4. External finance integration.
5. Production deployment to a real on-prem host.
6. Public customer identity, DCSA public Track & Trace, EDI intake, multi-entity, and multi-currency behavior.
7. Public cloud services, AWS IAM, CDK, CloudFormation, managed RDS, or managed Kafka.

## Open Questions

No product-scope questions block Inception. Execution remains blocked only by environment prerequisites until Java 21, Maven 3.9+, and Docker runtime are available locally or through a self-hosted runner.

## Review

Verdict: READY

Inline fallback review finds the requirements aligned with the approved Shared Platform Local Functionality scope. The requirements remain bounded to Shared Platform and trace to `intent-statement`, `scope-document`, `business-overview`, `architecture`, `code-structure`, and `team-practices`. They define testable outcomes for local runtime readiness, backend services, authentication and authorization, reference-data BFF/UI flows, seed apply mode, events/contracts, quality gates, observability, and local-only bypass safeguards.

No blocking requirements changes are required before User Stories. Reviewer caveat: the configured product-lead reviewer could not complete because the fixed reviewer model is unsupported in this account and the fallback subagent hit the account usage limit. Later review gates should re-check scope creep, explicit testability, and environment-prerequisite handling when subagent capacity is available.
