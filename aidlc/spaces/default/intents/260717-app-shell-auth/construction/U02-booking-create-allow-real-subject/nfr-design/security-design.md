# Security Design - U02 Booking Create Allow

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U02 security design makes the real-subject Booking create path fail closed unless identity-service authorizes the session-derived actor.

## Authentication and Actor Design

| Control | Design |
| --- | --- |
| Protected create route | Shell `/booking/new` requires the U01 server-side session guard before rendering or submitting. |
| Actor derivation | Booking BFF derives `actorSubjectId` from the safe server-side session summary and never from browser-submitted form data. |
| Header construction | `serviceHeaders(correlationId, actorSubjectId, idempotencyKey?)` requires a non-blank actor before calling booking-service. |
| Token boundary | Raw OAuth/OIDC tokens, service tokens, and secrets remain server-side and are not serialized into UI, browser storage, logs, or evidence. |

## Authorization Design

| Control | Design |
| --- | --- |
| Allow fixture | Seed/catalog setup adds or verifies `local.booking.user` with `booking-desk` access and Booking `read`/`create` permissions. |
| Deny fixture preservation | `local.reference.admin` remains without Booking permissions for the later deny proof. |
| Backend authorization | booking-service calls identity-service `POST /internal/identity/authorize` before mutation with resource `booking`, action `create`, caller `booking-service`, subject from `X-LinerCore-Actor-Id`, and correlation id. |
| Fail-closed outcomes | Deny, unknown subject, missing subject, timeout, identity-service error, or malformed authorization response prevents mutation. |
| Detail read | Created Booking detail read uses the same session-derived actor and Booking `read` permission semantics. |

## Data Protection

- Keep create payload validation and command body guards from W1.
- Keep idempotency key handling server-side and do not accept a missing or invalid key where the current API requires one.
- Evidence may include QA-safe actor, action `booking:create`, decision, Booking id/reference, route/action, outcome, and correlation id.
- Browser requests are not authority for service identity headers.

## Threat Controls

| Threat | Mitigation |
| --- | --- |
| Write without authorization | booking-service authorization adapter blocks command execution unless identity-service returns allow. |
| Actor spoofing | BFF derives actor server-side and ignores browser-provided actor authority. |
| Privilege expansion through seeds | Catalog diff/evidence proves only `local.booking.user` gains Booking allow permissions while `local.reference.admin` remains denied. |
| Replay/double submit | Existing idempotency semantics remain enforced by BFF/backend. |
| Token disclosure | HttpOnly session plus safe session summary; no raw token in browser-visible state or evidence. |

## Verification Design

- Integration tests cover identity allow before mutation and deny/error/timeout preventing mutation.
- BFF/backend tests cover missing actor rejection and no `local-user` fallback.
- Seed/catalog review covers `local.booking.user` allow and `local.reference.admin` preservation.
- Live proof records created Booking id and matching authorized actor/correlation evidence.

