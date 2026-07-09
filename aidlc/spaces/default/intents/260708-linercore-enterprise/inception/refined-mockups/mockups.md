# Refined Mockups - LinerCore Enterprise

## Source Context

This artifact consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It uses `design-inputs/claude-ui-export/` as the preferred visual baseline, especially `LinerCore.dc.html`, `Booking Directions.dc.html`, `LinerCore Platform.html`, `screenshots/platform-bundled.png`, `screenshots/bundled-check.png`, and `screenshots/directions.png`.

Graphify was used first for UI and story context. It found `support.js` and related document/code nodes, but raw Claude HTML/screenshots were not resolved as semantic exact source nodes. The raw export was inspected directly and is treated as design evidence, not graph-indexed semantic fact.

## Design Direction

The final UI should use the Claude export's operational-console direction as the base: light workspace, compact left navigation, dense business panels, IBM Plex Sans for text, IBM Plex Mono for identifiers and numeric references, navy/blue/teal status accents, and right-side evidence rails.

Prototype business behavior is not authoritative. Where the Claude export implies finance emission, automatic D&D, or simplified booking logic, the refined mockups preserve the composition but replace the behavior with the approved requirements: Booking owns lifecycle and D&D triggers, Charge owns pricing and D&D calculation, CMM owns movement truth, and Shared Platform owns identity/reference/event foundations.

## Global Shell

### Layout

```text
+----------------------------------------------------------------------------+
| LinerCore | Search booking, container, agreement... | Env local | User menu |
+----------+-----------------------------------------------------------------+
| Icon nav | Module workspace                                                |
|          | +-------------------------------------------------------------+ |
| Pricing  | | Contextual journey ribbon or module tabs                    | |
| Booking  | +-------------------------------------------------------------+ |
| Movement | | Primary content grid or form                                | |
| Platform | |                                                             | |
| Ops      | |                                                             | |
|          | +-------------------------------------------------------------+ |
|          | | Right evidence rail: pricing, status, D&D, audit, health    | |
+----------+-----------------------------------------------------------------+
```

### Persistent Elements

| Element | Specification |
|---|---|
| Top bar | App name, global search, environment selector, current user, notifications, help |
| Left rail | Icon plus accessible label for Pricing, Booking, Movement, Platform, Operations |
| Context ribbon | Agreement -> Booking -> Track and trace -> D&D, used only inside a booking journey |
| Right rail | Contextual evidence, not generic decoration |
| Work queue | Primary landing area for exceptions, assigned actions, recent objects, and degraded runtime status |

### Permissions

| State | Behavior |
|---|---|
| Read-only | User can view records, audit, and event history but cannot mutate |
| Operator | User can create and update module records within assigned role |
| Approver | User can approve commercial, manual fallback, or operational override actions |
| Platform admin | User can manage users, capabilities, reference data, seed/runtime health, and service visibility |

## Workspace 1 - Enterprise Work Queue

### Primary Users

Sara Platform Administrator, Lina Operations Supervisor, Ben Booking Coordinator, Priya Commercial Manager, Omar Movement Controller.

### Screen Composition

| Region | Contents |
|---|---|
| Main summary | Assigned exceptions, recent business objects, E2E flow evidence, degraded-service warnings |
| Module filters | All work, Booking, Pricing, Movement, D&D, Platform, Runtime |
| Work table | Type, reference, severity, owner, SLA/SLO impact, correlationId, last update, next action |
| Right rail | Runtime health, Kafka/outbox lag, contract-test status, latest failed flow |

### States

- Empty: no assigned work, show module shortcuts and seed-data health.
- Loading: table and right-rail skeletons.
- Error: failed service panels with affected modules and retry.
- Partial: stale badge when event lag makes data freshness uncertain.
- Permission denied: hide unauthorized actions but keep readable owned work.

## Workspace 2 - Pricing And Agreement

### Primary Users

Priya Commercial Manager, Quinn Quality And Compliance Reviewer.

### Screen Composition

| Region | Contents |
|---|---|
| Header | Agreement ID, customer, trade, version, status, effective dates |
| Tabs | Terms, Tariffs, Charge Lines, D&D Rules, Pricing Simulation, Audit |
| Left panel | Customer, commodity, lane, equipment, reefer/DG applicability |
| Center panel | Base freight, surcharges, local charges, fallback tariffs |
| Right rail | D&D rules, conflicts, publish status, schema/contract status |

