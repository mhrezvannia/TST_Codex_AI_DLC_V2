# Scope Document - Shared Platform MVP

## Scope Summary

This Shared Platform MVP includes the foundational runtime capabilities required before downstream LinerCore modules can integrate safely. The scope is based on `intent-statement.md`, `feasibility-assessment.md`, and `constraint-register.md`, plus the authoritative program and module documents.

The approved scope is full Shared Platform MVP: `reference-data-service`, `identity-service`, Kafka event bus integration for reference-change events, `apps/reference-data`, and `apps/auth`. It must follow Enterprise Technical Environment v1.1 exactly and must not build Charge, Booking, or Container Movement runtime capabilities.

## In Scope

| Area | Scope item | Priority | Rationale |
|------|------------|----------|-----------|
| Reference data | Nine canonical reference sets: Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, TradeLane | Must Have | Downstream modules cannot avoid re-keying or divergence without these shared records. |
| Reference data | Admin maintenance and validation for MVP data, including Country-Port containment and flat Region grouping | Must Have | Manual MVP maintenance is accepted but needs controls. |
| Reference data | Reference Open Host Service for read and admin operations | Must Have | Consumers need stable provider APIs and no shared database. |
| Reference data | Reference-change events for all nine sets | Must Have | Consumers need local replicas that stay current. |
| Identity | Keycloak 24 integration for internal carrier staff authentication | Must Have | Internal SSO is part of the Shared Platform foundation. |
| Identity | `identity-service` carrier role model and authorization API | Must Have | Authorization is platform-owned and separate from authentication. |
| Event transport | Kafka / Confluent Schema Registry integration, Avro envelope, topic authorization, outbox pattern | Must Have | Event delivery must be reliable, traceable, and compatible with downstream modules. |
| Frontend | `apps/reference-data` admin UI | Must Have | Reference administrators need governed maintenance workflows. |
| Frontend | `apps/auth` shared sign-on app | Must Have | Internal carrier staff need an auth entrypoint following the frontend constitution. |
| Contracts/testing | Pact/message-pact, OpenAPI, Avro compatibility, correlation-id propagation | Must Have | Contract freeze enables downstream module work. |

## Out of Scope

| Exclusion | Reason |
|-----------|--------|
| Charge Calculation and Customer Agreement runtime capabilities | Separate downstream business module; explicitly not built yet. |
| Customer Booking runtime capabilities | Separate downstream business module; explicitly not built yet. |
| Container Movement Management runtime capabilities | Separate downstream business module; explicitly not built yet. |
| Customer-facing identity for shippers/BCOs | Phase 2+ according to Shared Platform Module Vision. |
| External vessel schedule / capacity feed | Manual voyage entry is the MVP mitigation. |
| Automated UN/LOCODE feed | Manual entry is accepted for MVP. |
| Terminal/Facility location level | Country-Port is sufficient for MVP. |
| Multi-level/multi-dimensional regions | Flat Region grouping is MVP scope. |
| Multi-currency / exchange-rate depth | USD only for MVP. |
| Multi-entity carrier operation | Phase 3 scope. |
| Downstream consumer stubs owned as runtime scope | Downstream modules may review contracts; their stubs should be handled in downstream module workflows unless explicitly added later. |

## Prioritization

MoSCoW classification for this stage:

| Priority | Capabilities |
|----------|--------------|
| Must Have | Backend services, nine reference sets, internal identity/authz, reference APIs, reference-change events, Kafka/Schema Registry integration, frontend admin/auth apps, contract tests. |
| Should Have | Admin UX refinements, in-service reference caching where serving latency needs it, richer dashboarding for event lag and freshness. |
| Could Have | Bulk import/export tooling beyond minimal MVP needs, additional admin convenience filters, advanced role analytics. |
| Won't Have This Time | Customer identity, downstream module runtime work, external feeds, terminal/facility hierarchy, multi-entity, multi-currency. |

## Sequencing Preference

Use dependency-first sequencing:

1. Establish repository/platform skeleton and conformance baseline.
2. Validate Keycloak/OIDC and service-edge token validation path.
3. Define reference domain model and provider API contracts.
4. Define Avro reference-change events and Kafka/Schema Registry integration.
5. Implement reference-data admin and auth frontend flows on the mandated Next.js App Router stack.
6. Harden contract tests, freshness SLO, observability, and security evidence.

This sequence follows the dependency order from `feasibility-assessment.md` and the contract-freeze need captured in `constraint-register.md`.

## Value Stream Map

| Step | Actor | Shared Platform value | Downstream value enabled |
|------|-------|-----------------------|--------------------------|
| Define reference record | Reference-data administrator | Canonical entity is created once with validation. | Charge, Booking, and Container Movement can reference the same ID. |
| Publish reference change | `reference-data-service` | Change is captured and emitted through outbox/Kafka. | Consumers can keep local replicas fresh. |
| Authenticate internal user | Carrier staff | User signs in via Keycloak and app/BFF session path. | All modules can apply one identity model. |
| Authorize action | `identity-service` | Carrier role and permissions are evaluated. | Modules can enforce least privilege consistently. |
| Trace cross-module flow | Kafka envelope and observability stack | Correlation id flows through event and log boundaries. | Later booking-charge-movement flows are auditable. |

## Scope Validation

| Validation question | Answer |
|---------------------|--------|
| Does the scope deliver value without downstream modules? | Yes. It creates the foundation and provider contracts that downstream modules require. |
| Does it preserve the user's build-order constraint? | Yes. Shared Platform is built first; Charge, Booking, and Container Movement are excluded. |
| Does it follow Enterprise Technical Environment v1.1? | Yes. No deviations or waivers are included. |
| Does it carry feasibility risks forward? | Yes. OIDC readiness, residency/footprint, freshness SLA, manual data operations, and contract coordination remain tracked. |

## Source Trace

| Upstream artifact | Scope use |
|-------------------|-----------|
| `intent-statement.md` | Defines Shared Platform problem, target customers, success metrics, and scope signal. |
| `feasibility-assessment.md` | Confirms feasible-with-managed-risks posture and no AWS/public-cloud applicability. |
| `constraint-register.md` | Supplies technical, organizational, regulatory, and dependency constraints. |