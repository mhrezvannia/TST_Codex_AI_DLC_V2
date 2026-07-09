# Feasibility Assessment - LinerCore Enterprise

## Source Context

This assessment consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/competitive-analysis.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/market-trends.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/build-vs-buy.md`

It also uses the current Graphify graph as the primary codebase-understanding layer.

## Executive Feasibility Decision

The complete LinerCore enterprise program is feasible, but only as a staged, contract-driven enterprise delivery. It is not feasible as a single unsequenced implementation pass.

The core feasibility basis is:

- The domain is decomposable into explicit bounded workstreams: Shared Platform, Charge Calculation & Customer Agreement, Customer Booking, Container Movement Management, UI/runtime/operation.
- The Shared Platform MVP is complete and preserved as a brownfield baseline.
- Graphify shows existing implementation for Shared Platform and partial Charge Agreement capability.
- Authoritative documents and enterprise contracts already define the cross-module target.
- Market research supports a build-first approach for core carrier-owned domain logic.
- Enterprise Operation is in scope, so infrastructure, observability, and runbooks can be designed rather than retrofitted.

The core feasibility risk is scale. The program includes multiple services, frontend workflows, synchronous APIs, asynchronous events, contract testing, full local runtime, and operation readiness. It must be broken into module workstreams and integration milestones.

## Technical Viability

| Area | Feasibility | Rationale |
|------|-------------|-----------|
| Shared Platform hardening | Feasible | Existing MVP and graph-visible reference data, identity, and outbox concepts provide a baseline. |
| Charge and Customer Agreement | Feasible with extension | Existing `charge-agreement-service` appears in Graphify; pricing, tariffs, D&D, resilience, and full UI remain to be completed. |
| Customer Booking | Feasible but high effort | Booking is a core orchestrator and appears greenfield/unknown in current preparation; it needs full lifecycle, pricing, movement, D&D trigger, and exception logic. |
| Container Movement Management | Feasible but high effort | CMM is separable as a movement reporting owner, but must handle DCSA validation, event ordering, late/out-of-order events, and status publication. |
| D&D | Feasible with high correctness risk | Ownership is clear: Booking triggers, Charge calculates, CMM reports movements. Boundary detection and chargeable-day calculation need rigorous tests. |
| Full UI | Feasible with caveat | Claude UI is present as visual baseline; raw HTML/screenshots are not fully semantically graph-indexed and must be normalized or analyzed before hard requirements. |
| Local Docker runtime | Feasible but gating | Docker Compose profiles, Keycloak, Kafka, Schema Registry, PostgreSQL logical databases, services, frontends, reverse proxy, and observability must be proven before completion. |
| Enterprise Operation | Feasible with planned effort | Operation stages are in scope and must produce deployment, provisioning, observability, incident, performance, and feedback artifacts. |

## Architecture Feasibility

The architecture is feasible if it keeps the enterprise document's module and data-ownership rules:

- No shared domain database.
- No cross-module SQL joins.
- One PostgreSQL container may host multiple logical databases in local runtime.
- Services integrate only through approved APIs and events.
- Booking owns lifecycle and D&D trigger logic.
- Charge owns agreements, pricing, D&D rules, free time, rates, and D&D calculation.
- CMM owns movement capture, movement validation, journey state, status derivation, and status publication.
- Shared Platform owns identity, reference data, and event transport foundations.

The highest-risk architectural point is not service count; it is cross-service contract correctness. OpenAPI, Avro, AsyncAPI, Schema Registry compatibility, Pact, message-pact, idempotency, ordering, deduplication, and correlation IDs must be introduced as implementation gates, not after-the-fact checks.

## Infrastructure Feasibility

The infrastructure target is feasible for local and on-premises execution:

- Local: `docker compose --profile full up -d --build`.
- Profiles: `core`, `app`, `observability`, `devtools`, `full`, plus useful module modes.
- Runtime components: PostgreSQL, Kafka, Schema Registry, Keycloak, backend services, frontend applications, reverse proxy, contract-test support, observability support.
- Independent development mode: infrastructure in Docker while a service or frontend runs directly from the IDE.

The AWS Platform support perspective is limited here: the authoritative enterprise baseline says no public cloud runtime dependency. Therefore AWS account/service selection is not a prerequisite for this feasibility stage. The same Well-Architected concerns still apply as general infrastructure concerns: operational excellence, security, reliability, performance, cost, and sustainability.

## Compliance and Security Feasibility

The program is feasible from a compliance standpoint if controls are designed early:

- Data classes include commercial/confidential pricing and agreement data, customer/party PII, operational movement data, identity/authorization data, audit logs, and secrets.
- Likely control families include SOC2-style security/availability/processing-integrity evidence, GDPR/data-residency analysis if EU/EEA personal data or EU operations are in scope, and internal audit requirements.
- PCI and HIPAA are not assumed in core scope unless payment-card or protected-health data is later introduced.
- Security controls must include Keycloak/OIDC, JWT/RS256, service authorization, least privilege, Kafka ACLs, TLS, encryption at rest, secrets management, audit logging, correlation IDs, and incident readiness.

The largest compliance uncertainty is geography and trade/regulatory footprint. Program Vision already defers this, so Scope Definition and NFR stages must not invent the answer.

## Key Feasibility Risks

| Risk | Severity | Feasibility impact | Treatment |
|------|----------|--------------------|-----------|
| Enterprise scope is too broad for one delivery slice | High | Could stall delivery or produce superficial skeletons | Use module workstreams, contract freeze, integration milestones, and real completion gates |
| Full Compose runtime remains incomplete | High | Violates local execution requirement | Make Compose parity a hard construction/operation gate |
| Booking/CMM greenfield effort underestimated | High | Blocks core end-to-end flows | Reverse engineer first, then decompose units by vertical business flow |
| D&D correctness disputes | High | Incorrect charges create commercial risk | Build rule fixtures, audit trail, manual fallback, and edge-case tests |
| Raw UI export over-trusted | Medium | Prototype behavior may conflict with authoritative requirements | Preserve visual direction, map to real APIs/permissions, normalize UI requirements |
| External data quality | Medium | Late/out-of-order/duplicate movements can break workflows | Treat ingestion as unreliable; design dedupe, ordering, retries, dead letters, exception queues |
| Contract testing delayed | High | Integration failures appear late | Freeze and test contracts before real integration |

## Feasibility Conditions

Proceed only if these conditions remain true:

1. The historical MVP intent is preserved and not reused.
2. The enterprise parent intent remains the coordination spine until later stages approve any child module intents.
3. Scope Definition explicitly controls what belongs to each workstream.
4. Reverse Engineering uses Graphify first and maps actual code before brownfield edits.
5. Contract-freeze work happens before dependent modules claim integration readiness.
6. Local runtime and Operation are treated as product requirements, not post-release chores.
7. No stage declares completion with TODO-only methods, placeholder APIs, or mock-only screens.

## Feasibility Conclusion

Proceed to Scope Definition after this stage is approved. The enterprise program is viable if delivered through staged module workstreams, hard contract gates, rigorous local runtime validation, and full Operation lifecycle execution.
