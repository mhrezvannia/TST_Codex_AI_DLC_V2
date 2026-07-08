# Architecture Decisions - Shared Platform MVP

## Source Trace

These ADRs are based on `requirements.md`, `stories.md`, `team-practices.md`, and `application-design-questions.md`. Brownfield `architecture.md` and `component-inventory.md` are not applicable to this greenfield intent. Enterprise Technical Environment v1.1 is binding.

## ADR-001: Use mandated microservice deployable boundaries

Status: Accepted

Date: 2026-07-01

### Context

Enterprise Technical Environment v1.1 mandates microservices with one deployable per bounded context. The Shared Platform module is physically realized as `reference-data-service`, `identity-service`, and Kafka event bus integration, plus `apps/reference-data` and `apps/auth`.

### Decision

Use the deployable boundaries `reference-data-service`, `identity-service`, Kafka/Schema Registry integration, `apps/reference-data`, `apps/auth`, and shared frontend packages. Do not split each reference aggregate into its own deployable service and do not collapse backend scope into one service.

### Consequences

Positive:

- Aligns with the enterprise topology and build order.
- Keeps reference data and authorization independently owned.
- Allows downstream consumers to integrate through clear provider contracts.

Negative:

- Requires distributed-system discipline for API, auth, telemetry, and event contracts.
- Requires separate service pipelines and deployment artifacts.

Neutral:

- Internal modules can still keep reference aggregate logic cohesive without creating deployable sprawl.

### Alternatives Considered

Alternative 1: Service per reference set.

- Pros: highly isolated ownership per reference aggregate.
- Cons: excessive operational overhead and fragmented provider API for the MVP.

Alternative 2: One combined Shared Platform backend.

- Pros: simpler early implementation.
- Cons: contradicts Enterprise Technical Environment v1.1 and blurs reference-data vs authorization ownership.

### Reversibility

Low. This boundary follows a mandated enterprise topology and affects deployment, CI, data ownership, and contracts. Any reversal would require an approved standards change or waiver.

## ADR-002: Use aggregate modules inside `reference-data-service`

Status: Accepted

Date: 2026-07-01

### Context

The service owns nine reference sets with different invariants. A fully generic metadata model risks hiding business rules, while nine deployable services are too much operational split for one supporting bounded context.

### Decision

Organize `reference-data-service` as one hexagonal service with internal aggregate modules/groupings for Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane. Use one service-owned PostgreSQL datastore.

### Consequences

Positive:

- Preserves clear invariants and domain language.
- Avoids service sprawl.
- Supports consistent APIs, audit, outbox, and event publication.

Negative:

- Requires discipline to avoid a generic reference-data blob.
- Some cross-aggregate validation must be carefully bounded.

### Alternatives Considered

Alternative 1: One generic metadata table.

- Pros: fast CRUD implementation.
- Cons: weak domain invariants and hard-to-test behavior.

Alternative 2: Full internal module per reference set with separate schemas.

- Pros: strongest separation inside service.
- Cons: too much duplication and complexity for MVP.

### Reversibility

Medium. Internal aggregate modules can be split or consolidated before contracts are finalized, but database schema and API/event contracts will make later changes more expensive.

## ADR-003: Keep authentication in Keycloak and authorization in `identity-service`

Status: Accepted

Date: 2026-07-01

### Context

Enterprise Technical Environment v1.1 mandates Keycloak 24 for authentication and `identity-service` for carrier authorization. Requirements need a platform role model without customer-facing identity.

### Decision

`identity-service` owns roles, permissions, authorization decisions, assignment audit, and Keycloak adapters. Keycloak remains the authentication provider and token issuer. No custom password store is built.

### Consequences

Positive:

- Avoids hand-rolled authentication.
- Centralizes least-privilege decisions.
- Gives apps/services one authorization API.

Negative:

- Keycloak availability and claim mapping become explicit dependencies.
- Requires contract discipline for authz APIs.

### Alternatives Considered

Alternative 1: `identity-service` owns authentication and authorization.

- Pros: one conceptual identity backend.
- Cons: violates mandated Keycloak authentication and increases security risk.

Alternative 2: Thin Keycloak proxy only.

- Pros: less backend logic.
- Cons: fails the carrier role/permission domain requirement.

### Reversibility

Low. Keycloak authentication and `identity-service` authorization are mandated standards and security-critical. Reversal requires enterprise approval and migration of auth/session contracts.

## ADR-004: Use REST/OpenAPI for sync APIs and Kafka/Avro outbox for events

Status: Accepted

Date: 2026-07-01

### Context

Consumers need canonical reads, admin apps need synchronous commands/queries, and downstream modules later need reference-change notifications. Enterprise standards mandate REST/OpenAPI, Kafka, Avro, Schema Registry, and transactional outbox for emitted events.

