# User Stories - Shared Platform Local Functionality

## Context

These stories consume `requirements`, `business-overview`, `component-inventory`, and `team-practices`. Stories are split by workflow/backlog unit and use Given/When/Then acceptance criteria. They stay within Shared Platform U01-U12 and exclude Charge, Booking, Container Movement, finance integration, and production deployment.

## Must Have Stories

### US-001 - Verify Local Prerequisites

As an Implementation Developer, I want a deterministic prerequisite check, so that I can distinguish missing local tools from code failures.

Priority: Must Have  
Dependencies: none  
Requirements: FR-001, NFR-003  
Backlog: U01

Acceptance criteria:

- Given a machine with Node and Yarn but missing Java, Maven, or Docker, when I run the prerequisite check, then each missing prerequisite is reported by name with remediation guidance.
- Given all prerequisites are available, when I run the check, then it reports the runtime as ready for Compose/backend verification.
- Given a required port is occupied, when I run the check, then the conflict is reported before stack startup.

INVEST: Independent and testable as a CLI/script check.

### US-002 - Start Backing Services

As a Platform Operator, I want Compose backing services to start with health checks, so that Shared Platform has local PostgreSQL, Keycloak, Kafka, Schema Registry, and Nginx dependencies.

Priority: Must Have  
Dependencies: US-001  
Requirements: FR-002, FR-004  
Backlog: U01, U11

Acceptance criteria:

- Given Docker is running, when I start the documented Compose profile, then backing services become healthy or fail with actionable service names.
- Given a backing service is unhealthy, when smoke checks run, then the failed service is identified.

INVEST: Valuable and testable without completing all app code.

### US-003 - Build Runnable App and Service Processes

As a Platform Operator, I want app and service images or dev profiles to be buildable from the repo, so that Compose does not depend on unknown prebuilt local images.

Priority: Must Have  
Dependencies: US-001  
Requirements: FR-003  
Backlog: U02

Acceptance criteria:

- Given no `linercore/*:local` images exist, when I follow the documented build path, then identity-service, reference-data-service, apps-auth, and apps-reference-data can be started.
- Given an image cannot be built, when the build fails, then the failure names the service and missing prerequisite.

INVEST: Small enough to verify per app/service.

### US-004 - Compile and Test Backend Services

As an Implementation Developer, I want Java backend modules to compile and test, so that service code can be trusted before BFF integration.

Priority: Must Have  
Dependencies: US-001  
Requirements: FR-005, FR-006, FR-009  
Backlog: U03

Acceptance criteria:

- Given Java 21 and Maven are available, when `mvn -f services/pom.xml test` runs, then both backend services pass tests.
- Given domain-core purity is checked, when forbidden framework/persistence/messaging imports exist, then the quality gate fails.

INVEST: Testable through existing Maven and quality-gate commands.

### US-005 - Sign In Locally

As a Security / IT Administrator, I want deterministic local Keycloak sign-in and session summary, so that authentication is real and inspectable.

Priority: Must Have  
Dependencies: US-002, US-003  
Requirements: FR-010, FR-011  
Backlog: U04

Acceptance criteria:

- Given Keycloak is running, when bootstrap executes, then local realm, client, redirect URI, users, and roles exist.
- Given a local user signs in, when they open `/session`, then safe subject, role, permission, and correlation id data appears without tokens.
- Given `AUTH_BYPASS=true`, when sign-in is invoked locally, then a clearly local session is created.

INVEST: Valuable and independently testable through auth app routes.

### US-006 - Enforce Reference Data Authorization

As a Security / IT Administrator, I want reference-data permissions to come from `identity-service`, so that write actions are not controlled by static UI defaults.

Priority: Must Have  
Dependencies: US-005  
Requirements: FR-012, FR-013, FR-020, NFR-001  
Backlog: U04, U06

Acceptance criteria:

- Given a user has write permission, when the workbench loads, then create/edit/deactivate actions are enabled.
- Given a user lacks write permission, when the workbench loads, then actions are disabled or denied with reason and correlation id.
- Given an unauthorized mutation request reaches the BFF, when authorization denies it, then no backend mutation is persisted.

INVEST: Testable through BFF route tests and identity-service tests.

### US-007 - List and Inspect Reference Records

As a Reference Data Administrator, I want the workbench to list, filter, page, and inspect backend records, so that I can manage canonical reference data from real service state.

Priority: Must Have  
Dependencies: US-004, US-006  
Requirements: FR-007, FR-015, FR-016  
Backlog: U05, U06

Acceptance criteria:

- Given backend records exist, when I open the workbench, then the set list and records come from `reference-data-service`.
- Given I search or include inactive records, when filters change, then the BFF requests the backend and updates results.
- Given I select a record, when detail loads, then current backend detail is shown.

INVEST: End-to-end and user-visible.

### US-008 - Create Reference Record

As a Reference Data Administrator, I want to create a reference record, so that new canonical data is available to platform consumers.

Priority: Must Have  
Dependencies: US-006, US-007  
Requirements: FR-017, FR-021, NFR-006  
Backlog: U05, U06, U08

Acceptance criteria:

- Given I have write permission, when I submit valid create data, then the record is persisted and visible in the list/detail view.
- Given validation fails, when I submit invalid data, then the form preserves input and shows field errors plus correlation id.
- Given creation succeeds, when I inspect history/status, then a created entry and outbox status are visible.

INVEST: Core walking-skeleton candidate.

### US-009 - Update Reference Record

As a Reference Data Administrator, I want to update a reference record with version handling, so that edits are safe and auditable.

