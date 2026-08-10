# Scalability Design - U05 Route Compatibility and Preservation

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U05 keeps route compatibility stateless and preservation checks outside the runtime user path.

## Scaling Architecture

| Area | Design |
| --- | --- |
| Compatibility routing | Shell-owned Next.js redirects using a fixed deterministic route map; no database, service, cache, or policy lookup. |
| Canonical shell routes | Existing `/booking*` route behavior owns data loading and auth/session/actor checks. |
| Booking BFF/backend | No duplicate load from legacy and canonical route for one user action. |
| Preservation verification | Evidence/build-time diff and targeted checks, not runtime dependency. |
| Runtime | Existing Docker Compose/Nginx/Next.js topology; no AWS, CDN, autoscaling, queue, route database, W4-01 module migration, or new design-system foundation. |

## Load Distribution

Nginx forwards `/bookings*` to the shell unchanged; Next.js compatibility routes redirect to the canonical route first. U05 does not add runtime fan-out: a legacy route redirects before Booking data loading, then the canonical page performs the normal protected Booking behavior once.

## Shared State Avoidance

- Do not maintain compatibility state in browser storage or process globals.
- Do not cache legacy-route authorization state as authority.
- Do not duplicate Booking data loading across old and canonical routes.
- Do not make preservation evidence tooling a runtime dependency.

## Capacity Thresholds

Escalate only if U05 local proof shows:

- Compatibility resolution repeatedly exceeds 1 second p95 outside cold start/auth redirect.
- Legacy route performs backend calls before canonical resolution.
- Old and canonical routes both load Booking data for one action.
- Preservation tooling must run in the user request path.

## Future Compatibility

This design preserves future route cleanup and shell migration options without taking W4-01 scope. W2-01 does not select AWS services, CDK, IAM, VPC, public-cloud deployment, new module migrations, micro-frontend expansion, or a design-system foundation.
