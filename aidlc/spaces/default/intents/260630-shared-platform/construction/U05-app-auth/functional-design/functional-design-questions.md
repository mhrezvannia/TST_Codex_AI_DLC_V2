# Functional Design Questions - U05 Auth Frontend App and BFF

## Source Trace

This questions record derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Question Posture

Approved inception artifacts already resolve the U05 boundaries:

- `apps/auth` is a Next.js App Router app with BFF route handlers.
- Keycloak 24 provides OIDC authentication.
- `identity-service` provides authorization/session role details.
- Browser JavaScript never receives token values.
- Customer-facing identity and custom password storage are out of scope.
- Permission-review administration screens are not part of MVP unless approved later.

## Recorded Answers

### Q1. Where should OIDC tokens be handled?

A. Server-side BFF/session path with HttpOnly cookies; never browser JavaScript.  
B. Browser local storage for easier API calls.  
C. Shared Redux store.  
X. Other (please specify)

[Answer]: A. Server-side BFF/session path with HttpOnly cookies; never browser JavaScript.

### Q2. What app behavior is in U05?

A. Sign-in, callback, sign-out, access-denied, session display, and request-access path.  
B. Full security-admin role administration.  
C. Customer self-service identity.  
X. Other (please specify)

[Answer]: A. Sign-in, callback, sign-out, access-denied, session display, and request-access path.

### Q3. How does U05 obtain role/session information?

A. Call `identity-service` from BFF/server code and return a session-safe summary.  
B. Decode and expose all token claims in the browser.  
C. Duplicate role logic in frontend constants.  
X. Other (please specify)

[Answer]: A. Call `identity-service` from BFF/server code and return a session-safe summary.

## Ambiguity Analysis

No blocking ambiguity remains for U05 functional design. Exact Keycloak realm/client values and deployed callback URLs are environment configuration details for implementation and deployment stages.
