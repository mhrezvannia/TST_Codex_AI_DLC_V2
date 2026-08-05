# Shared Infrastructure - W2-03

## Upstream Coverage

This design consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resource Boundaries

| Resource | Owner | W2-03 access |
| --- | --- | --- |
| PostgreSQL container/host | Platform runtime | Dedicated `linercore_pricing` database and owner; no shared tables |
| Kafka/Schema Registry | Shared Platform | Charge topic/subjects through shared publisher and outbox patterns |
| Keycloak/identity-service | Shared Platform | Pricing analyst/admin and Booking service identities |
| reference-data-service | Shared Platform | Read-only stable IDs; Charge stores references only |
| Nginx | Platform runtime | `/charge-agreements/` route and correlation propagation |
| Observability stack | Platform runtime | Charge-specific targets, dashboards, traces, and alerts |

## Isolation Rules

Shared infrastructure does not imply shared domain ownership. Each service uses a dedicated database role and database. Topics, consumer groups, service tokens, dashboards, and alerts have explicit Charge ownership. Booking interacts only through the frozen pricing API/contract.

## Local Resource Corrections

Add a durable PostgreSQL named volume, Charge service/UI healthchecks, resource limits, log rotation, authenticated Charge UI configuration, and health-based dependency ordering. Resolve the current Grafana/Charge UI default host-port collision (`3003`) through profile-specific port configuration before running `full` plus `observability` together.

## Compliance and Evidence

Classify customer-specific agreement rates and quote snapshots as confidential commercial data. Restrict evidence access, redact general logs, retain immutable calculation/audit evidence under the approved retention policy, and record actor/correlation/version information for reconstruction. Jurisdiction-specific tariff-publication obligations remain a business/compliance decision; W2-03 must not claim regulatory publication coverage without that determination.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-07-25T21:42:51Z
**Iteration:** 2

### Findings

| # | Severity | Location | Finding | Recommendation |
| --- | --- | --- | --- | --- |
| 1 | Minor | Production topology | No approved production orchestrator, region, RTO, or RPO exists. | Keep W2-03 acceptance local/on-prem; require a separate approved production design before promotion. |
| 2 | Minor | Regulatory publication | Applicability of jurisdiction-specific public tariff rules is unresolved. | Track as compliance risk; do not claim the internal W2-03 slice publishes regulatory tariffs. |

### Validation Tool Results

| Tool | Result | Interpretation |
| --- | --- | --- |
| Compose/config inspection | GAPS IDENTIFIED | Missing Postgres volume, Charge health gates/limits, and one host-port collision are now explicit required changes. |
| Workflow inspection | GAPS IDENTIFIED | Charge UI and W2-03 live/audit gates must be added to CI. |
| Prometheus/application config inspection | GAPS IDENTIFIED | Scrape target exists but Charge does not expose `/actuator/prometheus`. |
| Required-section/upstream shape inspection | PASS | All five outputs include multiple H2 sections and every declared upstream artifact name. |

### Summary

Iteration 1 found that the historical host-runtime design and current Compose configuration could not support W2-03 durability, health, monitoring, or acceptance claims. The aggregate remediation is implementable for the approved local/on-prem target and leaves unapproved production/regulatory choices explicit.
