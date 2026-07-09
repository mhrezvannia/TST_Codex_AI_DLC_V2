# Reliability Design - contract-platform-catalog

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability for the Contract Platform means evidence is deterministic, fresh, reproducible, and fail-closed for required seams.

## Evidence State Machine

```text
[discovered]
     |
     v
[syntax_validated] --> [syntax_failed]
     |
     v
[metadata_validated] --> [metadata_failed]
     |
     v
[compatibility_checked] --> [compatibility_failed]
     |
     v
[fixture_verified] --> [fixture_failed]
     |
     v
[fresh_evidence] --> [stale_evidence]
```

Text fallback: a contract asset moves through discovery, syntax validation, metadata validation, compatibility checking, fixture verification, and fresh evidence publication. Any failed state blocks required readiness, and a later freshness mismatch moves prior green evidence to stale.

## Fail-Closed Behavior

| Failure | Reliability behavior |
|---|---|
| Syntax validation failure | Block required seam readiness and report file, line when available, validator, and remediation. |
| Metadata validation failure | Block readiness and report missing owner, consumer, auth, correlation, idempotency, observability, or story trace. |
| Compatibility failure | Block readiness unless an approved major-version migration or retirement exception is linked. |
| Schema Registry unavailable | Preserve static syntax and metadata results, mark registry-dependent checks `blocked`, and print Docker Compose remediation. |
| Pact/message-pact generation failure | Block provider/consumer readiness for the affected seam. |
| Report generation failure | Fail the validation job and preserve raw validator outputs where available. |
| Secret scan failure | Block release evidence and report redaction guidance. |

Partial reports are allowed only as explicit `partial` or `blocked` evidence. They are never converted into pass status.

## Retry And Recovery

Retry is intentionally limited:

| Operation | Retry policy |
|---|---|
| Static parsing and metadata validation | No retry; deterministic input errors should fail immediately. |
| Local Schema Registry readiness | Bounded readiness wait, then blocked state with required profile and endpoint. |
| Provider verification command startup | One local command retry only when startup fails before tests execute. |
| CI report upload | CI-native retry if available; local report generation remains deterministic and single-writer. |

Every failed validation result includes a documented local reproduction command. Registry-dependent failures include the Docker Compose profile or service needed to rerun locally.

## Freshness And Determinism

Evidence becomes stale when any freshness key changes:

- `gitRef`
- Contract source hash
- Validator version
- Runtime profile
- Schema Registry subject version
- Compatibility mode
- Report schema version
- Generated evidence timestamp older than 24 hours for active readiness views

For the same source files, validator versions, registry state, runtime profile, and `gitRef`, the runner emits deterministic result ordering and stable status values.

## Health Checks

The Contract Platform has no independent runtime availability target in the first release because it is an executable evidence platform. Reliability checks are therefore command and artifact checks:

| Check | Expected result |
|---|---|
| Changed-contract local command | Completes within budget or fails with reproducible remediation. |
| Full contract validation command | Emits complete, partial, failed, blocked, or stale evidence with no hidden green state. |
| Schema Registry adapter check | Identifies endpoint, subject, compatibility mode, and readiness. |
| Report integrity check | Confirms result records include `runId`, `gitRef`, source hashes, validator versions, runtime profile, start/end time, and status. |
| Read-only health view check | Confirms UI reads generated evidence and cannot manually edit health state. |

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements freshness, fail-closed rules, recovery, partial evidence, local reproduction, observability, and stale states. |
| `performance-requirements.md` | Preserves timing evidence and first actionable failure while continuing independent groups for partial evidence. |
| `security-requirements.md` | Treats security metadata and secret scan failures as blocking reliability outcomes. |
| `scalability-requirements.md` | Uses index-backed freshness and generated health snapshots at first-release scale. |
| `tech-stack-decisions.md` | Uses local Schema Registry, Docker Compose profiles, CI artifacts, and generated reports rather than remote SaaS or manual health editing. |
| `business-logic-model.md` | Implements deterministic validation, compatibility, evidence, and health publication workflows. |
