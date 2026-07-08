# Code Generation Plan - U02 Identity Authorization Service

## Source Trace

This plan implements U02 from `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `security-design.md`, `deployment-architecture.md`, `unit-of-work.md`, `unit-of-work-story-map.md`, and `requirements.md`.

U02 expands the `identity-service` skeleton created by U01. It implements platform authorization capabilities only. It must not store passwords, implement customer identity, build auth UI routes, or add Charge, Booking, or Container Movement runtime policy.

## Implementation Steps

- [x] Step 1: Extend `identity-service/domain-core` with authorization domain value objects.
  - Traceability: US-012, US-013, US-014, US-015; BR-U02-004, BR-U02-006 through BR-U02-017.
  - Add `AuthenticatedSubject`, `Role`, `Permission`, `RolePermission`, `RoleAssignment`, `AuthorizationRequest`, `AuthorizationDecision`, `EffectivePermissionsView`, and `AuthorizationAuditRecord`.
  - Add enums/value objects for role code, permission action, assignment status, decision result, reason code, and policy version.

- [x] Step 2: Implement MVP role and permission catalog.
  - Traceability: US-012, US-013; BR-U02-006 through BR-U02-012.
  - Include roles: `pricing`, `sales`, `booking-desk`, `equipment-control`, `customer-service`, `finance-read`, `reference-admin`, `platform-operator`, and `security-admin`.
  - Define initial permissions for `reference-data`, `reference-contracts`, `identity-roles`, `identity-audit`, and `platform-status`.

- [x] Step 3: Implement authorization policy evaluation in the domain/application-service layer.
  - Traceability: US-012; BR-U02-009, BR-U02-013 through BR-U02-017.
  - Evaluate subject, resource, action, scope, active assignments, and policy version.
  - Return deterministic allow/deny outcomes with safe reason codes and correlation id.

- [x] Step 4: Implement assignment command model and optimistic-version behavior.
  - Traceability: US-014, US-015; BR-U02-018 through BR-U02-023.
  - Add assign/revoke service methods with stale-version/conflict handling.
  - Preserve transactional assignment-plus-audit intent through ports.

- [x] Step 5: Define application ports.
  - Traceability: BR-U02-002, BR-U02-005, BR-U02-019, BR-U02-024.
  - Add ports for subject resolution, role assignment repository, catalog access, audit repository, and clock/id generation.
  - Keep Keycloak and PostgreSQL details outside domain-core.

- [x] Step 6: Add dataaccess adapter placeholders for PostgreSQL ownership.
  - Traceability: BR-U02-005, BR-U02-019 through BR-U02-022.
  - Add in-memory/local skeleton repositories sufficient for tests and walking-skeleton behavior.
  - Keep concrete JPA schema migrations minimal or placeholder until final persistence detail is extended.

- [x] Step 7: Add Keycloak adapter boundary.
  - Traceability: BR-U02-001, BR-U02-013, BR-U02-015, BR-U02-027.
  - Add safe token/claims translation interface and adapter placeholder.
  - Ensure raw tokens never enter domain objects, audit records, or API response DTOs.

- [x] Step 8: Add REST/API layer placeholders and safe DTOs.
  - Traceability: BR-U02-024 through BR-U02-029.
  - Add internal endpoints or controller skeletons for authorization decisions, effective permissions, role catalog, role assignment, and audit query APIs.
  - Use platform error envelope and correlation id conventions.

- [x] Step 9: Add OpenAPI contract placeholder for identity authorization APIs.
  - Traceability: BR-U02-024; FR-031, FR-032.
  - Add `contracts/openapi/identity-service.yaml` covering high-level paths and DTO shapes.

- [x] Step 10: Add unit tests for domain and application-service behavior.
  - Traceability: US-012, US-013, US-014; BR-U02-006 through BR-U02-023.
  - Cover default least privilege, reference-admin allow, missing permission deny, invalid/unknown subject fail-closed reason, active-only assignments, security-admin assignment authorization, stale assignment rejection, and audit record creation intent.

- [x] Step 11: Add adapter/API tests or stubs appropriate to the skeleton.
  - Traceability: BR-U02-024 through BR-U02-029.
  - Cover safe DTO projection and no raw token exposure.

- [x] Step 12: Update service configuration and Compose placeholders.
  - Traceability: `deployment-architecture.md`.
  - Add local config placeholders for PostgreSQL, Keycloak issuer/audience/JWKS, Vault-style secret comments, and service health/readiness.

- [x] Step 13: Run verification.
  - Traceability: NFR security, reliability, and standard test strategy.
  - Run feasible Java compile/tests if Maven is available; otherwise record the environment limitation.
  - Re-run skeleton validation, frontend/package checks affected by contracts or shared package changes, and direct tests available in this workspace.

## Test Strategy

The active strategy is Standard. U02 must create unit tests for domain/application behavior and adapter/API tests or stubs for key boundaries. Build and Test may extend coverage later, but U02 must not defer creation of core test files.

## Approval

This plan is ready for review before identity-service code generation.
