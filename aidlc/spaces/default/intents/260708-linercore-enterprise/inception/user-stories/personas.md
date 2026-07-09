# Personas - LinerCore Enterprise

## Source Context

This persona artifact consumes `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. It reflects the mixed brownfield status: Shared Platform exists, Charge/Agreement is partial, and Booking/CMM plus full enterprise UI/runtime must be added.

## Persona Summary

| Persona | Role | Priority | Primary modules |
|---|---|---|---|
| Priya Commercial Manager | Commercial team user managing agreements, tariffs, charges, pricing rules, and manual pricing fallback | Primary | Charge, Customer Agreement, D&D, UI |
| Ben Booking Coordinator | Booking desk user creating, amending, pricing, validating, and confirming bookings | Primary | Booking, Charge integration, UI |
| Omar Movement Controller | Operations user managing journeys, movement events, container status, and movement exceptions | Primary | CMM, Booking status, UI |
| Sara Platform Administrator | Admin user managing users, roles, capabilities, reference data, seed data, and service access | Primary | Shared Platform, runtime, security |
| Lina Operations Supervisor | Supervisor monitoring exceptions, manual overrides, D&D outcomes, lifecycle state, and operational audit trail | Primary | Booking, Charge, CMM, UI |
| Dev Delivery Engineer | Engineer running local runtime, migrations, contract tests, quality gates, observability, and release evidence | Secondary | Runtime, CI/CD, contracts, operation |
| Quinn Quality And Compliance Reviewer | Reviewer validating denied access, auditability, contracts, E2E flows, performance profiles, and no-fake-completion evidence | Secondary | Quality, security, contracts, operation |

## Persona Details

### Priya Commercial Manager

Goals:

- Maintain agreements, tariffs, validity, applicability, commodities, surcharges, local charges, and pricing audit details.
- Resolve manual pricing exceptions without losing auditability.
- Configure D&D rules, free time, rates, and manual overrides owned by Charge.

Pain points:

- Pricing results are hard to trust if agreement determination and tariff fallback are opaque.
- Manual pricing creates operational risk when approvals and audit trails are weak.

Context:

- Uses authenticated enterprise UI.
- Needs reference-data validation and permission-controlled workflows.

### Ben Booking Coordinator

Goals:

- Create and amend bookings with customer, routing, equipment, commodity, and operational details.
- Trigger pricing, validate capacity/routing, confirm bookings, and resolve exceptions.
- Track bookingRevision and lifecycle status after movement updates.

Pain points:

- Confirmation stalls if pricing, capacity validation, or manual fallback is unclear.
- Amendments can break downstream CMM reconciliation without revision traceability.

Context:

- Works across Booking, Charge, CMM status, and exception queues.
- Needs fast, dense UI workflows based on the Claude UI direction.

### Omar Movement Controller

Goals:

- Create journeys from confirmed bookings.
- Capture planned, estimated, and actual movement events.
- Resolve duplicate, late, and out-of-order events while preserving operational history.
- Publish movement status without deciding D&D relevance.

Pain points:

- Movement feeds are noisy and events arrive out of order.
- Status derivation must be explainable to Booking and operations users.

Context:

- First release uses manual/API capture with deterministic fixtures and future adapter seams.

### Sara Platform Administrator

Goals:

- Manage users, roles, capabilities, and reference data.
- Keep service access, local dev bypasses, Kafka ACLs, and database ownership controlled.
- Ensure seed data and runtime profiles are deterministic.

Pain points:

- Platform shortcuts can become production risks.
- Cross-module database access can silently violate ownership boundaries.

Context:

- Uses Shared Platform foundations and local Docker runtime evidence.

### Lina Operations Supervisor

Goals:

- Monitor manual overrides, operational exceptions, pricing failures, movement issues, and D&D outcomes.
- Ensure exceptions are resolved with auditability and traceability.
- Confirm all five enterprise flows are operationally credible.

Pain points:

- Business workflows fail when exception queues exist only as logs or hidden technical states.
- D&D disputes require clear boundary and charge calculation evidence.

Context:

- Needs dashboards and UI surfaces that connect real business state to audit records.

### Dev Delivery Engineer

Goals:

- Run `docker compose --profile full up -d --build`.
- Execute migrations, seed data, contract validation, quality gates, health checks, smoke tests, and observability checks.
- Keep Graphify updated after major changes.

Pain points:

- Partial containers starting can be mistaken for readiness.
- Missing profiles, migrations, or seed data slow every module team.

Context:

- Uses CI/CD and local runtime tools as release evidence.

### Quinn Quality And Compliance Reviewer

Goals:

- Verify requirements, stories, contracts, denied access paths, audit records, E2E tests, performance profiles, and operational artifacts.
- Prevent fake completion claims.

Pain points:

- Unexecutable contracts and mock UI logic hide integration risk.
- Missing negative tests undermine security claims.

Context:

- Uses test evidence and traceability from requirements to design, code, contracts, and tests.

## Persona Relationships

Ben depends on Priya's pricing/agreement setup, Omar's movement status, and Sara's reference data/security setup. Priya depends on Sara's reference data and platform controls. Omar depends on Booking's `booking.confirmed` events and must publish movement status back to Ben without assuming D&D relevance. Lina supervises the exception and audit trails across Ben, Priya, and Omar. Dev and Quinn provide delivery and assurance guardrails for every persona workflow.

