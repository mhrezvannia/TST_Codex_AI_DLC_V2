# Scalability Design - U02 Booking Create Allow

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U02 adds a Booking write path while preserving the existing scaling topology.

## Scaling Architecture

| Area | Design |
| --- | --- |
| Shell | Stateless protected create/detail routing; no in-process actor or authorization cache. |
| Booking BFF | Request-scoped actor, correlation, idempotency, validation, and backend call orchestration. |
| identity-service | Owns authorization state and permission catalog evaluation. |
| booking-service | Owns create idempotency, persistence, validation, and detail retrieval. |
| Runtime | Existing Docker Compose/Nginx topology; no AWS, CDN, autoscaling, cache, queue, or new runtime service for U02. |

## Load Distribution

Nginx remains the local browser edge for shell/auth/Booking routes. U02 does not add load-balancing rules beyond routing accepted shell traffic; future horizontal scaling remains possible because shell and BFF state is request-scoped and authorization state remains in identity-service/catalog.

## Shared State Avoidance

- Do not store authorization decisions in shell memory, browser storage, or client global stores.
- Do not add background polling or broad reload loops after create success.
- Do not cache created Booking detail in a way that becomes security authority.
- Keep idempotency and persistence in booking-service rather than duplicating domain state in shell.

## Capacity Thresholds

Escalate only if U02 local proof shows:

- Create through Nginx repeatedly exceeds 5 seconds p95 outside cold start.
- Detail load after create repeatedly exceeds 3 seconds p95 outside cold start.
- Authorization latency consumes the create budget enough to require a new approved timeout or architectural decision.
- Implementation requires cross-request mutable actor/authorization state.
- Create success requires unbounded list reloads or broad cross-module refresh.

## Future Compatibility

This design preserves stateless app boundaries and service-owned domain state so future scaling options remain open. W2-01 does not select AWS services, CDK, IAM, VPC, public-cloud deployment, micro-frontend expansion, or a new design-system foundation.

