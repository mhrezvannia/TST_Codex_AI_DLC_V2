# Scalability Design - U01 Walking Skeleton

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U01 proves a local walking skeleton and preserves future scalability without adding infrastructure.

## Scaling Architecture

| Area | Design |
| --- | --- |
| Shell | Stateless request handling; session authority remains in the existing cookie/auth path, not in process memory. |
| Booking BFF | Request-scoped actor and correlation resolution before backend fetch. |
| booking-service | Existing read/list behavior and persistence ownership remain unchanged. |
| Runtime | Existing Docker Compose/Nginx topology; no AWS, CDN, autoscaling, cache, or queue for U01. |

## Load Distribution

Nginx remains the browser edge for local acceptance. U01 does not introduce load balancing rules beyond routing to `apps/shell`; future horizontal scaling remains possible because shell/BFF actor state is not process-global.

## Shared State Avoidance

- Do not add in-memory session caches.
- Do not add client global stores as security authority.
- Do not cache authorization or actor identity in browser state.
- Do not introduce background polling for the read proof.

## Capacity Thresholds

Escalate only if U01 local proof shows:

- Authenticated `/booking` read repeatedly exceeds 3 seconds p95 outside cold start.
- Booking BFF timeout needs to exceed 2500 ms.
- Shell/BFF implementation requires cross-request mutable state.
- Booking read path loads unbounded data instead of existing pagination/query behavior.

## Future Compatibility

This design keeps AWS platform options open by preserving stateless service boundaries, but W2-01 does not select AWS services, CDK, IAM, VPC, or public-cloud deployment.
