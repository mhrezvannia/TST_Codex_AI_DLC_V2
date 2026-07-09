# User Stories - LinerCore Enterprise

## Source Context

These stories consume `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. They preserve the enterprise target across Shared Platform, Charge Calculation, Customer Agreement, Booking, D&D, CMM, full UI, contracts, local Docker runtime, and Operation.

## Story Index

| Epic | Story IDs | Focus |
|---|---|---|
| Shared Platform | US-SP-001 to US-SP-006 | Identity, reference data, event envelope, authorization, audit, contracts |
| Charge And Agreement | US-CHG-001 to US-CHG-007 | Agreements, pricing, tariffs, manual pricing, D&D |
| Booking | US-BKG-001 to US-BKG-008 | Creation, pricing orchestration, confirmation, amendments, status, D&D triggers |
| CMM | US-CMM-001 to US-CMM-006 | Journey creation, movement capture, validation, status publication |
| UI And Exceptions | US-UI-001 to US-UI-005 | Claude UI mapping, authenticated workflows, exceptions, supervisor views |
| Runtime And Operation | US-RUN-001 to US-RUN-006 | Compose, seed data, contracts, observability, quality gates, operation evidence |

## Shared Platform Stories

### US-SP-001 - Authenticate enterprise users

As Sara Platform Administrator, I want users to authenticate through Keycloak-backed identity, so that every enterprise workflow starts from a verified subject.

Priority: Must Have  
Trace: FR-SP-002, NFR-SEC-001  
Dependencies: Existing identity-service and apps/auth foundations  
Acceptance criteria:

- Given a configured local Keycloak realm, when a valid user signs in, then the UI receives an authenticated session.
- Given an unauthenticated user, when they access protected module routes, then access is denied or redirected.
- Given local development mode, when bypass is enabled, then the bypass is explicit, development-only, and auditable.

INVEST: Valuable and testable; depends on identity foundation but can be validated independently.

### US-SP-002 - Enforce role and capability access

As Sara Platform Administrator, I want module actions protected by roles and capabilities, so that users can only perform authorized operations.

Priority: Must Have  
Trace: FR-SP-003, NFR-SEC-003  
Dependencies: Identity capability model, module permission catalog  
Acceptance criteria:

- Given a user lacks a required capability, when they call a protected API, then the request is denied and audited.
- Given a user has the required capability, when they call the same API, then the operation proceeds.
- Given Quinn reviews security evidence, when denied-path tests run, then they prove both API denial and audit record creation.

INVEST: Testable through negative and positive security tests.

### US-SP-003 - Maintain enterprise reference data

As Sara Platform Administrator, I want to maintain reference data used by booking, pricing, agreements, D&D, and movements, so that all modules share controlled business values without sharing databases.

Priority: Must Have  
Trace: FR-SP-004, FR-RUN-005  
Dependencies: reference-data-service  
Acceptance criteria:

- Given authorized admin access, when Sara creates or updates a reference record, then the record is validated and versioned.
- Given another module needs reference values, when it integrates, then it uses approved API/event seams rather than direct database queries.
- Given seed data is loaded, when validation runs, then required enterprise reference sets exist.

INVEST: Vertical enough to include API, UI, seed, and integration boundaries.

### US-SP-004 - Publish reference-data events

As Dev Delivery Engineer, I want reference-data changes published through an outbox and canonical event envelope, so that consumers can react reliably.

Priority: Must Have  
Trace: FR-SP-005, NFR-REL-002  
Dependencies: Kafka, Schema Registry, outbox hardening  
Acceptance criteria:

- Given a reference-data mutation, when the transaction commits, then an outbox entry is created.
- Given the publisher runs, when Kafka and Schema Registry are available, then a backward-compatible event is published.
- Given publish failure, when retry runs, then the event remains recoverable and observable.

INVEST: Testable through integration and message contract tests.

### US-SP-005 - Trace requests and events

As Quinn Quality And Compliance Reviewer, I want correlation IDs across APIs, events, logs, and traces, so that every enterprise flow can be audited end to end.

Priority: Must Have  
Trace: FR-SP-006, NFR-OBS-001  
Dependencies: Shared logging/tracing conventions  
Acceptance criteria:

- Given a booking flow starts, when it crosses pricing and movement services, then a correlationId is preserved.
- Given logs and traces are inspected, when the flow completes, then the same correlationId appears in relevant records.
- Given a failure occurs, when an exception queue item is created, then the correlationId links it to originating business action.

INVEST: Cross-cutting but testable via E2E observability smoke.

### US-SP-006 - Validate executable contracts

As Dev Delivery Engineer, I want executable OpenAPI, Avro, AsyncAPI, HTTP Pact, and message-pact checks, so that integration readiness is proven before module completion.

Priority: Must Have  
Trace: FR-SP-007, NFR-COMP-001  
Dependencies: Contract catalog, CI quality gates  
Acceptance criteria:

- Given contract artifacts exist, when validation runs, then OpenAPI, Avro, AsyncAPI, Pact, and message fixtures pass.
- Given a schema change is introduced, when compatibility checks run, then backward compatibility is enforced.
- Given only markdown contract documents exist, when readiness is assessed, then integration readiness is not claimed.

INVEST: Clear acceptance; informs CI and delivery stories.

## Charge And Agreement Stories

### US-CHG-001 - Manage approved customer agreements

As Priya Commercial Manager, I want to create, approve, suspend, expire, and audit customer agreements, so that pricing uses governed commercial terms.

Priority: Must Have  
Trace: FR-CHG-001  
Dependencies: charge-agreement-service, reference data, authorization  
Acceptance criteria:

- Given valid agreement data, when Priya creates and approves an agreement, then status and audit history are recorded.
- Given invalid reference data, when Priya submits an agreement, then validation blocks approval.
- Given an unauthorized user, when they attempt approval, then access is denied and audited.

INVEST: Builds on partial existing Charge Agreement capability.

### US-CHG-002 - Determine active agreement or tariff fallback

As Ben Booking Coordinator, I want pricing to determine the applicable agreement or tariff fallback, so that booking confirmation can proceed with auditable charges.

Priority: Must Have  
Trace: FR-CHG-002, FR-CHG-003, FR-BKG-002  
Dependencies: Customer/agreement model, tariff data  
Acceptance criteria:

- Given an eligible contract customer, when Booking requests pricing, then Charge returns agreement-based pricingRef.
- Given no agreement applies, when Booking requests pricing, then Charge returns tariff fallback pricingRef.
- Given neither can be determined, when Booking requests pricing, then a manual pricing exception is returned.

INVEST: Valuable and testable through pricing matrix.

### US-CHG-003 - Return itemised pricing

As Priya Commercial Manager, I want pricing results itemised by base freight, surcharges, local charges, basis, and audit details, so that charges are explainable.

Priority: Must Have  
Trace: FR-CHG-004  
Dependencies: pricing model, tariff/agreement charge terms  
Acceptance criteria:

- Given a valid pricing request, when Charge calculates pricing, then each charge line has type, amount, currency, basis, pricingRef, and audit source.
- Given Quinn reviews pricing, when the result is inspected, then agreement/tariff determination is traceable.
- Given Booking stores pricing, when the booking is viewed, then itemised charges are visible.

INVEST: Testable through contract and UI assertions.

### US-CHG-004 - Handle pricing resilience

As Ben Booking Coordinator, I want pricing calls to be idempotent and resilient, so that duplicate attempts or temporary failures do not corrupt booking state.

Priority: Must Have  
Trace: FR-CHG-005, NFR-REL-001  
Dependencies: pricing contracts, idempotency store, timeout/retry policy  
Acceptance criteria:

- Given a repeated pricing request with the same idempotency key, when Charge receives it, then the same effective result is returned or safely deduplicated.
- Given Charge times out, when Booking retries, then circuit-breaker and exception behavior is observable.
- Given correlationId is present, when pricing succeeds or fails, then logs/events preserve it.

INVEST: Cross-module but bounded to pricing integration.

### US-CHG-005 - Configure D&D rules

As Priya Commercial Manager, I want to configure free time, rates, start/end boundaries, and qualifiers for D&D, so that D&D calculation is governed by Charge.

Priority: Must Have  
Trace: FR-CHG-006, FR-CHG-007  
Dependencies: Reference data, D&D model  
Acceptance criteria:

- Given import demurrage, import detention, or export detention rules, when Priya saves them, then applicability and qualifiers are validated.
- Given overlapping rules, when Priya attempts approval, then conflicts are detected.
- Given a rule changes, when audit history is reviewed, then the change source and time are visible.

INVEST: Domain-focused and testable.

### US-CHG-006 - Calculate D&D results

As Lina Operations Supervisor, I want D&D requests to return chargeable days, free time, rates, and manual override status, so that disputes can be resolved with evidence.

Priority: Must Have  
Trace: FR-CHG-008, FR-E2E-004  
Dependencies: Booking D&D trigger, Charge D&D rules  
Acceptance criteria:

- Given Booking sends a D&D request, when Charge applies rules, then Charge returns free time, chargeable days, rates, totals, and audit trail.
- Given no rule applies, when Charge evaluates the request, then a manual fallback or exception is returned.
- Given a manual override is applied, when reviewed, then original calculation and override reason are retained.

INVEST: Directly supports Flow 4.

### US-CHG-007 - Keep Charge out of Booking ownership

As Quinn Quality And Compliance Reviewer, I want Charge to calculate pricing and D&D without owning booking lifecycle decisions, so that module boundaries stay enforceable.

Priority: Must Have  
Trace: Constraints, FR-BKG-009, FR-CMM-008  
Dependencies: Architecture tests  
Acceptance criteria:

- Given Charge receives a pricing or D&D request, when it responds, then it does not mutate booking lifecycle.
- Given code review runs, when module dependencies are checked, then Charge does not query Booking or CMM databases.
- Given E2E tests run, when Booking state changes, then the state change occurs in Booking.

INVEST: Boundary story; acceptance is architectural and behavioral.

## Booking Stories

### US-BKG-001 - Create a booking

As Ben Booking Coordinator, I want to create a booking with customer, routing, equipment, commodity, reefer, and DG details, so that customer demand is captured accurately.

Priority: Must Have  
Trace: FR-BKG-001  
Dependencies: Reference data, authentication, booking service  
Acceptance criteria:

- Given valid customer and routing data, when Ben creates a booking, then the booking is stored in draft state.
- Given invalid POL, POD, equipment, commodity, reefer, or DG data, when Ben submits, then validation errors identify the field.
- Given the booking is saved, when viewed later, then customer references and audit history are preserved.

INVEST: Foundational Booking story.

### US-BKG-002 - Price a booking

As Ben Booking Coordinator, I want the booking to request pricing from Charge, so that charges are known before confirmation.

Priority: Must Have  
Trace: FR-BKG-002, FR-E2E-001  
Dependencies: pricing.request/result, Charge pricing  
Acceptance criteria:

- Given a draft booking is ready for pricing, when Ben requests pricing, then Booking sends `pricing.request` with correlationId and idempotency key.
- Given Charge returns a result, when Booking stores it, then itemised charges and pricingRef are visible.
- Given pricing fails, when the response is handled, then a pricing exception is created.

INVEST: Vertical cross-module slice.

### US-BKG-003 - Resolve manual pricing

As Priya Commercial Manager, I want to resolve manual pricing exceptions, so that Ben can continue confirmation with controlled approval.

Priority: Must Have  
Trace: FR-BKG-003, FR-UI-005  
Dependencies: Booking exception queue, Charge manual fallback  
Acceptance criteria:

- Given automated pricing cannot complete, when Booking creates an exception, then Priya can enter or approve manual pricing.
- Given manual pricing is approved, when Ben views the booking, then pricing status changes and audit details are visible.
- Given manual pricing is rejected, when Ben views the booking, then confirmation remains blocked.

INVEST: Business valuable and testable.

### US-BKG-004 - Validate capacity and routing

As Ben Booking Coordinator, I want fixture-backed schedule and capacity validation with audited manual override, so that operational checks are explicit in local-first release.

Priority: Must Have  
Trace: FR-BKG-004  
Dependencies: Local adapter seam, reference data  
Acceptance criteria:

- Given fixture schedule/capacity data, when Ben validates a booking, then validation returns pass/fail reasons.
- Given validation fails but business override is allowed, when authorized supervisor approves, then the override reason is audited.
- Given no override exists, when Ben confirms, then confirmation is blocked.

INVEST: Supports first-release local integration depth.

### US-BKG-005 - Confirm and publish booking

As Ben Booking Coordinator, I want to confirm a valid booking and publish `booking.confirmed`, so that CMM can create the container journey.

Priority: Must Have  
Trace: FR-BKG-005, FR-BKG-006, FR-E2E-001, FR-E2E-002  
Dependencies: pricing, validation, booking.confirmed contract  
Acceptance criteria:

- Given pricing and operational validation are complete or approved fallbacks exist, when Ben confirms, then booking status becomes confirmed.
- Given confirmation succeeds, when the outbox publisher runs, then `booking.confirmed` is published with bookingRevision and correlationId.
- Given the message is consumed by CMM, when Flow 2 runs, then journey creation begins.

INVEST: Walking skeleton candidate.

### US-BKG-006 - Amend and reconfirm a booking

As Ben Booking Coordinator, I want to amend a booking and trigger conditional repricing and revalidation, so that changed bookings remain trustworthy.

Priority: Must Have  
Trace: FR-BKG-007, FR-E2E-005  
Dependencies: Booking revision model, pricing, validation, CMM reconciliation  
Acceptance criteria:

- Given a confirmed booking, when Ben changes routing, equipment, commodity, or customer data, then bookingRevision increments.
- Given the change affects pricing, when amendment is submitted, then repricing is required.
- Given CMM has a journey for the old revision, when reconfirmation occurs, then CMM reconciliation receives the new revision.

INVEST: More complex but central to enterprise workflow.

### US-BKG-007 - Consume movement status

As Ben Booking Coordinator, I want Booking to consume `containermovement.status`, so that booking lifecycle state reflects operational progress.

Priority: Must Have  
Trace: FR-BKG-008, FR-E2E-003  
Dependencies: CMM status publication  
Acceptance criteria:

- Given CMM publishes status, when Booking consumes it, then booking lifecycle updates without recalculating movement status.
- Given a duplicate status event arrives, when Booking processes it, then deduplication prevents duplicate lifecycle changes.
- Given a status cannot be applied, when processing fails, then an exception queue item is created.

INVEST: Cross-module integration story.

### US-BKG-008 - Trigger D&D request

As Lina Operations Supervisor, I want Booking to detect D&D boundaries and request D&D pricing from Charge, so that D&D charges are generated without Booking calculating rates.

Priority: Must Have  
Trace: FR-BKG-009, FR-E2E-004  
Dependencies: Movement status, D&D contract, Charge D&D rules  
Acceptance criteria:

- Given movement status crosses a configured D&D boundary, when Booking evaluates lifecycle state, then it sends `pricing.dnd-request`.
- Given Charge returns `pricing.dnd-result`, when Booking stores it, then D&D charge and audit details are visible.
- Given Booking code is reviewed, when D&D calculation is checked, then no rate or free-time calculation exists in Booking.

INVEST: Critical boundary and flow story.

## CMM Stories

### US-CMM-001 - Create journey from confirmed booking

As Omar Movement Controller, I want CMM to consume `booking.confirmed` and create a journey, so that operations can track expected container movement.

Priority: Must Have  
Trace: FR-CMM-001, FR-E2E-002  
Dependencies: booking.confirmed event  
Acceptance criteria:

- Given `booking.confirmed` arrives, when CMM consumes it, then a journey is created or reconciled by bookingRevision.
- Given the same event arrives twice, when processed, then CMM deduplicates it.
- Given a newer revision arrives, when processed, then CMM reconciles journey expectations.

INVEST: Walking skeleton candidate.

### US-CMM-002 - Derive expected movements

As Omar Movement Controller, I want CMM to derive expected POL, transshipment, POD, and equipment moves, so that operations know what should happen.

Priority: Must Have  
Trace: FR-CMM-002  
Dependencies: Journey model, booking route details  
Acceptance criteria:

- Given a confirmed booking with POL/POD and transshipment legs, when CMM creates the journey, then expected movements are generated.
- Given equipment data is present, when expected moves are shown, then each move references container/equipment identity where applicable.
- Given routing changes arrive, when CMM reconciles, then expected movements reflect the latest bookingRevision.

INVEST: Testable through journey derivation.

### US-CMM-003 - Capture movement events

As Omar Movement Controller, I want to capture planned, estimated, and actual movements through UI/API, so that local-first operations can run without external movement feeds.

Priority: Must Have  
Trace: FR-CMM-003  
Dependencies: CMM API/UI, movement fixtures  
Acceptance criteria:

- Given a journey exists, when Omar enters a planned, estimated, or actual event, then the event is stored with occurred and received time.
- Given required fields are missing, when Omar submits, then validation explains the missing data.
- Given future external adapters are added, when they publish movement data, then they use the same validation path.

INVEST: Supports manual first release and future seams.

### US-CMM-004 - Validate DCSA-aligned movements

As Quinn Quality And Compliance Reviewer, I want movement events validated against DCSA v2.2-aligned rules, so that movement status is trustworthy.

Priority: Must Have  
Trace: FR-CMM-004  
Dependencies: Reference data, movement validation rules  
Acceptance criteria:

- Given invalid event type, location, time, equipment, empty/laden, or transshipment state, when submitted, then CMM rejects or flags it.
- Given valid movement data, when submitted, then CMM accepts it and records operational history.
- Given validation rules change, when tests run, then edge cases are covered.

INVEST: Clear validation story.

### US-CMM-005 - Handle event ordering problems

As Omar Movement Controller, I want duplicate, late, and out-of-order events handled deterministically, so that operational history remains correct.

Priority: Must Have  
Trace: FR-CMM-005  
Dependencies: Event identity, ordering metadata  
Acceptance criteria:

- Given a duplicate event arrives, when processed, then it is ignored or linked without creating duplicate status.
- Given a late event arrives, when it affects history, then CMM records it and recalculates status according to deterministic rules.
- Given an out-of-order event arrives, when it cannot be safely applied, then an exception is raised.

INVEST: Testable through scenario fixtures.

### US-CMM-006 - Publish movement status

As Omar Movement Controller, I want CMM to publish `containermovement.status`, so that Booking can update lifecycle without owning movement logic.

Priority: Must Have  
Trace: FR-CMM-006, FR-CMM-007, FR-CMM-008, FR-E2E-003  
Dependencies: status derivation, status event contract  
Acceptance criteria:

- Given movement status changes, when CMM derives status, then it publishes `containermovement.status`.
- Given Booking consumes the status, when lifecycle updates, then movement status remains owned by CMM.
- Given D&D relevance is evaluated, when code boundaries are reviewed, then CMM does not decide D&D relevance.

INVEST: Cross-module boundary story.

## UI And Exception Stories

### US-UI-001 - Use Claude UI baseline for navigation and layout

As Lina Operations Supervisor, I want the enterprise UI to preserve compatible Claude UI navigation and visual direction, so that users get a coherent operating workspace.

Priority: Must Have  
Trace: FR-UI-001, FR-UI-002  
Dependencies: Refined mockups, design-inputs/claude-ui-export  
Acceptance criteria:

- Given refined mockups are produced, when compared to the Claude UI export, then compatible navigation and component direction are preserved.
- Given prototype behavior conflicts with requirements, when implemented, then real business behavior wins.
- Given raw HTML/screenshots are not semantically indexed, when design evidence is cited, then that limitation is stated honestly.

INVEST: Design story feeding Refined Mockups.

### US-UI-002 - Operate booking workflows in UI

As Ben Booking Coordinator, I want UI screens for booking creation, pricing, validation, confirmation, amendment, and lifecycle status, so that I can complete booking work without hidden API steps.

Priority: Must Have  
Trace: FR-UI-003, FR-BKG-001 through FR-BKG-008  
Dependencies: Booking APIs, auth, pricing/status integrations  
Acceptance criteria:

- Given Ben has booking permissions, when he uses the UI, then create, price, validate, confirm, amend, and status views are available.
- Given an exception occurs, when Ben opens the booking, then the exception is visible with next actions.
- Given a field fails validation, when Ben edits it, then the UI shows precise feedback.

INVEST: User-facing and cross-functional.

### US-UI-003 - Operate commercial pricing and D&D workflows in UI

As Priya Commercial Manager, I want UI workflows for agreements, tariffs, pricing, manual fallback, and D&D rules, so that commercial behavior is governed and auditable.

Priority: Must Have  
Trace: FR-UI-003, FR-CHG-001 through FR-CHG-008  
Dependencies: Charge APIs, reference data, permissions  
Acceptance criteria:

- Given Priya has commercial permissions, when she uses the UI, then agreements, tariffs, charge terms, pricing audit, and D&D rules are accessible.
- Given manual pricing or D&D override is needed, when Priya acts, then reason, approver, and audit trail are recorded.
- Given unauthorized users access commercial actions, when they attempt changes, then actions are blocked.

INVEST: Clear business value.

### US-UI-004 - Operate movement workflows in UI

As Omar Movement Controller, I want UI workflows for journeys, expected moves, movement capture, validation errors, and operational history, so that movement operations are manageable.

Priority: Must Have  
Trace: FR-UI-003, FR-CMM-001 through FR-CMM-006  
Dependencies: CMM APIs, auth, journey data  
Acceptance criteria:

- Given a journey exists, when Omar opens it, then expected and actual movement state is visible.
- Given Omar captures movement, when validation fails, then the UI explains the DCSA-aligned issue.
- Given late or out-of-order events exist, when Omar views history, then the operational timeline is clear.

INVEST: Directly supports CMM users.

### US-UI-005 - Supervise exceptions and audit trail

As Lina Operations Supervisor, I want cross-module exception and audit views, so that unresolved pricing, capacity, movement, D&D, and contract issues can be managed.

Priority: Must Have  
Trace: FR-BKG-010, FR-UI-005, NFR-OBS-001  
Dependencies: Exception queues, audit logs, correlation IDs  
Acceptance criteria:

- Given an exception exists, when Lina opens the supervisor view, then module, severity, owner, correlationId, and next action are shown.
- Given an exception is resolved, when audited, then action, approver, and business reason are preserved.
- Given multiple modules are involved, when Lina filters by correlationId, then related records are linked.

INVEST: Cross-module but user-visible and testable.

## Runtime And Operation Stories

### US-RUN-001 - Start full local runtime

As Dev Delivery Engineer, I want `docker compose --profile full up -d --build` to start all enterprise components locally, so that the application can run on the user's Windows PC without remote runtime servers.

Priority: Must Have  
Trace: FR-RUN-001, FR-RUN-002  
Dependencies: Compose profiles, service Dockerfiles  
Acceptance criteria:

- Given local prerequisites are installed, when the full profile starts, then PostgreSQL, Kafka, Schema Registry, Keycloak, services, frontends, reverse proxy, and observability are healthy.
- Given a component fails, when readiness checks run, then failure is explicit.
- Given only containers start without E2E flow proof, when completion is assessed, then completion is not claimed.

INVEST: Operationally testable.

### US-RUN-002 - Support development profiles

As Dev Delivery Engineer, I want `core`, `app`, `observability`, `devtools`, `full`, and module-development profiles, so that teams can work independently without losing full-runtime parity.

Priority: Must Have  
Trace: FR-RUN-003  
Dependencies: Compose/profile design  
Acceptance criteria:

- Given a backend service runs from the IDE, when infrastructure runs in Docker, then dependent services remain reachable.
- Given a frontend runs locally, when app profile dependencies run, then it can call APIs through documented URLs.
- Given profile documentation is followed, when startup completes, then health checks identify readiness.

INVEST: Developer-experience story.

### US-RUN-003 - Seed deterministic enterprise data

As Dev Delivery Engineer, I want deterministic seed data for all modules, so that tests and demos repeat consistently.

Priority: Must Have  
Trace: FR-RUN-007  
Dependencies: Migrations, seed scripts  
Acceptance criteria:

- Given the seed command runs, when completed, then users, roles, reference data, agreements, tariffs, charges, D&D rules, bookings, journeys, and movements exist.
- Given seed validation runs, when data is missing or invalid, then the script fails.
- Given tests run multiple times, when seed resets occur, then results are deterministic.

INVEST: Testable and prerequisite for E2E.

### US-RUN-004 - Validate contracts in CI and local

As Quinn Quality And Compliance Reviewer, I want contract validation in local and CI workflows, so that integration changes cannot silently break consumers.

Priority: Must Have  
Trace: NFR-COMP-001, US-SP-006  
Dependencies: Contract artifacts and scripts  
Acceptance criteria:

- Given a contract changes, when CI runs, then compatibility and Pact/message-pact checks execute.
- Given a provider does not satisfy a contract, when verification runs, then the gate fails.
- Given markdown-only enterprise contracts exist, when readiness is assessed, then implementation remains incomplete.

INVEST: Assurance story.

### US-RUN-005 - Observe enterprise flows

As Lina Operations Supervisor, I want logs, metrics, traces, dashboards, alerts, and SLO evidence for all five flows, so that operations can detect and diagnose issues.

Priority: Must Have  
Trace: NFR-OBS-001, NFR-OPS-001  
Dependencies: Observability stack, correlation IDs  
Acceptance criteria:

- Given an E2E flow runs, when observability is inspected, then logs, metrics, and traces show the flow.
- Given an error threshold is crossed, when alert rules are active, then an alert condition is visible.
- Given SLOs are defined in NFR stages, when performance validation runs, then evidence is produced.

INVEST: Operation-ready story.

### US-RUN-006 - Prove no fake completion

As Quinn Quality And Compliance Reviewer, I want completion gates to require real implementation evidence, so that documents, skeletons, mock screens, or containers merely starting are never treated as done.

Priority: Must Have  
Trace: Constraints, NFR-OPS-001  
Dependencies: Quality gates, E2E tests, operation artifacts  
Acceptance criteria:

- Given a module claims completion, when reviewed, then real code, migrations, APIs/events, frontend, tests, contracts, runtime, and observability evidence are present.
- Given a TODO-only method or hardcoded fake result exists, when quality checks run, then completion is rejected.
- Given a stage artifact references an unimplemented capability, when reviewed, then it is marked as gap rather than complete.

INVEST: Governance story protecting enterprise quality.

## Walking Skeleton Candidate

The first Construction walking skeleton should combine:

- US-SP-001, US-SP-002, and US-SP-003 for authenticated platform and reference readiness.
- US-CHG-002 and US-CHG-003 for pricing seam and itemised result.
- US-BKG-001, US-BKG-002, and US-BKG-005 for booking creation, pricing, confirmation, and `booking.confirmed`.
- US-CMM-001 and US-CMM-002 for CMM journey creation and expected movement derivation.
- US-UI-002 and US-RUN-001 for authenticated UI and local runtime proof.

This is not a completion claim for all enterprise scope; it is the first vertical proof point required by `team-practices.md`.

## Dependency Notes

- Shared Platform security, reference data, contracts, and runtime foundations unblock all other stories.
- Charge pricing and D&D stories must not absorb Booking lifecycle ownership.
- Booking stories depend on pricing and CMM contracts but own confirmation, amendments, D&D trigger logic, and exception queues.
- CMM stories depend on `booking.confirmed` and must not decide D&D relevance.
- UI stories depend on real APIs and permissions; prototype-only behavior is not acceptable.
- Runtime and operation stories provide the evidence needed before any enterprise completion claim.

## Review

Verdict: READY

Product Lead review was completed inline after the declared reviewer subagent failed because its configured model is not supported for this Codex account. The story set is business-aligned with the approved requirements, covers the required enterprise personas, preserves module ownership boundaries, identifies a credible walking-skeleton candidate, and gives Delivery Planning enough material to sequence units without reducing scope to Shared Platform.

Findings:

- No blocking story gaps were found for this stage.
- The stories are intentionally workflow-level rather than implementation-ticket-level; Units Generation and Delivery Planning should split them into executable units and Bolts.
- Refined Mockups must still convert Claude UI design direction into route and state-level UX specifications.
- Application Design must still refine schemas, API surfaces, event subjects, persistence ownership, and service boundaries before Construction.
