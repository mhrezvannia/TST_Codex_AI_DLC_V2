# Requirements - Shared Platform MVP

## Intent Analysis

LinerCore needs the Shared Platform before Charge, Booking, and Container Movement are built. The intent captured in `intent-statement.md` is to create one canonical platform for shared reference data, internal carrier identity, and cross-module event transport so later modules do not duplicate master data, authorization rules, or event semantics.

The approved scope in `scope-document.md` is the full Shared Platform MVP:

- `reference-data-service`
- `identity-service`
- Kafka event bus integration for reference-change events
- `apps/reference-data`
- `apps/auth`

The delivery practices in `team-practices.md` require trunk-based development, a gated walking skeleton as the first Construction Bolt, 85% backend line coverage, contract and compatibility tests as first-class deliverables, and exact conformance with Enterprise Technical Environment v1.1.

This stage turns that scope into testable requirements. It does not authorize downstream runtime work for Charge Calculation and Customer Agreement, Customer Booking, or Container Movement Management.

## Functional Requirements

### Reference Data Domain

FR-001 - Canonical reference sets: `reference-data-service` must own and expose the nine MVP reference sets: Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.

FR-002 - Reference identifiers: each reference record must have a stable platform-owned identifier that can be used by downstream modules without direct database coupling.

FR-003 - Status model: each reference record must support active and inactive states. Inactive records must remain readable for historical references and must be excluded from default active lookups unless explicitly requested.

FR-004 - Audit fields: each reference record must persist created-by, created-at, updated-by, updated-at, status-change metadata, and a reason or change note where administratively supplied.

FR-005 - Party/Customer: the service must support internal carrier-maintained customer and party records needed by later commercial modules, including classification of customer data as Confidential or Restricted where PII or commercially sensitive attributes are present.

FR-006 - Location/Port: the service must support a Country to Port structure for MVP. A Port must belong to exactly one Country, orphan ports must be rejected, and re-parenting an existing Port to a different Country must be prevented unless a later governed migration capability is approved.

FR-007 - Region: the service must support flat Region groupings independent of the Country to Port structural hierarchy. Multi-level or multi-dimensional regions are outside MVP scope.

FR-008 - Voyage: the service must support manually maintained voyage reference records sufficient for later booking and charge consumers to identify a voyage. External vessel schedule or capacity feed integration is out of scope.

FR-009 - Currency: the service must support USD as the MVP operating currency while preserving a domain model that does not block later multi-currency expansion.

FR-010 - ChargeCode: the service must support canonical charge-code records used by later charge modules, including validation for code uniqueness and status.

FR-011 - EquipmentType: the service must support canonical equipment type records used by later booking, charge, and movement modules.

FR-012 - Commodity: the service must support canonical commodity records used by later booking and charge modules, including active/inactive status and search.

FR-013 - TradeLane: the service must support TradeLane records as configurable origin/destination Region pairs. The exact MVP lanes and site residency remain an inception dependency, but the model must not hard-code a single trade or geography.

### Reference Data Administration

FR-014 - Admin lifecycle: for all nine reference sets, `reference-data-service` must provide create, read, update, deactivate, reactivate, search, filter, validation, audit trail, and change-publication behavior.

FR-015 - Validation: admin writes must reject invalid required fields, duplicate business keys, invalid relationships, and prohibited structural changes such as orphan ports.

FR-016 - Search and filter: admin APIs must support list, detail, active/inactive filtering, text search where appropriate, and deterministic pagination/sorting.

FR-017 - Change history: administrators must be able to inspect recent changes for a reference record, including actor, timestamp, before/after summary where practical, and emitted event status.

FR-018 - Reference read APIs: `reference-data-service` must expose internal provider APIs for list/detail reads of all nine sets. Consumers must not read the service database directly.

FR-019 - Admin APIs: admin write APIs must be protected by authentication and authorization. Only users with appropriate reference administration or platform operations permissions may mutate reference records.

FR-020 - OpenAPI: all synchronous provider/admin APIs must publish OpenAPI contracts that can be used for generated clients, contract review, and CI validation.

### Reference-Change Events

FR-021 - Typed events: `reference-data-service` must publish nine typed Avro reference-change event contracts, one per reference set, using the naming pattern `referencedata.<entity>.changed`.

