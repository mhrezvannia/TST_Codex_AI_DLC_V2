# User Stories - Shared Platform MVP

## Source Trace

These stories are derived from `requirements.md`, `team-practices.md`, `personas.md`, and the approved `user-stories-questions.md` plan. Brownfield-only upstream inputs `business-overview.md` and `component-inventory.md` are not applicable to this greenfield Shared Platform intent.

Planning choices:

- Persona set: full platform set.
- Breakdown: persona journey and platform domain.
- Granularity: 18-24 stories.
- Enablers: include when framed around platform value.
- Priority: Shared Platform foundation is Must Have; refinements are Should/Could.
- Downstream treatment: contracts only, no Charge, Booking, or Container Movement runtime implementation.

## Story Map

| Journey area | Must Have stories | Should/Could stories |
|--------------|-------------------|----------------------|
| Shared sign-in | US-001, US-002, US-003 | US-004 |
| Reference administration | US-005, US-006, US-007, US-008, US-009, US-010 | US-011 |
| Authorization and audit | US-012, US-013, US-014 | US-015 |
| Event publication and consumption | US-016, US-017, US-018 | US-019 |
| Delivery, quality, and operations | US-020, US-021, US-022 | US-023 |

## Stories

### US-001 - Sign in through shared internal auth

Priority: Must Have

Story: As an Internal Carrier Staff User, I want to sign in through the shared internal auth entrypoint, so that I can access authorized LinerCore tools through one platform login.

Acceptance criteria:

- Given I am not authenticated, when I open `apps/auth`, then I can start a Keycloak-backed sign-in flow.
- Given Keycloak authenticates me successfully, when the callback completes, then the approved application session path is established.
- Given sign-in succeeds, when my session is shown, then I can see my identity and platform roles.
- Given sign-in fails or is cancelled, when I return to the app, then I receive a clear error state without exposing sensitive details.

Dependencies: Keycloak 24, `identity-service` authorization API, frontend session pattern.

INVEST notes: Vertical UI/auth/API slice; testable with auth-flow E2E and authorization API stubs.

### US-002 - Sign out from Shared Platform apps

Priority: Must Have

Story: As an Internal Carrier Staff User, I want to sign out from the shared auth app, so that my application session is cleared when I leave a shared workstation or complete my work.

Acceptance criteria:

- Given I am signed in, when I select sign out, then my application session is cleared.
- Given sign out completes, when Keycloak logout is required, then the app invokes the approved logout path.
- Given I return to a protected screen after sign out, when the session is absent, then I am redirected to sign in.
- Given sign out fails upstream, when the app cannot complete the external logout, then the local session is still cleared and the error is logged.

Dependencies: US-001.

INVEST notes: Small, user-visible, independently testable once sign-in exists.

### US-003 - Handle access denied and request access

Priority: Must Have

Story: As an Internal Carrier Staff User, I want clear access-denied and request-access flows, so that I know what to do when I am authenticated but not authorized.

Acceptance criteria:

- Given I am authenticated without a required permission, when I open a protected page, then I see an access-denied state.
- Given I see access denied, when I choose request access, then I can submit or route an access request using the MVP request-access path.
- Given access is denied, when the event is logged, then the log includes correlation id, user id, requested resource, and decision.
- Given I have read-only permission, when I open a reference screen, then the app shows read-only controls instead of write actions.

Dependencies: US-001, US-012.

INVEST notes: Includes UX and audit value; acceptance criteria are observable.

### US-004 - Review current session details

Priority: Should Have

Story: As an Internal Carrier Staff User, I want to view my current session and role details, so that support can diagnose access problems without inspecting backend systems first.

Acceptance criteria:

- Given I am signed in, when I open the session view, then I see my display name, user id, and assigned platform roles.
- Given role details are unavailable, when the session view loads, then I see a recoverable error state.
- Given the view displays security-sensitive identifiers, when it renders, then it avoids exposing secrets or tokens.

Dependencies: US-001, US-012.

INVEST notes: Useful support enhancement but not required for the first functional auth path.

### US-005 - Browse canonical reference sets

Priority: Must Have

Story: As a Reference Data Administrator, I want to browse all nine canonical reference sets, so that I can find the data that downstream modules will rely on.

Acceptance criteria:

- Given I have reference read permission, when I open `apps/reference-data`, then I can navigate to Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.
- Given I open a reference set, when records exist, then I see a paginated list with stable sorting.
- Given I filter by active or inactive status, when the list reloads, then the result set matches the selected status.
- Given a reference set is empty, when I open it, then I see an empty state that does not imply an error.

Dependencies: US-001, US-012, reference read APIs.

INVEST notes: Vertical read slice with direct administrator value.

