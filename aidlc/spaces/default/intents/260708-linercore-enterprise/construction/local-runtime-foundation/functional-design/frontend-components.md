# Frontend Components - local-runtime-foundation

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

`local-runtime-foundation` does not own business UI. A minimal read-only runtime health surface is acceptable only as evidence for Enterprise Web or operations routes. Full operational dashboards and SLO semantics belong to later observability and Operation stages.

## Component Scope

The frontend surface shows local runtime status:

- Active profile.
- Infrastructure service health.
- Backend/frontend availability as implemented.
- Reverse proxy route status.
- Keycloak/Kafka/Schema Registry/PostgreSQL readiness.
- Blocking failures and warnings.
- Links to logs, health output, and local commands.

It does not edit runtime configuration, secrets, service data, business fixtures, or production settings.

## Component Hierarchy

```text
RuntimeHealthRoute
  |
  +-- RuntimeProfileSummary
  +-- RuntimeServiceStatusGrid
  |     |
  |     +-- ServiceStatusBadge
  |     +-- PortBindingCell
  |     +-- HealthCheckCell
  |
  +-- RuntimeFailurePanel
  +-- LocalCommandReference
  +-- IdeModeHelpPanel
```

Text fallback: the route summarizes profile readiness, shows service health rows, highlights failures, and links to local commands and IDE-mode instructions.

## Component Responsibilities

### RuntimeHealthRoute

- Load latest `RuntimeStatusSnapshot`.
- Render non-green status when runtime evidence is missing or stale.
- Preserve read-only behavior.

### RuntimeProfileSummary

- Show active profile.
- Show overall status.
- Show generated timestamp.
- Show profile service counts.

### RuntimeServiceStatusGrid

Rows include:

- Service name.
- Service type.
- Profiles.
- Container status.
- Application health.
- Host port.
- Blocking failures.

### RuntimeFailurePanel

Shows:

- Docker daemon failure.
- Port conflict.
- Keycloak realm/client import failure.
- PostgreSQL unavailable.
- Kafka unavailable.
- Schema Registry unavailable.
- Reverse proxy route failure.
- Application health endpoint failure.

### LocalCommandReference

Shows documented commands for setup, start, stop, reset, logs, and health.

### IdeModeHelpPanel

Shows how to run infrastructure in Docker while one service or frontend runs from the host IDE.

## Data Contract For UI

| Field | Meaning |
|---|---|
| `snapshotId` | Unique runtime status snapshot id. |
| `profile` | Active profile. |
| `generatedAt` | Health snapshot timestamp. |
| `overallStatus` | `green`, `amber`, or `red`. |
| `services[]` | Service status rows. |
| `failures[]` | Blocking failures and warnings. |
| `commands[]` | Local command references. |

Missing snapshot data renders amber/red, not green.

## Interaction Flow

1. User opens runtime health route.
2. UI loads latest local runtime status snapshot.
3. Summary shows selected profile and overall status.
4. User scans service grid.
5. User opens failure panel for remediation.
6. User opens command reference or IDE-mode help.

## Validation Rules

- Unauthorized users cannot access runtime health route.
- UI cannot expose secret values.
- UI cannot edit local environment values.
- UI cannot mark runtime ready from container-start status only.
- UI must distinguish Docker infrastructure readiness from application readiness.

## Traceability

| Source | Frontend coverage |
|---|---|
| `unit-of-work.md` | U01 command and health responsibilities become a read-only runtime evidence view. |
| `unit-of-work-story-map.md` | US-RUN-001 and US-RUN-002 require visible local runtime and developer-mode evidence. |
| `requirements.md` | FR-RUN-001 through FR-RUN-006 require documented local commands and honest readiness status. |
| `components.md` | Local Runtime Platform and Enterprise Web define runtime health ownership and UI placement. |
| `component-methods.md` | Runtime status methods shape UI data contract. |
| `services.md` | Infrastructure service topology defines displayed service rows. |

