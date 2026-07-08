# Reliability Requirements - U10 Observability Deployment

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines health/smoke, event publication health, deployment readiness, and walking-skeleton support. `business-rules.md` requires liveness/readiness, dependency readiness, smoke coverage, staging promotion checks, actionable diagnostics, and operator-visible alerts. `requirements.md` fixes NFR-005, NFR-011, NFR-012, NFR-016, and NFR-017.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Health | Every deployable service and BFF app exposes liveness/readiness appropriate to runtime. |
| Readiness | Required dependency readiness is checked, not just process availability. |
| Smoke | Checks exercise auth, reference API/BFF access, persistence, event/outbox evidence, and correlation evidence. |
| Publication health | Outbox depth, oldest pending age, retry/failure counts, and freshness p95 are visible. |
| Promotion | Staging requires successful health and smoke checks before production promotion is considered. |
| Diagnostics | Smoke failures include correlation id, failing check, and service/app boundary. |

## Failure Behavior

| Failure | Required behavior |
|---|---|
| Freshness p95 exceeds 60 seconds | Operator-visible alert/dashboard signal. |
| Repeated publication failure | Alert/dashboard signal with safe reason and affected event id. |
| Status API unavailable | UI/smoke shows non-blocking status-unavailable with correlation id. |
| Telemetry export unavailable | Application remains functional, but readiness/observability status reflects degraded telemetry. |
| Required runtime dependency unavailable | Readiness fails and smoke cannot claim success. |

## Non-Goals

- No final SLA/SLO or DR target.
- No production promotion automation policy.
- No replacement for service-level recovery behavior.

