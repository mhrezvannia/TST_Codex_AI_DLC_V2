# Refined Mockups - Shared Platform MVP

## Source Trace

These refined mockups evolve `wireframes.md` and `user-flow.md` using the approved `stories.md`, `requirements.md`, `team-practices.md`, and `refined-mockups-questions.md`. They cover only `apps/auth`, `apps/reference-data`, and Shared Platform API/event contract views. Charge, Booking, and Container Movement remain future consumers and are not represented as runtime screens.

## Design Direction

- Product shape: quiet operational admin workspace for repeated reference-data maintenance.
- Technology basis: Enterprise Technical Environment v1.1, Next.js App Router, `@erp/ui`, `@erp/api-core`, Tailwind, TypeScript strict mode.
- Visual basis: use existing `@erp/ui` atomic components and platform tokens; do not introduce a separate LinerCore brand system in this stage.
- Accessibility target: WCAG 2.1 AA.
- Responsive policy: desktop-first administration, tablet adaptive layout, mobile read-only/reference lookup by default.

## Screen Group A - Shared Auth

Story trace: US-001, US-002, US-003, US-004, FR-041 through FR-046.

### A1 Sign In

```text
Header
  LinerCore Shared Platform        Environment badge

Main
  h1 Sign in
  Supporting text: Use enterprise single sign-on.
  Primary action: Continue with SSO
  Secondary link: Need access?
  Status region: authentication messages

Footer
  Support | Privacy | Build/version
```

States:

| State | Behavior |
|---|---|
| Default | SSO action enabled, support link visible, no session data shown. |
| Loading | Primary action disabled, inline status says redirecting to SSO. |
| Auth error | Plain-language message, retry action, support path. |
| Already signed in | Redirect to authorized landing route or session summary. |

### A2 Access Denied and Request Access

```text
Header
  LinerCore Shared Platform

Main
  h1 Access denied
  Summary: You are signed in but do not have access to this area.
  Details: current user, requested app, correlation id
  Actions: Request access | Sign out | Back to safe page
```

States:

| State | Behavior |
|---|---|
| Missing role | Show request-access action and current role summary where safe. |
| Request submitted | Show confirmation and next step text. |
| Request failure | Show recoverable error and support path. |

## Screen Group B - Reference Data Workspace

Story trace: US-005, US-006, US-011, US-012, FR-035 through FR-040.

### B1 Desktop Workspace

```text
App header
  Product name | Environment | User menu

Left nav
  Party / Customer
  Location / Port
  Region
  Voyage
  Currency
  Charge Code
  Equipment Type
  Commodity
  Trade Lane

Main
  Breadcrumb: Reference Data > [Set]
  h1 [Reference set]
  Toolbar: Search | Status filter | Add record
  Data table: Code | Name | Status | Updated | Event status
  Detail panel or linked detail page

Right aside
  Validation summary
  Recent event status
  Freshness target
```

States:

| State | Behavior |
|---|---|
| Loading | Table skeleton, toolbar disabled except navigation. |
| Empty | Explain the selected reference set and show Add record if permitted. |
| Populated | Table rows with stable pagination, sorting, and selected-row detail. |
| Read only | Add/Edit/Deactivate hidden or disabled with visible reason. |
| Network error | Retain shell and show retry in main region. |
| Freshness warning | Status aside shows stale or delayed event signal. |

### B2 Tablet Adaptive Workspace

```text
Header
  Menu | Reference Data | User menu

Main
  Set selector
  Search and filters
  List table with reduced columns
  Detail expands below selected row
```

Behavior:

- Side navigation collapses behind a menu.
- Secondary event and validation panels move below details.
- Table shows key columns first: Code, Name, Status, Event status.

### B3 Mobile Read-Only Lookup

```text
Header
  Menu | Reference Data | User

Main
  h1 Reference lookup
  Reference set selector
  Search input
  Result cards
  Selected detail
  Actions: Copy ID | View event status
```

Behavior:

