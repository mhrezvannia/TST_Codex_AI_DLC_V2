# Bolt Plan - Shared Platform Local Functionality

## Context

This Bolt plan consumes `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. It is the execution plan for building Shared Platform locally functional.

## Bolt Sequence

| Bolt | Name | Units | Walking skeleton | Gate | Expected demo |
| --- | --- | --- | --- | --- | --- |
| B01 | Gated Walking Skeleton | UOW-01, UOW-02, UOW-03, UOW-04, UOW-05, UOW-07 | Yes | Required | Local runtime starts enough services to create one authorized reference record through BFF/service, persist history, enqueue outbox, and show event status/smoke evidence. |
| B02 | Workbench Write UX and Bypass Guard | UOW-06, UOW-11 | No | Per autonomy ladder | Reference Data UI enables create/edit/deactivate when authorized, shows read-only denial when not, and proves local bypass cannot run outside local profile. |
| B03 | Seed Apply Through Live APIs | UOW-08 | No | Per autonomy ladder | Seed apply loads local users, roles, and reference records through live APIs with created/updated/skipped/failed evidence. |
| B04 | Contract Provider and Message Verification | UOW-09 | No | Per autonomy ladder | OpenAPI provider checks and Avro/message checks run against current services/events. |
| B05 | Local Readiness and Quality Evidence | UOW-10 | No | Per autonomy ladder | One readiness command/runbook reports prerequisites, Compose health, auth, reference-data mutation, seed, contracts, smoke, and quality gates. |

## B01 - Gated Walking Skeleton

Included units:

- UOW-01 Local Runtime Packaging and Prerequisite Checks
- UOW-02 Auth Session and Keycloak Local Flow
- UOW-03 Identity Authorization Integration and Persistence
- UOW-04 Reference Data Service Persistence and Mutation Core
- UOW-05 Reference Data BFF Service Clients and Error Mapping
- UOW-07 Outbox Publication and Event Status

Definition of Done:

- Prerequisite check reports Java/Maven/Docker/port/env state accurately.
- App/service build path is reproducible by Dockerfile or documented dev profile.
- Auth/session path returns a safe session summary with correlation id.
- identity-service can authorize a reference-data write request and deny an unauthorized request.
- reference-data-service can create or update one reference record, persist it, write history, enqueue outbox, and expose status.
- Reference Data BFF calls real services and no longer reports mutation success from local static arrays.
- A smoke check proves the path or reports the exact missing local prerequisite.

Confidence hypothesis:

- If B01 ships, the architecture is real enough to build on: local runtime, auth, authorization, BFF-to-service, persistence, outbox/status, and smoke evidence all work together.

Expected demo:

- Run local prerequisites.
- Start required backing services or show prerequisite blocker.
- Use auth/local session.
- Submit one authorized reference-data mutation through the BFF.
- Inspect persisted detail, history, and outbox/status evidence.

## B02 - Workbench Write UX and Bypass Guard

Included units:

- UOW-06 Reference Data Workbench Write UX
- UOW-11 Auth Bypass Non-Local Guard

Definition of Done:

- Reference Data workbench uses BFF-backed list/detail state.
- Create/edit/deactivate controls enable only when permission allows.
- Drawer/dialog flows handle validation, stale version, success, backend unavailable, and read-only denial.
- Local bypass state is visible when active.
- Non-local profile with `AUTH_BYPASS=true` fails config/test validation.
- Accessibility checklist for keyboard, labels, table semantics, dialog focus, and status text is covered by focused tests or manual evidence.

Confidence hypothesis:

- If B02 ships, the user's "everything is view-only" concern is resolved in the primary UI and local bypass is constrained.

Expected demo:

- Open Reference Data workbench.
- See write-enabled state for authorized user.
- Create/edit/deactivate a record and see refreshed detail/history/status.
- Toggle or simulate unauthorized state and see read-only reason.
- Run auth bypass guard tests.

## B03 - Seed Apply Through Live APIs

Included units:

- UOW-08 Seed Apply Through Live APIs

Definition of Done:

- Seed loader supports dry-run and apply modes.
- Apply waits for required service health.
- Local users/roles and reference records are applied through live APIs, not direct database writes.
- Re-running apply reports skipped unchanged records without duplicates.
- Failed rows include set/key/error and correlation id.

Confidence hypothesis:

- If B03 ships, a clean local stack can be bootstrapped repeatedly without manual admin-console or database edits.

Expected demo:

- Run seed dry-run.
- Run seed apply.
- Run seed apply again and show idempotent skipped/updated counts.

## B04 - Contract Provider and Message Verification

Included units:

- UOW-09 Contract Provider and Message Verification

Definition of Done:

- OpenAPI provider checks exercise running identity and reference-data service behavior.
- Avro compatibility checks cover all nine reference-data event schemas.
- Message fixture checks validate reference-data changed events and publication status.
- Contract evidence is available to later downstream module work.

Confidence hypothesis:

- If B04 ships, downstream modules can trust Shared Platform contracts before their own runtime implementation starts.

Expected demo:

- Run contract checks.
- Show pass/fail evidence for OpenAPI, Avro, and message fixtures.

## B05 - Local Readiness and Quality Evidence

Included units:

- UOW-10 Local Readiness, Smoke, and Quality Evidence

Definition of Done:

- Readiness output separates prerequisites, Compose services, app/service health, auth, reference-data mutation, seed, contracts, frontend tests, backend tests, and policy checks.
- Missing Java/Maven/Docker is classified as blocked prerequisite, not hidden success.
- Smoke scenario traces one mutation by correlation id through BFF, backend, history, and event status.
- Runbook documents startup, shutdown, reset, health, smoke, and known local-only switches.

Confidence hypothesis:

- If B05 ships, Shared Platform has evidence strong enough to proceed to Charge, Booking, and Container Movement work in the remembered project order.

Expected demo:

- Run readiness/quality command.
- Show evidence summary and correlation-id trace for a mutation.

## Construction Gate Posture

- B01 is always gated as the walking skeleton.
- After B01 approval, the AI-DLC autonomy ladder decides whether B02 through B05 continue autonomously or remain gated.
- Failures always halt and ask, regardless of autonomy mode.

## Review

Verdict: READY

Inline fallback review finds the Bolt plan aligned with `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. It honors the required gated walking skeleton and keeps all work inside Shared Platform.

