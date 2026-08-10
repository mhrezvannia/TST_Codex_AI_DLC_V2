# Security Design - U01 Walking Skeleton

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It designs the U01 authentication, actor propagation, token protection, and audit controls.

## Authentication Design

| Control | Design |
| --- | --- |
| Protected shell route | `apps/shell` uses a server-side `requireShellSession` guard before rendering `/` or `/booking`. |
| Existing auth reuse | Missing session redirects through existing `apps/auth`/Keycloak routes; no parallel auth mechanism is introduced. |
| Session summary | Shell consumes a safe session summary only; raw OAuth/OIDC tokens are not serialized to browser JavaScript. |
| Local bypass | Protected W2-01 shell paths must not implicitly create `local-user`; any local/test bypass remains profile-gated and logged. |

## Authorization and Actor Design

| Control | Design |
| --- | --- |
| Actor resolver | `requireBookingActor(request)` derives actor subject from the server-side session summary. |
| BFF header contract | `serviceHeaders(correlationId, actorSubjectId, idempotencyKey?)` requires a non-blank actor subject before any backend fetch. |
| Backend safety net | booking-service rejects blank `X-LinerCore-Actor-Id` on protected read paths except explicit local/test bypass. |
| Browser trust boundary | Browser requests never provide service identity headers as authority; BFF constructs service headers server-side. |

## Data Protection

- HttpOnly session cookie remains the session transport.
- No raw access token, refresh token, service token, or secret is rendered into shell props, local storage, session storage, logs, or evidence.
- Evidence may include QA-safe fields only: subject id, actor header, route/action, outcome, and correlation id.

## Threat Controls

| Threat | Mitigation |
| --- | --- |
| Spoofed actor | BFF derives actor from session and ignores browser-provided actor authority. |
| Elevation through `local-user` fallback | Protected shell/BFF/backend path fails closed when actor is missing. |
| Token disclosure | Safe session summary and HttpOnly cookie; no token in browser-visible state. |
| Repudiation | Correlation id and actor evidence are captured for the Booking read. |

## Verification Design

- Unit/integration tests cover no-session redirect, missing-actor fail-closed, and backend blank-actor rejection.
- Live proof captures a non-`local-user` actor and correlation id.
- Detector 6d later confirms mounted shell/Booking surfaces do not depend on hardcoded auth.
