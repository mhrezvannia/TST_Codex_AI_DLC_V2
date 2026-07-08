# RAID Log - Shared Platform Feasibility

## RAID Summary

The Shared Platform MVP is feasible with managed risks. This RAID log traces back to `intent-statement.md`; optional Market Research inputs `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` are absent because the MVP scope skips Market Research.

## Risks

| ID | Risk | Likelihood | Impact | Owner | Mitigation | Status |
|----|------|------------|--------|-------|------------|--------|
| R-001 | Keycloak 24 / OIDC provider is unavailable or not ready for service-edge validation. | Medium | High | Security / IT | Validate IdP, token issuance, JWKS, and service-edge validation path before Construction. | Open |
| R-002 | Trade/regulatory footprint and primary/DR site remain unresolved. | Medium | High | Platform / Architecture | Decide footprint before hardening residency, DR, retention, and deployment topology. | Open |
| R-003 | Reference-data freshness SLA is not defined before event and replica tests are designed. | Medium | Medium | Platform / Architecture | Define change-to-replica lag target during Inception. | Open |
| R-004 | Manual voyage/capacity and UN/LOCODE maintenance creates data-quality issues. | Medium | Medium | Reference-data administrator | Add validation, dependency-order loading, and admin workflow review. | Open |
| R-005 | Downstream teams are not available for contract-freeze review. | Medium | High | Delivery / Platform | Include Charge, Booking, and Container Movement representatives in gates. | Open |
| R-006 | Scope expands into Charge, Booking, or Container Movement runtime work. | Medium | Medium | Product / Platform | Enforce Shared Platform-only scope in every stage artifact and gate. | Open |

## Assumptions

| ID | Assumption | Validation path | Owner | Status |
|----|------------|-----------------|-------|--------|
| A-001 | Enterprise Tech Env v1.1 remains the binding standard for this run. | Conformance table and gate approval. | Platform / Architecture | Accepted |
| A-002 | Keycloak 24 can support internal carrier staff SSO for MVP. | Feasibility spike / identity integration test. | Security / IT | Unvalidated |
| A-003 | Manual voyage and nominal capacity entry is acceptable for MVP. | Admin workflow review and data-quality checks. | Operations | Unvalidated |
| A-004 | Manual Country-Port / UN/LOCODE maintenance is acceptable for MVP. | Admin workflow review and validation rules. | Reference-data administrator | Unvalidated |
| A-005 | Kafka and Confluent Schema Registry can be self-managed on-premises by the platform team. | Environment readiness check. | Platform operator | Unvalidated |
| A-006 | Downstream modules can build later against provider contracts and stubs. | Contract-freeze gate and Pact/message-pact setup. | Platform / downstream module leads | Unvalidated |

## Issues

| ID | Issue | Impact | Owner | Resolution path | Status |
|----|-------|--------|-------|-----------------|--------|
| I-001 | User-named vision files were not present under exact names; available files include `program-vision-document 4.md` and `shared-platform-module-vision 1.md`. | Traceability could be confusing if filenames are not reconciled. | Platform / Documentation | Rename files or update references in future docs. | Open |
| I-002 | Program Vision contract map does not yet ratify the nine `referencedata.<entity>.changed` event names defined in module tech-env. | Program-level contract map can drift from module-side construction input. | Platform / Architecture | Reconcile Program Vision Section 5 in next documentation sweep. | Open |
| I-003 | `security/owasp-compliance.md` is planned but not complete. | Security evidence is incomplete for later gates. | Security / IT | Complete during NFR/security work. | Open |

## Dependencies

| ID | Dependency | Needed for | Owner | Timing | Status |
|----|------------|------------|-------|--------|--------|
| D-001 | Keycloak 24 / enterprise OIDC provider | `identity-service`, `apps/auth`, service-to-service auth | Security / IT | Before Construction | Open |
| D-002 | Kafka + Confluent Schema Registry | Reference-changed events and event bus integration | Platform operator | Before event implementation | Open |
| D-003 | PostgreSQL 15+ on-premises | Both backend services | Platform operator | Before backend implementation | Open |
| D-004 | Harbor and Nexus/Artifactory | Image and package publishing | Platform operator | Before CI/CD hardening | Open |
| D-005 | Downstream module representatives | Contract usability review | Charge, Booking, Container Movement teams | Before contract freeze | Open |
| D-006 | Trade/regulatory footprint decision | Residency, DR, retention, and possible FMC implications | Commercial / Platform | Before deployment topology hardens | Open |

## Overall RAID Decision

Proceed with Feasibility approval if stakeholders accept the managed-risk posture. No current item requires building Charge, Booking, or Container Movement in this workflow.