FR-022 - Common envelope: every reference-change event must include a common envelope with event id, event type, schema version, source, occurred-at time, correlation id, entity id, operation, and producer metadata.

FR-023 - Schema Registry: all Avro event schemas must be registered with Confluent Schema Registry and must pass compatibility checks before deployment.

FR-024 - Outbox: reference-change publication must use a transactional outbox or equivalent reliable publication pattern so committed reference changes are not silently lost before Kafka publication.

FR-025 - Idempotency: event consumers must be able to deduplicate events by event id. Producer behavior must support at-least-once delivery semantics.

FR-026 - Publication status: the platform must expose enough event publication status for administrators or operators to see whether a reference change is pending, published, failed, or retrying.

FR-027 - Correlation propagation: API requests that create or update reference data must carry a correlation id into logs, audit records, outbox entries, and Kafka events.

### Identity and Authorization

FR-028 - Authentication delegation: user authentication must be delegated to Keycloak 24 using OIDC flows approved by Enterprise Technical Environment v1.1. `identity-service` must not implement a custom password store.

FR-029 - Carrier authorization model: `identity-service` must own the internal carrier role and permission model used by Shared Platform apps and later modules.

FR-030 - MVP roles: the MVP authorization model must include pricing, sales, booking desk, equipment control, customer service, finance-read, reference admin, platform operator, and security admin roles.

FR-031 - Authorization API: `identity-service` must expose an internal authorization API that lets services and apps evaluate the current user's roles and permissions without directly coupling to Keycloak internals.

FR-032 - Role assignment audit: role and permission changes must be logged with actor, target user, timestamp, before/after values, and reason where supplied.

FR-033 - Least privilege: the default authenticated user must receive no administrative privileges unless explicitly assigned through the platform authorization model.

FR-034 - Customer identity exclusion: customer-facing shipper or BCO identity is out of scope for this MVP.

### `apps/reference-data`

FR-035 - Admin shell: `apps/reference-data` must provide a Next.js App Router administration experience for the nine reference sets.

FR-036 - Navigation: the app must let authorized administrators navigate by reference set and open list, detail, create, edit, deactivate, and reactivate workflows as allowed by role.

FR-037 - Validation feedback: the app must present field-level and relationship validation errors returned by `reference-data-service`.

FR-038 - Status and event visibility: the app must display active/inactive status and event publication/sync status for recent changes where available.

FR-039 - Read-only access: users without write permission but with permitted read access must receive a read-only experience rather than hidden or broken screens.

FR-040 - Accessibility: the app must support keyboard navigation, visible focus, semantic form labels, and WCAG 2.1 AA-compatible UI behavior.

### `apps/auth`

FR-041 - Sign-in flow: `apps/auth` must provide the shared internal carrier sign-in entrypoint and redirect users through Keycloak OIDC.

FR-042 - Callback flow: the app must handle the post-authentication callback and establish the approved frontend/BFF session path defined by the Enterprise Technical Environment.

FR-043 - Sign-out flow: the app must provide sign-out behavior that clears the application session and invokes the appropriate Keycloak logout path.

FR-044 - Access denied: the app must present an access-denied screen when authentication succeeds but platform authorization is insufficient.

FR-045 - Session display: the app must expose a minimal authenticated session view showing current user identity and platform roles for troubleshooting and support.

FR-046 - Request access: the app must provide a request-access path for users who authenticate but do not yet have the required platform permissions. Permission-review administration screens are not part of this MVP unless added later.

### Contract Testing and Developer Experience

FR-047 - API contract tests: provider and consumer contract tests must cover synchronous APIs for `reference-data-service` and `identity-service`.

FR-048 - Message contract tests: reference-change events must have message-pact or equivalent contract tests for envelope and entity payload compatibility.

FR-049 - Downstream contract readiness: downstream module teams may review contracts and build later stubs against them, but this workflow must not implement downstream runtime capabilities.

FR-050 - Seed data: local and CI environments must include deterministic seed data for the nine reference sets sufficient for tests, frontend development, and smoke validation.

## Non-Functional Requirements

NFR-001 - Reference read performance: common internal list/detail reads for reference data must target p95 <= 300 ms under expected MVP admin and consumer load. The exact load profile must be validated in NFR and test planning stages.

