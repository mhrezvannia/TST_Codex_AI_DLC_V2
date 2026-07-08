# Intent Backlog - Shared Platform MVP

## Backlog Summary

This proto-backlog translates the approved scope into dependency-ordered intent items. It is not yet the final unit-of-work DAG; Inception will refine these into requirements, stories, application design, and units. Source trace: `intent-statement.md`, `feasibility-assessment.md`, and `constraint-register.md`.

## Prioritized Proto-Units

| ID | Proto-unit | MoSCoW | Sequence | Primary value | Key dependencies |
|----|------------|--------|----------|---------------|------------------|
| PB-001 | Platform/service skeleton and conformance baseline | Must | 1 | Establishes Enterprise Tech Env v1.1 structure for both services and apps. | None |
| PB-002 | Identity/OIDC validation slice | Must | 2 | Proves Keycloak 24 authentication and service-edge token validation path. | PB-001, Keycloak availability |
| PB-003 | Carrier role model and authorization API | Must | 3 | Provides platform-owned roles and permission checks. | PB-002 |
| PB-004 | Reference domain model for nine sets | Must | 4 | Defines canonical ownership and validation for shared data. | PB-001 |
| PB-005 | Reference Open Host Service contracts | Must | 5 | Gives consumers stable REST/OpenAPI provider contracts. | PB-004 |
| PB-006 | Reference admin maintenance workflows | Must | 6 | Enables governed manual MVP data maintenance. | PB-004, PB-005 |
| PB-007 | Reference-change event contracts | Must | 7 | Defines the nine `referencedata.*.changed` Avro event types. | PB-004 |
| PB-008 | Kafka/Schema Registry/outbox integration | Must | 8 | Proves reliable, traceable event publication. | PB-007, Kafka/SR readiness |
| PB-009 | `apps/auth` sign-on flow | Must | 9 | Provides the internal staff auth entrypoint. | PB-002, frontend baseline |
| PB-010 | `apps/reference-data` admin UI | Must | 10 | Provides admin maintenance UX for reference sets. | PB-005, PB-006, frontend baseline |
| PB-011 | Contract and compatibility test suite | Must | 11 | Enables downstream modules to build against frozen contracts. | PB-005, PB-007, PB-008 |
| PB-012 | Observability, freshness SLO, and security evidence | Must | 12 | Makes operations, auditability, and compliance evidence explicit. | PB-002 through PB-011 |
| PB-013 | Bulk import/export convenience | Should | Later | Reduces admin effort if manual reference maintenance becomes heavy. | PB-006 |
| PB-014 | Reference serving cache | Should | Later | Improves read latency if usage requires it. | PB-005 |
| PB-015 | Advanced admin filtering and dashboards | Could | Later | Improves operator ergonomics after core flows work. | PB-010, PB-012 |

## Dependency Notes

- PB-001 is first because all generated code must conform to the mandated skeleton and frontend constitution.
- PB-002 is early because Feasibility identified Keycloak/OIDC readiness as the earliest validation dependency.
- PB-004 through PB-008 are the core reference-data and event backbone path.
- PB-009 and PB-010 are Must Have because the approved scope includes `apps/auth` and `apps/reference-data`.
- PB-011 is the contract-freeze enabler for downstream modules.
- PB-012 closes the risk loop from Feasibility: freshness SLA, auditability, observability, and security evidence.

## WSJF Lite Ranking

| ID | Business value | Time criticality | Risk reduction | Effort | Relative priority |
|----|----------------|------------------|----------------|--------|-------------------|
| PB-001 | High | High | High | Medium | 1 |
| PB-002 | High | High | High | Medium | 2 |
| PB-004 | High | High | Medium | Medium | 3 |
| PB-005 | High | High | Medium | Medium | 4 |
| PB-007 | High | High | Medium | Medium | 5 |
| PB-008 | High | High | High | High | 6 |
| PB-003 | Medium | Medium | High | Medium | 7 |
| PB-006 | High | Medium | Medium | Medium | 8 |
| PB-009 | Medium | Medium | Medium | Medium | 9 |
| PB-010 | High | Medium | Medium | High | 10 |
| PB-011 | High | High | High | High | 11 |
| PB-012 | High | Medium | High | Medium | 12 |

## MVP Boundary

Everything PB-001 through PB-012 is inside the MVP backlog. PB-013 through PB-015 are outside the first MVP cut unless later Inception evidence shows they are necessary to meet the approved success metrics.

## Explicit Non-Backlog Items

The following are not backlog items for this workflow:

| Excluded item | Reason |
|---------------|--------|
| Pricing/agreement functions | Charge module runtime scope, not Shared Platform. |
| Booking capture, pricing orchestration, invoice emission | Booking module runtime scope, not Shared Platform. |
| Container registry and movement lifecycle | Container Movement module runtime scope, not Shared Platform. |
| Customer-facing identity | Deferred phase scope. |
| External schedule/UNLOCODE feeds | Deferred; manual maintenance is MVP mitigation. |
| Multi-entity and multi-currency | Deferred phase scope. |

## Delivery Guidance

Use dependency-first ordering, then refine with risk reduction during Inception. The first Construction Bolt should be a walking skeleton if the team's greenfield MVP practices remain in force: a minimal vertical path that proves service skeleton, auth validation, a reference API, event publication, and app/BFF access without expanding into downstream module runtime behavior.