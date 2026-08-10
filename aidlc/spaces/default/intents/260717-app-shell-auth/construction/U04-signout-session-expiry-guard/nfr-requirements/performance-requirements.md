# Performance Requirements - U04 Sign-Out and Session Expiry Guard

## Source Context

These performance requirements consume U04 `business-logic-model.md`, U04 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U04 uses existing `POST /api/auth/sign-out`, Keycloak logout redirect, protected shell routes, and Booking BFF guards.

## Local Acceptance Targets

| ID | Requirement | Measurement |
| --- | --- | --- |
| PERF-01 | User-menu sign-out request should receive redirect or controlled error within 3 seconds p95 in local proof, excluding cold start. | Scenario timestamps. |
| PERF-02 | Post-sign-out `/` and `/booking` route checks should require login within 3 seconds p95. | Scenario timestamps. |
| PERF-03 | Stale Booking BFF call should fail before backend fetch within 1 second p95 because no external service call is required after missing actor detection. | BFF test/timing evidence. |
| PERF-04 | No retry loops or polling are introduced after sign-out. | Browser/network trace. |

## Resource Constraints

- Use existing auth sign-out route and cookie helper.
- Do not add client global session libraries or new auth runtime services.
- BFF stale-call guard is request-scoped and cheap.

## Evidence

Performance evidence includes sign-out timing, protected-route reauth timing, stale-call fail-closed timing, pre-sign-out subject, and correlation ids.

## Architecture Review - NFR Requirements

Verdict: READY.

Required changes: none.

Checks passed:

- Required-sections and upstream-coverage sensors passed for the U04 `nfr-requirements` output directory.
- Upstream coverage is explicit: each NFR artifact references U04 `business-logic-model.md`, U04 `business-rules.md`, `requirements.md`, and the stack context carried by prior design decisions.
- Performance targets are local Construction targets, bounded to sign-out redirect/error, protected-route reauth, and stale BFF early-return timing. They do not claim unsupported production SLOs.
- Security targets cover the existing `POST /api/auth/sign-out`, `lc_session` clear semantics, Keycloak logout redirect, protected route reauth, missing actor `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED`, and no post-sign-out backend `local-user` call.
- Scalability and reliability targets remain implementable: session authority stays server-readable, BFF guards are request-scoped, no polling/background services/shared cache are introduced, and runtime blockers remain honest W2-01 blockers.
- Tech-stack constraints are coherent with the repository and upstream design: existing Next.js/React/TypeScript/auth routes are reused, and no prohibited frontend libraries or parallel auth provider are allowed.
