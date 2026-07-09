# Wireframes - LinerCore Enterprise

## Source Context

This artifact consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`

Additional design baseline:

- `design-inputs/claude-ui-export/`
- `design-inputs/claude-ui-export/screenshots/platform-bundled.png`
- `design-inputs/claude-ui-export/screenshots/bundled-check.png`
- `design-inputs/claude-ui-export/LinerCore.dc.html`
- `design-inputs/claude-ui-export/Booking Directions.dc.html`

Graphify caveat: the graph is usable for code and normalized document context, and it exposes `support.js` plus uploaded markdown from the Claude export. Raw Claude HTML and screenshots were inspected directly because they are not fully semantically indexed by exact source path.

## Design Direction

Use the Claude export as the preferred visual baseline, with the operational console direction as the default:

- Compact left icon rail for module-level navigation.
- Top application bar with search, currency/context controls, and authenticated user state.
- Horizontal workflow ribbon for cross-module journey state.
- Dense work-focused content panels, not a marketing layout.
- Persistent right-side rail for live pricing, D&D, audit, exception, or status summaries.
- IBM Plex Sans and monospaced numeric references where the implementation can support them.
- Palette led by navy, white, light gray, teal, and restrained status colors.

The prototype business logic is not authoritative. The final UI must keep the visual quality and page composition where possible, but all behavior must map to the real requirements in the intent-statement, scope-document, and intent-backlog.

## Information Architecture

Primary shell:

```text
LinerCore
  Platform
    Reference data
    Identity and access
    Event and contract health
  Commercial
    Customer agreements
    Tariffs and charges
    Pricing workbench
    D&D rules
  Booking
    New booking
    Booking search
    Amendments
    Manual pricing
    Exceptions
  Container movement
    Journeys
    Movement capture
    Track and trace
    Status events
  Operations
    Exception queues
    Audit trails
    Runtime health
    Observability
