# Feasibility Assessment - Shared Platform

## Executive Verdict

The Shared Platform MVP is feasible with managed risks. The module should proceed because the authoritative documents already fix the build order, module boundaries, and technical environment: Shared Platform is first, conforms to Enterprise Technical Environment v1.1 without waivers, and is limited to `reference-data-service`, `identity-service`, Kafka event bus integration, `apps/reference-data`, and `apps/auth`.

Feasibility is conditional on early validation of four items: enterprise OIDC / Keycloak 24 availability, trade/regulatory footprint and site residency, reference-data freshness SLA, and manual data operations for voyages/capacity and UN/LOCODE-based location data.

## Technical Viability

| Area | Viability | Rationale |
|------|-----------|-----------|
| Service topology | Feasible | Enterprise Tech Env v1.1 mandates microservices with one deployable per bounded context. Shared Platform is already decomposed into `reference-data-service`, `identity-service`, and operated Kafka infrastructure. |
| Runtime substrate | Feasible | On-premises Docker and Docker Compose are mandated and confirmed. No AWS accounts or AWS services are in use or required for this module. |
| Backend stack | Feasible | Java 21 target, Spring Boot 3.3.x, PostgreSQL 15+, Spring Kafka, Avro 1.11.x, and Confluent Schema Registry are all mandated or inherited in the module tech-env. |
| Frontend stack | Feasible | `apps/reference-data` and `apps/auth` inherit Next.js App Router, React, TypeScript strict mode, Turborepo, Yarn Workspaces, BFF route handlers, Tailwind, TanStack Query, Zustand, and RHF/Zod. |
| Identity | Feasible with dependency risk | Authentication is delegated to Keycloak 24; `identity-service` owns authorization. The earliest validation dependency is confirming Keycloak availability and service-edge token validation. |
| Eventing | Feasible | Kafka, Confluent Schema Registry, Avro envelope, transactional outbox, and message-pact tests are explicitly mandated. |
| Reference data | Feasible with operational risk | The nine reference sets are well-defined; manual voyage/capacity and UN/LOCODE data maintenance are accepted MVP mitigations but must be validated operationally. |

## Constraint Fit

| Constraint | Feasibility impact | Treatment |
|------------|--------------------|-----------|
| Enterprise Technical Environment v1.1 | Positive constraint | Treat as binding. No waivers are planned. |
| No public cloud / on-premises only | Positive constraint if infrastructure team is ready | AWS service/account questions are not applicable; feasibility must focus on Docker Compose, Nginx, Harbor, Nexus/Artifactory, Vault, ELK, Prometheus/Grafana, Jaeger, and self-hosted runners. |
| Shared Platform first | Positive constraint | Enables contract freeze for downstream module construction. |
| No Charge, Booking, or Container Movement runtime work | Scope control | Preserve the boundary. Downstream modules may review contracts but their runtime capabilities are out of scope. |
| PII and identity ownership | Compliance constraint | Party/Customer data and authorization data require stricter access logging and least privilege. |
| Primary/DR site and residency TBD | Feasibility risk | Must be resolved before hardening deployment topology and data-retention controls. |

## Risk Analysis

| Risk | Likelihood | Impact | Feasibility judgement | Mitigation |
|------|------------|--------|----------------------|------------|
| Keycloak 24 / OIDC path not ready | Medium | High | Managed risk | Validate IdP availability and token-validation pattern before Construction. |
| Residency and trade footprint unresolved | Medium | High | Managed risk | Keep as top Feasibility and Requirements Analysis item; decide before deployment topology hardens. |
| Reference-data freshness SLA undefined | Medium | Medium | Managed risk | Define in Inception and use it as an SLO and acceptance threshold. |
| Manual voyage/capacity or UN/LOCODE maintenance is too error-prone | Medium | Medium | Managed risk | Validate admin workflows and add structural-integrity checks. |
| Contract freeze coordination slips | Medium | High | Managed risk | Include downstream representatives at gates and freeze provider contracts early. |
| Scope creep into downstream business modules | Medium | Medium | Managed risk | Keep only Shared Platform runtime scope in this workflow. |

## AWS / Cloud Landscape Assessment

AWS services and AWS accounts are not applicable to this workflow. Enterprise Technical Environment v1.1 explicitly fixes the primary runtime as on-premises with no public cloud provider. Infrastructure feasibility should therefore assess self-managed Docker Compose, Nginx, Kafka, Schema Registry, PostgreSQL, Vault, ELK, Prometheus/Grafana, Jaeger, Harbor, Nexus/Artifactory, GitHub Actions self-hosted runners, Terraform, and Ansible.

The AWS-platform perspective contributes the infrastructure feasibility discipline: environment parity, infrastructure as code, drift control, least privilege, cost visibility, and operational readiness. The concrete technology choices are on-premises, not AWS.

## Compliance Assessment

| Compliance area | Feasibility position | Required follow-up |
|-----------------|----------------------|--------------------|
| Data classification | Feasible | Classify Party/Customer PII as Confidential/Restricted and identity authorization data as sensitive. |
| Privacy and PII | Feasible with controls | Access logging, least privilege, encryption at rest/in transit, and audit evidence are mandatory. |
| Residency | Open risk | Resolve trade/regulatory footprint and physical site/DR location before production deployment design. |
| OWASP / API / CIS | Feasible | Complete `security/owasp-compliance.md` during later security/NFR work. |
| Auditability | Feasible | Correlation id propagation, structured logs, and event envelope support traceability. |

## Upstream Input Coverage

This assessment used `intent-statement.md` as the required upstream input. The optional Market Research artifacts `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` are absent because MVP scope skips Market Research. No competitive or market claims are introduced in this stage.

## Feasibility Decision

Proceed to Scope Definition after approval. The initiative is feasible if the workflow keeps the Shared Platform boundary intact and carries the managed risks into subsequent Ideation and Inception artifacts.