NFR-002 - Reference freshness: committed reference-data changes must target p95 <= 60 seconds from successful commit to consumer-observable Kafka event. The NFR stage must confirm the measurement point and test method.

NFR-003 - Backend coverage: `reference-data-service` and `identity-service` must each target at least 85% line coverage, consistent with `team-practices.md`.

NFR-004 - CI gates: CI must block merge on formatting, linting, compile/type checks, unit tests, adapter integration tests, OpenAPI contract checks, Avro schema compatibility checks, and relevant frontend checks.

NFR-005 - Pre-deployment validation: staging deployment must require successful E2E, contract, smoke, and health checks before production promotion.

NFR-006 - Security classification: Party/Customer data and authorization data must be treated as Confidential or Restricted where PII, commercial sensitivity, or access-control sensitivity applies.

NFR-007 - Transport security: internal HTTP and event infrastructure must use TLS 1.2 or stronger where supported by the environment.

NFR-008 - Encryption at rest: PostgreSQL, Kafka persistence, and operational backups must use encryption at rest as required by Enterprise Technical Environment v1.1.

NFR-009 - Access logging: administrative actions, role changes, failed authorization attempts, and sensitive reads must produce structured access logs suitable for audit review.

NFR-010 - Immutable audit: reference admin changes and authorization changes must be recorded in append-only or tamper-evident audit records.

NFR-011 - Reliability: Kafka publication must support at-least-once semantics, retries, dead-letter or failure handling, and operator visibility into failed publication.

NFR-012 - Observability: services must emit JSON logs, correlation ids, OpenTelemetry traces/metrics, and runtime metrics consumable by ELK, Prometheus/Grafana, and Jaeger.

NFR-013 - Accessibility: `apps/reference-data` and `apps/auth` must meet WCAG 2.1 AA expectations for MVP workflows.

NFR-014 - Maintainability: backend services must use the Java/Spring hexagonal skeleton with a pure domain core and adapters for persistence, HTTP, Kafka, and identity provider integration.

NFR-015 - Frontend maintainability: frontend apps must use TypeScript strict mode, Next.js App Router, approved shared `@erp/*` packages, and no prohibited frontend libraries or package managers.

NFR-016 - Data consistency: API responses and emitted events must be consistent for committed reference changes. Eventual consistency through Kafka is acceptable, but stale or failed publication must be observable.

NFR-017 - Local reproducibility: the MVP must run locally with Docker Compose using the mandated on-prem technology profile.

## Constraints

C-001 - Enterprise Technical Environment v1.1 is binding. No technology waiver is approved in this stage.

C-002 - The runtime target is on-premises Docker Compose. AWS/public cloud services are not part of this MVP unless a later approved environment change supersedes the current technical environment.

C-003 - Backend services must use Java 21, Spring Boot 3.3, PostgreSQL 15+, Kafka, Confluent Schema Registry, Avro 1.11, OpenAPI, Pact/message-pact, and the approved service skeleton.

C-004 - Authentication must use Keycloak 24. Custom authentication stores or unmanaged identity libraries are not allowed.

C-005 - Frontend apps must use Next.js App Router, React, TypeScript strict mode, Turborepo, Yarn, Tailwind, React Hook Form, Zod, Zustand, TanStack Query, Axios through `@erp/api-core`, and `@erp/ui`.

C-006 - Nginx edge, Vault defaults, GitHub Actions self-hosted runners, ELK, Prometheus/Grafana, and Jaeger are the expected platform integrations.

C-007 - Charge Calculation and Customer Agreement, Customer Booking, and Container Movement Management runtime capabilities must not be built in this workflow.

C-008 - Consumers must integrate through APIs and events, not shared databases.

C-009 - The first Construction Bolt must be a gated walking skeleton before later autonomous Bolt decisions are made.

## Assumptions

A-001 - Keycloak 24 is available in the on-prem environment and can support the required internal OIDC flows.

A-002 - Manual voyage and capacity-related reference maintenance is acceptable for MVP until external schedule or capacity feeds are added later.

A-003 - Manual Country/Port maintenance is acceptable for MVP until automated UN/LOCODE ingestion is added later.

