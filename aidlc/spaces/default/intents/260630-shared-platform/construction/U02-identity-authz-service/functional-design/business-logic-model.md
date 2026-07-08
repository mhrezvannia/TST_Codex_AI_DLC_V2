# Business Logic Model - U02 Identity Authorization Service

## Source Trace

This U02 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Unit Purpose

U02 implements the `identity-service` authorization domain for the Shared Platform MVP. It converts Keycloak-authenticated subjects into platform authorization decisions, exposes effective permission and role APIs to backend services and frontend BFFs, persists role assignment state in the service-owned PostgreSQL datastore, and records auditable role/permission changes and protected authorization outcomes.

U02 does not implement customer-facing identity, custom password storage, auth UI routes, or Charge, Booking, or Container Movement runtime behavior.

## Authorization Decision Workflow

```text
Receive authorization decision request
  -> validate correlation id and request envelope
  -> resolve authenticated subject through Keycloak adapter boundary
  -> load active platform role assignments for subject
  -> expand roles into effective permissions
  -> evaluate requested resource/action/scope against policy catalog
  -> produce allow or deny decision
  -> record denial or sensitive decision audit where required
  -> return decision with reason code, correlation id, and evaluated permissions version
```

Decision outcomes:

| Outcome | Meaning | Follow-up behavior |
|---|---|---|
| `ALLOW` | Subject has an active permission for the resource/action/scope. | Caller proceeds and carries correlation id. |
| `DENY_NO_PERMISSION` | Subject is authenticated but lacks permission. | Caller shows access-denied or read-only state. |
| `DENY_UNKNOWN_SUBJECT` | Subject cannot be resolved to an active internal user. | Caller fails closed. |
| `DENY_INVALID_TOKEN` | Token validation or claims translation failed. | Caller treats session as invalid. |
| `DENY_DEPENDENCY_UNAVAILABLE` | Required identity dependency is unavailable for a protected decision. | Caller fails closed and support can trace by correlation id. |

## Effective Permission Workflow

```text
Receive effective-permissions query
  -> resolve subject through Keycloak token/claims adapter
  -> load active role assignments
  -> load role catalog and permission catalog
  -> produce session-safe role and permission summary
  -> omit token material and secret claims
  -> return response for BFF/session display
```

This supports US-004 session detail review, US-012 platform role evaluation, and BFF decisions in `apps/auth` and `apps/reference-data`.

## Role Assignment Workflow

```text
Receive assign/revoke role command
  -> authorize actor for security administration
  -> validate target subject and role id
  -> verify role is assignable in MVP catalog
  -> detect duplicate assignment, missing assignment, or stale version
  -> persist assignment change in a transaction
  -> append immutable audit record with actor, target, before/after, reason, and correlation id
  -> return assignment result and updated version
```

Role assignment writes use optimistic versioning so concurrent security-admin changes cannot silently overwrite each other.

## Role Catalog and Policy Evaluation

The MVP catalog starts with these carrier roles:

| Role | Functional intent |
|---|---|
| `pricing` | Pricing and charge-reference read participation. |
| `sales` | Sales/customer-facing operational read participation. |
| `booking-desk` | Booking-related operational read participation for future modules. |
| `equipment-control` | Equipment-related operational read participation for future modules. |
| `customer-service` | Customer support read participation. |
| `finance-read` | Finance-oriented read-only participation. |
| `reference-admin` | Create/update/deactivate/reactivate Shared Platform reference records. |
| `platform-operator` | Operational support, health/status, and platform diagnostics. |
| `security-admin` | Role assignment, role review, and authorization audit access. |

Policy evaluation maps a request tuple to a decision:

```text
subject roles + requested resource + requested action + requested scope
  -> permission candidates
  -> active assignment check
  -> policy match
  -> decision result
```

Representative resource/action tuples:

| Resource | Actions | Primary users |
|---|---|---|
| `reference-data` | `read`, `create`, `update`, `deactivate`, `reactivate` | `reference-admin`, read-capable roles |
| `reference-contracts` | `read` | platform roles and future contract reviewers through approved APIs |
| `identity-roles` | `read`, `assign`, `revoke` | `security-admin` |
| `identity-audit` | `read` | `security-admin`, limited `platform-operator` views |
| `platform-status` | `read` | `platform-operator`, `security-admin` |

## Keycloak Adapter Workflow

```text
Receive token reference or bearer token from service/BFF layer
  -> validate issuer, audience, expiry, and signature through OIDC/JWKS metadata
  -> translate stable claims to AuthenticatedSubject
  -> reject tokens with missing internal subject identifier
  -> cache provider metadata safely
  -> return subject without exposing token material to domain core
```

The adapter belongs outside `domain-core`; domain logic sees only `AuthenticatedSubject` and authorization value objects.

## Audit Workflow

```text
Create audit candidate
  -> enrich with actor subject, target subject, action, before/after values, reason, result, and correlation id
  -> persist append-only audit record
  -> expose filtered audit query for authorized security/platform users
```

Audit records support US-014 and NFR expectations for access logging and immutable/tamper-evident records. The final retention window is an NFR/design detail and does not change the U02 domain model.

## Service Integration Workflow

`apps/auth`, `apps/reference-data`, and backend services call `identity-service` through OpenAPI-defined internal APIs. Browser JavaScript never calls `identity-service` directly and never receives raw token material.

```text
BFF or service request
  -> include correlation id and authenticated context
  -> call identity-service authorization API
  -> receive allow/deny/session-safe details
  -> enforce decision at caller boundary
```

## Walking Skeleton Support

For the first Construction Bolt, U02 must support a thin end-to-end decision:

- Resolve one Keycloak-backed internal subject.
- Return effective roles for session display.
- Deny a protected reference-admin operation for a user without `reference-admin`.
- Allow the same operation for a subject with `reference-admin`.
- Emit enough audit/log data to trace the decision by correlation id.

## Non-Goals

- No user password management.
- No customer/shipper/BCO identity.
- No full permission-review administration UI.
- No downstream Charge, Booking, or Container Movement runtime policy implementation.
- No direct database sharing with other services or BFFs.