### US-006 - Search and inspect reference details

Priority: Must Have

Story: As a Reference Data Administrator, I want to search and inspect reference records, so that I can verify canonical values before creating or changing data.

Acceptance criteria:

- Given I am viewing a reference set, when I enter supported search text, then the list returns matching records.
- Given I select a record, when the detail view opens, then I see identifiers, business fields, status, audit metadata, and relationship fields.
- Given I use invalid filter values, when the request is submitted, then the app shows a validation error and keeps the prior usable state.
- Given I navigate by keyboard, when I move through list and detail controls, then focus order is logical and visible.

Dependencies: US-005.

INVEST notes: Complements browse with searchable inspection and accessibility criteria.

### US-007 - Create reference records with validation

Priority: Must Have

Story: As a Reference Data Administrator, I want to create valid reference records, so that canonical data can be maintained once and reused by consumers.

Acceptance criteria:

- Given I have create permission, when I submit a valid record for any MVP reference set, then the record is persisted with a stable platform id.
- Given required fields are missing, when I submit the form, then field-level validation messages identify what must be fixed.
- Given a duplicate business key is submitted, when validation runs, then the service rejects the request and no event is published.
- Given creation succeeds, when I return to the list, then the new record appears with active status.

Dependencies: US-005, US-012, US-016.

INVEST notes: Applies a repeated pattern across the nine sets while preserving per-set validation details for design.

### US-008 - Update reference records safely

Priority: Must Have

Story: As a Reference Data Administrator, I want to update reference records with relationship safeguards, so that corrections do not break downstream consistency.

Acceptance criteria:

- Given I have update permission, when I change editable fields and submit, then the record is updated and audited.
- Given I try to create an orphan Port, when validation runs, then the update is rejected.
- Given I try to re-parent an existing Port to another Country, when the MVP rule is enforced, then the update is rejected unless a later approved migration path exists.
- Given an update succeeds, when the change is committed, then a reference-change event is queued.

Dependencies: US-006, US-016.

INVEST notes: Focuses on high-risk update rules for Location/Port while still covering general update behavior.

### US-009 - Deactivate and reactivate reference records

Priority: Must Have

Story: As a Reference Data Administrator, I want to deactivate and reactivate reference records, so that obsolete data is controlled without deleting historical references.

Acceptance criteria:

- Given I have deactivate permission, when I deactivate an active record with a reason, then the record becomes inactive and remains readable.
- Given a record is inactive, when default active lookups run, then the record is excluded unless inactive records are requested.
- Given I reactivate an inactive record, when validation passes, then the record returns to active status.
- Given status changes occur, when auditing and event publication run, then both include the status operation and correlation id.

Dependencies: US-006, US-016.

INVEST notes: Small lifecycle slice with clear business value and tests.

### US-010 - Maintain trade lanes as region pairs

Priority: Must Have

Story: As a Reference Data Administrator, I want to maintain TradeLanes as configurable origin and destination Region pairs, so that the MVP supports selected trades without hard-coding a geography.

Acceptance criteria:

- Given active origin and destination Regions exist, when I create a TradeLane, then it stores both Region references.
- Given either Region is missing or inactive, when I submit the TradeLane, then validation rejects the request.
- Given the exact MVP lanes are not finalized, when seed data is configured, then the model allows configurable lanes without code changes.
- Given TradeLane changes are committed, when events publish, then consumers can identify the changed TradeLane by stable id.

Dependencies: Region reference APIs, US-007, US-016.

INVEST notes: Addresses the explicit regulatory/footprint open dependency without blocking the model.

### US-011 - View change history and publication status

Priority: Should Have

Story: As a Reference Data Administrator, I want to view change history and publication status for a record, so that I can answer whether a change was saved, audited, and announced.

Acceptance criteria:

- Given a record has prior changes, when I open its history, then I see actor, timestamp, operation, and summary where available.
- Given an event is pending, published, failed, or retrying, when I inspect the recent change, then the UI shows that status.
- Given publication status cannot be loaded, when the detail page renders, then the app shows a non-blocking status error.

Dependencies: US-016, US-019.

INVEST notes: Valuable visibility enhancement; can follow core lifecycle stories.

### US-012 - Evaluate platform roles and permissions

Priority: Must Have

Story: As a Security Administrator, I want `identity-service` to evaluate carrier roles and permissions, so that Shared Platform services enforce authorization consistently.

Acceptance criteria:

- Given a user has assigned platform roles, when a service calls the authorization API, then it receives the user's effective permissions.
- Given a user has no administrative role, when they attempt an admin mutation, then the platform denies the request.
- Given role data is unavailable, when authorization is requested, then the platform fails closed for protected actions.
- Given authorization decisions are made, when logs are emitted, then they include correlation id and decision outcome.

