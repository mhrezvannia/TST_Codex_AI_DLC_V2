# Intent Statement - Shared Platform

## Problem Statement

LinerCore needs a Shared Platform foundation before the business modules can be built safely. Without a single owner for reference data, a shared internal identity model, and a traceable event backbone, Charge, Booking, and Container Movement would each recreate common concerns and drift on the meaning of customers, ports, voyages, currencies, charge codes, equipment types, commodities, trade lanes, and cross-module events.

The business problem is fragmentation at the seams between modules. The Shared Platform prevents duplicate master data, fragmented logins, and untraceable asynchronous flows before those failure modes appear in downstream modules.

Source basis: Program Vision, Shared Platform Module Vision, Program Execution Plan, Enterprise Technical Environment v1.1, and Shared Platform Module Tech Env.

## Target Customer

The primary customers are the downstream LinerCore business modules as consuming systems:

| Customer | Need |
|----------|------|
| Charge and Customer Agreement | Reads canonical customer, port, region, vessel/voyage, currency, charge-code, equipment-type, commodity, and trade-lane data; consumes reference-change events. |
| Customer Booking | Reads canonical customer, vessel/voyage, capacity, port, equipment-type, commodity, and trade-lane data; relies on identity and event transport. |
| Container Movement Management | Reads location and equipment-type references; relies on identity and event transport. |

Direct human stakeholders are reference-data administrators, platform operators, Security / IT, and carrier staff who use single sign-on and role-based access.

## Success Metrics

| Metric | Intent-level target |
|--------|---------------------|
| Canonical reference ownership | All nine MVP reference sets have exactly one owning record and are administrable. |
| Reference consumption | Consuming modules can read reference data through the provider API and react to reference-change notifications. |
| Identity coverage | Internal carrier staff authenticate through enterprise SSO and authorize through the carrier role model. |
| Event traceability | A cross-module event carries a correlation id, schema version, source, type, and time, and is delivered idempotently. |
| Contract readiness | Reference APIs, identity authorization API, and reference-changed event contracts are frozen enough for downstream stubs and contract tests. |
| Scope control | Charge, Booking, and Container Movement runtime capabilities are not built in this workflow. |

## Initiative Trigger

Shared Platform is build order number one. It is the hard dependency for downstream module construction and for the contract-freeze gate described in the Program Execution Plan. Freezing the reference-data API, identity authorization surface, and event envelope early allows the other modules to build later against stubs and contract tests without waiting for all real integrations.

The trigger is therefore both strategic and technical: build the foundation first so every later module shares one data language, one internal access model, and one traceable event transport.

## Initial Scope Signal

Scope is MVP, Standard depth. The workflow is limited to the Shared Platform module:

| In scope | Out of scope for this workflow |
|----------|--------------------------------|
| `reference-data-service` | Charge Calculation and Customer Agreement runtime capabilities |
| `identity-service` | Customer Booking runtime capabilities |
| Kafka event bus integration and reference-changed events | Container Movement Management runtime capabilities |
| `apps/reference-data` | Full customer-facing identity and self-service track and trace |
| `apps/auth` | Multi-entity, multi-currency, automated UN/LOCODE feed, terminal/facility locations |

Enterprise Technical Environment v1.1 is binding. The module conforms without waivers and inherits the on-premises Docker Compose runtime, Keycloak 24 authentication, Java 21 / Spring Boot 3.3 backend baseline, PostgreSQL 15+, Kafka with Confluent Schema Registry, OpenAPI and Pact/message-pact contract testing, and Next.js App Router frontend standards.

## Assumptions and Open Items

| Item | Stage treatment |
|------|-----------------|
| Trade/regulatory footprint | Carry as a high-risk open assumption into Feasibility and Requirements Analysis. |
| Reference-data freshness SLA | Define during Inception; it becomes a freshness SLO and test threshold. |
| Enterprise OIDC / Keycloak availability | Validate early because internal identity depends on it. |
| Manual voyage/capacity entry | Accepted MVP mitigation, but validate operational feasibility. |
| Manual UN/LOCODE and Country-Port maintenance | Accepted MVP mitigation, with validation and admin controls required later. |

## Source Trace

| Source | Intent use |
|--------|------------|
| `docs/program-vision-document 4.md` | Program problem, build order, MVP boundaries, Shared Platform ownership. |
| `docs/program-execution-plan.md` | Contract-freeze rationale and dependency order. |
| `docs/enterprise-technical-environment.md` | Binding Enterprise Technical Environment v1.1 standards. |
| `docs/shared-platform-module-vision 1.md` | Shared Platform what/why, MVP features, success criteria, risks. |
| `docs/shared-platform-module-tech-env.md` | Shared Platform how, service/app scope, conformance, contracts, testing. |