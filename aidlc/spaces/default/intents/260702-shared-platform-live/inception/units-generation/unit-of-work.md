# Units of Work - Shared Platform Local Functionality

## Context

This unit catalog consumes `components`, `component-methods`, `services`, `component-dependency`, `decisions`, `requirements`, and `stories`. The units are topology units for Shared Platform only; Delivery Planning will choose Bolt grouping and build sequence.

## Unit Summary

| Unit | Name | Complexity | Deployment model | Description |
| --- | --- | --- | --- | --- |
| UOW-01 | Local Runtime Packaging and Prerequisite Checks | M | Shared local runtime | Make local toolchain checks, app/service build paths, and Compose profiles reproducible. |
| UOW-02 | Auth Session and Keycloak Local Flow | M | `apps-auth` plus Keycloak | Complete local sign-in/session behavior and visible local-only bypass state. |
| UOW-03 | Identity Authorization Integration and Persistence | M | `identity-service` | Make authorization/effective-permission decisions durable and consumable by BFF/service callers. |
| UOW-04 | Reference Data Service Persistence and Mutation Core | L | `reference-data-service` | Persist records/history through service-owned repositories and expose mutation behavior. |
| UOW-05 | Reference Data BFF Service Clients and Error Mapping | M | `apps-reference-data` BFF | Replace static BFF data with identity/reference-data service clients and UI-shaped errors. |
| UOW-06 | Reference Data Workbench Write UX | L | `apps-reference-data` UI | Enable permission-aware create/edit/deactivate forms and refresh persisted state. |
| UOW-07 | Outbox Publication and Event Status | L | `reference-data-service` plus Kafka/Schema Registry | Publish reference-data changed events and expose publication status. |
| UOW-08 | Seed Apply Through Live APIs | M | Node seed job/script | Apply local users, roles, and reference data through live APIs with idempotent evidence. |
| UOW-09 | Contract Provider and Message Verification | M | Contract scripts/checks | Verify OpenAPI, Avro, and message fixtures against running behavior. |
| UOW-10 | Local Readiness, Smoke, and Quality Evidence | M | scripts/readiness surface | Aggregate prerequisites, services, seed, smoke, contracts, and quality gate evidence. |
| UOW-11 | Auth Bypass Non-Local Guard | S | `apps-auth`, config/tests | Prevent local auth bypass from working outside local profile and test the guard. |

## Unit Details

### UOW-01 - Local Runtime Packaging and Prerequisite Checks

Responsibilities:

- Provide deterministic checks for Node, Yarn, Java 21, Maven 3.9+, Docker, ports, and required env vars.
- Add buildable app/service images or a documented Compose dev profile for `apps-auth`, `apps-reference-data`, `identity-service`, and `reference-data-service`.
- Keep missing prerequisites distinct from code/test failures.

Boundaries:

- Owns local runtime packaging and checks.
- Does not implement business behavior or seed apply.

Constraints:

- Must satisfy `requirements` FR-001 through FR-004 and `decisions` ADR-006.
- Must keep Compose local/on-prem and avoid public cloud substitutions.

### UOW-02 - Auth Session and Keycloak Local Flow

Responsibilities:

- Complete or harden local Keycloak sign-in/callback/session summary.
- Preserve safe session output with roles, permissions, auth mode, and correlation id.
- Keep local bypass visibly labelled when active.

Boundaries:

- Owns `apps-auth`, `packages/auth` behavior, and Keycloak-facing auth flow.
- Does not own reference-data authorization policy.

Constraints:

- Must satisfy FR-010, FR-011, US-005.
- Must interoperate with UOW-03 effective permissions.

### UOW-03 - Identity Authorization Integration and Persistence

Responsibilities:

- Expose stable authorize/effective-permission behavior for BFF and service callers.
- Add or wire durable role assignment and audit persistence behind identity-service ports.
- Ensure authorization denial includes reason, policy version, and correlation id.

Boundaries:

- Owns identity authorization and role assignment state.
- Does not persist reference records.

Constraints:

- Must satisfy FR-012, FR-013, NFR-001.
- Must preserve identity domain-core purity from `team-practices`.

### UOW-04 - Reference Data Service Persistence and Mutation Core

Responsibilities:

