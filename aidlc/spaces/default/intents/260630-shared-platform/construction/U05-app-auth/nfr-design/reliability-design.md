# Reliability Design - U05 Auth Frontend App

## Reliability Goals

U05 must fail safely through sign-in, callback, current-session, sign-out, access-denied, request-access, and route-protection flows. Failures clear partial or unsafe auth state, preserve support correlation, and avoid exposing token or provider internals.

## Sign-In and Callback Reliability

Existing valid sessions redirect to the validated return URL or default session route. Missing Keycloak configuration returns a safe configuration error with correlation id. State, nonce, or PKCE mismatch clears transient cookies and fails safely. Token exchange failure clears transient cookies and shows retry/support guidance.

Session creation only succeeds after token validation and identity-service session summary retrieval or an explicitly recoverable session-summary outcome. Partial sessions are cleared on failure.

## Current Session and Route Protection

Invalid or expired app sessions return unauthenticated state without exposing internals. `proxy.ts` redirects unauthenticated users to sign-in with a validated return URL and allows authenticated requests through to route handlers; it is intentionally not the sole authorization control.

Identity-service summary failure returns a recoverable session/authorization state that does not expose tokens and allows support diagnosis through correlation id.

## Sign-Out and Access Denied

Sign-out clears the local app session even if the Keycloak logout redirect cannot be built. Users still land on a stable signed-out state with correlation id where needed.

Access-denied renders stable guidance, safe reason text, correlation id, and request-access action. It must not break into raw error pages or leak permission internals.

## Request Access

Request-access validation is bounded and non-mutating with respect to permissions. If the route target or storage/routing mechanism fails, U05 shows support instructions or queued-failure guidance without granting access.

## Health, Smoke, and Recovery

The app/BFF health route supports Nginx, smoke checks, and staging readiness. Smoke coverage should prove sign-in or approved local equivalent, session display, access-denied rendering, local sign-out clearing, and correlation id evidence. Accessibility checks cover sign-in, signed-out, access-denied, session display, and request-access states.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
