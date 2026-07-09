# Business Rules - Observability Quality Operation Readiness

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The accepted recommended answers keep this unit inside its approved cross-cutting boundary and require real evidence before completion. The rules below define when evidence is accepted, rejected, or escalated.

## Ownership Rules

- OQR-OWN-001: `observability-quality-operation-readiness` owns evidence aggregation, quality gates, logs, metrics, traces, dashboards, alerts, SLO evidence, CI/CD checks, runbooks, readiness, rollback, backup, disaster recovery, and incident-readiness artifacts.
- OQR-OWN-002: This unit does not own pricing, booking, movement, agreement, D&D, identity, or reference-data domain decisions.
- OQR-OWN-003: This unit must not mutate service-owned business records. It may read evidence through approved APIs, events, reports, artifacts, dashboards, logs, metrics, and traces.
- OQR-OWN-004: Evidence must cite the owning component from `components.md` or `services.md`.
- OQR-OWN-005: A completion claim is invalid when evidence is produced by a non-owning component for a business behavior it does not own.

## Evidence Acceptance Rules

| Rule | Statement |
|---|---|
| OQR-EVD-001 | Evidence must include source, owner, timestamp, `gitRef`, runtime profile, command or endpoint, status, and correlation ID where applicable. |
| OQR-EVD-002 | Evidence must be machine-verifiable whenever the source is a contract, test, migration, seed, runtime health, trace, log, metric, or CI report. |
| OQR-EVD-003 | Manual notes are allowed only as context and cannot turn a failed or missing machine check into a pass. |
| OQR-EVD-004 | Evidence for E2E Flow 1-5 must prove real service/API/event/UI/runtime behavior and cannot be screenshots or mock responses alone. |
| OQR-EVD-005 | Evidence is stale when it was produced for a different `gitRef`, contract version, runtime profile, schema version, or seed profile. |
| OQR-EVD-006 | Evidence bundle summaries must list both passing and blocking items; hiding failed items is a gate failure. |

## Quality Gate Rules

| Rule | Statement |
|---|---|
| OQR-GATE-001 | A quality gate passes only when every mandatory check has fresh passing evidence. |
| OQR-GATE-002 | Missing, stale, mock-only, documents-only, hardcoded, or container-start-only evidence blocks the gate. |
| OQR-GATE-003 | Contract readiness requires executable OpenAPI, Avro, AsyncAPI, Pact, message-pact, and Schema Registry checks where applicable to the integration. |
| OQR-GATE-004 | Runtime readiness requires more than container liveness: migrations, seed validation, health checks, route checks, contract checks, and E2E smoke evidence must be present for the selected profile. |
| OQR-GATE-005 | Security readiness requires denied-path tests, authorization audit evidence, and service-to-service authentication evidence where protected integrations are involved. |
| OQR-GATE-006 | Resilience readiness requires timeout, retry, circuit-breaker, idempotency, deduplication, and ordering checks for the relevant HTTP/event seams. |
| OQR-GATE-007 | Observability readiness requires correlation propagation across HTTP, events, logs, metrics, and traces for the relevant flow. |

## No-Fake-Completion Rules

- OQR-NFC-001: Markdown contracts without executable validation do not prove contract readiness.
- OQR-NFC-002: UI screenshots or mock-state routes do not prove workflow completion.
- OQR-NFC-003: TODO-only methods, stubs, or hardcoded domain outcomes block completion.
- OQR-NFC-004: Container startup without service health, migrations, contracts, and flow checks does not prove runtime readiness.
- OQR-NFC-005: A passing happy-path test does not waive required negative, denied-path, contract, resilience, or boundary evidence.
- OQR-NFC-006: Completion summaries must disclose blockers and skipped checks.

## Readiness And Operation Handoff Rules

| Rule | Statement |
|---|---|
| OQR-OPS-001 | Operation handoff items must have owner, evidence source, verification command, latest status, and unresolved risk if any. |
| OQR-OPS-002 | Runbooks must link to the alert or incident scenario they support. |
| OQR-OPS-003 | Rollback, backup, and DR readiness may be refined in Operation, but Construction must identify required evidence and blockers. |
| OQR-OPS-004 | SLO targets are set in NFR Requirements; this unit records evidence against those targets after they exist. |
| OQR-OPS-005 | Open risks carried to Operation must be explicit and cannot be used to hide failed Construction completion criteria. |

## Exception Rules

| Exception | Rule |
|---|---|
| Evidence source unavailable | Mark affected checks blocked and preserve partial evidence with owner and retry command. |
| Non-critical dashboard missing | Mark readiness partial unless the dashboard is mandatory for the current gate or Operation handoff. |
| Known external adapter deferral | Accept only if requirements explicitly defer the adapter and local deterministic seam evidence exists. |
| Reviewer disagreement | Keep gate open until the design records the disagreement and the human approves or requests changes. |

## Traceability

| Source | Business-rule coverage |
|---|---|
| `unit-of-work.md` | Defines cross-cutting evidence and readiness ownership plus no-masking boundary. |
| `unit-of-work-story-map.md` | Maps rules to US-SP, US-CHG, US-CMM, and US-RUN evidence stories. |
| `requirements.md` | Supplies contract, runtime, observability, security, resilience, and no-fake-completion requirements. |
| `components.md` | Supplies ownership boundaries for Observability Platform, Contract Platform, Local Runtime Platform, services, and Enterprise Web. |
| `component-methods.md` | Supplies evidence collection, health, contract health, and E2E suite method expectations. |
| `services.md` | Supplies service topology, contract strategy, event paths, runtime services, and no cross-service database access rule. |