### Decision

Use REST/OpenAPI for provider/admin/authorization APIs. Use Kafka with Avro schemas and a transactional outbox for typed `referencedata.<entity>.changed` events. Do not allow shared database integration.

### Consequences

Positive:

- Strong request/response behavior where needed.
- Eventual-consistency path for downstream reference replicas.
- Compatible with contract testing and schema compatibility gates.

Negative:

- Requires outbox worker and status handling.
- Consumers must handle idempotency and eventual consistency.

### Alternatives Considered

Alternative 1: GraphQL gateway.

- Pros: flexible frontend queries.
- Cons: not part of mandated platform standard and adds unnecessary gateway complexity.

Alternative 2: Direct database reads.

- Pros: simple for trusted internal consumers.
- Cons: violates data ownership and would create tight coupling.

### Reversibility

Low. API/event standards are mandated and become downstream contracts. Contract versioning can evolve payloads, but replacing REST/OpenAPI or Kafka/Avro would require broad migration.

## ADR-005: Keep `apps/auth` and `apps/reference-data` as separate Next.js apps

Status: Accepted

Date: 2026-07-01

### Context

The approved scope includes two frontend apps with different workflows. Enterprise standards mandate Next.js App Router, BFF route handlers, HttpOnly-cookie auth, `proxy.ts`, and shared `@erp/*` packages.

### Decision

Build separate `apps/auth` and `apps/reference-data` applications. Both use BFF route handlers and shared packages. Browser clients never call backend services directly.

### Consequences

Positive:

- Keeps authentication entrypoint and reference administration concerns separate.
- Supports independent UX and route protection.
- Preserves BFF security pattern.

Negative:

- Requires shared session conventions across apps.
- Requires consistent navigation and environment labeling.

### Alternatives Considered

Alternative 1: One combined frontend.

- Pros: simpler routing.
- Cons: mixes auth and admin workspace concerns and weakens app ownership.

Alternative 2: Direct browser-to-service APIs.

- Pros: fewer BFF handlers.
- Cons: violates frontend security baseline and exposes token/API coupling risks.

### Reversibility

Medium. App shells could be consolidated before implementation maturity, but BFF/session/security patterns are non-reversible without violating standards.

## ADR-006: Model event publication status through the outbox

Status: Accepted

Date: 2026-07-01

### Context

Reference administrators and operators need to know whether changes were published, pending, failed, or stale. Requirements set a 60 second p95 freshness target and require operator visibility.

### Decision

Persist outbox entries with status metadata in `reference-data-service`, publish through a messaging adapter, update status after broker outcomes, and expose status through APIs used by `apps/reference-data`.

### Consequences

Positive:

- Prevents silent event loss.
- Enables admin/operator visibility.
- Supports retries and freshness monitoring.

Negative:

- Adds persistence and worker complexity.
- Requires cleanup/retention rules later.

### Alternatives Considered

Alternative 1: Publish directly during request transaction.

- Pros: simpler initial code path.
- Cons: risks commit/publish inconsistency and poor failure visibility.

Alternative 2: Defer status until downstream modules exist.

- Pros: less MVP UI/API scope.
- Cons: fails approved requirements and weakens contract readiness.

### Reversibility

Medium-low. Status representation can evolve, but the outbox itself is mandated for event publication after state changes and should be treated as durable architecture.

## ADR-007: Represent downstream modules as contract-only consumers

Status: Accepted

Date: 2026-07-01

### Context

The user explicitly constrained this workflow to Shared Platform first and excluded Charge, Booking, and Container Movement runtime work. Requirements and stories still need downstream contract readiness.

### Decision

Represent downstream modules only as future external consumers in OpenAPI, Avro, and message-pact contract terms. Do not build downstream runtime services, UI screens, or stubs in this workflow.

### Consequences

Positive:

- Preserves build order and scope control.
- Enables future modules to integrate against stable contracts.
- Avoids premature implementation of downstream behavior.

Negative:

- Contract assumptions require downstream review later.
- Some consumer behavior remains unvalidated until downstream workflows start.

### Alternatives Considered

Alternative 1: Include downstream stub services now.

- Pros: early contract test consumers.
- Cons: violates scope and risks creating throwaway runtime code.

Alternative 2: Include downstream review screens.

- Pros: visible contract review UI.
- Cons: out of scope and unnecessary for application design.

### Reversibility

High. Future AI-DLC workflows can add downstream module implementations after Shared Platform contracts are approved, without changing this Shared Platform design boundary.

## Review

Verdict: READY

Fallback architecture review initially found a blocking dependency-direction issue and missing ADR reversibility coverage. The dependency diagram was corrected to show adapters as siblings depending inward on `application-service`, and all seven ADRs now include reversibility sections. Focused re-review returned READY.