### Required Interactions

- Inline edit with draft/approved state separation.
- Agreement approval requires review summary.
- Pricing simulation accepts booking facts and returns itemised pricing.
- Manual pricing exception opens when no agreement/tariff applies or Charge is unavailable.
- D&D rules editor shows import demurrage, import detention, export detention, free time, rates, boundaries, qualifiers, and rule conflicts.

### API/Event Mapping

| Action | Real behavior |
|---|---|
| Run pricing | Booking or simulation sends `pricing.request`; Charge returns `pricing.result` |
| Save agreement | Charge Agreement API persists agreement draft or update |
| Publish commercial change | Charge emits governed event where later design requires it |
| Review D&D rule | Charge owns rule validation and calculation |

## Workspace 3 - Booking Creation And Confirmation

### Primary Users

Ben Booking Coordinator, Priya Commercial Manager for manual pricing, Lina Operations Supervisor for operational overrides.

### Screen Composition

| Region | Contents |
|---|---|
| Header | Booking ID, customer, lifecycle status, bookingRevision, correlationId |
| Stepper | Request -> Capacity -> Pricing -> Confirm |
| Main form | Customer references, POL, POD, transshipment, voyage, equipment, commodity, reefer/DG |
| Right rail | Pricing result, operational validation, manual fallback, confirm action |
| Footer/action row | Save draft, validate, price, confirm, create amendment |

### Required Interactions

- Save draft without complete pricing.
- Validate reference data inline.
- Request pricing with timeout state and idempotency indicator.
- Show agreement/tariff determination and itemised charges.
- Confirm only when pricing and operational validation pass or approved manual fallback exists.
- Publish `booking.confirmed` after confirmation through outbox/event path.

### Screen States

| State | Required UI |
|---|---|
| Draft | Editable form, missing-field summary, save action |
| Pending pricing | Right rail shows pending request, timeout countdown, retry disabled until safe |
| Manual pricing | Exception queue link, commercial approver action |
| Capacity failed | Override request path with required reason |
| Confirmed | Read-only confirmation summary, event publication status |
| Amendment | Diff view, repricing/revalidation flags, bookingRevision preview |

## Workspace 4 - Container Journey And Movement Status

### Primary Users

Omar Movement Controller, Ben Booking Coordinator, Lina Operations Supervisor.

### Screen Composition

| Region | Contents |
|---|---|
| Header | Booking ID, container/equipment, journey status, bookingRevision |
| Timeline | Expected, planned, estimated, actual events |
| Movement form | Event type, location, occurred time, received time, empty/laden, source |
| Right rail | Status derivation, duplicate/late/out-of-order flags, `containermovement.status` publication |

### Required Interactions

- Create journey from `booking.confirmed`.
- Derive expected moves from route and equipment facts.
- Capture movement manually/API-backed in first release.
- Validate DCSA v2.2-aligned movement fields.
- Quarantine invalid movement facts.
- Publish `containermovement.status`.
- Show "CMM reports movement; Booking decides D&D relevance" near D&D-related movement evidence.

### Screen States

- Empty journey: confirmed booking exists, no movements captured.
- Validation error: field-level and event-row error display.
- Duplicate: duplicate linked to original event.
- Late event: accepted with timeline warning.
- Out-of-order: recalculated status or exception depending on safety.
- Published: event status and schema compatibility visible.

## Workspace 5 - D&D Outcome And Exception Handling

### Primary Users

Lina Operations Supervisor, Ben Booking Coordinator, Priya Commercial Manager.

### Screen Composition

| Region | Contents |
|---|---|
| Header | Booking, container, D&D type, trigger status, result status |
| Left panel | Booking trigger evidence from `containermovement.status` |
| Center panel | Charge D&D result with free time, chargeable days, rate, total, rule ID |
| Right rail | Manual review, audit trail, correlationId, request/result IDs |

### Required Interactions

- Booking detects D&D boundary and sends `pricing.dnd-request`.
- Charge returns `pricing.dnd-result`.
- UI shows ownership split: Booking trigger evidence and Charge calculation evidence.
- Manual review opens for timeout, missing rule, conflict, or rejected result.
- Accepting a result stores D&D charge on Booking without calculating it in Booking.

