# Business Rules - U02 Identity Authorization Service

## Source Trace

These U02 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Boundary Rules

BR-U02-001: Keycloak 24 is the authentication provider. `identity-service` must not store passwords or implement custom authentication.

BR-U02-002: `identity-service` owns platform authorization decisions, role catalog, permission catalog, role assignments, and authorization audit.

BR-U02-003: Callers must use the `identity-service` authorization API instead of embedding platform role logic in frontend apps, BFFs, or other backend services.

BR-U02-004: The `identity-service` domain core must not depend on Keycloak, Spring Security, JPA, REST controllers, Kafka, frontend packages, or adapter modules.

BR-U02-005: `identity-service` owns its PostgreSQL datastore. Other services and frontend BFFs must not read or write its database directly.

## Role and Permission Rules

BR-U02-006: The MVP role catalog must include `pricing`, `sales`, `booking-desk`, `equipment-control`, `customer-service`, `finance-read`, `reference-admin`, `platform-operator`, and `security-admin`.

BR-U02-007: A default authenticated user must receive no administrative permissions unless explicitly assigned by the platform authorization model.

BR-U02-008: Only active role assignments contribute to effective permissions.

BR-U02-009: Permission evaluation must consider subject, resource, action, scope, assignment status, and policy version.

BR-U02-010: Reference-data create, update, deactivate, and reactivate operations require an explicit permission, normally through `reference-admin`.

BR-U02-011: Role assignment and revocation require `security-admin` authorization.

BR-U02-012: Role catalog reads may be exposed only to authenticated and authorized callers according to the contract.

## Decision Rules

BR-U02-013: Protected authorization decisions must fail closed when token validation, subject resolution, policy lookup, persistence, or required dependency access cannot complete.

BR-U02-014: Authorization responses must include a decision result, reason code, correlation id, evaluated subject identifier, and permission/policy version where applicable.

BR-U02-015: Deny decisions must be safe for BFF/UI display and must not leak token internals, secret claims, or unauthorized role details.

BR-U02-016: The service must distinguish invalid token, unknown subject, missing permission, stale assignment, conflict, and dependency unavailable outcomes.

BR-U02-017: Repeated decision calls for the same active assignment and policy version must be deterministic.

## Assignment and Audit Rules

BR-U02-018: Role assignment changes must capture actor, target user, role, operation, timestamp, before value, after value, reason where supplied, and correlation id.

BR-U02-019: Assignment changes and their audit records must be persisted in one transaction where the storage technology allows it.

BR-U02-020: Role assignment writes must reject stale versions or conflicting concurrent changes.

BR-U02-021: Audit records must be append-only from the application perspective.

BR-U02-022: Authorized audit queries must support filtering by target subject, actor, role, action, result, and time range.

BR-U02-023: Failed protected decisions and denied role-assignment attempts must produce structured audit/log signals suitable for later observability work.

## API and Integration Rules

BR-U02-024: `identity-service` must publish an OpenAPI contract for authorization decisions, effective permissions, role catalog, role assignment, and audit query APIs.

BR-U02-025: Every API request must accept or generate a correlation id and propagate it into logs and audit records.

BR-U02-026: REST error responses must use the platform error envelope with code, message, correlationId, timestamp, and optional details.

BR-U02-027: BFFs may receive session-safe role and permission summaries; browser JavaScript must not receive raw access tokens or sensitive claims from U02.

BR-U02-028: `apps/auth` owns sign-in, callback, sign-out, access-denied, session display, and request-access screens; U02 only supplies backend identity/authorization capabilities.

BR-U02-029: `apps/reference-data` and `reference-data-service` must enforce U02 decisions at their own boundaries and must not assume UI hiding is sufficient authorization.

## Scope Rules

BR-U02-030: U02 must not implement Charge, Booking, or Container Movement runtime services, screens, data stores, or domain policies.

BR-U02-031: Role names may anticipate future module access, but future module permissions must remain contract placeholders until those modules are approved for build.

BR-U02-032: Full permission-review administration UI is outside U02 and remains bounded to U05 or a later approved workflow.
