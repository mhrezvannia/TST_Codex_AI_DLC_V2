# Monitoring Design - U03 Booking Deny

## Source Context

This monitoring design consumes U03 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U03 `business-logic-model.md`. U03 monitoring captures the authenticated denied path and proves it is not a fake success.

## Metrics and Evidence Signals

| Signal | Source | Acceptance use |
| --- | --- | --- |
| `/booking` route timing | Browser transcript through Nginx. | Prove denied state within local target. |
| Authenticated subject | Auth/session evidence. | Prove `local.reference.admin` is signed in. |
| Authorization request | booking-service/identity evidence. | Prove backend authorization was consulted. |
| Deny decision/reason | identity-service or booking-service evidence. | Prove explicit denial. |
| Shell denied render | UI transcript/test. | Prove in-shell denied state, not empty list/404. |
| No data/mutation | Backend/BFF evidence. | Prove Booking data was not disclosed or mutated. |

## Log Strategy

Evidence fields: scenario id, subject, route, action/resource, deny decision, reason/reference, status code, timestamp, and correlation id. Raw tokens, cookies, service tokens, policy internals, and secrets are prohibited.

## Tracing and Correlation

Carry the Nginx/shell correlation id through BFF, booking-service, and identity-service deny evidence. U03 does not add a tracing backend or managed observability service.

## Alerting and Dashboards

No production dashboard or alert is required. A detector/audit failure or repeated local proof failure is recorded as a W2-01 blocker rather than remediated with a new observability platform.

## Health Checks

| Component | Health/readiness evidence |
| --- | --- |
| Nginx | `/health` and route transcript. |
| Auth/Keycloak | Ability to authenticate `local.reference.admin`. |
| booking-service | Existing `/actuator/health` and authorization path evidence. |
| identity-service | Deny decision evidence. |

## Incident and Blocker Handling

If `local.reference.admin` accidentally has Booking permission, identity-service is unavailable, deny maps to empty list, or denied UI is inaccessible/blank, record U03 as failed or BLOCKED with concrete blocker id. Do not call it PASS through hidden navigation or W1 waiver language.

