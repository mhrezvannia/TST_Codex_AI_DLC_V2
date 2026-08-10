# Business Rules - U01 Walking Skeleton

## Source Context

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They apply only to U01: protected shell login, session handoff, one Booking read, real actor propagation, and live evidence.

## Authentication Rules

| Rule | Statement | Source |
| --- | --- | --- |
| AUTH-01 | Protected shell routes require a valid server-side session before rendering business content. | FR-01, FR-02, US-01 |
| AUTH-02 | No raw access token or refresh token is exposed to browser JavaScript, local storage, session storage, or client-side state. | FR-03, NFR-01 |
| AUTH-03 | Unauthenticated access to `/` or `/booking` through Nginx redirects into existing `apps/auth`/Keycloak behavior. | FR-02, `services.md` |
| AUTH-04 | A session that cannot produce a subject is not a Booking actor and must fail closed. | FR-05, NFR-02 |

## Actor Propagation Rules

| Rule | Statement | Enforcement |
| --- | --- | --- |
| ACTOR-01 | Booking BFF read calls must pass a session-derived actor subject into `serviceHeaders`. | Change the `serviceHeaders` contract and its read-path callers. |
| ACTOR-02 | `serviceHeaders` must not synthesize `local-user` for protected shell/Booking paths. | Require `actorSubjectId`; reject missing actor before backend call. |
| ACTOR-03 | booking-service must reject blank `X-LinerCore-Actor-Id` on U01 protected read paths, except an explicit local/test bypass that is profile-gated and logged. | Harden `BookingApiController.actor` behavior. |
| ACTOR-04 | U01 live proof must include actor evidence showing a non-`local-user` subject and correlation id. | Evidence package for B01/U01. |

## Shell and Booking Read Rules

| Rule | Statement | Enforcement |
| --- | --- | --- |
| SHELL-01 | `apps/shell` owns canonical `/` and `/booking` user-facing routes for U01. | Nginx/shell routing and shell route handlers. |
| SHELL-02 | Booking appears as the only mounted W2-01 business module. Non-mounted modules remain disabled placeholders or links. | Navigation component rules from `mockups.md` and FR-09. |
| SHELL-03 | The U01 Booking path is read-only. Create, deny, sign-out, compatibility, and final audit behavior are later Bolt responsibilities. | `unit-of-work.md` and `bolt-plan.md`. |
| SHELL-04 | Existing W1 Booking read/list semantics are preserved; U01 only changes shell/session actor context. | NFR-06, NFR-10. |

## Frontend Constraints

| Rule | Statement |
| --- | --- |
| UI-01 | Use existing Next.js, React, TypeScript, and workspace patterns. |
| UI-02 | Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |
| UI-03 | Use stable shell layout dimensions so navigation, breadcrumbs, and user menu do not overlap at common desktop and mobile widths. |
| UI-04 | Keep shell focus and landmarks accessible enough for the walking skeleton; expanded denied/sign-out accessibility evidence belongs to later Bolts. |

## Evidence Rules

| Rule | Statement |
| --- | --- |
| EVID-01 | Direct app-port checks are supporting evidence only; U01 acceptance enters through Nginx. |
| EVID-02 | A successful U01 proof must show auth/Keycloak redirect and return to shell, `/booking` rendered inside shell, and a Booking read with non-`local-user` actor. |
| EVID-03 | Any Docker/Compose blocker is recorded as a W2-01 blocker; it is not hidden by unit tests or screenshots. |
| EVID-04 | W1's prior live-proof waiver remains BLOCKED at `compose-start`, not PASS. |
