# Business Rules - U02 Booking Create Allow

## Source Context

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They govern the live allow path for `local.booking.user`.

## Identity and Permission Rules

| Rule | Statement |
| --- | --- |
| ID-01 | `local.booking.user` must exist as a deterministic live-proof subject before U02 closes. |
| ID-02 | `local.booking.user` must have `booking-desk` access plus Booking permissions equivalent to `booking:read` and `booking:create`; confirm, validate, and price permissions are added if preserved W1 actions require them. |
| ID-03 | `local.reference.admin` remains without Booking permissions; U02 must not accidentally grant the deny fixture Booking access. |
| ID-04 | Shell and BFF role hints may improve UX, but booking-service authorization through identity-service is the allow-path authority. |

## Authorization Rules

| Rule | Statement |
| --- | --- |
| AUTHZ-01 | booking-service calls identity-service `/internal/identity/authorize` before executing the protected create command. |
| AUTHZ-02 | The authorization request uses the real actor subject from `X-LinerCore-Actor-Id`, resource `booking`, action `create`, caller `booking-service`, and correlation id. |
| AUTHZ-03 | Deny, unknown subject, missing subject, timeout, or identity-service error all fail closed; no Booking is created. |
| AUTHZ-04 | Allow decisions and create outcomes are recorded in audit/log/evidence with the real subject and correlation id. |

## Booking Create Rules

| Rule | Statement |
| --- | --- |
| BOOK-01 | Existing W1 Booking create validation and persistence semantics remain authoritative. |
| BOOK-02 | U02 may change actor/session propagation and authorization only; it must not redefine Booking domain fields or lifecycle states. |
| BOOK-03 | A successful create must be followed by detail retrieval at canonical `/booking/[id]`. |
| BOOK-04 | Idempotency keys remain required or preserved where existing Booking create behavior expects them. |

## Frontend Rules

| Rule | Statement |
| --- | --- |
| UI-01 | `/booking/new` and `/booking/[id]` render inside `apps/shell` chrome. |
| UI-02 | Form and detail behavior reuse existing Booking UI semantics. |
| UI-03 | Frontend implementation follows existing Next.js/React/TypeScript patterns and does not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |
| UI-04 | Raw OAuth/OIDC tokens are never passed to client-side code or form state. |

## Evidence Rules

| Rule | Statement |
| --- | --- |
| EVID-01 | U02 proof must show `local.booking.user` or equivalent Keycloak subject on create and detail requests. |
| EVID-02 | Evidence must include identity-service allow decision or service logs sufficient to trace the allow. |
| EVID-03 | The created Booking must be retrievable in shell at `/booking/[id]`. |
| EVID-04 | W1 live-proof waiver stays BLOCKED at `compose-start`; U02 create evidence does not rewrite prior W1 status. |
