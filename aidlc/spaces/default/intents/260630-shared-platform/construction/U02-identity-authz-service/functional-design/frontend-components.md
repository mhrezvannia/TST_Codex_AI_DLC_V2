# Frontend Components - U02 Identity Authorization Service

## Source Trace

This U02 frontend/BFF integration design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U02 is a backend service unit. It does not implement complete frontend screens, but it defines the session-safe contract points consumed by `apps/auth`, `apps/reference-data`, and shared `@erp/auth`/`@erp/api-core` packages in later units.

## Consuming Frontend/BFF Touchpoints

| Consumer | U02 capability used | Completed by |
|---|---|---|
| `apps/auth` BFF | Effective permissions/session role summary, access-denied reason support, request-access context. | U05 |
| `apps/reference-data` BFF | Authorization decisions for reference read/write behavior and read-only UI state. | U06 |
| `@erp/auth` | Session-safe auth types, role summaries, permission helper types. | U05/U06 shared package use |
| `@erp/api-core` | Error envelope, correlation id propagation, Axios client contract use. | U05/U06/U07 |
| Contract catalog views | Identity Authorization OpenAPI visibility. | U07 |

## Session Summary View Model

Purpose: Safe payload returned to BFF callers and displayed by auth/session screens.

Fields:

| Field | Purpose |
|---|---|
| `subjectId` | Stable support identifier. |
| `displayName` | User-facing display name. |
| `email` | Internal email where permitted. |
| `roles` | Active role labels/codes safe for the caller. |
| `permissions` | Optional permission summaries safe for support/read-only state. |
| `policyVersion` | Authorization catalog version used. |
| `correlationId` | Trace id for support. |

Rules:

- No raw tokens.
- No secret claims.
- No hidden role assignments outside caller authorization.

## Authorization Decision BFF Pattern

```text
Frontend route/action
  -> BFF route handler receives request
  -> BFF attaches correlation id and server-held session context
  -> BFF calls identity-service authorization API
  -> BFF maps decision to UI state or backend service call
  -> Browser receives only safe allow/deny/read-only outcome
```

This pattern prevents browser-to-service direct calls and keeps token material on the server side.

## UI States Enabled by U02

| State | U02 signal | Implementing app |
|---|---|---|
| Authenticated with roles | Effective permission/session summary. | `apps/auth` |
| Access denied | Deny decision with safe reason code and correlation id. | `apps/auth`, `apps/reference-data` |
| Read-only reference data | Deny write but allow read decision. | `apps/reference-data` |
| Security-admin role management available | `security-admin` role/effective permission. | Later approved admin surface or U05 boundary where included |
| Support trace available | Correlation id on denial/audit-sensitive path. | `apps/auth`, `apps/reference-data`, observability views |

## BFF Route Placeholders

| Route placeholder | U02 interaction | Completed by |
|---|---|---|
| `apps/auth/app/api/session` | Calls effective-permissions/session summary API. | U05 |
| `apps/auth/app/api/access/request` | Uses deny reason and subject context for request-access capture/routing. | U05 |
| `apps/reference-data/app/api/reference-data/*` | Calls U02 before protected reference mutations or read-only-state decisions. | U06 |
| `apps/reference-data/app/api/contracts/identity` | Exposes contract metadata for Identity Authorization OpenAPI. | U07 |

## Shared Type Placeholders

| Type | Package | Purpose |
|---|---|---|
| `SessionSummary` | `@erp/auth` | Safe display/session payload. |
| `AuthorizationDecisionDto` | `@erp/shared-types` or generated OpenAPI client | Decision payload used by BFFs. |
| `AccessDeniedViewModel` | `@erp/auth` / app local | User-readable denied state with correlation id. |
| `RoleSummary` | `@erp/auth` | Safe role display model. |
| `PermissionSummary` | `@erp/auth` | Optional safe permission display model. |

## Validation Rules

- Frontend apps must call U02 only through BFF route handlers or server-side utilities.
- UI code must treat denied mutation decisions as authoritative even if controls were visible.
- Access-denied messages must be supportable but must not expose sensitive authorization internals.
- Correlation id must remain visible enough for support and audit troubleshooting.
- U02 frontend artifacts must not implement complete sign-in, callback, sign-out, or reference-data screens.

## Out of Scope

- Full `apps/auth` page and route implementation.
- Full `apps/reference-data` authorization-aware UI.
- Permission-review administration screens unless approved in a later workflow.
- Charge, Booking, or Container Movement routes or screens.