- Add PostgreSQL-backed repositories for reference records, changes, and outbox.
- Expose list/detail/create/update/deactivate/validate/history behavior through existing controller/service interfaces.
- Map stale version, validation, not found, and authorization errors cleanly.

Boundaries:

- Owns reference records, validation, history, and outbox enqueue.
- Does not own browser session state or UI forms.

Constraints:

- Must satisfy FR-005 through FR-009, FR-015 through FR-021, NFR-006, and ADR-003.

### UOW-05 - Reference Data BFF Service Clients and Error Mapping

Responsibilities:

- Replace static local arrays in BFF route handlers with server-side clients to identity-service and reference-data-service.
- Propagate correlation ids.
- Map service errors to UI-safe status codes and payloads.

Boundaries:

- Owns BFF routes and BFF client library.
- Does not own backend domain validation or persistence.

Constraints:

- Must satisfy FR-013, FR-015 through FR-021, ADR-001.
- Browser must not call Java services directly.

### UOW-06 - Reference Data Workbench Write UX

Responsibilities:

- Enable permission-aware create/edit/deactivate UI.
- Add drawer/dialog interactions, validation summaries, stale-version handling, read-only reason, and refreshed list/detail/history/status.
- Preserve accessibility requirements from refined mockups.

Boundaries:

- Owns UI components and screen interactions in `apps-reference-data`.
- Does not call services except through BFF routes.

Constraints:

- Must satisfy US-006 through US-010, NFR-005.

### UOW-07 - Outbox Publication and Event Status

Responsibilities:

- Implement or wire Kafka publisher and Schema Registry adapter.
- Persist and expose pending/published/retrying/failed statuses.
- Support publish/claim/status APIs and UI-visible event status.

Boundaries:

- Owns reference-data event publication.
- Does not implement downstream consumers.

Constraints:

- Must satisfy FR-025 through FR-027 and ADR-004.

### UOW-08 - Seed Apply Through Live APIs

Responsibilities:

- Extend seed loader from validation-only to apply mode.
- Apply local users, roles, and reference records through Keycloak/admin, identity-service, and reference-data-service APIs.
- Report created, updated, skipped, failed rows and preserve idempotency.

Boundaries:

- Owns seed job behavior and summary evidence.
- Does not direct-write databases.

Constraints:

- Must satisfy FR-022 through FR-024 and ADR-005.

### UOW-09 - Contract Provider and Message Verification

Responsibilities:

- Validate OpenAPI provider behavior against running services.
- Validate Avro compatibility and reference-data message fixtures.
- Surface contract evidence in quality/readiness output.

Boundaries:

- Owns contract verification scripts and evidence.
- Does not own service implementation details.

Constraints:

- Must satisfy FR-028, FR-029, NFR-004.

### UOW-10 - Local Readiness, Smoke, and Quality Evidence

Responsibilities:

- Aggregate prerequisite, Compose health, app/service health, smoke mutation, seed, contract, frontend, backend, and policy evidence.
- Distinguish blocked prerequisites from failing tests.
- Provide runbook/readiness output for local verification.

Boundaries:

- Owns readiness aggregation and evidence.
- Does not replace individual service/app tests.

Constraints:

- Must satisfy FR-004, NFR-003, NFR-004, NFR-006.

### UOW-11 - Auth Bypass Non-Local Guard

Responsibilities:

- Add profile/config validation that rejects `AUTH_BYPASS=true` outside local profile.
- Add focused tests for local allowed and non-local rejected states.
- Ensure UI/session clearly labels bypass when enabled.

Boundaries:

- Owns auth bypass safety.
- Does not replace Keycloak local flow.

Constraints:

- Must satisfy FR-014 and ADR-007.

## Coverage Notes

- Every approved user story US-001 through US-016 is covered in `unit-of-work-story-map.md`.
- Every unit traces to `requirements`, `stories`, `components`, `component-methods`, `services`, `component-dependency`, and `decisions`.
- No unit implements downstream Charge, Booking, Container Movement, public cloud, or production deployment.

## Review

Verdict: READY

Inline fallback review finds the unit catalog aligned with `components`, `component-methods`, `services`, `component-dependency`, `decisions`, `requirements`, and `stories`. Unit boundaries are implementation-ready without choosing the delivery sequence.

