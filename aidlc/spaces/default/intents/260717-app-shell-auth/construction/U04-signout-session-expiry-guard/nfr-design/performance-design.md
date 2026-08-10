# Performance Design - U04 Sign-Out and Session Expiry Guard

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It implements local Compose/Nginx performance design for existing auth sign-out, protected-route reauth, and stale Booking BFF early return.

## Design Decisions

| Decision | Design | Requirement coverage |
| --- | --- | --- |
| PERF-D01 | Shell user-menu sign-out posts to existing `POST /api/auth/sign-out`; do not add a parallel logout path. | PERF-01, SEC-01 |
| PERF-D02 | Preserve the auth-owned redirect to Keycloak logout with `post_logout_redirect_uri=/signed-out` and `lc_session` deletion. | PERF-01, SEC-02, SEC-03 |
| PERF-D03 | Re-check server-readable session on post-sign-out `/` and `/booking`; protected content must not render from stale client state. | PERF-02, REL-02 |
| PERF-D04 | Stale Booking BFF calls fail before `serviceHeaders` and backend fetch when actor resolution returns no subject. | PERF-03, SEC-05, SEC-07 |
| PERF-D05 | Do not add retry loops, polling, client global session libraries, or new auth runtime services. | PERF-04, SCALE-03 |

## Latency Budget

| Segment | Local target | Notes |
| --- | --- | --- |
| User-menu sign-out request through Nginx | 3 seconds p95 | Excludes first container cold start; redirect or controlled error is acceptable. |
| Auth sign-out route | Inside 3 second sign-out target | Existing handler builds Keycloak logout redirect and clear-cookie header. |
| Post-sign-out `/` and `/booking` checks | 3 seconds p95 | Server route guard must require login after `lc_session` is cleared. |
| Stale BFF actor guard | 1 second p95 | Missing actor is local request logic; no external backend fetch is needed. |

## Optimization Strategy

- Keep sign-out as one server-owned request/redirect flow.
- Keep stale-call guard request-scoped and cheap by resolving actor before service header construction.
- Avoid background session polling and automatic reauth loops after sign-out.
- Capture timing at scenario boundaries and BFF early-return evidence instead of adding instrumentation services.
- Avoid dependencies prohibited by `tech-stack-decisions.md`: Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Preservation Boundary

U04 NFR Design preserves prior merged work by explicit boundary:

| Prior work | U04 NFR boundary |
| --- | --- |
| W0-01 platform/eventing | Do not redesign eventing, outbox, messaging, telemetry, or platform correlation infrastructure. U04 only carries existing correlation id through stale-call and evidence records. |
| W0-02 reference-data | Do not change reference-data seed/completeness surfaces or migrate reference-data UI. U04 preserves `local.reference.admin` identity semantics and does not alter reference-data behavior. |
| W1-01 Booking | Preserve existing Booking read/detail behavior and W1 waiver wording. U04 changes stale-call guarding only; it does not redefine Booking fields, queries, create/detail/action flows, or W1 live-proof status. |
| W2-02 design-system foundation | Do not add a broad design-system foundation or new styling stack. U04 may consume existing user-menu/state primitives and must record gaps without taking ownership of W2-02. |

## Measurement Design

U04 evidence should record:

- Sign-out request start/end through Nginx.
- Redirect or controlled-error result.
- `Set-Cookie` or browser observation proving `lc_session` cleared.
- Post-sign-out `/` and `/booking` route checks requiring login.
- Stale BFF call early return with `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED`.
- Backend logs/request counters showing no post-sign-out `X-LinerCore-Actor-Id: local-user`.

Performance PASS is not valid if sign-out is client-only, if protected routes still render stale content, or if evidence rewrites the W1 live-proof waiver as PASS.

