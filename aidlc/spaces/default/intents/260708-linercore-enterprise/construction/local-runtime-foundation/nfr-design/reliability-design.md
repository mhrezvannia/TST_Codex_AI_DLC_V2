# Reliability Design - local-runtime-foundation

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability for local runtime is honest command behavior: fail clearly, preserve evidence, and do not claim readiness before the relevant layer is actually ready.

## Readiness State Model

```text
[not_started]
      |
      v
[preflight_checked] --> [blocked]
      |
      v
[container_started]
      |
      v
[infrastructure_ready]
      |
      v
[application_ready]
      |
      v
[evidence_ready]
```

Text fallback: a profile moves from not started through preflight, container start, infrastructure readiness, application readiness, and evidence readiness. Any failed required check moves the affected service or profile to blocked.

## Failure Handling

| Failure | Behavior |
|---|---|
| Docker unavailable | Setup and start fail with Docker daemon remediation. |
| Port conflict | Report exact port, service, profile, route owner, and remediation. |
| Keycloak import failure | Block auth-enabled readiness and preserve import logs. |
| Kafka or Schema Registry failure | Block event integration and contract compatibility readiness. |
| Service health failure | Mark service and dependent profile blocked; do not hide behind container-up status. |
| Optional devtool missing | Mark optional tool unavailable but do not block required profiles unless selected. |
| Reset requested | Require explicit scoped reset and report affected volumes before destructive action. |

## Recovery Design

Every failing command prints:

- owner service or profile,
- blocker category,
- affected endpoint, port, volume, or dependency,
- log path or log command,
- next remediation command,
- whether retry is safe after remediation.

Reset only touches workspace-owned local volumes named by the selected profile or explicit reset scope. It does not delete external Docker volumes, arbitrary host paths, or production-like state.

## Evidence Preservation

| Evidence | Preservation rule |
|---|---|
| Preflight output | Printed and saved for setup/start failures. |
| Compose status | Captured per selected profile. |
| Service logs | Collectable by profile and service. |
| Keycloak import logs | Preserved on auth-enabled blocker. |
| Kafka/Schema Registry logs | Preserved on event readiness blocker. |
| Reset report | Lists affected volumes and post-reset health status. |

## Deterministic Restart

After a blocker is fixed, restart must converge from the same commands and profile inputs. Health output compares previous blocker state with current status so developers can see whether remediation actually changed readiness.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements readiness states, failure handling, recovery, reset safety, evidence preservation, and honest blockers. |
| `performance-requirements.md` | Keeps command responses bounded and logs accessible within the approved timing targets. |
| `security-requirements.md` | Fails readiness for unsafe environment, auth, callback, or bypass states. |
| `scalability-requirements.md` | Supports grouped profile health as services, databases, frontends, and tools grow. |
| `tech-stack-decisions.md` | Uses Docker Compose, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, and observability services. |
| `business-logic-model.md` | Implements start profile, stop/reset, health/readiness, independent IDE mode, and environment validation workflows. |
