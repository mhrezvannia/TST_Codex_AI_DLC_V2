# Scalability Design - U04 Sign-Out and Session Expiry Guard

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U04 preserves stateless session validation and request-scoped stale-call guards.

## Scaling Architecture

| Area | Design |
| --- | --- |
| Shell | Reads server session/cookie per protected request; does not rely on client global session state. |
| Existing auth route | Owns sign-out redirect and `lc_session` clearing. |
| Booking BFF | Request-scoped actor resolution before `serviceHeaders` and backend fetch. |
| booking-service | Safety net rejects blank actor and never treats stale requests as `local-user`. |
| Runtime | Existing Docker Compose/Nginx/Keycloak topology; no new auth service, shared cache, polling worker, queue, CDN, or AWS resource for U04. |

## Load Distribution

Nginx remains the local browser edge. U04 does not add load-balancing rules or shared session infrastructure; future horizontal scaling remains possible because session authority is cookie/auth-service state and BFF actor guards are request-local.

## Shared State Avoidance

- Do not store sign-out authority in browser local/session storage.
- Do not add client global session libraries.
- Do not use cross-request caches to decide stale-call authorization.
- Do not start polling protected Booking APIs after sign-out.
- Apply the same guard consistently to `proxyBooking`, `loadBookings`, and `loadBooking`.

## Capacity Thresholds

Escalate only if U04 local proof shows:

- Sign-out through Nginx repeatedly exceeds 3 seconds p95 outside cold start.
- Post-sign-out protected route checks repeatedly exceed 3 seconds p95 outside cold start.
- Missing-actor BFF guard exceeds 1 second p95 without an external fetch.
- Guard implementation requires cross-request mutable state or a shared cache.

## Future Compatibility

This design keeps future distributed session and logout-topology decisions open by preserving stateless request boundaries. W2-01 does not select AWS services, CDK, IAM, VPC, public-cloud deployment, micro-frontend expansion, or a new design-system foundation.

