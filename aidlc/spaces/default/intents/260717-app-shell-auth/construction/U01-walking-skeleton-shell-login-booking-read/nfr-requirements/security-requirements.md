# Security Requirements - U01 Walking Skeleton

## Source Context

These security requirements consume U01 `business-logic-model.md`, U01 `business-rules.md`, `requirements.md`, and `technology-stack.md`. They apply STRIDE-style controls to the U01 data flow: Nginx -> `apps/shell` -> existing auth/Keycloak -> session summary -> Booking BFF read -> booking-service read.

## Authentication and Token Protection

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-01 | Protected shell routes require server-side session validation before rendering business content. | Route tests and live no-session redirect evidence. |
| SEC-02 | Raw OAuth/OIDC access and refresh tokens remain server-side and are not exposed to browser JavaScript, local storage, session storage, or client-visible props. | Code review and browser storage check. |
| SEC-03 | U01 sign-in reuses existing `apps/auth`/Keycloak routes and `packages/auth` DTOs; no parallel auth mechanism is introduced. | Dependency/route review. |

## Authorization and Actor Integrity

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-04 | Booking BFF read calls require a session-derived actor subject before calling `serviceHeaders`. | Unit/integration test for missing actor and live evidence. |
| SEC-05 | Protected U01 paths must not synthesize or retry as `local-user`. | Detector 6d scope, tests, and backend actor evidence. |
| SEC-06 | booking-service rejects blank `X-LinerCore-Actor-Id` for protected read paths except explicit local/test bypass that is profile-gated and logged. | Backend tests and log/evidence review. |
| SEC-07 | Correlation id propagates through shell/BFF/backend evidence for the U01 read. | Live evidence package. |

## Threat Considerations

| Threat | Control |
| --- | --- |
| Spoofed actor header from browser | Browser does not set service headers directly; BFF derives actor server-side from session. |
| Token disclosure through shell UI | Only safe session summary reaches UI; raw tokens are not serialized. |
| Elevation via local bypass | Protected shell path suppresses implicit `local-user`; bypass remains local/test only and logged. |
| Repudiation of Booking read | Actor and correlation id are captured in U01 evidence. |

## Compliance and Audit

U01 handles internal authenticated subject data and operational Booking data. Evidence must be audit-friendly but QA-safe: subject id, actor header, route/action, status, and correlation id are allowed; raw tokens and secrets are prohibited.
