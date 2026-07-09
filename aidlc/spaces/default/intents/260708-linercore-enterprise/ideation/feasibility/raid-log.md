# RAID Log - LinerCore Enterprise Feasibility

## Source Context

This RAID log consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/competitive-analysis.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/market-trends.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/build-vs-buy.md`

## Risks

| ID | Risk | Likelihood | Impact | Owner | Treatment | Status |
|----|------|------------|--------|-------|-----------|--------|
| R-001 | Enterprise scope becomes too broad and produces superficial artifacts. | Medium | High | Product/Delivery | Enforce workstream split, scope gates, and real completion criteria. | Open |
| R-002 | Docker Compose full profile cannot run all required services locally. | Medium | High | Platform/DevOps | Make Compose parity a construction and operation gate. | Open |
| R-003 | Booking and CMM greenfield complexity is underestimated. | Medium | High | Architecture/Product | Reverse engineer and decompose by end-to-end flows before construction. | Open |
| R-004 | D&D calculation errors cause commercial disputes. | Medium | High | Charge/Product/Quality | Create rule fixtures, audit trail, edge-case tests, and manual fallback. | Open |
| R-005 | Contract tests are delayed until after module implementation. | Medium | High | Architecture/Quality | Freeze and test OpenAPI/Avro/AsyncAPI contracts early. | Open |
| R-006 | Raw UI prototype behavior conflicts with authoritative requirements. | Medium | Medium | Design/Product | Preserve visual design but map to real APIs, permissions, and workflows. | Open |
| R-007 | External movement data quality is poor. | High | Medium | CMM/Operations | Build duplicate, late, out-of-order, dead-letter, and exception handling. | Open |
| R-008 | Security and audit controls are treated as late NFR polish. | Medium | High | Security/Compliance | Track controls from feasibility through Operation. | Open |

## Assumptions

| ID | Assumption | Owner | Validation Point | Status |
|----|------------|-------|------------------|--------|
| A-001 | The completed Shared Platform MVP can be reused and hardened rather than rebuilt. | Architecture | Reverse Engineering | Open |
| A-002 | One local PostgreSQL container with multiple logical databases is acceptable for local runtime. | Platform | Infrastructure Design | Open |
| A-003 | Keycloak remains the authentication provider. | Security | NFR Requirements | Open |
| A-004 | Kafka and Schema Registry remain the async event foundation. | Architecture | Application Design | Open |
| A-005 | External finance can initially be represented through an adapter and contract-test seam. | Product/Architecture | Scope Definition | Open |
| A-006 | DCSA v2.2 movement validation is sufficient for initial CMM movement semantics. | CMM/Product | Requirements Analysis | Open |

## Issues

| ID | Issue | Impact | Owner | Resolution Plan | Status |
|----|-------|--------|-------|-----------------|--------|
| I-001 | Raw Claude UI HTML and screenshots are not fully semantically graph-indexed by exact source path. | UI requirements could be under-read. | Design/Product | Normalize or analyze UI export during mockup/refined mockup stages. | Open |
| I-002 | codebase-memory MCP exposed no resources in this session. | Secondary indexed lookup unavailable. | Orchestrator | Use Graphify as primary and retry MCP when tools/resources appear. | Open |
| I-003 | Module-specific vision/tech-env docs for Charge, Booking, and CMM were not found under `docs/`. | Later stage requirements may need to generate missing module authority. | Product/Architecture | Carry into Scope Definition and Requirements Analysis. | Open |

## Dependencies

| ID | Dependency | Needed For | Owner | Status |
|----|------------|------------|-------|--------|
| D-001 | Shared Platform MVP and `shared-platform-mvp-complete` tag | Brownfield baseline and traceability | Platform | Available |
| D-002 | Program Vision, Execution Plan, Enterprise Technical Environment | Enterprise scope and standards | Product/Architecture | Available |
| D-003 | Enterprise contracts | Integration design and contract tests | Architecture/Quality | Available as prose; executable artifacts pending |
| D-004 | Graphify graph/report | Codebase understanding | Orchestrator | Available |
| D-005 | Claude UI export | Preferred UX baseline | Design/Product | Available with indexing caveat |
| D-006 | Keycloak, Kafka, Schema Registry, PostgreSQL | Local full runtime | Platform/DevOps | Pending implementation verification |
| D-007 | External finance, vessel schedule/capacity, movement feeds | Enterprise integrations | Product/Architecture | Not yet finalized |

## Current Feasibility Position

Proceed with caution. The program is feasible if the next stages narrow workstream boundaries, preserve historical baseline integrity, and make contract/runtime/operation gates explicit before construction.