### Business Guardrail

The screen must never imply that CMM decides D&D relevance or that Booking calculates free time/rates. Labels and audit rail must make the ownership split visible.

## Workspace 6 - Platform Administration

### Primary Users

Sara Platform Administrator, Quinn Quality And Compliance Reviewer.

### Screen Composition

| Region | Contents |
|---|---|
| Tabs | Reference Data, Users, Roles, Capabilities, Contracts, Event Health, Seeds |
| Main table | Domain-specific records with validity and status |
| Right rail | Change audit, outbox state, schema compatibility, dependent modules |

### Required Interactions

- Manage reference records and versions.
- Manage user role/capability assignments.
- View denied access audit records.
- Validate seed data and contract catalog.
- Expose event lag and Schema Registry compatibility.

## Workspace 7 - Operations And Observability

### Primary Users

Dev Delivery Engineer, Lina Operations Supervisor, Quinn Quality And Compliance Reviewer.

### Screen Composition

| Region | Contents |
|---|---|
| Runtime health | PostgreSQL, Kafka, Schema Registry, Keycloak, services, frontends, reverse proxy |
| E2E evidence | Flow 1 to Flow 5 pass/fail state |
| Observability | Logs, traces, metrics, dashboards, alerts |
| Contracts | OpenAPI, Avro, AsyncAPI, Pact, message-pact, compatibility |
| Runbooks | Setup, reset, migrations, seed, logs, health, tests, incidents |

### Required Interactions

- Start from local runtime proof, not production cloud assumptions.
- Show `docker compose --profile full up -d --build` readiness as health plus E2E proof.
- Show degraded service impact by affected module and flow.
- Link failed flow to logs/traces and runbook action.

## Route Map

| Route | Workspace | Primary stories |
|---|---|---|
| `/` | Enterprise Work Queue | US-UI-005, US-RUN-005 |
| `/pricing/agreements` | Pricing And Agreement | US-CHG-001 to US-CHG-006, US-UI-003 |
| `/booking/new` | Booking Creation | US-BKG-001 to US-BKG-005, US-UI-002 |
| `/booking/[id]` | Booking Detail/Amendment | US-BKG-006 to US-BKG-008 |
| `/movement/journeys/[id]` | Journey And Movement | US-CMM-001 to US-CMM-006, US-UI-004 |
| `/dnd/[bookingId]` | D&D Outcome | US-CHG-006, US-BKG-008 |
| `/platform/reference-data` | Platform Administration | US-SP-001 to US-SP-006 |
| `/operations` | Operations And Observability | US-RUN-001 to US-RUN-006 |

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Desktop 1280px+ | Left rail, main workspace, and right evidence rail all visible |
| Tablet 768px-1279px | Evidence rail becomes drawer; tables keep high-priority columns |
| Mobile 390px-767px | Search, triage, approvals, read-only status, exception assignment; complex tariff/rule editing prompts desktop |

## Traceability

| Source | Refined mockup coverage |
|---|---|
| `wireframes.md` | Preserves seven rough workspaces and ownership guardrails |
| `user-flow.md` | Maps Flow 1 through Flow 5 to workspaces and states |
| `stories.md` | Maps stories to routes, personas, and workspace interactions |
| `requirements.md` | Maps FR/NFR groups to UI, runtime, contract, and security behaviors |
| `team-practices.md` | Preserves enterprise walking skeleton, tests-as-evidence, and Graphify honesty |

## Review

Verdict: READY

Product Lead review was completed inline after the declared reviewer subagent failed because its configured model is not supported for this Codex account. The refined mockups preserve the Claude UI visual direction where compatible, replace prototype logic with real business behavior, keep module ownership boundaries explicit, include interaction/state/accessibility details, and provide enough route and component direction for Application Design.

Findings:

- No blocking mockup gaps were found for this stage.
- The design correctly avoids reducing the enterprise target to Shared Platform or UI-only work.
- The D&D and movement screens make ownership boundaries visible: Booking triggers D&D, Charge calculates D&D, and CMM reports movements.
- Application Design must still decide the concrete frontend app topology, API/BFF shape, schema contracts, and implementation-level component boundaries.
- Raw Claude UI HTML/screenshots remain direct design inputs, not semantically Graphify-indexed exact source nodes.
