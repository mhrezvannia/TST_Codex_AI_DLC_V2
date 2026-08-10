# Business Rules - U03 Booking Deny

## Source Context

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They govern authenticated denied Booking access for `local.reference.admin`.

## Deny Fixture Rules

| Rule | Statement |
| --- | --- |
| DENY-01 | `local.reference.admin` remains an authenticated deterministic subject without Booking permissions. |
| DENY-02 | U02 allow-path seed changes must not grant Booking permissions to `local.reference.admin`. |
| DENY-03 | Anonymous users are not the U03 deny fixture; they should follow U01 protected-route redirect behavior. |

## Authorization Rules

| Rule | Statement |
| --- | --- |
| AUTHZ-01 | booking-service asks identity-service to authorize the requested Booking read/action for the real subject. |
| AUTHZ-02 | A deny decision prevents data disclosure and mutation. |
| AUTHZ-03 | Unknown subject, missing subject, timeout, or identity-service error fail closed and must not fall back to `local-user`. |
| AUTHZ-04 | Deny evidence includes subject, resource/action, reason or decision reference, and correlation id. |

## Shell Denied-State Rules

| Rule | Statement |
| --- | --- |
| UI-01 | Access denied renders inside the shell frame with breadcrumbs and active Booking navigation context. |
| UI-02 | Denied UI identifies the user is authenticated but unauthorized. |
| UI-03 | Denied UI provides request-access and safe-return/back actions where available. |
| UI-04 | Denied UI is keyboard reachable and does not rely on color only. |
| UI-05 | Frontend code follows existing Next.js/React/TypeScript patterns and does not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |

## Evidence Rules

| Rule | Statement |
| --- | --- |
| EVID-01 | U03 proof must show `local.reference.admin` or corresponding Keycloak subject, not `local-user`. |
| EVID-02 | Evidence must show identity-service deny or backend/BFF deny derived from identity authorization. |
| EVID-03 | Empty data, hidden navigation, or screenshots without backend evidence are not sufficient. |
| EVID-04 | W1 live-proof waiver remains BLOCKED at `compose-start`, not PASS. |
