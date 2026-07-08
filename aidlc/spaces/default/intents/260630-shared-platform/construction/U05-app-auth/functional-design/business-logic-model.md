# Business Logic Model - U05 Auth Frontend App and BFF

## Source Trace

This U05 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Unit Purpose

U05 implements `apps/auth`, the Shared Platform internal authentication entrypoint and BFF session surface. It starts and completes Keycloak-backed sign-in, establishes a server-managed app session, exposes a safe current-session view, handles sign-out, renders access-denied states, and captures or routes request-access intent.

U05 does not authenticate users itself, store passwords, implement customer-facing identity, or own full permission-review administration.

## Sign-In Workflow

```text
User opens sign-in route
  -> app renders SignInPage
  -> user invokes sign in
  -> BFF creates state/nonce/pkce verifier
  -> BFF stores transient values in secure HttpOnly cookie
  -> BFF redirects to Keycloak authorization endpoint
```

Decision points:

| Decision | Behavior |
|---|---|
| Existing valid session? | Redirect to return URL or session page. |
| Missing configured Keycloak client? | Return safe configuration error with correlation id. |
| Invalid return URL? | Use approved default app route. |

## Callback Workflow

```text
Keycloak redirects to callback
  -> BFF validates state, nonce, and PKCE verifier
  -> BFF exchanges authorization code server-side
  -> BFF validates token response
  -> BFF creates server-side session / HttpOnly cookie envelope
  -> BFF calls identity-service for effective permissions/session summary
  -> BFF redirects to requested return URL or session page
```

Failure outcomes:

| Failure | Result |
|---|---|
| State/nonce mismatch | Clear transient cookies and show safe auth error. |
| Code exchange failure | Clear transient cookies and show retry/support message. |
| Identity authorization denial | Redirect to access denied with correlation id. |
| Session creation failure | Clear partial session and show safe auth error. |

## Current Session Workflow

```text
Client or server requests current session
  -> BFF reads server-side session cookie
  -> BFF verifies session validity
  -> BFF calls or uses cached identity-service session summary
  -> BFF returns safe SessionSummary
```

Safe session summary includes user display name, internal subject id, email where permitted, platform roles, permission summaries where allowed, policy version, and correlation id. It excludes access tokens, refresh tokens, secret claims, and raw Keycloak internals.

## Sign-Out Workflow

```text
User invokes sign out
  -> BFF clears app session cookie
  -> BFF builds Keycloak logout redirect if configured
  -> BFF redirects to signed-out page
```

If Keycloak logout cannot be built, local session is still cleared and the user sees a signed-out state with a correlation id for support.

## Access Denied Workflow

```text
Protected route detects denied decision
  -> route redirects to /access-denied with safe reason and correlation id
  -> AccessDeniedPage renders reason, support trace, and request-access action
  -> user may start request-access workflow
```

The page must not reveal raw permission internals or token claims.

## Request Access Workflow

```text
User submits request-access
  -> BFF validates message/context
  -> BFF attaches current safe session summary and requested resource/action
  -> BFF records or routes request according to MVP support channel
  -> UI confirms submission or displays support instructions
```

U05 captures enough information for a human/security process without implementing a full permission-review administration system.

## Route Protection Workflow

```text
proxy.ts receives route request
  -> identify protected route pattern
  -> check session cookie presence and basic shape
  -> redirect unauthenticated users to sign-in with return URL
  -> allow authenticated requests to route handlers/pages
```

Authoritative authorization still happens through BFF/server calls to `identity-service` or service APIs. Route protection is a UX/session guard, not the only security control.

## Integration Workflows

| Integration | Direction | Contract |
|---|---|---|
| Browser to `apps/auth` | HTTPS via Nginx | Next.js routes and BFF endpoints. |
| `apps/auth` BFF to Keycloak | Server-side OIDC | Authorization code + PKCE, token exchange, logout. |
| `apps/auth` BFF to `identity-service` | Server-side REST/OpenAPI | Effective permissions/session summary. |
| `apps/auth` to shared packages | TypeScript imports | `@erp/auth`, `@erp/api-core`, `@erp/ui`, `@erp/shared-types`. |

## Walking Skeleton Support

U05 supports the walking skeleton by:

- Rendering a sign-in page.
- Completing a local/dev Keycloak callback.
- Establishing a server-managed session.
- Showing current user and platform roles.
- Rendering access-denied with a correlation id.
- Proving browser JavaScript cannot access token values.

## Non-Goals

- No custom identity provider.
- No password reset, user registration, or customer self-service.
- No full security-admin role administration UI.
- No reference-data admin screens.
- No Charge, Booking, or Container Movement UI routes.
