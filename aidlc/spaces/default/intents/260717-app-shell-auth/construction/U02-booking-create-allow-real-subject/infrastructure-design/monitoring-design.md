# Monitoring Design - U02 Booking Create Allow

## Source Context

This monitoring design consumes U02 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U02 `business-logic-model.md`. U02 monitoring captures finite local evidence for the allowed create/detail path.

## Metrics and Evidence Signals

| Signal | Source | Acceptance use |
| --- | --- | --- |
| `/booking/new` route timing | Browser transcript through Nginx. | Prove create route local target. |
| Submit start/end | Scenario transcript. | Prove create completes or blocks within evidence. |
| Authorization timing/decision | booking-service/identity-service logs or evidence. | Prove allow before mutation. |
| Actor/correlation | BFF/backend evidence. | Prove non-`local-user` real subject. |
| Created Booking id/reference | booking-service response/evidence. | Link create to detail proof. |
| `/booking/[id]` detail timing/result | Browser transcript through Nginx. | Prove persisted detail retrieval. |

## Log Strategy

Capture QA-safe fields only: scenario id, subject, actor header, action `booking:create` or `booking:read`, authorization decision, created id/reference, status, timestamp, and correlation id. Do not store raw tokens, cookies, service tokens, secrets, or full policy internals.

## Tracing and Correlation

The correlation id from Nginx/shell is propagated through Booking BFF to booking-service and identity-service authorization evidence. U02 does not add a new tracing backend; existing logs and evidence files are sufficient.

## Alerting and Dashboards

No production alert or dashboard is required for U02. Optional observability profile services may help diagnostics, but they are not required for PASS and must not become a runtime dependency.

## Health Checks

| Component | Health/readiness evidence |
| --- | --- |
| Nginx | `/health` and route transcript. |
| `apps-shell` | U01 shell health/readiness once available. |
| `apps-booking` | Existing healthcheck or targeted BFF proof. |
| `booking-service` | Existing `/actuator/health`. |
| `identity-service` | Seed/authorize call evidence and service readiness. |

## Incident and Blocker Handling

Missing `local.booking.user`, missing Booking permissions, identity-service unavailability, authorization timeout, create validation failure, or detail retrieval failure becomes U02 evidence with a concrete blocker or scenario failure. Do not replace live proof with unit tests or W1 waiver language.

