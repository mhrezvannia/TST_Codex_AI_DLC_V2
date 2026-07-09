# Escalation Matrix

## Inputs

This escalation matrix consumes `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

## Roles

| Role | Responsibility | Escalate for |
| --- | --- | --- |
| Local developer/operator | Run readiness, smoke, and service recovery commands | Runtime blocked, BFF unavailable |
| Platform owner | Compose/runtime/toolchain ownership | Docker, Java, Maven, service image issues |
| Security owner | Auth and bypass guard ownership | Auth bypass non-local, authorization anomalies |
| Data/service owner | Reference Data and seed ownership | Seed apply failure, outbox freshness breach |
| CI owner | Self-hosted runner and quality-gate ownership | CI runner missing Maven/Docker or artifact upload failures |

## Escalation Rules

- P1: Notify owner immediately and stop deployment.
- P2: Assign same-day remediation.
- P3: Track in backlog or next AI-DLC intent.

## Current Assignments

Named on-call contacts are not configured in this repo. Until then, the active project owner handles local P1/P2 triage and delegates by component.