Dependencies: Keycloak 24 integration.

INVEST notes: Core platform story with service and UI impact.

### US-013 - Support MVP carrier roles

Priority: Must Have

Story: As a Security Administrator, I want the MVP carrier role set represented in the platform authorization model, so that each internal function can receive least-privilege access.

Acceptance criteria:

- Given the platform role model is configured, when roles are listed, then pricing, sales, booking desk, equipment control, customer service, finance-read, reference admin, platform operator, and security admin are available.
- Given a role is assigned, when authorization is evaluated, then permissions reflect that role.
- Given a user has multiple roles, when effective permissions are calculated, then the result is deterministic and auditable.
- Given an unknown role is received from identity data, when authorization runs, then the platform does not grant unexpected privileges.

Dependencies: US-012.

INVEST notes: Establishes the role vocabulary required by later modules without building those modules.

### US-014 - Audit role and permission changes

Priority: Must Have

Story: As a Security Administrator, I want role and permission changes audited immutably, so that access-control changes can be reviewed and investigated.

Acceptance criteria:

- Given a role assignment changes, when the change is saved, then audit records include actor, target user, timestamp, before/after values, and reason where supplied.
- Given an audit record is written, when it is queried by authorized users or tools, then the record cannot be altered through normal admin APIs.
- Given unauthorized users request role audit data, when authorization is evaluated, then access is denied and logged.

Dependencies: US-012, US-013.

INVEST notes: Security-control story with explicit audit evidence.

### US-015 - Define permission-review administration boundary

Priority: Could Have

Story: As a Security Administrator, I want permission-review administration boundaries documented, so that `apps/auth` does not accidentally absorb a larger access-management product in MVP.

Acceptance criteria:

- Given MVP scope is reviewed, when permission-review screens are considered, then the decision is documented as included, deferred, or assigned to another workflow.
- Given the decision is deferred, when `apps/auth` is implemented, then it includes request-access but no full permission-review administration.
- Given a later workflow adds permission review, when it starts, then it can trace back to this boundary.

Dependencies: US-003, US-014.

INVEST notes: Scope-control story; Could Have because it is decision hygiene, not runtime foundation.

### US-016 - Publish typed reference-change events

Priority: Must Have

Story: As a Downstream Module Consumer, I want typed reference-change events for each reference set, so that my future module can update local replicas without guessing payload meaning.

Acceptance criteria:

- Given a reference change commits, when the outbox publisher runs, then it publishes the matching `referencedata.<entity>.changed` Avro event.
- Given an event is published, when the payload is inspected, then it includes event id, event type, schema version, source, occurred-at, correlation id, entity id, and operation.
- Given a schema change is proposed, when compatibility checks run, then incompatible changes block deployment.
- Given the same event is delivered more than once, when a consumer deduplicates by event id, then duplicate effects can be avoided.

Dependencies: Reference admin lifecycle stories, Kafka, Schema Registry.

INVEST notes: Consumer-value enabler and core contract story.

### US-017 - Read canonical reference data through provider APIs

Priority: Must Have

Story: As a Downstream Module Consumer, I want stable provider APIs for canonical reference reads, so that future modules do not couple to Shared Platform databases.

Acceptance criteria:

- Given a consumer calls a list/detail API, when the request is authorized, then the API returns canonical reference data with stable ids.
- Given a consumer attempts direct database coupling, when architecture is reviewed, then it is rejected as out of scope.
- Given OpenAPI contracts are generated, when contract checks run, then provider behavior is validated against the contract.
- Given inactive data is needed for historical references, when the consumer requests inactive records explicitly, then the API can return them where permitted.

Dependencies: US-005, US-012.

INVEST notes: Future-consumer story without downstream runtime implementation.

### US-018 - Freeze contracts for downstream review

Priority: Must Have

Story: As a Downstream Module Consumer, I want OpenAPI and message contracts frozen enough for review, so that later Charge, Booking, and Container Movement work can start against stable provider expectations.

Acceptance criteria:

- Given synchronous API contracts are published, when downstream representatives review them, then findings are captured before contract freeze.
- Given message contracts are published, when message-pact or equivalent checks run, then envelope and entity payload compatibility are verified.
- Given downstream review identifies a required contract change, when the change is accepted, then versioning and compatibility impact are documented.
- Given this workflow produces contracts, when scope is checked, then it still does not build downstream runtime stubs.

Dependencies: US-016, US-017.

INVEST notes: Cross-team coordination story needed for build-order safety.

### US-019 - Monitor event publication health

Priority: Should Have

