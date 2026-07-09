# Business Logic Model - Observability Quality Operation Readiness

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The unit `observability-quality-operation-readiness` owns evidence that proves LinerCore is production-grade enough to proceed through Construction and into Operation. It covers structured logs, metrics, traces, dashboards, alerts, SLO evidence, E2E flow gates, CI/CD checks, runbooks, readiness, rollback, backup, disaster recovery, and incident readiness. It supports US-SP-002, US-SP-004, US-SP-005, US-SP-006, US-CHG-004, US-CHG-007, US-CMM-004, and all US-RUN stories.

## Functional Scope

This unit does not implement pricing, booking, movement, identity, reference data, or UI business rules. It coordinates proof that those owning units expose the required evidence through approved service APIs, events, runtime checks, contract outputs, and test reports. It must fail closed when evidence is missing or when a unit tries to claim completion from documentation, mock screens, hardcoded results, or container startup alone.

## Core Workflows

### Evidence Collection Workflow

1. Receive an evidence collection request from CI, a local runtime command, an operator dashboard refresh, or a stage gate.
2. Create an `EvidenceRun` with `runId`, `profile`, `gitRef`, `correlationId`, `requestedBy`, and expected evidence categories.
3. Read contract outputs from the Contract Platform: OpenAPI validation, Pact provider/consumer results, AsyncAPI/Avro compatibility, message-pact fixtures, and Schema Registry compatibility.
4. Read runtime outputs from Local Runtime Platform: compose profile health, service readiness, migration status, seed validation, and reverse-proxy route checks.
5. Read service test outputs: unit, integration, security, resilience, and E2E Flow 1-5 reports.
6. Read observability outputs: trace spans, structured log samples, metric samples, dashboard panels, alert rules, and SLO burn or threshold evidence.
7. Normalize every source into `EvidenceItem` records with owner, source path or endpoint, freshness, status, and blocking reason.
8. Attach items to an `EvidenceBundle` and publish a readiness summary for CI and the Enterprise Web operations surface.

### Quality Gate Workflow

1. Load the active `QualityGatePolicy` for the target stage or runtime profile.
2. Evaluate required categories:
   - Contracts are executable and backward-compatible.
   - E2E Flow 1-5 checks pass or have explicit blocking evidence.
   - Security denied-path and authorization audit checks pass.
   - Resilience checks cover timeout, retry, circuit breaker, idempotency, and deduplication where applicable.
   - Runtime checks prove the selected Docker Compose profile and deterministic seed state.
   - Observability checks prove correlation across HTTP, events, logs, metrics, and traces.
3. Mark the gate `PASSED` only when every mandatory check has fresh passing evidence.
4. Mark the gate `BLOCKED` when evidence is absent, stale, failed, mock-only, or owned by the wrong component.
5. Emit a `QualityGateResult` with blocking reasons grouped by owning unit and source artifact.

### Readiness Handoff Workflow

1. Build a `ReadinessChecklist` from Construction completion criteria and Operation-stage inputs.
2. Map each readiness item to an evidence source, owner, verification command, and recovery owner.
3. Generate Operation handoff inputs:
   - dashboard inventory
   - alert rule inventory
   - runbook index
   - rollback and backup evidence placeholders
   - incident scenario matrix
   - unresolved blocker list
4. Expose handoff status through CI artifacts and the Enterprise Web operations views.
5. Do not mark Operation readiness complete until unresolved blockers are either fixed or explicitly carried to Operation with owner and risk.

### No-Fake-Completion Workflow

1. Scan candidate completion evidence for prohibited completion signals:
   - TODO-only methods
   - mock-only UI
   - hardcoded business results
   - markdown-only contracts without executable validation
   - containers starting without health, contract, and E2E evidence
2. Compare evidence owners against `components.md`, `component-methods.md`, and `services.md`.
3. Reject evidence where a non-owning component proves a business outcome it does not own.
4. Write a blocking `CompletionGuardFinding` with owner, source, severity, and required remediation.

## Decision Points

