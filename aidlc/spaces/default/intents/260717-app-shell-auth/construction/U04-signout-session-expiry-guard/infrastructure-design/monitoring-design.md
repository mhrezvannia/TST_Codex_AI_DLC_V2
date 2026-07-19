# Monitoring Design - U04 Sign-Out and Session Expiry Guard

## Source Context

This monitoring design consumes U04 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U04 `business-logic-model.md`. U04 monitoring captures sign-out, protected-route reauth, and stale-call early return.

## Metrics and Evidence Signals

| Signal | Source | Acceptance use |
| --- | --- | --- |
| Sign-out request timing/status | Browser transcript through Nginx. | Prove route returns redirect or controlled error within target. |
| Cookie clear observation | Response header or browser state. | Prove `lc_session` is cleared with required attributes. |
| Keycloak logout redirect | Auth route response/evidence. | Prove existing IdP logout path and `/signed-out`. |
| Post-sign-out protected route | Browser transcript. | Prove `/` and `/booking` require login. |
| BFF stale-call early return | BFF test/log/evidence. | Prove missing actor stops before backend fetch. |
| Backend no-call/no-`local-user` | booking-service logs/request counters. | Prove stale calls did not reach backend as `local-user`. |

## Log Strategy

Evidence fields: pre-sign-out subject, route/action, sign-out correlation id, stale-call correlation id, status/error code, cookie-cleared observation, backend no-call status, and timestamp. Do not log raw cookies, raw tokens, service tokens, or secrets.

## Tracing and Correlation

Use correlation ids for sign-out and stale-call branches. The stale-call branch must show the BFF response code and no backend fetch; booking-service logs/request counters provide independent no-`local-user` confirmation.

## Alerting and Dashboards

No production alert/dashboard is required. Optional observability profile tools may support diagnostics, but U04 PASS depends on the finite evidence package.

## Health Checks

| Component | Health/readiness evidence |
| --- | --- |
| Nginx | Existing `/health` plus route transcript. |
| `apps-auth` | Existing auth health/sign-out route behavior. |
| Keycloak | Logout redirect availability. |
| `apps-shell` | Protected route reauth behavior after cookie clear. |
| `apps-booking` | BFF early return evidence. |
| booking-service | No post-sign-out `local-user` observation. |

## Incident and Blocker Handling

Auth route failure, cookie-clear mismatch, Keycloak logout blocker, stale protected render, BFF guard gap, or backend `local-user` observation makes U04 failed/BLOCKED with concrete blocker id. Screenshot-only evidence is not accepted.

