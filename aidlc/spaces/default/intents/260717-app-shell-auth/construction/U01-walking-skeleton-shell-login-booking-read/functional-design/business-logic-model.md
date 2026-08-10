# Business Logic Model - U01 Walking Skeleton

## Source Context

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U01 covers the walking skeleton from Nginx to `apps/shell`, existing auth/Keycloak, session summary, Booking BFF read, booking-service read, and evidence that the actor is not `local-user`.

## Workflow

| Step | Actor/component | Input | Processing | Output |
| --- | --- | --- | --- | --- |
| 1 | Browser/Nginx | Request to `/` or `/booking` | Route request to `apps/shell`; preserve or create correlation id where supported. | Shell request context. |
| 2 | Shell protected route | Request cookies and route | Call `requireShellSession`; if no valid session, redirect to existing `apps/auth` sign-in/Keycloak flow. | `SessionSummary` or redirect. |
| 3 | Existing auth/Keycloak | Unauthenticated request | Complete sign-in and callback using existing auth routes. | HttpOnly `lc_session` cookie. |
| 4 | Shell landing | `SessionSummary` | Render top bar, navigation, breadcrumbs, user menu, and Booking nav entry without exposing raw tokens. | Authenticated shell UI. |
| 5 | Booking read adapter | Route `/booking`, session subject, correlation id | Resolve actor through `requireBookingActor`; call Booking BFF read path with actor and correlation. | Booking read request headers. |
| 6 | Booking BFF | Actor, service id/token, correlation | Build `serviceHeaders(correlationId, actorSubjectId, idempotencyKey?)`; reject missing subject. | HTTP request to booking-service. |
| 7 | booking-service | `X-LinerCore-Actor-Id`, service headers | Execute existing read/list behavior; reject blank actor instead of defaulting to `local-user`. | Booking list/read response or fail-closed error. |
| 8 | Evidence capture | Response, logs/audit, correlation | Capture actor and correlation evidence for U01 live proof. | Evidence under `artifacts/w2-01-live/app-shell-auth/` or Bolt-local child path. |

## Decision Flow

```text
----------------------+
| Request shell route |
+----------+-----------+
           |
           v
    Session present?
      /          \
    no            yes
    |              |
    v              v
 Redirect      Actor subject
 to auth       present?
                 /    \
               no      yes
               |        |
               v        v
          Fail closed  Booking read
                       with actor
```

Text fallback: U01 first requires a valid session. If no session exists, the user enters the existing auth flow. If a session exists but has no subject, the Booking path fails closed. Only a session with a real subject can call booking-service.

## Data Transformations

| Source data | Transformation | Consumer | Constraint |
| --- | --- | --- | --- |
| `AuthSession` cookie | Convert with `safeSessionSummary` or a shell wrapper to `SessionSummary`. | Shell layout and Booking actor resolver. | Raw access/refresh tokens stay server-side. |
| `SessionSummary.subject` or equivalent | Normalize to `actorSubjectId`. | `serviceHeaders` and Booking BFF read calls. | Must not be empty and must not default to `local-user`. |
| Incoming correlation id | Preserve existing id or create a request correlation id. | Booking BFF and booking-service evidence. | Include in logs/evidence for live proof. |
| Booking service response | Map to shell-mounted Booking list/read state. | `/booking` UI. | Preserve existing W1 read/list behavior. |

## Error and Edge Cases

| Condition | Behavior | Evidence requirement |
| --- | --- | --- |
| No session cookie | Redirect to existing auth/Keycloak; do not render protected Booking content. | Browser proof of redirect. |
| Invalid/expired session | Redirect or fail closed through auth; protected shell does not render stale Booking data. | Route/session evidence. |
| Session summary has no subject | Stop before booking-service call; render authentication-required or shell error with correlation id. | Evidence that no `local-user` retry occurred. |
| Booking BFF receives missing actor | Return fail-closed response; no backend request as `local-user`. | BFF test/log evidence. |
| booking-service receives blank actor | Reject blank actor except explicit local/test bypass; do not synthesize `local-user`. | Backend test/log evidence. |
| Booking read fails | Render existing recoverable error state in shell with correlation id. | Error evidence, not a fake success. |

## Traceability

| Requirement/story | U01 behavior |
| --- | --- |
| FR-01, FR-02, FR-03, US-01 | Protected shell entry, existing auth flow, safe session summary, token non-exposure. |
| FR-05, FR-10, NFR-03, US-02 | Session-derived actor and correlation reach the Booking read path. |
| FR-09, NFR-07, US-03 | Shell navigation remains scoped and uses approved frontend patterns. |
| NFR-08, US-04 | Live proof runs on Compose/Nginx with shell/auth/Booking runtime. |

## Architecture Review - Iteration 1

Verdict: READY

Findings:

1. Upstream coverage is present. The U01 functional design artifacts reference `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, and the design stays inside the resolved walking-skeleton boundary: Nginx -> `apps/shell` -> existing auth/Keycloak -> session helper -> Booking BFF read -> booking-service read.
2. The vertical implementation path is concrete enough for construction. The design names the shell route guard, session summary conversion, `requireBookingActor`, the `serviceHeaders(correlationId, actorSubjectId, idempotencyKey?)` contract, booking-service blank-actor rejection, and U01 evidence capture. These match the existing code seams that currently need hardening.
3. Security and failure behavior are coherent. Missing session redirects through auth, missing subject fails closed before Booking calls, raw tokens remain server-side, `local-user` is not accepted as a protected-path fallback, and correlation id evidence is required.
4. Scope discipline is preserved. Create allow, deny path, sign-out, route compatibility, final detector/audit packaging, and broad prior-work preservation evidence remain assigned to later units; U01 only preserves their boundaries.
5. Constraints are carried. NFR-07 prohibited frontend libraries are explicit, W0-01/W0-02/W1-01/W2-02 are consumed through stable interfaces, and the W1 waiver remains BLOCKED at `compose-start`.

Required changes: none.
