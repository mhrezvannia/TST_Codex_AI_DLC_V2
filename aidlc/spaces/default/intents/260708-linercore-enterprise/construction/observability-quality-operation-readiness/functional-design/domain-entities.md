# Domain Entities - Observability Quality Operation Readiness

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The model is an evidence and readiness model. It represents proof, blockers, quality gates, observability assets, and Operation handoff material without taking ownership of pricing, booking, movement, identity, reference-data, or UI domain state.

## Entity Overview

| Entity | Purpose |
|---|---|
| `EvidenceRun` | A single CI, local runtime, operator, or stage-gate execution that gathers evidence for a `gitRef` and runtime profile. |
| `EvidenceBundle` | The normalized collection of evidence items and quality-gate results for a run. |
| `EvidenceItem` | A machine or manual evidence record with owner, source, status, freshness, and blocking reason. |
| `QualityGatePolicy` | The configured mandatory and optional checks for a stage, profile, flow, or release gate. |
| `QualityGateResult` | The pass, fail, partial, or blocked result produced by evaluating evidence against a policy. |
| `TraceCorrelation` | The observed relationship between correlation IDs across HTTP requests, events, logs, metrics, and traces. |
| `DashboardSpec` | A dashboard definition with panels, query sources, owners, and readiness status. |
| `AlertRule` | An alert definition with signal, threshold, severity, runbook, and ownership metadata. |
| `SloEvidence` | Evidence that a service, flow, or runtime profile met or violated the SLO targets defined in NFR Requirements. |
| `Runbook` | An operational procedure linked to alerts, incident scenarios, rollback, backup, or DR tasks. |
| `ReadinessChecklist` | Operation handoff checklist with evidence links, owners, status, and unresolved risks. |
| `IncidentScenario` | A modeled failure scenario with detection, response, escalation, and recovery evidence. |
| `CompletionGuardFinding` | A blocking or advisory finding for mock-only, document-only, hardcoded, stale, or ownership-violating evidence. |

## Entity Attributes

### EvidenceRun

| Attribute | Description |
|---|---|
| `runId` | Stable identifier for the collection run. |
| `gitRef` | Commit, tag, or branch head used by the run. |
| `runtimeProfile` | Docker Compose or environment profile such as `core`, `app`, `observability`, `devtools`, or `full`. |
| `triggerType` | CI, local command, operator refresh, stage gate, or scheduled check. |
| `correlationId` | Correlation identifier propagated into logs, traces, and reports. |
| `startedAt` / `completedAt` | Collection timestamps. |
| `status` | `PENDING`, `COLLECTING`, `EVALUATING`, `PASSED`, `BLOCKED`, or `ERROR`. |

### EvidenceItem

| Attribute | Description |
|---|---|
| `itemId` | Stable evidence item identifier. |
| `category` | Contract, runtime, E2E flow, security, resilience, observability, UI, migration, seed, runbook, rollback, backup, DR, or incident. |
| `owner` | Owning service, platform, or unit from `components.md` or `services.md`. |
| `source` | File path, CI artifact, API endpoint, dashboard URL, log query, trace query, metric query, or command output. |
| `status` | `PASS`, `FAIL`, `BLOCKED`, `MISSING`, `STALE`, or `MANUAL_CONTEXT`. |
| `freshnessKey` | Tuple of `gitRef`, schema version, runtime profile, command set, and seed profile. |
| `blockingReason` | Required when status is not `PASS`. |

### QualityGateResult

| Attribute | Description |
|---|---|
| `gateId` | Gate identifier, for example `contracts`, `runtime-full`, `flow-1`, or `operation-handoff`. |
| `policyId` | The applied `QualityGatePolicy`. |
| `requiredItems` | Required evidence categories and item IDs. |
| `optionalItems` | Advisory evidence categories and item IDs. |
| `decision` | `PASSED`, `PARTIAL`, `BLOCKED`, or `ERROR`. |
| `blockers` | Blocking findings grouped by owner and source. |

## Relationships

```text
[EvidenceRun]
        |
        +-- contains --> [EvidenceBundle]
                              |
                              +-- has many --> [EvidenceItem]
                              +-- evaluated by --> [QualityGatePolicy]
                              +-- produces --> [QualityGateResult]
                                                       |
                                                       +-- references --> [CompletionGuardFinding]
                                                       +-- updates --> [ReadinessChecklist]

[TraceCorrelation] --> supports --> [EvidenceItem]
[DashboardSpec] --> supports --> [EvidenceItem]
[AlertRule] --> links to --> [Runbook]
[IncidentScenario] --> links to --> [Runbook]
[SloEvidence] --> supports --> [QualityGateResult]
```

Text fallback: an EvidenceRun creates an EvidenceBundle, which contains EvidenceItems. Gate policies evaluate the bundle and produce QualityGateResults. Results update readiness checklists and link to findings, dashboards, alerts, runbooks, SLO evidence, and incident scenarios.

## Lifecycle States

| Entity | States |
|---|---|
| `EvidenceRun` | `PENDING` -> `COLLECTING` -> `EVALUATING` -> `PASSED` or `BLOCKED` or `ERROR` |
| `EvidenceItem` | `EXPECTED` -> `COLLECTED` -> `VALIDATED` or `REJECTED` |
| `QualityGateResult` | `DRAFT` -> `EVALUATED` -> `PASSED` or `PARTIAL` or `BLOCKED` |
| `ReadinessChecklist` | `DRAFT` -> `IN_PROGRESS` -> `READY` or `READY_WITH_RISKS` or `BLOCKED` |
| `CompletionGuardFinding` | `OPEN` -> `ACKNOWLEDGED` -> `REMEDIATED` or `CARRIED_TO_OPERATION` |

## Invariants

- An `EvidenceBundle` cannot be `PASSED` when it contains a mandatory `MISSING`, `STALE`, `FAIL`, or `BLOCKED` item.
- A `QualityGateResult` cannot be `PASSED` unless every mandatory evidence category in its policy has fresh passing evidence.
- A `CompletionGuardFinding` with blocking severity prevents completion until remediated or explicitly accepted by a human gate with owner and risk.
- A `ReadinessChecklist` item cannot be `READY` without a linked evidence item or an explicit approved carry-forward risk.
- `TraceCorrelation` evidence must reference at least two signal types for cross-boundary flows, such as HTTP plus Kafka or logs plus traces.

## Traceability

| Source | Entity coverage |
|---|---|
| `unit-of-work.md` | Defines evidence, observability, quality, CI/CD, readiness, rollback, backup, DR, and incident concepts. |
| `unit-of-work-story-map.md` | Maps entity behavior to US-SP-002, US-SP-004, US-SP-005, US-SP-006, US-CHG-004, US-CHG-007, US-CMM-004, and all US-RUN stories. |
| `requirements.md` | Supplies security, reliability, observability, contract, runtime, and Operation evidence requirements. |
| `components.md` | Defines Observability Platform, Contract Platform, Local Runtime Platform, Enterprise Web, and owner boundaries. |
| `component-methods.md` | Supplies health, contract health, E2E flow suite, local evidence, and operations dashboard methods. |
| `services.md` | Supplies runtime topology, integration style, contract strategy, and service ownership boundaries. |
