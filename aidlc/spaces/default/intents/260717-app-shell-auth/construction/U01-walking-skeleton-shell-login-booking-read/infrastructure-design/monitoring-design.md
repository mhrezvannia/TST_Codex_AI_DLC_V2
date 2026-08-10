# Monitoring Design - U01 Walking Skeleton

## Source Context

This monitoring design consumes U01 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U01 `business-logic-model.md`. U01 monitoring is evidence-oriented for local Compose/Nginx proof, not a production observability platform.

## Metrics and Evidence Signals

| Signal | Source | Acceptance use |
| --- | --- | --- |
| Nginx route timing/status | Browser transcript and Nginx response. | Prove `/` and `/booking` entered through accepted edge. |
| Auth redirect/return timing | Browser transcript and auth route observation. | Prove existing auth/Keycloak path. |
| Shell session state | Shell server logs or test transcript. | Prove protected content requires session. |
| Booking BFF correlation id | BFF response/log/evidence. | Prove actor/correlation propagation. |
| booking-service read status | Backend response/log/evidence. | Prove read path outcome or blocker. |
| Runtime blocker | Evidence package blocker row. | Prevent false PASS when Compose or dependencies fail. |

## Log Strategy

Use existing container logs and scenario transcripts. Required log/evidence fields are QA-safe only:

- route
- timestamp
- status
- actor subject or actor header
- correlation id
- outcome
- blocker id when blocked

Raw access tokens, refresh tokens, service tokens, cookies, secrets, and broad PII must not be logged or stored in artifacts.

## Tracing and Correlation

Nginx already sets `X-Correlation-Id $request_id` for configured routes. U01 infrastructure should ensure shell routes also receive a correlation id. The shell/Booking path carries that id to Booking BFF and booking-service evidence. No new tracing backend is required.

## Alerting and Dashboards

U01 does not add production alerts or dashboards. Existing optional `observability` profile services (`prometheus`, `grafana`, `jaeger`, `otel-collector`, Elasticsearch, Kibana) are not required for W2-01 PASS. If used during diagnostics, their output is supporting evidence only.

## Health Checks

| Component | Health/readiness evidence |
| --- | --- |
| Nginx | Existing `/health` returns `ok`. |
| `apps-shell` | Add a lightweight shell health route or container healthcheck once the app exists. |
| `apps-auth` | Existing `/api/health` route is graph-indexed and can support readiness. |
| `apps-booking` | Existing Compose healthcheck currently uses `/bookings`; U01 should update or supplement health after canonical `/booking` is introduced only if necessary. |
| `booking-service` | Existing `/actuator/health` healthcheck. |

## Incident and Blocker Handling

Failures in Nginx route setup, shell startup, auth/Keycloak, Booking BFF, or booking-service are recorded as W2-01 blockers with dependency, observed failure, timestamp, next action, and correlation where relevant. Do not use W1 waiver language as a U01 PASS.

