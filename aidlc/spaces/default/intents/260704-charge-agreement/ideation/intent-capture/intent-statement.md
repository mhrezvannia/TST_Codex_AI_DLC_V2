# Intent Statement - Charge & Customer Agreement

## Problem Statement

LinerCore now has a locally functional Shared Platform foundation, but the product is not complete until the first business capability can use that foundation for real work. The immediate gap is commercial agreement management: pricing and commercial users need to define customer agreements, attach charge terms, control validity windows, and move agreements through usable statuses before downstream booking and movement workflows can rely on commercial terms.

Without this module, Booking would have no authoritative commercial context for rates, charges, currencies, customers, commodities, trade lanes, or validity. Building Booking first would force placeholder pricing assumptions and create integration debt.

## Target Customer

| Stakeholder | Need |
| --- | --- |
| Commercial / pricing user | Create and maintain customer agreements and charge terms with validity and approval state. |
| Sales / account owner | See whether a customer has an active agreement and which terms apply. |
| Booking user | Consume approved agreement terms when preparing a customer booking. |
| Finance / revenue stakeholder | Rely on structured charge terms as a later input to invoicing and settlement. |
| Platform / architecture team | Prove that business modules consume Shared Platform reference data rather than duplicating it. |
| Product sponsor | See the MVP move beyond platform scaffolding into business functionality. |

## Success Metrics

| Metric | Target |
| --- | --- |
| Agreement lifecycle | Local user can create, view, update, approve, suspend, and expire customer agreements. |
| Charge terms | Agreement can hold charge lines with charge code, basis, currency, amount, route/trade-lane context, and validity window. |
| Shared Platform integration | Module consumes existing customer, charge-code, currency, location, commodity, and trade-lane reference data. |
| API usability | Backend exposes documented endpoints for agreement CRUD, approval, search, and active-agreement lookup. |
| UI usability | Local UI supports list/detail/edit flows rather than view-only placeholders. |
| Test evidence | Unit, API/service, UI, and smoke tests pass through existing quality-gate conventions. |
| Integration readiness | Booking can later resolve active commercial terms by customer, trade lane, commodity, and booking date. |

## Initiative Trigger

The trigger is the project roadmap decision captured after Shared Platform: build Charge & Customer Agreement first, then Customer Booking, then Container Movement Management, then run M0-M4 integration milestones. Shared Platform is now locally runnable, seeded, and contract-verified in host-runtime mode, so the next value-producing step is to build the first business module against it.

## Initial Scope Signal

Scope: `feature`.

Rationale: this is a new business module over an existing monorepo and platform foundation. It needs the full feature lifecycle because it introduces a domain model, service/API surface, UI workflows, persistence, tests, local runtime wiring, and downstream integration contracts.

## Initial Scope Boundaries

In scope:

| Area | Included |
| --- | --- |
| Agreement management | Customer agreements with lifecycle status, validity dates, and ownership metadata. |
| Charge terms | Charge lines using Shared Platform charge codes, currencies, locations, commodities, and trade lanes. |
| Local UI | Functional list, detail, create/edit, and approval controls for local development. |
| Backend module | Domain/service/API/persistence implementation following the existing Java/Spring hexagonal layout. |
| Shared data consumption | Read reference data from the existing Shared Platform path where practical; seed minimal agreement demo data only where needed. |
| Test and readiness evidence | Add tests and smoke/readiness coverage aligned with existing scripts. |

Out of scope:

| Area | Deferred |
| --- | --- |
| Customer Booking | Separate next module after Charge & Customer Agreement. |
| Container Movement | Separate module after Booking. |
| Invoicing/payment settlement | Later finance/revenue workflow, not required for this module's first completion. |
| Rebuilding Shared Platform | Shared Platform remains an upstream dependency. |
| Production deployment | Local/staging readiness only unless later Operation stages approve more. |
