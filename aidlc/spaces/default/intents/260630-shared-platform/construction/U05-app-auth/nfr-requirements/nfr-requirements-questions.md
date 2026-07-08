# NFR Requirements Questions - U05 Auth Frontend App

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Auth security posture

How should U05 handle OIDC tokens and sessions?

A. Keep code exchange, token validation, refresh handling, and logout coordination server-side in BFF utilities; browser JavaScript receives no tokens or secret claims (recommended)
B. Store tokens in browser local storage for simpler calls
C. Let browser code call Keycloak and backend services directly
X. Other (please specify)

[Answer]: A. Server-side BFF session handling (Recommended)

## Q2. Session cookie posture

Which cookie model should U05 use?

A. HttpOnly session cookies with secure same-site behavior appropriate to the environment (recommended)
B. JavaScript-readable session state
C. No app session, only Keycloak browser state
X. Other (please specify)

[Answer]: A. HttpOnly secure session cookies (Recommended)

## Q3. Access denied UX

What must access-denied and auth error states expose?

A. Safe user-readable reason, denied application/resource where appropriate, request-access action, and correlation id without policy internals or token details (recommended)
B. Raw provider errors and claims for debugging
C. Generic blank error page
X. Other (please specify)

[Answer]: A. Safe supportable errors (Recommended)

## Q4. Accessibility scope

Which accessibility target applies to U05?

A. WCAG 2.1 AA expectations for sign-in, callback/error, sign-out, access denied, session display, and request-access paths (recommended)
B. Accessibility only after MVP
C. Keyboard support only
X. Other (please specify)

[Answer]: A. WCAG 2.1 AA-oriented MVP paths (Recommended)

## Q5. Performance scope

How should U05 treat performance?

A. Keep auth/session BFF routes responsive, avoid unnecessary client bundles, and measure Keycloak and identity-service dependency latency separately (recommended)
B. Define all platform read latency targets here
C. Defer all performance checks
X. Other (please specify)

[Answer]: A. Responsive app/BFF auth paths (Recommended)

## Ambiguity Analysis

- `business-rules.md` fixes no-token-in-browser, HttpOnly cookies, state/nonce validation, safe summaries, no permission-review administration, and WCAG expectations.
- `requirements.md` fixes Keycloak, frontend stack, accessibility, observability, CI, and on-prem constraints.
- No follow-up questions are needed for U05 because final permission administration is explicitly out of scope.

