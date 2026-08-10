# Incident Plan - W1-01

## Incident Classification

| Severity | Criteria | Examples | Response target |
|---|---|---|---|
| P1 | Blocks W1 completion or invalidates release evidence | nginx Booking path fails, happy-path DLT, manifest not PASS, unsigned evidence, outbox stuck beyond lease | Start response immediately; no release claim. |
| P2 | Degrades diagnostics or blocks observability runtime but not domain services directly | Kibana image pull blocked, Grafana runtime unavailable, charge transient 5xx during diagnostics | Record evidence and remediate before approval or merge claim. |
| P3 | Non-blocking cleanup or follow-up | Dashboard panel naming, non-pageable local warning, future production SLO baseline task | Track as follow-up. |

## Response Procedure

1. Declare the incident in the stage or run evidence with run ID, failing gate, command, timestamp, and affected component.
2. Preserve failed evidence under `artifacts/w1-01-live/<run-id>/`; do not delete or overwrite it.
3. Assign owner from `escalation-matrix.md`.
4. Use the matching runbook from `runbooks.md`.
5. Document mitigation and whether a new run ID is required.
6. Rerun `node scripts/w1-live-acceptance.mjs --run-id <new-id>` only after the root blocker is removed.
7. Accept completion only when the manifest records PASS and detector outputs are reviewed.

## Current Incident Record

The current W1 incident is P2/P1 boundary:

| Field | Value |
|---|---|
| Run ID | `operation-deployment-execution` |
| Failing gate | `compose-start` |
| Blocker | Docker Desktop cannot pull `docker.elastic.co/kibana/kibana:8.16.1` |
| User-path smoke | nginx Booking path failed |
| Direct diagnostics | Booking app and Booking service returned HTTP 200 directly |
| Release verdict | BLOCKED |

The direct diagnostics are useful for narrowing the problem, but they do not satisfy release smoke because `deployment-architecture.md` and `alarms.md` require the nginx user path and full acceptance harness.

## RTO And RPO

| Scope | Target |
|---|---|
| Local release RTO | Rerun live acceptance with a new run ID as soon as Docker image/proxy access is fixed. |
| Local release RPO | Zero loss of retained evidence; failed manifests and logs stay intact. |
| Database proof RPO | No database volume reset to create success; migration and replay evidence must use existing volumes. |
| Production RTO/RPO | Deferred until production environment and business criticality are defined. |

## Communication

For every P1/P2 W1 incident, record:

```text
Status: investigating | identified | mitigating | blocked | resolved
Impact: which live-proof gate or user journey is blocked
Evidence: exact artifact path and command
Next action: owner and next command or environment fix
Next update: expected time or condition
```

## Source Coverage

The plan uses symptom alerts from `alarms.md`, operator views from `dashboards.md`, the fail-fast state machine in `reliability-design.md`, evidence trust controls in `security-design.md`, and the local acceptance topology in `deployment-architecture.md`.
