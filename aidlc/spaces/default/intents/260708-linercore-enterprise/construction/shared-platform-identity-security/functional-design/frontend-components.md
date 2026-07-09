# Frontend Components - shared-platform-identity-security

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The unit supports authenticated Enterprise Web shell behavior, route/action permissions, denied access states, and optional read-only/admin capability visibility. Business workflow screens remain owned by their module units.

## Component Scope

Frontend support includes:

- Session bootstrap and sign-in/sign-out integration.
- Effective-permission loading.
- Route guards and action guards.
- Denied access state.
- Capability/role administration or read-only support where approved.
- Authorization audit lookup links where useful.

It does not implement pricing, booking, CMM, D&D, or reference-data business UI.

## Component Hierarchy

```text
AuthShellProvider
  |
  +-- SessionBoundary
  +-- PermissionProvider
  +-- RouteGuard
  +-- ActionGuard
  +-- AccessDeniedView
  +-- CapabilityAdminView
```

Text fallback: the auth shell loads session and permissions, route/action guards use those permissions, denied users see an access-denied state, and optional admin views expose capabilities safely.

## Component Responsibilities

### SessionBoundary

- Detect authenticated session.
- Redirect unauthenticated users to sign-in.
- Handle sign-out.
- Avoid exposing raw tokens to components.

### PermissionProvider

- Fetch effective permissions from Identity.
- Cache permissions for the session.
- Refresh on role/capability changes where supported.

### RouteGuard and ActionGuard

- Check required capability before rendering protected route or command.
- Render `AccessDeniedView` on denial.
- Never replace backend authorization enforcement.

### CapabilityAdminView

- Show roles, capabilities, assignments, and audit links where authorized.
- Avoid broad editing unless approved by service design and tests.

## UI Validation Rules

- Route hiding is not sufficient authorization.
- Denied-path UI tests must pair with backend denied-path tests.
- UI must not enable local auth bypass outside local mode.
- UI must not expose token secrets.
- UI permission failures must be auditable through Identity where configured.

## Traceability

| Source | Frontend coverage |
|---|---|
| `unit-of-work.md` | U03 requires Keycloak-backed authentication and role/capability authorization. |
| `unit-of-work-story-map.md` | US-SP-001 and US-SP-002 require login and permission enforcement; US-SP-005 requires traceable decisions. |
| `requirements.md` | FR-SP-002, FR-SP-003, and NFR-SEC requirements drive UI auth support. |
| `components.md` | Enterprise Web enforces route/action permissions from Identity Service. |
| `component-methods.md` | Permission method shapes inform provider/guard data contracts. |
| `services.md` | Enterprise Web calls service APIs and does not own business rules. |

