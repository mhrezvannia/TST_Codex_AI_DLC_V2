# User Flow - W2-01 App Shell and Auth

## Source Context

This flow consumes `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`. It maps U01 through U04 from the approved W2-01 backlog.

## Primary Flow

```
[Start]
  |
  v
[Open LinerCore shell URL through Nginx]
  |
  v
{Session exists?}
  | no
  v
[Redirect to auth / Keycloak]
  |
  v
[Successful login]
  |
  v
[Shell landing]
  |
  v
[Select Booking]
  |
  v
[Booking list mounted in shell]
  |
  v
[Open or create Booking]
  |
  v
[BFF sends request with real subject + correlation]
  |
  v
[Booking backend authorizes via identity-service]
  |
  +-- allowed --> [Booking action succeeds and audit shows real subject]
  |
  +-- denied  --> [Access denied inside shell]
  |
  v
[User menu sign out]
  |
  v
[Session cleared]
  |
  v
[Protected route redirects to login again]
```

## Flow to Proto-Unit Mapping

| Flow segment | Proto-unit | Acceptance signal |
|---|---|---|
| Open shell URL -> login redirect -> shell landing | U01 | Protected route and auth app flow work through Nginx/Keycloak. |
| Shell/Booking request -> BFF -> backend real subject | U02 | Backend/audit evidence shows session subject, not `local-user`. |
| Shell nav, breadcrumbs, user menu, denied path, sign-out | U03 | User can navigate and recover; denied user sees clear state; sign-out clears session. |
| Booking list/detail/action in shell plus live evidence | U04 | Booking runs mounted inside shell and audits are green. |

## Error and Recovery Paths

- Login fails: stay in auth flow with a clear error and retry action.
- User lacks Booking role: show access-denied surface inside shell with request-access action.
- Session expires: protected route returns user to sign-in and preserves a safe return target.
- Booking backend denies or cannot resolve subject: show action failure and correlation id; do not silently retry as `local-user`.
- Compose dependency is unavailable: live proof is blocked, not passed.

## Accessibility Flow Requirements

- Keyboard path reaches skip link, nav, user menu, Booking actions, denied/request-access actions, and sign-out.
- Route changes update document title and `h1`.
- Status changes use text and live regions where appropriate.
- Denied/error states include actionable recovery, not color-only indicators.

## Product Guardrails

- The flow proves W2-01 only.
- W1 live-proof waiver remains explicit.
- Non-mounted modules must not appear complete.
- Real subject propagation is part of the UX because the user/session shown in shell must match backend evidence.
