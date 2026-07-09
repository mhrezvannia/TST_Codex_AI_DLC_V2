# Monitoring Design - contract-platform-catalog

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

Monitoring focuses on contract validation evidence: timing, status, freshness, ownership, compatibility, security metadata, secret scanning, and health publication.

## Metrics And KPIs

| Metric | Target or interpretation |
|---|---|
| Changed-contract preflight duration | <= 2 minutes locally and in pull-request CI. |
| Full contract suite duration | <= 10 minutes target, 15 minutes hard CI timeout. |
| Report publication duration | <= 60 seconds after validators finish. |
| Contract asset count | At least 75 supported first-release assets. |
| Registry subject count | At least 25 supported active subjects. |
| Pact/message-pact suite count | At least 20 supported suites. |
| Validation result records | At least 500 records per full validation run. |
| Required seam readiness | 100% fresh passing evidence required before integration readiness. |
| Stale evidence count | Any stale required evidence blocks the affected gate. |

## Log Strategy

Every validation run emits structured records with:

- `runId`
- `gitRef`
- source path and source hash
- owner, provider, consumer, seam, protocol, contract id, and version
- validator name and version
- runtime profile
- start and end timestamp
- status: `passed`, `failed`, `blocked`, `partial`, or `stale`
- failure location when available
- remediation text
- correlation id for linking CI logs, generated reports, and health rows

Logs must not include secrets, production personal data, tokens, or unredacted sensitive fixture values.

## Tracing And Correlation

The Contract Platform is command-driven in the first release, so tracing is evidence correlation rather than distributed request tracing:

| Correlation surface | Design |
|---|---|
| CI run | Link GitHub run id, job id, `gitRef`, and evidence `runId`. |
| Local run | Generate `runId` and capture runtime profile, command, validator versions, and source hashes. |
| Registry checks | Include registry endpoint, subject, compatibility mode, and bounded readiness result. |
| Health snapshot | Carry the same `runId` and source hashes into read-only UI rows. |

If later promoted to a service, the same fields become OpenTelemetry span attributes and structured log fields.

## Alert Definitions

| Alert | Severity | Trigger | Runbook |
|---|---|---|---|
| Required contract suite blocked | P1 for release candidate, P2 otherwise | Any required seam has missing, failed, stale, or not-comparable evidence. | Rerun full suite, inspect owner/seam failures, remediate contract or metadata. |
| Schema Registry unavailable | P2 | Registry-dependent checks blocked after bounded readiness wait. | Start required Compose profile, verify endpoint and subject naming. |
| Secret scan failure | P1 | Secret or non-synthetic sensitive fixture detected. | Revoke/rotate if needed, remove fixture, regenerate evidence. |
| Validation duration budget exceeded | P2 | Preflight or full-suite budget breach. | Review parallelism, asset index, dependency cache, and slow validator group. |
| Health snapshot stale | P2 | Snapshot freshness keys no longer match current `gitRef`, validator versions, runtime profile, or schema version. | Regenerate evidence from source. |

Every alert includes owner, seam, protocol, source path, failing validator, and remediation link when available.

## Dashboard Specifications

| Dashboard panel | Contents |
|---|---|
| Contract readiness summary | Counts by passed, failed, blocked, partial, stale, owner, seam, and protocol. |
| Required seam status | Required integrations with current compatibility/security/readiness status. |
| Failure detail | Source path, owner, validator, location, severity, and remediation. |
| Freshness | `gitRef`, source hash, validator version, runtime profile, Schema Registry subject version, compatibility mode, and report schema version. |
| Runtime budget | Preflight duration, full-suite duration, registry wait, and report generation time. |

The dashboard is read-only. It cannot convert failed, partial, blocked, not-comparable, or stale evidence to green.

## Incident Response Hooks

| Scenario | Response |
|---|---|
| Release blocked by contract failure | Preserve evidence, assign owner by seam/provider/consumer, rerun only after contract or fixture fix. |
| Registry dependency broken | Keep static results, mark registry checks blocked, repair Compose/registry state, rerun compatibility scope. |
| Report generation failure | Preserve raw validator outputs and rerun deterministic aggregation after fix. |
| Health view unavailable | CI/local artifacts remain source of truth; UI failure does not mutate readiness. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors runtime budgets and first actionable failures. |
| `security-design.md` | Monitors secret scanning, metadata security, access, classification, and no manual green override. |
| `scalability-design.md` | Dashboards filter and paginate by owner, seam, protocol, source, status, and freshness. |
| `reliability-design.md` | Alerts on failed, blocked, partial, stale, not-comparable, and registry-unavailable states. |
| `logical-components.md` | Observability maps to ValidationOrchestrator, EvidencePublisher, and ContractHealthReadModel. |
| `components.md` | Feeds the Observability Platform and Enterprise Web operations surfaces without taking ownership of business services. |
| `services.md` | Monitors the contract strategy required for Enterprise Web, Booking, Charge, CMM, and Reference Data integrations. |
| `business-logic-model.md` | Implements publish contract health and generated consumer evidence workflows. |
