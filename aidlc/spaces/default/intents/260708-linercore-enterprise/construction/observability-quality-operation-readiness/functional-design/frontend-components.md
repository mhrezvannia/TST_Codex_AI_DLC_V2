# Frontend Components - Observability Quality Operation Readiness

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

Frontend scope for this unit is operational evidence, quality-gate visibility, runtime health, dashboard inventory, alerts, runbooks, incident scenarios, and readiness handoff. The UI must use real service APIs, contract outputs, CI artifacts, logs, metrics, and traces. It must not hide incomplete domain work or claim completion from mock screens, documents, or container startup alone.

## Component Scope

The Enterprise Web operations area exposes this unit's evidence model to operators, delivery reviewers, and engineering teams. It does not implement service-owned business decisions. It provides a dense, work-focused view for scanning blockers, drilling into evidence, and handing Construction outputs into Operation stages.

## Component Hierarchy

```text
OperationsReadinessRoute
  |
  +-- ReadinessSummaryBar
  +-- EvidenceRunSelector
  +-- QualityGateMatrix
  +-- EvidenceBundleTable
  +-- FlowEvidenceTimeline
  +-- ObservabilityAssetPanel
  +-- CompletionGuardFindingsPanel
  +-- RunbookAndIncidentPanel
  +-- ReadinessHandoffDrawer
```

Text fallback: the operations readiness route shows summary status, run selection, gate matrix, evidence table, flow timeline, observability assets, completion blockers, runbooks, incident scenarios, and Operation handoff details.

## Component Responsibilities

| Component | Responsibility |
|---|---|
| `ReadinessSummaryBar` | Shows overall gate status, latest run, profile, `gitRef`, blocker count, stale evidence count, and Operation handoff state. |
| `EvidenceRunSelector` | Lets users switch between CI, local runtime, operator, and stage-gate evidence runs. |
| `QualityGateMatrix` | Displays required and optional checks by category, owner, status, freshness, and blocking reason. |
| `EvidenceBundleTable` | Lists normalized evidence items with source, command or endpoint, owner, status, timestamp, and traceability link. |
| `FlowEvidenceTimeline` | Shows E2E Flow 1-5 evidence from request through pricing, booking confirmation, CMM journey, movement status, D&D, and amendment where available. |
| `ObservabilityAssetPanel` | Lists dashboards, alerts, SLO evidence, traces, metrics, and structured-log samples. |
| `CompletionGuardFindingsPanel` | Surfaces mock-only, document-only, hardcoded, stale, and ownership-violating evidence findings. |
| `RunbookAndIncidentPanel` | Shows runbooks, incident scenarios, alert links, escalation owners, and recovery steps. |
| `ReadinessHandoffDrawer` | Presents Operation-stage handoff checklist, unresolved risks, owners, evidence links, and required follow-up. |

## State And Data Sources

| State | Source |
|---|---|
| Current evidence run | OQR API or BFF read model backed by CI/local evidence artifacts. |
| Quality gate status | `QualityGateResult` read model. |
| Evidence items | `EvidenceBundle` and source artifact links. |
| Flow evidence | E2E reports, traces, structured logs, metrics, and contract results. |
| Observability assets | Dashboard specs, alert rules, SLO evidence, trace queries, log queries, and metric queries. |
| Runbook and incident links | Operation readiness artifacts and runbook index. |
| Authorization | Identity Service capability checks through shell context and route/action permissions. |

## Interaction Rules

- Authenticated access and route/action permissions come from Identity Service.
- Operators can filter by unit, owner, flow, evidence category, status, profile, and `gitRef`.
- UI commands call approved service APIs or BFF routes only.
- UI state is derived from evidence read models and source artifacts; the UI cannot turn a blocked gate into a pass.
- Blockers are visible by default and cannot be hidden from summary status.
- Manual annotations may explain context but cannot override machine-verifiable failures.
- Every evidence item links back to its source command, artifact, endpoint, trace, log query, metric query, dashboard, or runbook.

## Validation And Error States

| Scenario | UI behavior |
|---|---|
| Missing evidence | Show `Missing` status, owner, expected source, and remediation command. |
| Stale evidence | Show `Stale` status with current and evidence `gitRef`, profile, schema, or seed mismatch. |
| Partial runtime health | Show container, service, migration, seed, contract, and flow checks separately. |
| Ownership violation | Show blocking finding with violated component or service boundary. |
| Source unavailable | Show partial evidence and retry guidance without marking gate passed. |
| Unauthorized user | Hide protected details and show denied-path audit evidence where permitted. |

## Accessibility And Usability

- Gate and evidence status must use text labels in addition to color.
- Dense tables must support keyboard navigation, sorting, filtering, and copyable source identifiers.
- Long blocker text must wrap inside table rows and drawers without overlapping adjacent controls.
- Detail drawers must preserve the user's filter and scroll position when closed.
- Runbook links must be reachable from alert, incident, and blocker contexts.

## Traceability

| Source | Frontend coverage |
|---|---|
| `unit-of-work.md` | Defines operations evidence, readiness, dashboard, runbook, and no-masking responsibilities. |
| `unit-of-work-story-map.md` | Maps this frontend surface to US-SP, US-CHG, US-CMM, and US-RUN evidence stories. |
| `requirements.md` | Supplies UI, audit, observability, runtime, contract, and no-fake-completion constraints. |
| `components.md` | Defines Enterprise Web, Observability Platform, Contract Platform, and Local Runtime Platform boundaries. |
| `component-methods.md` | Supplies `loadOperationsDashboard`, `runE2EFlowSuite`, `collectLocalEvidence`, `checkHealth`, and `reportContractHealth` expectations. |
| `services.md` | Supplies runtime topology, contract strategy, event paths, and service ownership boundaries. |