A-004 - Kafka and Confluent Schema Registry are available as self-managed on-prem platform components.

A-005 - Downstream module representatives will be available during contract freeze to review provider APIs and reference-change event contracts.

A-006 - The MVP can begin with a configurable trade-lane model while exact lanes, sites, and data-residency implications are confirmed.

A-007 - USD-only currency scope is acceptable for MVP, provided the model does not block later multi-currency extension.

## Out of Scope

OOS-001 - Charge Calculation and Customer Agreement runtime capabilities.

OOS-002 - Customer Booking runtime capabilities.

OOS-003 - Container Movement Management runtime capabilities.

OOS-004 - Customer-facing shipper or BCO identity, self-service, or track-and-trace.

OOS-005 - External vessel schedule or capacity feeds.

OOS-006 - Automated UN/LOCODE feed integration.

OOS-007 - Terminal/facility-level location hierarchy.

OOS-008 - Multi-level or multi-dimensional region modeling.

OOS-009 - Multi-entity carrier operation.

OOS-010 - Multi-currency exchange-rate management.

OOS-011 - Downstream consumer runtime stubs owned by this workflow.

## Open Questions

Q-001 - Which exact MVP trade lanes, regions, ports, and operating sites must be present in seed data?

Q-002 - What are the final data-residency and disaster-recovery requirements for the on-prem deployment sites?

Q-003 - What final load profile should validate the p95 <= 300 ms read target and p95 <= 60 second event freshness target?

Q-004 - What exact field list and validation rules apply to each of the nine reference aggregates?

Q-005 - What is the final role-to-permission matrix for the nine MVP carrier roles?

Q-006 - Does `apps/auth` later need permission-review administration, or should that remain inside a separate platform/security administration workflow?

Q-007 - What retention period applies to reference-change audit records, identity authorization audit records, and Kafka event payloads?

Q-008 - What OWASP ASVS/control mapping must be evidenced for the Shared Platform MVP?

## Acceptance Criteria

AC-001 - Given an authorized reference administrator, when they create or update any of the nine reference sets with valid data, then the change is persisted, audited, and queued for event publication.

AC-002 - Given invalid reference data, when an administrator submits the change, then the service rejects the request with structured validation errors and no Kafka event is published.

AC-003 - Given a committed reference change, when the outbox publisher processes it, then the corresponding typed Avro `referencedata.<entity>.changed` event is published with event id, schema version, source, occurred-at, correlation id, and entity id.

AC-004 - Given a user authenticated by Keycloak but lacking a required role, when they attempt an administrative action, then the platform denies the action, logs the authorization failure, and shows a read-only or access-denied experience as appropriate.

AC-005 - Given a consumer reads reference data, when it calls the provider API, then it receives canonical active records without requiring direct database access.

AC-006 - Given CI runs for a pull request, when lint, compile, type, unit, contract, compatibility, or configured frontend checks fail, then merge is blocked.

## Traceability

The requirements trace to `intent-statement.md` for goals, stakeholders, success metrics, and Shared Platform-only intent; to `scope-document.md` for in-scope and out-of-scope module boundaries; and to `team-practices.md` for delivery, testing, walking-skeleton, and technology conformance practices.

Brownfield-only upstream inputs are not applicable to this greenfield Shared Platform intent: no `business-overview.md`, `architecture.md`, or `code-structure.md` reverse-engineering artifacts were produced or required for this stage.

Question answer trace:

- Q1 selected p95 <= 60 seconds for reference-change freshness.
- Q2 selected configurable regions/trade lanes with exact footprint as an open dependency.
- Q3 selected the full internal carrier role set.
- Q4 selected full admin lifecycle for all nine reference sets.
- Q5 selected nine typed Avro reference-change events.
- Q6 selected sign-in basics for `apps/auth`.
- Q7 selected Confidential/Restricted PII and immutable audit controls.
- Q8 selected p95 <= 300 ms for common reference API reads.

## Review

Verdict: READY

Fallback product-lead review found no blocking product issues. The artifact preserves Shared Platform-only scope, carries Enterprise Technical Environment v1.1 constraints, includes measurable NFR anchors, reflects all eight answered questions, and keeps Charge, Booking, and Container Movement runtime capabilities out of this workflow.
