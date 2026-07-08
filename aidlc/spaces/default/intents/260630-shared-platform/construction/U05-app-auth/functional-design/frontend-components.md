# Frontend Components - U05 Auth Frontend App and BFF

## Source Trace

This U05 frontend component design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Route Structure

```text
apps/auth/app/
  layout.tsx
  page.tsx
  sign-in/page.tsx
  callback/route.ts
  signed-out/page.tsx
  access-denied/page.tsx
  session/page.tsx
  request-access/page.tsx
  api/
    auth/sign-in/route.ts
    auth/callback/route.ts
    auth/sign-out/route.ts
    session/route.ts
    access/request/route.ts
proxy.ts
```

## Page Components

### SignInPage

Purpose: Entry point for internal carrier users.

Behavior:

- Shows carrier/internal sign-in action.
- Posts or links to BFF sign-in route.
- Redirects already-authenticated users to validated return URL or session page.
- Provides safe error messaging when configuration or provider state is unavailable.

### CallbackRoute

Purpose: Server route handler that completes OIDC callback.

Behavior:

- Validates state/nonce/PKCE.
- Exchanges authorization code server-side.
- Creates app session through HttpOnly cookie/session storage.
- Calls `identity-service` for session-safe roles.
- Redirects to return URL, session page, or access denied.

### SignedOutPage

Purpose: Confirms local session cleared.

Behavior:

- Shows signed-out state.
- Offers sign-in action.
- Does not expose provider logout details.

### AccessDeniedPage

Purpose: Explain insufficient authorization.

Props/state:

| Item | Purpose |
|---|---|
| `reasonCode` | Safe denial reason. |
| `correlationId` | Support trace id. |
| `resourceLabel` | Requested area where safe. |
| `canRequestAccess` | Controls request-access action. |

Behavior:

- Displays correlation id.
- Links to request-access when allowed.
- Does not expose raw policies or token claims.

### SessionPage

Purpose: Troubleshooting/support view of current authenticated session.

Behavior:

- Loads safe `SessionSummary`.
- Shows display name, email where allowed, platform roles, and policy version.
- Shows no tokens or raw claims.

### RequestAccessPage

Purpose: Capture a user's access request after denial.

Behavior:

- Uses React Hook Form and Zod.
- Preserves entered message on validation failure.
- Submits through BFF route.
- Confirms submission/support routing without granting access.

## BFF Route Handlers

| Route | Purpose |
|---|---|
| `api/auth/sign-in` | Create OIDC transaction and redirect to Keycloak. |
| `api/auth/callback` | Complete callback and establish session. |
| `api/auth/sign-out` | Clear app session and redirect through logout where configured. |
| `api/session` | Return safe session summary. |
| `api/access/request` | Validate and route request-access payload. |

## Shared Components

| Component | Purpose |
|---|---|
| `AuthShell` | Consistent app frame for auth pages. |
| `SignInAction` | Button/form trigger for sign-in. |
| `SessionSummaryPanel` | Displays safe current-session fields. |
| `AccessDeniedNotice` | Denial state with support correlation id. |
| `RequestAccessForm` | Request-access form with validation. |
| `AuthErrorBanner` | Safe auth error display. |

## State and Data Flow

```text
Page/component
  -> app-local hook or server component
  -> BFF route handler
  -> Keycloak or identity-service
  -> safe DTO
  -> @erp/ui component render
```

State rules:

- Use TanStack Query for session fetch where client refresh is needed.
- Use React Hook Form/Zod for request-access form state and validation.
- Use Zustand only for bounded non-sensitive UI state if needed.
- Never store tokens in client state.

## Accessibility and UX Rules

- Sign-in and request-access controls must be keyboard accessible.
- Focus must move predictably after auth errors and form validation errors.
- Error and denied states must include visible correlation id text.
- Dynamic form validation must be announced through accessible messaging.
- Page titles and landmarks must be semantic.

## Validation Rules

- Return URLs must be internal and allowlisted.
- Request-access message must have bounded length.
- Required form fields must be validated with Zod.
- BFF responses must use the platform error envelope where applicable.
- No direct browser calls to Keycloak token endpoints or backend services.

## Out of Scope

- Full platform/security admin console.
- Reference-data admin workspace.
- Customer identity, registration, password reset, and self-service.
- Charge, Booking, or Container Movement routes.