```

Role visibility:

| Role | Primary areas | Hidden or restricted areas |
|------|---------------|----------------------------|
| Commercial manager | Agreements, tariffs, pricing, D&D rules, pricing audit | Identity administration unless separately granted |
| Booking desk | Bookings, amendments, pricing status, exceptions, movement status | D&D rule authoring and tariff publishing |
| Operations user | Container journeys, movement capture, movement status, exceptions | Agreement publishing and manual price approval |
| Platform administrator | Reference data, identity, capabilities, runtime health | Commercial override actions unless granted |
| Read-only auditor | Audit trails, event history, correlation views | Create, amend, publish, confirm, or approve actions |

## Wireframe 1 - Enterprise Shell and Work Queue

Purpose: first authenticated operational surface for users who need to find work, continue exceptions, or jump into a module.

```text
+--------------------------------------------------------------------------------+
| LinerCore | Commercial & Equipment Platform | Search bookings, containers... | U |
+----------+---------------------------------------------------------------------+
| [P]      |  Work queue                                  | Context summary      |
| [B]      | +------------------------------------------+ | +------------------+ |
| [M]      | | Needs action                             | | | Runtime healthy  | |
| [O]      | | Booking pricing exceptions      12      | | | Kafka OK         | |
| [A]      | | Movement validation exceptions   7      | | | Outbox lag low   | |
|          | | Manual D&D review               3      | | +------------------+ |
| user     | +------------------------------------------+ |                    |
|          |  Recent business objects                    | Event correlation  |
|          | +------------------------------------------+ | +----------------+ |
|          | | Type | Ref | Status | Owner | Updated    | | | c-7f3a91      | |
|          | +------------------------------------------+ | | | bkg-204418    | |
|          |                                              | +----------------+ |
+----------+----------------------------------------------+--------------------+
```

Mapped behavior:

- Platform: authn/authz controls module visibility and actions.
- Shared Platform: reference data and event health appear as status but are not edited here.
- Booking: user can open booking exceptions, amendments, confirmations, and movement-driven updates.
- Charge: user can open pricing and D&D exceptions.
- CMM: user can open movement validation exceptions and journey status.

Screen states:

| State | Behavior |
|-------|----------|
| Empty | Show no assigned work, recent objects, and module shortcuts according to permissions. |
| Loading | Use table-shaped skeletons for queues and status panels. |
| Error | Show service-specific unavailable panels without blocking unrelated modules. |
| Partial | Show stale data badge when event lag or service health affects freshness. |

Accessibility note: h1 "Work queue"; landmarks: header, nav, main, aside; first keyboard entry is skip link to work queue, then module rail.

## Wireframe 2 - Pricing and Agreement Workspace

Purpose: manage agreements, tariffs, charge terms, validity, applicability, and pricing auditability.

```text
+--------------------------------------------------------------------------------+
| LinerCore | Pricing & Agreements                         | Search agreements... |
+----------+---------------------------------------------------------------------+
| [P]*     | Customer agreement PRT-2026-NEU                                      |
| [B]      | Active | North Europe trade | Version 7 | Effective 01 Jun - 31 Dec   |
| [M]      +------------------------------+-------------------+------------------+
| [O]      | Terms and applicability      | Tariffs           | D&D rules        |
| [A]      | + Customer / commodity       | Base freight      | Import demurrage |
|          | + POL/POD/trade lane         | Surcharges        | Import detention |
|          | + Equipment and reefer/DG    | Local charges     | Export detention |
|          |                              | Fallback tariff   | Free time/rates  |
|          +------------------------------+-------------------+------------------+
|          | Pricing simulation                                                     |
|          | Booking facts -> agreement determination -> itemised result             |
|          | [Run pricing] [View audit] [Publish changes]                           |
+----------+---------------------------------------------------------------------+
```

Mapped behavior:

- Module owner: Charge Calculation & Customer Agreement.
- APIs and contracts: pricing request/result, active agreement lookup, tariff fallback, D&D request/result later in the flow.
- Permissions: publish and rule-edit actions require commercial authorizer capability; booking desk sees read-only pricing evidence.
- Audit: every price result must expose pricingRef, agreement/tariff source, line-item basis, fallback reason, and correlationId.

Screen states:

| State | Behavior |
|-------|----------|
| Empty | Guide commercial user to create first agreement or import tariffs. |
| Loading | Skeleton agreement header, tabs, and simulation rail. |
| Error | Inline pricing simulation error with retry and manual fallback path. |
| Partial | Show expired, future, draft, and conflicting validity states. |

Accessibility note: h1 "Customer agreement"; landmarks: header, nav, main, aside; first keyboard entry is agreement search, then tabs.

## Wireframe 3 - Booking Creation and Confirmation

Purpose: create, price, validate, and confirm bookings while showing commercial and operational state in one console.

```text
+--------------------------------------------------------------------------------+
| LinerCore | Commercial & Equipment Platform | Search bookings, containers... | U |
+----------+---------------------------------------------------------------------+
| [P]      | Agreement -> Booking -> Track & trace -> D&D & invoice              |
| [B]*     +---------------------------------------------------------------------+
| [M]      | New booking: Pacific Rim Trading Co.       Pending pricing           |
| [O]      | BKG-204418 | priced from PRT-2026-NEU | Agreement active              |
| [A]      | Request [done] -- Capacity [done] -- Pricing [active] -- Confirm      |
|          +----------------------------------------------+----------------------+
|          | Route                                        | Calculated charges   |
|          | CNSHA -> NLRTM, transshipment if present     | USD 4,764.00         |
|          | Vessel/voyage, ETD/ETA, cutoff dates         | Ocean freight        |
|          | Equipment: 2 x 40HC                          | BAF, THC, ISPS       |
|          | Commodity, weight, reefer/DG indicators      | pricingRef           |
|          | Customer references                          | [Re-price]           |
|          | Operational/capacity validation              | [Confirm booking]    |
+----------+----------------------------------------------+----------------------+
```

Mapped behavior:

- Module owner: Customer Booking.
- Booking calls Charge for pricing and stores pricing.result.
- Booking confirms only after pricing and operational/capacity validation are satisfied or an approved manual pricing fallback exists.
- Booking publishes `booking.confirmed`; CMM consumes the event.
- Booking must not calculate D&D rates or free time.

Screen states:

| State | Behavior |
|-------|----------|
| Empty | New booking wizard starts with customer and routing facts. |
| Loading | Pricing rail shows "pricing requested" with timeout countdown and retry state. |
| Error | Manual pricing queue appears when Charge is unavailable or no agreement/tariff applies. |
| Partial | Draft can be saved when customer references or optional commodity facts are incomplete. |

Accessibility note: h1 "New booking"; landmarks: header, nav, main, complementary pricing aside; first keyboard entry is booking stepper.

## Wireframe 4 - Container Journey and Movement Status

Purpose: manage CMM journey creation, expected movements, actual movement capture, DCSA-aligned validation, and status publication.

```text
+--------------------------------------------------------------------------------+
| LinerCore | Container movement                         | Search container...    |
+----------+---------------------------------------------------------------------+
| [P]      | Journey BKG-204418 / TCLU 738061-2                                  |
| [B]      | Confirmed booking revision 3 | CMM reconciled | Last status sent       |
| [M]*     +--------------------------------------------+------------------------+
| [O]      | Journey timeline                            | Status derivation       |
| [A]      | Expected: empty release                     | Planned                 |
|          | Expected: gate-in full at POL               | Estimated               |
|          | Actual: loaded on vessel                    | Actual                  |
|          | Actual: discharged at POD                   | Empty/laden state       |
|          | Actual: empty return received               | Duplicate/late flags    |
|          +--------------------------------------------+------------------------+
|          | Movement capture form                       | [Publish status]        |
|          | event type, location, occurred time, received time, source             |
+----------+---------------------------------------------------------------------+
```

Mapped behavior:

- Module owner: Container Movement Management.
- CMM consumes `booking.confirmed`, creates the journey, derives expected movements, validates captured movement events, derives status, and publishes `containermovement.status`.
- CMM reports movement truth; it must not decide whether a movement is D&D relevant.
- Booking consumes movement status and decides lifecycle/D&D trigger behavior.

Screen states:

| State | Behavior |
|-------|----------|
| Empty | Show confirmed booking without captured movements and expected movement plan. |
| Loading | Timeline skeletons preserve layout while movement history loads. |
| Error | Validation failures appear as row-level errors with correction and quarantine paths. |
| Partial | Late/out-of-order events display sequence warnings without losing event history. |

Accessibility note: h1 "Container journey"; landmarks: header, nav, main, aside; first keyboard entry is journey search, then timeline list.

## Wireframe 5 - D&D Outcome and Exception Handling

Purpose: show Booking-owned trigger decisions and Charge-owned D&D calculation results without blurring ownership.

```text
+--------------------------------------------------------------------------------+
| LinerCore | D&D outcome                                | Booking BKG-204418     |
+----------+---------------------------------------------------------------------+
| [P]*     | Movement boundary detected by Booking                              |
| [B]      | Empty return crossed import detention boundary                      |
| [M]      +--------------------------------------------+------------------------+
| [O]      | Trigger evidence                            | Charge result          |
| [A]      | Boundary event: empty return                | Free time: 5 days      |
|          | Occurred: 21 Jul 08:16                      | Chargeable: 4 days     |
|          | Received: 21 Jul 08:18                      | Rate: USD 120/day      |
|          | Source: containermovement.status            | Total: USD 480         |
|          | Correlation: c-7f3a91                       | pricing.dnd-result     |
|          +--------------------------------------------+------------------------+
|          | [Accept result] [Send to manual review] [Open audit trail]            |
+----------+---------------------------------------------------------------------+
```

Mapped behavior:

- Booking owns the D&D trigger and stores the D&D result.
- Charge owns D&D free time, rules, rates, applicability, and calculation.
- The UI must show both sides of the interaction and preserve auditability.
- Manual fallback appears when D&D result is unavailable, rejected, timed out, or ambiguous.

Screen states:

| State | Behavior |
|-------|----------|
| Empty | No D&D outcome until a movement boundary is recognized by Booking. |
| Loading | Trigger panel and Charge result panel load independently. |
| Error | Manual review queue captures failed D&D request or inconsistent movement facts. |
| Partial | Show pending result when request exists but result is not received. |

Accessibility note: h1 "D&D outcome"; landmarks: header, nav, main, complementary audit aside; first keyboard entry is booking breadcrumb.

## Wireframe 6 - Reference Data and Identity Administration

Purpose: harden the Shared Platform MVP into enterprise administration surfaces without turning domain modules into shared tables.

```text
+--------------------------------------------------------------------------------+
| LinerCore | Platform administration                     | Search reference...    |
+----------+---------------------------------------------------------------------+
| [P]      | Reference data                                                      |
| [B]      | Ports | Locations | Equipment | Commodities | Capabilities | Users    |
| [M]      +------------------------------------------+--------------------------+
| [O]      | Reference table                          | Change and event audit    |
| [A]*     | Code | Name | Status | Validity | Owner   | reference-data event     |
|          | CNSHA| Shanghai | Active | ...            | outbox status            |
|          | NLRTM| Rotterdam| Active | ...            | schema compatibility     |
|          +------------------------------------------+--------------------------+
|          | [Create] [Edit] [Retire] [View dependents]                           |
+----------+---------------------------------------------------------------------+
```

Mapped behavior:

- Shared Platform owns identity, authorization foundations, reference data, Kafka, Schema Registry, event envelope, and platform observability.
- Domain modules consume reference data through approved APIs/events only.
- Service and user capabilities drive visible actions.

Screen states:

| State | Behavior |
|-------|----------|
| Empty | Show seed-data status and create/import paths. |
| Loading | Table skeleton and audit rail skeleton. |
| Error | Permission denied and validation failures are distinct states. |
| Partial | Event publication lag appears in the audit rail, not hidden. |

Accessibility note: h1 "Platform administration"; landmarks: header, nav, main, aside; first keyboard entry is reference search.

## Wireframe 7 - Operations and Observability

Purpose: make enterprise readiness visible for local runtime, CI/CD, contract tests, observability, and incident workflows.

```text
+--------------------------------------------------------------------------------+
| LinerCore | Operations                                  | Environment: local     |
+----------+---------------------------------------------------------------------+
| [P]      | Runtime status                                                     |
| [B]      | PostgreSQL | Kafka | Schema Registry | Keycloak | Services | UI       |
| [M]      +------------------------------------------+--------------------------+
| [O]*     | Service health                           | Business flow evidence   |
| [A]      | reference-data-service OK                | Flow 1 passed            |
|          | identity-service OK                      | Flow 2 passed            |
|          | charge-agreement-service degraded        | Flow 3 pending           |
|          | booking-service OK                       | Flow 4 failed            |
|          | cmm-service OK                           | Flow 5 passed            |
|          +------------------------------------------+--------------------------+
|          | Logs | Traces | Metrics | Contract tests | Runbooks | Incidents        |
+----------+---------------------------------------------------------------------+
```

Mapped behavior:

- Supports the local execution requirement and Operation phase.
- Shows service health, contract-test support, outbox lag, Kafka lag, trace correlation, and E2E validation status.
- Does not claim production readiness from containers merely starting.

Screen states:

| State | Behavior |
|-------|----------|
| Empty | First-time local setup shows required `.env` and seed-data status. |
| Loading | Health widgets load independently. |
| Error | Failed service panels include logs, health endpoint, and runbook links. |
| Partial | Degraded services leave unrelated flows visible and mark affected flows. |

Accessibility note: h1 "Operations"; landmarks: header, nav, main, aside; first keyboard entry is environment selector.

## Contradiction Analysis

| UX expectation | Scope constraint | Resolution |
|----------------|------------------|------------|
| Claude prototype shows a single smooth MVP journey | Enterprise scope requires explicit module ownership | Preserve the journey ribbon visually, but keep separate module navigation, permissions, APIs, events, and audit ownership. |
| Prototype shows D&D calculation inside the visible journey | Booking must not calculate D&D rates/free time; CMM must not decide D&D relevance | Show Booking trigger evidence and Charge result side by side, with ownership labels and correlation. |
| Prototype implies invoice/finance behavior | Finance production integration is not fully scoped | Treat invoice/finance as downstream adapter evidence until later approved scope fixes depth. |
| Prototype uses mocked live values | No fake completion is allowed | Wireframes use sample values only as visual placeholders; implementation must bind to real APIs/events and persisted state. |
| Operational console is desktop-heavy | Users may still need smaller screens | Desktop is primary; tablet/mobile provide search, triage, approval, and read-only status first, with dense editing optimized for desktop. |

## Responsive and Accessibility Baseline

- Desktop first for operational density: 1280px and wider keeps icon rail, main content, and right rail visible.
- Tablet collapses the right rail below or behind a summary drawer.
- Mobile supports search, triage, read-only details, approvals, and exception routing; complex agreement/tariff editing can require desktop.
- WCAG 2.1 AA target: keyboard access, visible focus, semantic headings, skip link, labels, status announcements, non-color-only indicators, and sufficient contrast.
- All module rail icons require text labels or accessible names.
- Tables need sortable header semantics and row actions available from keyboard.

## Traceability to Backlog

| Backlog items | Wireframe coverage |
|---------------|--------------------|
| M-003 to M-005 | Reference Data and Identity Administration, Operations |
| M-007 to M-009 | Pricing and Agreement Workspace, D&D Outcome |
| M-010 to M-012 | Booking Creation and Confirmation |
| M-013 to M-015 | Container Journey and Movement Status |
| M-016 to M-018 | Booking movement/D&D integration, D&D Outcome |
| M-019 | Complete enterprise UI across all modules |
| M-020 to M-023 | Operations and Observability, E2E flow evidence |

## Review

Verdict: READY

Reviewer note: the configured `aidlc-product-lead-agent` sub-agent could not run because its configured model was rejected by the account. The conductor completed the review inline using the product-lead persona and preserved this caveat for the approval gate.

Findings:

- The rough mockups cover the complete enterprise scope rather than narrowing to Shared Platform or booking only.
- The artifacts preserve the Claude UI export direction while explicitly rejecting fake prototype business logic as implementation authority.
- Module ownership is visible: Shared Platform owns identity/reference/event foundations, Charge owns agreement/pricing/D&D calculation, Booking owns lifecycle/pricing orchestration/D&D triggers, and CMM owns movement truth.
- All five approved end-to-end flows are represented in the user-flow artifact.
- Accessibility notes are present per screen and the responsive baseline is stated.
- The Graphify/UI indexing caveat is explicit and does not over-claim semantic indexing of raw HTML or screenshots.

Required changes before approval: none.

Recommended refinements for the refined-mockups stage:

- Decide whether the final design blends the cleaner light-sidebar direction with the operational-console direction or standardizes fully on the operational console.
- Add concrete permission-state examples for read-only, operator, commercial approver, and platform administrator roles.
- Convert the D&D and movement evidence panels into interaction-level component specifications.