| Decision | Rule |
|---|---|
| Evidence freshness | Evidence is valid only for the current `gitRef`, runtime profile, schema versions, and test command set. |
| Contract readiness | Integration readiness requires executable OpenAPI, Avro, AsyncAPI, Pact, message-pact, and Schema Registry evidence where applicable. |
| Flow readiness | E2E Flow 1-5 readiness requires real service/API/event/UI/runtime evidence, not isolated unit tests only. |
| Boundary validation | Evidence must respect service ownership from `components.md` and `services.md`; cross-service database joins are a blocking finding. |
| Completion claim | Completion is blocked by documents-only, mock-only, hardcoded, or container-start-only evidence. |
| Operation handoff | Operation inputs may carry open risks, but only when each risk has owner, severity, mitigation, and follow-up stage. |

## Processing Sequence

```text
[CI or Operator Trigger]
        |
        v
[EvidenceRun]
        |
        +--> [Contract Evidence]
        +--> [Runtime Evidence]
        +--> [Service Test Evidence]
        +--> [Observability Evidence]
        +--> [Security and Resilience Evidence]
        |
        v
[EvidenceBundle]
        |
        v
[QualityGateResult]
        |
        +--> [ReadinessChecklist]
        +--> [Dashboard and Alert Inventory]
        +--> [Runbook and Incident Scenario Index]
        +--> [Blocking Findings]
```

Text fallback: CI or an operator starts an evidence run. The unit gathers contract, runtime, service, observability, security, and resilience evidence into a bundle, evaluates quality gates, and publishes readiness or blocker outputs.

## Error Handling

| Error | Handling |
|---|---|
| Missing evidence source | Mark gate `BLOCKED`, record expected source, owner, and remediation command. |
| Stale evidence | Reject when `gitRef`, schema version, runtime profile, or test command differs from the current run. |
| Partial runtime startup | Distinguish container liveness from service readiness and keep gate blocked until health, migrations, contracts, and flow checks pass. |
| Service unavailable during evidence collection | Preserve partial evidence, mark affected checks blocked, and surface owning service. |
| Ownership violation | Block completion and cite the violated ownership rule from `components.md` or `services.md`. |
| Conflicting reports | Prefer machine-readable CI/runtime output over manual notes and require explicit resolution before passing the gate. |

## Traceability

| Source | Functional design coverage |
|---|---|
| `unit-of-work.md` | Defines observability, quality, CI/CD, readiness, rollback, backup, DR, and incident-readiness ownership. |
| `unit-of-work-story-map.md` | Maps this unit to US-SP-002, US-SP-004, US-SP-005, US-SP-006, US-CHG-004, US-CHG-007, US-CMM-004, and all US-RUN stories. |
| `requirements.md` | Supplies no-fake-completion, contract, observability, runtime, security, reliability, and Operation evidence requirements. |
| `components.md` | Defines Observability Platform, Contract Platform, Local Runtime Platform, Enterprise Web, and service ownership boundaries. |
| `component-methods.md` | Supplies `runE2EFlowSuite`, `collectLocalEvidence`, `reportContractHealth`, `checkHealth`, and operations dashboard method expectations. |
| `services.md` | Defines runtime topology, contract strategy, service ownership, and approved integration patterns. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` could not start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design preserves the approved boundary for `observability-quality-operation-readiness`: evidence aggregation, quality gates, observability assets, CI/CD checks, readiness handoff, rollback/backup/DR placeholders, and incident-readiness artifacts.
- The model does not take over service-owned business behavior from Identity, Reference Data, Charge, Booking, CMM, or Enterprise Web.
- Completion guardrails are explicit and block documents-only, mock-only, hardcoded, stale, or container-start-only evidence.
- Required traceability to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md` is present across the artifact set.
- Markdown sensors for required sections and upstream coverage passed; JavaScript/TypeScript linter and type-check sensors are not applicable because this stage output contains no code files.

Residual risks to carry forward:

- NFR Requirements must still set concrete SLO targets, resilience thresholds, coverage thresholds, and evidence freshness windows.
- Operation stages must refine production deployment, rollback, backup, disaster recovery, incident response, performance validation, and feedback optimization details.
