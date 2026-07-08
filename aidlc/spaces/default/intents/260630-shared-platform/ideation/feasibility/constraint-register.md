# Constraint Register - Shared Platform Feasibility

## Register Summary

This register captures technical, organizational, regulatory, and scope constraints for the Shared Platform MVP. It is based on `intent-statement.md`; optional Market Research inputs `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` are not available because Market Research is skipped for MVP scope.

## Technical Constraints

| ID | Constraint | Source | Classification | Impact | Treatment |
|----|------------|--------|----------------|--------|-----------|
| TC-001 | Enterprise Technical Environment v1.1 is binding. | Enterprise Tech Env | Mandated | All code, infrastructure, CI/CD, and frontend work must conform. | No waiver planned. |
| TC-002 | Runtime is on-premises; no public cloud provider. | Enterprise Tech Env | Mandated | AWS services/accounts are not applicable. | Use Docker Compose, Nginx, self-managed platform services. |
| TC-003 | Shared Platform is physically two services plus operated Kafka infrastructure. | Enterprise Tech Env, Module Tech Env | Mandated | `reference-data-service` and `identity-service` are separate deployables; Kafka is infrastructure. | Preserve service boundaries. |
| TC-004 | Backend service code uses Java 21 target / Java 17 floor and Spring Boot 3.3.x. | Enterprise Tech Env | Mandated/Default | Backend implementation choices are constrained. | Use inherited service starter. |
| TC-005 | PostgreSQL 15+ is the selected datastore. | Module Tech Env | Default pinned | Both services require their own stores. | No shared database. |
| TC-006 | Kafka events use Avro envelope and Confluent Schema Registry. | Enterprise Tech Env | Mandated | Event schemas require compatibility governance and message-pact tests. | Register schemas and enforce compatibility. |
| TC-007 | Frontends use Next.js App Router, React, TypeScript strict, Turborepo, Yarn Workspaces. | Enterprise Tech Env v1.1 | Mandated | `apps/reference-data` and `apps/auth` must follow the frontend constitution. | No `pages/`, use `proxy.ts`, BFF route handlers. |
| TC-008 | No downstream runtime modules in this workflow. | User instruction, Intent Statement | Scope constraint | Charge, Booking, and Container Movement cannot be built now. | Limit to provider contracts and Shared Platform runtime. |

## Organizational Constraints

| ID | Constraint | Source | Impact | Treatment |
|----|------------|--------|--------|-----------|
| OC-001 | Shared Platform must freeze provider contracts early for downstream modules. | Program Execution Plan | Delayed freeze blocks later parallel module work. | Include downstream representatives in gate review. |
| OC-002 | Standards Owner contact is TBD. | Enterprise Tech Env | Waiver and standards clarification path may be slow. | Identify owner before Construction. |
| OC-003 | Reference-data administration has operational workload. | Module Vision | Manual MVP maintenance can create data-quality risk. | Validate admin workflows and validation rules. |

## Regulatory and Compliance Constraints

| ID | Constraint | Source | Impact | Treatment |
|----|------------|--------|--------|-----------|
| RC-001 | Trade/regulatory footprint is unresolved. | Program Vision, Intent Statement | Affects residency, DR site, retention, and possible FMC considerations. | Resolve before deployment topology hardens. |
| RC-002 | Party/Customer data is PII-bearing. | Module Tech Env | Requires restricted access and evidence-grade logging. | Classify and access-log Party operations. |
| RC-003 | Identity authorization data is sensitive. | Module Tech Env | Requires least privilege and admin auditability. | Access-log role and permission changes. |
| RC-004 | OWASP Top 10, OWASP API Top 10, and CIS Controls apply. | Enterprise Tech Env | Control matrix must be completed. | Produce `security/owasp-compliance.md` in later NFR/security work. |

## Dependency Constraints

| ID | Dependency | Owner | Status | Treatment |
|----|------------|-------|--------|-----------|
| DC-001 | Keycloak 24 / enterprise OIDC provider | Security / IT | TBD | Earliest validation dependency. |
| DC-002 | Kafka and Confluent Schema Registry | Platform / Architecture | Planned / operated by Shared Platform | Provision topics and schema compatibility workflow. |
| DC-003 | Manual voyage/capacity source | Operations | Accepted MVP mitigation | Validate admin entry before Booking depends on it. |
| DC-004 | UN/LOCODE data source | External standard / reference admin | Manual MVP entry | Add validation and dependency-order loading. |
| DC-005 | Downstream module contract reviewers | Charge, Booking, Container Movement teams | Needed | Include in contract-freeze and approval gates. |

## Constraint Decision

No feasibility constraint blocks the workflow today. The stage should proceed with managed risks and explicit follow-up items for OIDC readiness, residency/footprint, freshness SLA, manual reference-data operations, and downstream contract coordination.