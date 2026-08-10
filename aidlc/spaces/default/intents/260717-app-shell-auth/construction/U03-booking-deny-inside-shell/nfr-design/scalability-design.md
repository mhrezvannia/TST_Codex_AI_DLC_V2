# Scalability Design - U03 Booking Deny

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U03 preserves stateless, request-scoped authorization behavior for denied Booking access.

## Scaling Architecture

| Area | Design |
| --- | --- |
| Shell | Stateless denied-state rendering from the request result; no durable client authorization authority. |
| Booking BFF | Request-scoped actor and correlation propagation. |
| booking-service | Owns protected Booking read/action authorization boundary. |
| identity-service | Owns deny decision and permission catalog evaluation. |
| Runtime | Existing Docker Compose/Nginx topology; no AWS, CDN, autoscaling, cache, queue, role-admin UI, or new authorization service for U03. |

## Load Distribution

Nginx remains the local browser edge. U03 does not add load-balancing rules or authorization infrastructure; future horizontal scaling remains possible because shell/BFF state is request-scoped and identity-service remains the authorization owner.

## Shared State Avoidance

- Do not cache deny decisions in shell client state as security authority.
- Do not store authorization state in browser storage or process globals.
- Do not poll identity-service or retry authorization repeatedly after deny.
- Do not add global frontend state libraries for denied UI.

## Capacity Thresholds

Escalate only if U03 local proof shows:

- Deny state through Nginx repeatedly exceeds 3 seconds p95 outside cold start.
- The denied UI starts repeated authorization requests.
- Authorization state persists beyond session changes.
- Denied path requires new global state libraries or policy-management UI.

## Future Compatibility

This design keeps future policy-management and production-scale authorization throughput out of W2-01 while preserving a request-scoped backend authorization boundary. W2-01 does not select AWS services, CDK, IAM, VPC, public-cloud deployment, micro-frontend expansion, or a design-system foundation.

