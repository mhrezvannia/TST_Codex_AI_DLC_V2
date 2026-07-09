# Shared Infrastructure - contract-platform-catalog

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This file is produced because contract validation shares infrastructure with Local Runtime, CI Pipeline, Enterprise Web, provider services, and consumer services.

## Shared Resource Inventory

| Shared resource | Shared by | Ownership boundary |
|---|---|---|
| Contract source tree | Contract Platform, provider units, consumer units, CI, Enterprise Web health readers. | Contract Platform owns layout and validation; provider/consumer units own contract content for their seams. |
| Local Kafka and Schema Registry | Contract Platform, Reference Data, Booking, CMM, Local Runtime Platform. | Local Runtime owns service availability; Contract Platform owns compatibility checks and evidence. |
| GitHub Actions runners | Contract Platform, code build/test, CI Pipeline. | CI Pipeline owns runner configuration; Contract Platform owns contract jobs and outputs. |
| CI artifact storage | Contract evidence, readiness reports, operations handoff, health snapshots. | Pipeline controls retention and access; evidence producers own record schema and freshness. |
| Enterprise Web operations surface | Contract health, runtime health, observability readiness, quality gates. | Enterprise Web presents read-only data; source platforms own evidence. |
| Observability stack | Contract validation metrics, service logs/traces, runtime readiness. | Observability Platform owns storage and dashboards; Contract Platform emits evidence records. |

## Access Boundaries

| Boundary | Rule |
|---|---|
| Provider/consumer services | May consume generated clients, fixtures, and reports; may not edit generated pass/fail status. |
| Enterprise Web | Displays generated health; does not mutate contract readiness. |
| CI Pipeline | Executes validators and stores artifacts; cannot override failed evidence to pass. |
| Local Runtime Platform | Provides Kafka/Schema Registry endpoints; Contract Platform treats unavailable registry as blocked evidence. |
| Observability Platform | Displays metrics/logs/traces; does not become the contract source of truth. |

## Shared Networking

Local and CI registry checks use the same endpoint contract:

```text
[Validator Job] --> [Compose Network] --> [Schema Registry] --> [Kafka]
```

Text fallback: the validator job reaches Schema Registry through the local or CI Compose network. Kafka backs Schema Registry compatibility where required; static validation remains independent of runtime services.

No business service may query another service database to satisfy contract evidence. Contract readiness is based on executable contract files, fixtures, validator output, generated reports, and service-owned tests.

## Resource Ownership And Lifecycle

| Resource | Lifecycle rule |
|---|---|
| Contract source tree | Versioned with application code and reviewed in pull requests. |
| Generated metadata index | Rebuilt on every validation run and not manually edited. |
| Generated health snapshot | Rebuilt from validator output and freshness keys. |
| CI artifacts | Retained according to release-candidate and internal/confidential evidence policy. |
| Local registry state | Disposable local runtime resource; compatibility evidence must capture subject versions and runtime profile. |
| Future central registry | Deferred until generated artifacts prove insufficient; requires separate architecture approval. |

## Compliance And Security Controls

| Control | Shared-infrastructure implication |
|---|---|
| Least privilege | CI jobs and UI readers receive only artifact and source access needed for their function. |
| Data classification | Contract evidence and release-candidate bundles are internal/confidential by default. |
| Secret protection | Fixtures and reports are scanned and redacted before publication. |
| Auditability | Evidence records include actor or CI run identity, `runId`, `gitRef`, timestamp, source hashes, and validator versions. |
| Production approval | Contract health can block readiness but cannot bypass manual production promotion approval. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares local/CI resources without forcing all checks to start the full runtime. |
| `security-design.md` | Enforces read-only health views, redaction, retention, audit, and no manual status editing. |
| `scalability-design.md` | Keeps shared artifacts compact, partitioned, and filterable across owners and seams. |
| `reliability-design.md` | Preserves fail-closed behavior for unavailable shared resources and stale generated evidence. |
| `logical-components.md` | Maps shared resources to repository tree, SchemaRegistryAdapter, EvidencePublisher, ContractHealthReadModel, and validator toolchain. |
| `components.md` | Separates Contract Platform, Local Runtime Platform, Observability Platform, Enterprise Web, and service ownership. |
| `services.md` | Supports the enterprise contract strategy across HTTP and Kafka seams. |
| `business-logic-model.md` | Implements shared evidence flows without taking over provider or consumer implementation. |