Story: As a Platform Operator, I want to monitor reference-change publication health, so that failed or delayed events can be detected before consumers drift.

Acceptance criteria:

- Given an outbox item is pending, published, failed, or retrying, when operator telemetry is inspected, then that status is visible.
- Given publication fails repeatedly, when retry limits or error handling trigger, then operators can identify the failed item and reason.
- Given event freshness is measured, when p95 latency exceeds the 60 second target, then an alert or dashboard signal is available.

Dependencies: US-016, observability stack.

INVEST notes: Supports NFR freshness and reliability; not required before first event slice works.

### US-020 - Trace requests across API, audit, outbox, and Kafka

Priority: Must Have

Story: As a Platform Operator, I want correlation ids propagated through API requests, audit records, outbox entries, logs, and Kafka events, so that cross-boundary behavior can be investigated.

Acceptance criteria:

- Given a request includes a correlation id, when it creates or changes reference data, then the same id appears in logs, audit, outbox, and event envelope.
- Given a request lacks a correlation id, when it enters the platform, then the platform creates one and propagates it.
- Given an operator searches by correlation id, when logs and traces exist, then related records can be linked.
- Given telemetry is emitted, when OpenTelemetry is configured, then traces and metrics are available for the approved observability tools.

Dependencies: Service skeleton, logging, Kafka, OpenTelemetry.

INVEST notes: Operational enabler with direct troubleshooting value.

### US-021 - Run deterministic local Shared Platform seed data

Priority: Must Have

Story: As a Delivery and QA Engineer, I want deterministic local seed data for the nine reference sets, so that developers and tests use repeatable canonical values.

Acceptance criteria:

- Given the local Docker Compose environment starts, when seed data loads, then all nine reference sets have deterministic MVP records.
- Given seed data is loaded more than once, when the process reruns, then it remains idempotent.
- Given seed data includes configurable regions and trade lanes, when tests run, then they do not require hard-coded final trade decisions.
- Given seed data changes, when CI runs, then dependent tests remain deterministic.

Dependencies: Database migrations, reference domain model.

INVEST notes: Delivery enabler framed around test and developer value.

### US-022 - Enforce CI contract, schema, and coverage gates

Priority: Must Have

Story: As a Delivery and QA Engineer, I want CI to enforce unit, integration, contract, schema, frontend, and coverage gates, so that Shared Platform changes do not weaken the foundation.

Acceptance criteria:

- Given a pull request changes backend code, when CI runs, then formatting, linting, compile, unit, integration, and 85% line coverage checks run for each backend service.
- Given a pull request changes APIs or events, when CI runs, then OpenAPI, Pact/message-pact, and Avro compatibility checks run.
- Given a pull request changes frontend code, when CI runs, then TypeScript, lint, test, and accessibility-relevant checks run where configured.
- Given any required gate fails, when merge is attempted, then merge is blocked.

Dependencies: Repository skeleton, CI runner, contract tooling.

INVEST notes: Quality-control story tied directly to `team-practices.md`.

### US-023 - Build a gated walking skeleton

Priority: Must Have

Story: As a Delivery and QA Engineer, I want the first Construction Bolt to deliver a gated walking skeleton, so that later bolts build on a proven end-to-end platform slice.

Acceptance criteria:

- Given the first Construction Bolt is planned, when units are selected, then it includes a thin path through auth, reference read/write, persistence, event publication, frontend access, CI, and observability basics.
- Given the walking skeleton completes, when the approval gate is presented, then the user can decide whether later bolts remain gated or become more autonomous.
- Given downstream module work is proposed for the skeleton, when scope is checked, then that work is rejected unless it is contract-only.
- Given the skeleton is deployed to staging, when smoke and health checks run, then they pass before production promotion is considered.

Dependencies: Delivery planning, CI, environment baseline.

INVEST notes: Implements the team practice as a story-level delivery guardrail.

## Dependency Notes

- US-001 and US-012 are early prerequisites for protected frontend and service flows.
- US-005 through US-010 form the reference administration backbone.
- US-016 through US-018 create the downstream-consumer contract path without building downstream modules.
- US-020 through US-023 should inform the first walking skeleton and CI planning.

## Out of Scope Reinforcement

The stories treat Charge, Booking, and Container Movement only as future consumers and contract reviewers. No story authorizes runtime implementation of Charge Calculation and Customer Agreement, Customer Booking, or Container Movement Management.

## Review

Verdict: READY

Fallback product-lead review found no blocking issues. User Stories should execute for this MVP, the personas and stories reflect the approved questions, acceptance criteria are testable, Enterprise Technical Environment v1.1 constraints are respected, and downstream modules remain contract-only future consumers.
