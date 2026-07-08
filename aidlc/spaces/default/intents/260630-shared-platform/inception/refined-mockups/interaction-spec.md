# Interaction Specification - Shared Platform MVP

## Source Trace

This interaction specification refines `wireframes.md` and `user-flow.md` using `stories.md`, `requirements.md`, `team-practices.md`, and `refined-mockups-questions.md`. It follows the component specification template from `.codex/knowledge/aidlc-design-agent/component-spec-template.md`.

## Auth Action Panel

| Field | Value |
|---|---|
| Component | AuthActionPanel |
| Description | Shared sign-in, sign-out, access-denied, and request-access action surface. |
| Category | feedback / navigation |

### States

| State | Description | Trigger |
|---|---|---|
| default | Shows SSO entry action. | Unauthenticated user opens app. |
| loading | Shows redirect or callback progress. | OIDC operation starts. |
| authenticated | Shows session summary and sign-out action. | Valid session exists. |
| denied | Shows access-denied message and request-access action. | Authorization API denies access. |
| error | Shows retry and support path. | Auth flow fails. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| session | object | no | null | Current authenticated user/session summary. |
| authState | string | yes | default | default, loading, authenticated, denied, error. |
| correlationId | string | no | - | Troubleshooting id for denied/error states. |
| onSignIn | function | yes | - | Starts Keycloak OIDC flow. |
| onSignOut | function | yes | - | Clears app session and invokes logout. |
| onRequestAccess | function | no | - | Starts request-access path. |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Full-width panel, actions stacked. |
| tablet (768-1024px) | Centered panel with readable max width. |
| desktop (>1024px) | Centered panel inside auth shell. |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native buttons and links; status region uses `aria-live="polite"`. |
| Keyboard interaction | Tab to actions, Enter/Space to activate. |
| Label / aria-label | Visible labels for actions; correlation id copy action has accessible name. |
| Contrast ratio | WCAG AA. |
| Screen reader | Auth status and errors announced politely. |
| Focus management | Callback/error states focus the h1 or status message. |

## Reference Workspace Shell

| Field | Value |
|---|---|
| Component | ReferenceWorkspaceShell |
| Description | Main `apps/reference-data` shell with header, reference-set navigation, main workspace, and status aside. |
| Category | layout / navigation |

### States

| State | Description | Trigger |
|---|---|---|
| default | Header, side nav, main region, aside visible. | Desktop load. |
| collapsed | Navigation collapsed behind menu. | Tablet or mobile breakpoint. |
| read-only | Mutating actions disabled or hidden. | User lacks write permission. |
| error | Shell remains available while main region shows error. | Data load failure. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| selectedSet | string | yes | Party/Customer | Current reference set. |
| permissions | object | yes | - | Read/write/admin capabilities. |
| environment | string | yes | local | Environment label. |
| navigationItems | array | yes | nine sets | Reference-set navigation entries. |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Menu button plus set selector; read-only lookup flow. |
| tablet (768-1024px) | Collapsible side nav; status aside moves below main content. |
| desktop (>1024px) | Persistent side nav and right status aside. |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `header`, `nav`, `main`, `aside`. |
| Keyboard interaction | Logical Tab order: skip link, header, nav, toolbar, table, detail, aside. |
| Label / aria-label | Navigation labelled "Reference sets". |
| Contrast ratio | WCAG AA. |
| Screen reader | Active reference set announced via page h1. |
| Focus management | Route changes focus h1. |

## Reference Data Table

| Field | Value |
|---|---|
| Component | ReferenceDataTable |
| Description | Paginated searchable list for a selected reference set. |
| Category | display / input |

### States

| State | Description | Trigger |
|---|---|---|
| loading | Skeleton rows, disabled table actions. | Query pending. |
| empty | Empty state and Add record if permitted. | No records returned. |
| populated | Rows, pagination, sorting, selected row. | Query success. |
| error | Retry message while preserving filters. | Query failure. |
| read-only | Row actions limited to view/copy. | Missing write permission. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| rows | array | yes | [] | Reference records. |
| columns | array | yes | - | Code, name, status, updated, event status. |
| filters | object | no | {} | Search and status filters. |
| pagination | object | yes | - | Page size and current page. |
| onRowSelect | function | yes | - | Opens detail. |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Converts rows to result cards with key fields. |
| tablet (768-1024px) | Reduced visible columns with details on expansion. |
| desktop (>1024px) | Full table. |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native table with caption and column headers. |
| Keyboard interaction | Row selection available through Enter; pagination buttons keyboard operable. |
| Label / aria-label | Search/filter controls labelled visibly. |
| Contrast ratio | WCAG AA. |
| Screen reader | Result counts announced after filter changes. |
| Focus management | Filter submit returns focus to result summary. |