- Mobile defaults to read-only lookup.
- Editing and publication controls are not shown unless later requirements approve mobile editing.
- Touch targets meet minimum size and keyboard navigation remains available.

## Screen Group C - Reference Record Create/Edit

Story trace: US-007, US-008, US-009, US-010, US-011, FR-014 through FR-027.

### C1 Full-Page Create/Edit Form

```text
Breadcrumb
  Reference Data > [Set] > New/Edit

Main
  h1 New/Edit [reference set]
  Section: Identity
  Section: Classification and relationships
  Section: Status
  Section: Notes and provenance

Sticky action bar
  Save draft | Validate | Publish change | Cancel

Right aside
  Required fields
  Validation errors
  Event preview
```

Pattern decisions:

- Create/edit is a page, not a modal, because reference records can have relationship validation and audit-sensitive actions.
- Publish and deactivate use confirmation dialogs.
- Field validation is inline and text-based.
- Draft values are preserved after validation failure.

### C2 Relationship-Specific Details

| Reference set | Refined behavior |
|---|---|
| Location / Port | Country is required before Port save; no orphan Port; re-parenting blocked in MVP. |
| Region | Flat grouping only; no hierarchy controls. |
| Trade Lane | Origin Region and Destination Region selectors with inactive-region validation. |
| Party / Customer | PII-sensitive fields show classification and access notice. |
| Voyage | Manual voyage fields only; no external schedule-feed controls. |

## Screen Group D - Event and Sync Status

Story trace: US-011, US-016, US-019, US-020, FR-021 through FR-027.

```text
Header
  Event and Sync Status

Main
  h1 Event status for [record]
  Change history table
    Time | Actor | Operation | Event ID | Status
  Event detail
    Event type
    Entity ID
    Correlation ID
    Schema version
    Published time
    Freshness target

Actions
  Recheck status | Copy event ID | Copy correlation ID
```

States:

| State | Behavior |
|---|---|
| Pending | Show outbox pending status and next retry time if available. |
| Published | Show event id, schema version, and published timestamp. |
| Failed | Show failure reason, retry status, and operator escalation path. |
| Stale | Show freshness warning against the p95 60 second target. |

## Screen Group E - Contract and Developer Experience

Story trace: US-016, US-017, US-018, US-022, FR-020, FR-047, FR-048.

```text
Main
  h1 Shared Platform contracts
Tabs:
    OpenAPI
    Authorization API
    Avro events
    Compatibility
    Examples

OpenAPI tab
  Endpoint list
  Contract version
  Download/view action
  Provider check status

Authorization API tab
  identity-service authorization endpoints
  Role and permission decision examples
  Access-denied response shape
  Audit/correlation id expectations

Avro events tab
  referencedata.<entity>.changed list
  Envelope fields
  Schema version
  Compatibility status

Examples tab
  Request/response example
  Event payload example
  Correlation id propagation note
```

Guardrail:

- These are Shared Platform contract views for future consumers. They do not add Charge, Booking, or Container Movement runtime screens or implementation stories.

## Story Coverage

| Screen group | Stories covered |
|---|---|
| Shared Auth | US-001, US-002, US-003, US-004 |
| Reference Workspace | US-005, US-006, US-011, US-012 |
| Create/Edit | US-007, US-008, US-009, US-010 |
| Authorization/Audit | US-012, US-013, US-014, US-015 |
| Event/Sync | US-016, US-019, US-020 |
| Contract DX | US-017, US-018, US-022 |
| Delivery guardrail | US-021, US-023 via implementation and delivery artifacts rather than end-user screens |

## Review

Verdict: READY

Fallback product-lead review found no blocking product-readiness issues. The refined mockups answer all seven questions, refine the rough wireframes and user flow, cover story and requirement expectations, map to Enterprise Technical Environment v1.1 and `@erp/ui`, include WCAG 2.1 AA coverage, and keep API/event developer experience contract-only without adding Charge, Booking, or Container Movement runtime screens.
