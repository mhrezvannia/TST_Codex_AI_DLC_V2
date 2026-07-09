# Unit of Work Story Map - Shared Platform Local Functionality

## Context

This story map consumes `components`, `component-methods`, `services`, `component-dependency`, `decisions`, `requirements`, and `stories`. It verifies that every approved story maps to one or more Shared Platform implementation units.

## Story to Unit Map

| Story | Primary unit | Supporting units | Coverage rationale |
| --- | --- | --- | --- |
| US-001 Verify Local Prerequisites | UOW-01 | UOW-10 | Prerequisite checks are implemented in runtime packaging and summarized by readiness. |
| US-002 Start Backing Services | UOW-01 | UOW-10 | Compose health belongs to runtime packaging and readiness evidence. |
| US-003 Build Runnable App and Service Processes | UOW-01 | UOW-10 | Buildable images/dev profiles are runtime packaging and quality evidence inputs. |
| US-004 Compile and Test Backend Services | UOW-01 | UOW-10 | Java/Maven/backend tests are prerequisite and quality-gate concerns. |
| US-005 Sign In Locally | UOW-02 | UOW-03, UOW-11 | Auth/session flow uses identity permissions and bypass guard. |
| US-006 Enforce Reference Data Authorization | UOW-03 | UOW-04, UOW-05, UOW-06 | Authorization decision, service enforcement, BFF mapping, and UI state all participate. |
| US-007 List and Inspect Reference Records | UOW-04 | UOW-05, UOW-06 | Service data, BFF clients, and UI list/detail together satisfy the story. |
| US-008 Create Reference Record | UOW-04 | UOW-05, UOW-06, UOW-07 | Service mutation, BFF route, UI form, history/outbox evidence. |
| US-009 Update Reference Record | UOW-04 | UOW-05, UOW-06, UOW-07 | Service update/stale-version handling, BFF/UI errors, publication status. |
| US-010 Deactivate Reference Record | UOW-04 | UOW-05, UOW-06, UOW-07 | Status change, history, outbox, UI confirmation. |
| US-011 Apply Seed Data | UOW-08 | UOW-02, UOW-03, UOW-04, UOW-10 | Seed apply uses live auth/identity/reference APIs and readiness evidence. |
| US-012 Publish Reference Data Events | UOW-07 | UOW-04, UOW-05, UOW-06 | Outbox publication is service-owned and status is surfaced through BFF/UI. |
| US-013 Validate Contracts Against Running Behavior | UOW-09 | UOW-04, UOW-07, UOW-10 | Provider/message checks need running service and event publication. |
| US-014 Run Full Quality Gates | UOW-10 | UOW-01, UOW-09 | Aggregates prerequisite, backend, frontend, contract, seed, smoke, and policy checks. |
| US-015 Operate Local Readiness and Smoke Evidence | UOW-10 | UOW-01 through UOW-09 | Readiness composes evidence from implemented runtime and platform behavior. |
| US-016 Guard Local Auth Bypass | UOW-11 | UOW-02, UOW-10 | Guard is auth-owned and validated by quality/readiness checks. |

## Unit to Story Coverage

| Unit | Stories covered |
| --- | --- |
| UOW-01 Local Runtime Packaging and Prerequisite Checks | US-001, US-002, US-003, US-004, US-014, US-015 |
| UOW-02 Auth Session and Keycloak Local Flow | US-005, US-011, US-016 |
| UOW-03 Identity Authorization Integration and Persistence | US-005, US-006, US-011 |
| UOW-04 Reference Data Service Persistence and Mutation Core | US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013 |
| UOW-05 Reference Data BFF Service Clients and Error Mapping | US-006, US-007, US-008, US-009, US-010, US-012 |
| UOW-06 Reference Data Workbench Write UX | US-006, US-007, US-008, US-009, US-010, US-012 |
| UOW-07 Outbox Publication and Event Status | US-008, US-009, US-010, US-012, US-013 |
| UOW-08 Seed Apply Through Live APIs | US-011, US-015 |
| UOW-09 Contract Provider and Message Verification | US-013, US-014, US-015 |
| UOW-10 Local Readiness, Smoke, and Quality Evidence | US-001, US-002, US-003, US-004, US-011, US-013, US-014, US-015, US-016 |
| UOW-11 Auth Bypass Non-Local Guard | US-005, US-016 |

## Cross-Cutting Stories

| Story | Cross-cut reason |
| --- | --- |
| US-006 | Authorization must be visible in UI, enforced in BFF, and enforced in reference-data-service. |
| US-008 through US-010 | Mutations span UI forms, BFF clients, service validation/persistence, history, and outbox. |
| US-011 | Seed apply spans auth, identity, reference-data APIs, idempotency, and readiness evidence. |
| US-012 | Event status spans service outbox, Kafka/Schema Registry, BFF status, and UI detail/status panels. |
| US-014 through US-015 | Quality/readiness consumes evidence from most units. |
| US-016 | Bypass guard spans auth runtime behavior and quality/readiness checks. |

## Intra-Unit Story Notes

This section records only story grouping inside each unit. It does not choose the cross-unit build sequence.

- UOW-01 groups prerequisite, Compose, image/dev-profile, and backend gate evidence stories.
- UOW-04 groups reference-data service read/mutation/history behavior before BFF/UI layers consume it.
- UOW-06 groups list/detail and mutation interactions because the workbench state model is shared.
- UOW-10 groups readiness stories because it aggregates evidence from other completed capabilities.

## Coverage Verification

- Every story US-001 through US-016 is assigned.
- Every unit UOW-01 through UOW-11 has at least one story.
- Every mapping traces back to the approved `requirements`, `stories`, `components`, `component-methods`, `services`, `component-dependency`, and `decisions`.
- No story maps to downstream Charge, Booking, Container Movement, public cloud, or production deployment implementation.

## Review

Verdict: READY

Inline fallback review finds the story map complete and aligned with `components`, `component-methods`, `services`, `component-dependency`, `decisions`, `requirements`, and `stories`. It covers all approved stories without selecting the Delivery Planning build sequence.