## Reference Form

| Field | Value |
|---|---|
| Component | ReferenceForm |
| Description | Full-page create/edit form for one reference set. |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| draft | Unsaved edits are present. | User changes form fields. |
| validating | Validation request pending. | Validate or publish selected. |
| invalid | Field and summary errors shown. | Validation failure. |
| valid | Publish action enabled. | Validation passes. |
| publishing | Save and publish in progress. | Publish selected. |
| published | Success state and event preview. | Commit and outbox success. |
| denied | Mutating controls blocked. | User lacks permission. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| referenceSet | string | yes | - | Current set type. |
| record | object | no | null | Existing record for edit. |
| validationSchema | object | yes | - | Zod/RHF validation mapping. |
| permissions | object | yes | - | Create/update/deactivate/publish permission flags. |
| eventPreview | object | no | null | Event type and envelope preview. |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Read-only by default; edit route hidden unless later approved. |
| tablet (768-1024px) | Single-column form; aside moves below fields. |
| desktop (>1024px) | Two-column layout with right validation/event aside. |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native form and fieldsets where sections apply. |
| Keyboard interaction | Tab through fields and actions; Escape closes confirmation dialog only. |
| Label / aria-label | Every input has visible label and error association. |
| Contrast ratio | WCAG AA. |
| Screen reader | Error summary announced and links to invalid fields. |
| Focus management | Validation failure focuses error summary; publish success focuses success message. |

## Event Status Panel

| Field | Value |
|---|---|
| Component | EventStatusPanel |
| Description | Shows outbox/publication/freshness status for a reference change. |
| Category | feedback / display |

### States

| State | Description | Trigger |
|---|---|---|
| pending | Outbox waiting or retry scheduled. | Event not published yet. |
| published | Event id and timestamps available. | Publish success. |
| failed | Failure reason and escalation path shown. | Publish failure. |
| stale | Freshness warning shown. | Freshness target breached. |
| unavailable | Status cannot be loaded. | Status API failure. |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Status region with `aria-live="polite"`. |
| Keyboard interaction | Copy buttons keyboard operable. |
| Label / aria-label | Copy event id and copy correlation id actions have explicit labels. |
| Contrast ratio | WCAG AA; status not color-only. |
| Screen reader | Status changes announced. |
| Focus management | Failed state exposes first recovery action after summary. |

## Contract Viewer

| Field | Value |
|---|---|
| Component | ContractViewer |
| Description | Read-only developer/consumer view for OpenAPI contracts, identity authorization API details, Avro events, examples, and compatibility status. |
| Category | display / navigation |

### States

| State | Description | Trigger |
|---|---|---|
| loading | Contract metadata loading. | Route load. |
| available | Contract tabs and examples shown. | Metadata loaded. |
| incompatible | Compatibility issue visible. | CI/schema status fails. |
| unavailable | Contract source cannot be loaded. | API or artifact failure. |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Tabs use standard tablist/tabpanel pattern or native equivalent. |
| Keyboard interaction | Arrow keys move between tabs; Tab enters active panel. |
| Label / aria-label | Tabs visibly labelled OpenAPI, Authorization API, Avro events, Compatibility, Examples. |
| Contrast ratio | WCAG AA. |
| Screen reader | Active tab and compatibility status announced. |
| Focus management | Route load focuses h1; tab changes keep focus on active tab. |

## Confirmation Dialog

| Field | Value |
|---|---|
| Component | ConfirmationDialog |
| Description | Confirms publish, deactivate, reactivate, and sign-out actions. |
| Category | feedback / input |

### States

| State | Description | Trigger |
|---|---|---|
| open | Dialog visible and focus trapped. | Sensitive action selected. |
| submitting | Confirm action in progress. | Confirm selected. |
| error | Dialog remains with error message. | Action fails. |
| closed | Focus returns to trigger. | Cancel, Escape, or success. |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `dialog` with accessible title and description. |
| Keyboard interaction | Escape closes unless critical non-dismissible flow; Enter/Space activate buttons. |
| Label / aria-label | Dialog title describes action and affected record. |
| Contrast ratio | WCAG AA. |
| Screen reader | Dialog title and consequence are announced on open. |
| Focus management | Initial focus on safe action for destructive changes; return focus to trigger on close. |

## Interaction Guardrails

- Use full-page forms for complex reference create/edit workflows; avoid modal-heavy editing.
- Use inline validation plus an error summary.
- Express event status with text and icon, never color alone.
- Preserve user drafts after validation or network failures.
- Do not add downstream module runtime screens.