Priority: Must Have  
Dependencies: US-007  
Requirements: FR-018, FR-021  
Backlog: U05, U06, U08

Acceptance criteria:

- Given I have write permission and current version, when I save an edit, then detail, history, and publication status update.
- Given my version is stale, when I save, then the UI shows a stale-version error and does not overwrite newer data.

INVEST: Testable with service and BFF tests.

### US-010 - Deactivate Reference Record

As a Reference Data Administrator, I want to deactivate a reference record with a reason, so that inactive data is preserved historically and excluded from active lookups.

Priority: Must Have  
Dependencies: US-007  
Requirements: FR-019, FR-021  
Backlog: U05, U06, U08

Acceptance criteria:

- Given I have write permission, when I deactivate an active record with a reason, then the record status becomes inactive and history captures the operation.
- Given inactive records are excluded, when I list active records, then the deactivated record is not shown unless include-inactive is selected.
- Given deactivation succeeds, when event status is inspected, then an outbox event is visible.

INVEST: Completes CRUD-like lifecycle without hard delete.

### US-011 - Apply Seed Data

As a Platform Operator, I want seed apply mode to load MVP reference and identity data through live services, so that the local stack is reusable and deterministic.

Priority: Must Have  
Dependencies: US-004, US-005, US-007  
Requirements: FR-022, FR-023, FR-024  
Backlog: U07

Acceptance criteria:

- Given services are running, when seed apply mode runs, then required reference sets, roles, and local users are created or updated through service/admin APIs.
- Given apply mode is run twice with unchanged data, when the second run completes, then unchanged records are skipped without duplicate active keys.
- Given a seed row is invalid, when apply runs, then the run reports failed rows with validation details.

INVEST: Testable through seed script tests and local smoke.

### US-012 - Publish Reference Data Events

As a Downstream Module Developer, I want reference-data changes published with compatible schemas, so that downstream modules can integrate against real event contracts later.

Priority: Must Have  
Dependencies: US-008, US-009, US-010  
Requirements: FR-025, FR-026, FR-027, FR-029  
Backlog: U08

Acceptance criteria:

- Given a reference-data mutation succeeds, when the outbox is queried, then the event includes set, record id, operation, schema subject, and correlation id.
- Given Kafka and Schema Registry are healthy, when publication runs, then status becomes published with broker metadata.
- Given publication fails, when status is viewed, then retrying or failed state and reason are visible.

INVEST: Integration-ready and measurable.

## Should Have Stories

### US-013 - Validate Contracts Against Running Behavior

As a Downstream Module Developer, I want OpenAPI, Avro, Pact/provider, and message checks aligned with running services, so that later modules can depend on Shared Platform contracts.

Priority: Should Have  
Dependencies: US-004, US-012  
Requirements: FR-028, FR-029, NFR-004  
Backlog: U09

Acceptance criteria:

- Given backend services are running, when provider checks execute, then OpenAPI requests/responses match the documented contracts.
- Given event fixtures and schemas, when message checks execute, then Avro compatibility passes for all nine reference sets.

INVEST: Valuable for downstream readiness.

### US-014 - Run Full Quality Gates

As an Implementation Developer, I want the quality-gate aggregator to report full frontend, backend, contract, seed, smoke, and policy status, so that readiness is evidence-based.

Priority: Should Have  
Dependencies: US-004, US-013  
Requirements: NFR-004, FR-004  
Backlog: U10

Acceptance criteria:

- Given all prerequisites are available, when `quality:gates` runs, then required gates pass or fail with evidence files.
- Given Java/Maven/Docker are missing, when gates run, then missing prerequisites are reported distinctly from test failures.

INVEST: Testable through scripts and CI workflow.

### US-015 - Operate Local Readiness and Smoke Evidence

As a Platform Operator, I want a local readiness runbook and smoke checks, so that I can prove the stack is functional and troubleshoot failures.

Priority: Should Have  
Dependencies: US-002, US-003, US-007, US-012  
Requirements: FR-004, NFR-003, NFR-006  
Backlog: U11

Acceptance criteria:

- Given the stack is running, when smoke checks run, then auth, reference-data, seed, contract, outbox, and health paths are summarized.
- Given a component is down, when checks run, then the component and recovery hint are shown.
- Given a mutation is performed, when logs/status are inspected, then the correlation id can be traced.

INVEST: Operations-focused and independently useful.

## Could Have Stories

### US-016 - Guard Local Auth Bypass

As a Security / IT Administrator, I want local auth bypass guarded by profile and tests, so that it cannot leak into non-local environments.

Priority: Could Have  
Dependencies: US-005, US-014  
Requirements: FR-014  
Backlog: U12

Acceptance criteria:

- Given a non-local profile, when `AUTH_BYPASS=true` is set, then startup or configuration validation fails.
- Given local profile, when bypass is enabled, then the UI/session clearly identifies local bypass state.

INVEST: Small, testable, and security-relevant.

## Dependency Map

```text
US-001 -> US-002 -> US-003 -> US-004 -> US-005 -> US-006
                                      \               \
                                       \               -> US-007 -> US-008 -> US-012 -> US-013 -> US-014
                                        \                         -> US-009 -> /
                                         \                        -> US-010 -> /
                                          -> US-011 -------------------------/
US-014 -> US-016
US-012 -> US-015
```

## Review

Verdict: READY

Inline fallback review finds the stories aligned with `requirements`, `business-overview`, `component-inventory`, and `team-practices`. The story set is scoped to Shared Platform U01-U12, uses Given/When/Then acceptance criteria, preserves a walking-skeleton path, and avoids downstream module runtime work.
