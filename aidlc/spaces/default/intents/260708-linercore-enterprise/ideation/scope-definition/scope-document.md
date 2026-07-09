# Scope Document - LinerCore Enterprise

## Source Context

This scope document consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/feasibility-assessment.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/constraint-register.md`

It also reflects market-research outputs and Graphify analysis used during the stage.

## Scope Position

The approved enterprise intent is a complete integrated production-grade LinerCore application. This is not a new MVP and must not be narrowed back to Shared Platform only. The "minimum viable scope" for this intent means the smallest complete enterprise release that proves the carrier's integrated commercial, booking, movement, D&D, runtime, and operation workflows without fake completion.

The parent enterprise intent at `aidlc/spaces/default/intents/260708-linercore-enterprise` remains the coordination spine. Workstreams are explicit now; later AI-DLC stages may split them into child intents or units if approved by delivery planning.

## In Scope

### Shared Platform Enterprise Hardening

- Reuse and harden valid completed MVP functionality from `aidlc/spaces/default/intents/260630-shared-platform`.
- Reference data service, identity service, Keycloak integration, authentication, authorization, capability model.
- Kafka infrastructure, Schema Registry, transactional outbox, canonical event envelope, reference-data events.
- Service security, Kafka authorization, audit logging, correlation IDs, traceability.
- Contract-testing infrastructure, observability, resilience, deployment, operations.

### Charge Calculation & Customer Agreement

- Customer agreements, tariffs, validity, applicability, agreement determination, tariff fallback.
- Commodity eligibility, pricing basis, pricingRef, base freight, surcharges, local charges, itemised pricing.
- Pricing auditability, manual pricing fallback, idempotency, timeouts, retries, circuit breaking.
- `pricing.request` and `pricing.result`.
- D&D rule ownership: free time, rates, import demurrage, import detention, export detention, chargeable-day calculation, manual fallback.
- `pricing.dnd-request` and `pricing.dnd-result`.

### Customer Booking

- Booking creation, amendment, validation, customer references, routing, POL, POD, transshipment legs, voyage references.
- Equipment, commodity, reefer/DG indicators, pricing orchestration, pricing result storage.
- Operational/capacity validation, confirmation, manual pricing workflow, bookingRevision, conditional revalidation.
- Re-confirmation, lifecycle status, movement-event consumption, D&D boundary recognition, D&D trigger logic, D&D result handling, exception queues, audit trail.
- Booking owns the D&D trigger and must not calculate D&D rates or free time.

### Container Movement Management

- Consumption of `booking.confirmed`.
- Journey creation, booking revision reconciliation, equipment journey management, expected move derivation.
- POL, transshipment, POD, container references, movement capture.
- DCSA v2.2 movement validation, planned/estimated/actual events, occurred/received time.
- Duplicate, late, and out-of-order event handling.
- Status derivation, empty/laden state, transshipment state, movement location, operational history.
- Publication of `containermovement.status`.
- CMM reports movements and must not decide whether a movement is D&D relevant.

### Contracts and Integration

- OpenAPI, Avro, AsyncAPI where appropriate.
- Schema Registry with backward compatibility.
- HTTP Pact, message-pact, JWT/RS256, idempotency, deduplication, ordering, correlationId, observability.
- End-to-end contracts:
  - Booking -> CMM: `booking.confirmed`
  - Booking <-> Charge: `pricing.request`, `pricing.result`, `pricing.dnd-request`, `pricing.dnd-result`
  - CMM -> Booking: `containermovement.status`

### Frontend and UX

- Use `design-inputs/claude-ui-export/` as preferred visual and UX baseline.
- Preserve visual quality, layout, page composition, component appearance, navigation, and UX direction where compatible with requirements.
- Implement real modules, APIs, permissions, events, and business flows.
- Support authentication, reference data, agreements, tariffs, pricing, bookings, amendments, manual pricing, container journeys, movements, D&D outcomes, and operational exceptions.

### Local Runtime and Developer Experience

- Target `docker compose --profile full up -d --build`.
- Profiles or equivalent modes for `core`, `app`, `observability`, `devtools`, `full`, plus useful module development modes.
- PostgreSQL, Kafka, Schema Registry, Keycloak, all backend services, frontend applications, reverse proxy, contract-test support, observability support.
- Separate logical databases/users for identity, reference data, pricing, booking, container movement, Keycloak, and infrastructure tools where required.
- `.env.example` with no secrets.
- Deterministic seed data for users, roles, reference data, agreements, tariffs, charges, D&D rules, bookings, container journeys, and movements.
- Commands for setup, startup, shutdown, reset, migrations, seed data, logs, health checks, tests, and full E2E validation.

### Enterprise NFR and Operation

- Authentication, authorization, least privilege, service security, Kafka ACLs, secrets management.
- Auditability, correlation IDs, distributed tracing, structured logs, metrics, dashboards, alerts, SLOs.
- Timeouts, retries, circuit breakers, idempotency, deduplication, transactional outbox, recovery.
- Contract, integration, E2E, performance, CI, deployment, environment provisioning, rollback, backup, DR, runbooks, incident readiness.
- Full AI-DLC Operation phase remains in scope.

## Out of Scope

- Reopening, overwriting, or scope-changing `aidlc/spaces/default/intents/260630-shared-platform`.
- Reusing the old MVP intent directory for new enterprise work.
- Cross-module SQL joins or direct reads/writes to another module's domain database.
- Collapsing all domains into one service.
- Declaring completion based only on documents, diagrams, skeletons, placeholder APIs, mock screens, or containers merely starting.
- Copying fake prototype business logic from the Claude UI export.
- Building a global carrier booking network from scratch before explicit network integration scope is approved.
- Payment card processing and PCI scope unless explicitly introduced later.
- HIPAA/PHI scope unless explicitly introduced later.
- Production public-cloud runtime dependency unless a later approved decision changes the on-prem/local baseline.
- External finance full production integration beyond contract/adapter scope until the integration depth is fixed.

## Workstream Boundaries

| Workstream | Owns | Does Not Own |
|------------|------|--------------|
| Shared Platform | Reference data, identity, authorization foundations, event transport foundations, contract infrastructure, platform operation | Charge rules, Booking lifecycle, CMM movement decisions |
| Charge Calculation & Customer Agreement | Agreements, tariffs, pricing, D&D rules, free time, rates, D&D calculation, pricing APIs | Booking confirmation, D&D trigger decision, movement reporting |
| Customer Booking | Booking lifecycle, pricing orchestration, confirmations/amendments, D&D trigger logic, movement status consumption, exceptions | D&D rates/free time, movement validation/publication |
| Container Movement Management | Journey creation, movement capture/validation, movement status, movement event publication | D&D relevance decisions, pricing, booking commercial state |
| Frontend | User workflows across modules and BFF/API integration | Backend domain ownership |
| Runtime/Operation | Compose profiles, infrastructure, observability, CI/CD, runbooks, incident readiness | Business-rule shortcuts or fake readiness |

## Scope Gates

| Gate | Purpose | Evidence Required |
|------|---------|-------------------|
| Historical baseline gate | Prove old MVP is preserved | No writes to old intent; tag and path referenced |
| Contract-freeze gate | Unblock module integration | OpenAPI/Avro/AsyncAPI artifacts, Pact/message-pact, schema compatibility |
| Local runtime gate | Prove Windows local execution | `docker compose --profile full up -d --build`, health checks, logs |
| E2E flow gate | Prove real business behavior | Automated flows 1-5, persistence, events, UI/API integration |
| Security/observability gate | Prove enterprise NFRs | Authn/authz tests, ACLs, audit logs, traces, dashboards, alerts |
| Operation gate | Prove production readiness artifacts | Deployment, provisioning, rollback, backup/DR, incident/performance/runbook evidence |

## Release Boundary

This enterprise release is complete only when:

1. All in-scope module workstreams have real business implementation.
2. Contracts are executable and tested.
3. Full local runtime works without remote runtime servers.
4. Frontend workflows map to real APIs, permissions, and events.
5. Data ownership and module boundaries are enforced.
6. Tests and operational evidence prove readiness.
7. Operation phase artifacts are complete and reviewed.

## Deferred Decisions

- Whether to spawn module child intents or keep all work as parent-intent units.
- External finance first-release depth.
- Vessel schedule/capacity source.
- Trade/regulatory footprint and data residency policy.
- Customer-type handling beyond the current enterprise assumptions.
- How much of the raw Claude UI export should be converted into normalized design requirements before refined mockups.
