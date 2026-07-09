# Reliability Requirements - local-runtime-foundation

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means local runtime commands fail honestly, preserve evidence, and do not conflate container startup with application or enterprise readiness.

## Readiness States

| State | Meaning |
|---|---|
| `container_started` | Container exists and Docker reports it started. |
| `infrastructure_ready` | Required infrastructure health checks pass. |
| `application_ready` | Implemented service/frontend endpoints pass profile checks. |
| `evidence_ready` | Profile-specific logs, health, contracts, and test hooks pass where applicable. |
| `blocked` | Required service, port, config, health, or dependency check failed. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Docker unavailable | Fail preflight with Docker daemon remediation. |
| Port conflict | Report exact port, service, profile, and remediation. |
| Keycloak import failure | Block auth-enabled readiness and preserve logs. |
| Kafka/Schema Registry failure | Block event integration readiness. |
| Service health failure | Mark service and dependent profile blocked, not green. |
| Reset requested | Require explicit scoped reset and report affected volumes. |

## Recovery Requirements

- Every failing command prints an owner, blocker, and next remediation command.
- Logs are collectable by profile and service.
- Reset never silently deletes state outside workspace-owned local volumes.
- Restart after failed startup must be deterministic after blocker remediation.
- Missing optional devtools cannot block required profile readiness unless selected.

## Reliability Evidence

| Scenario | Evidence |
|---|---|
| Docker missing | Preflight failure output |
| Port conflict | Health/setup output identifying owner |
| Keycloak unhealthy | Auth blocker and logs |
| Kafka unhealthy | Event readiness blocker |
| Successful scoped reset | Reset report and post-reset health |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines runtime state model, stop/reset, and health/readiness workflows. |
| `business-rules.md` | Defines readiness honesty, security, developer mode, and completion guardrails. |
| `requirements.md` | Supplies FR-RUN and no-fake-completion constraints. |
| `technology-stack.md` | Supplies Docker Compose and local infrastructure dependencies. |
| `nfr-requirements-questions.md` | Q2 and Q5 define readiness states and failure policy. |
