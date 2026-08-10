# Monitoring Design - U05 Route Compatibility and Preservation

## Source Context

This monitoring design consumes U05 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U05 `business-logic-model.md`. It defines evidence for legacy redirect behavior and prior-work preservation.

## Metrics and Evidence Signals

| Signal | Source | Acceptance use |
| --- | --- | --- |
| Legacy route timing/status | Browser/network transcript through Nginx. | Prove 1 second p95 redirect target. |
| Canonical target | Redirect response/location and final route. | Prove fixed `/bookings*` -> `/booking*` map. |
| Query/id handling | Route tests/evidence. | Prove allowlist, decode/re-encode, drop, and shell 404 behavior. |
| No backend prefetch | BFF/backend logs or request counters. | Prove no booking-service call before redirect. |
| Auth/session/actor preservation | Canonical route evidence. | Prove compatibility does not bypass shell protection. |
| Preservation diff | Evidence artifact. | Prove W0/W1/W2 boundaries are preserved or justified. |

## Log Strategy

Evidence fields: source route, target route, redirect status, query/id handling result, subject/correlation where authenticated, no-backend-call observation, touched path, W2-01 reason, targeted verification result, and W1 waiver status. Secrets, raw tokens, and service tokens are prohibited.

## Tracing and Correlation

Compatibility redirect itself may only have edge/request id evidence. Once canonical route is loaded, normal shell/Booking correlation evidence applies. U05 does not add a tracing backend.

## Alerting and Dashboards

No production alert or dashboard is required. Route compatibility proof is finite scenario evidence; preservation proof is deterministic diff/path evidence.

## Health Checks

| Component | Health/readiness evidence |
| --- | --- |
| Nginx | `/health` plus legacy route transcript. |
| `apps-shell` | Compatibility route handlers and canonical route load. |
| `apps-booking`/booking-service | No call before redirect; normal canonical route behavior after redirect. |
| Preservation tooling | Diff/path report generated and reviewable. |

## Incident and Blocker Handling

Open redirect, malformed id reaching backend, `/bookings/new` parsed as id, unknown query preservation, backend prefetch before redirect, prior-work touch without reason, or W1 waiver PASS wording blocks U05 and requires repair or W2-01 blocker evidence.

