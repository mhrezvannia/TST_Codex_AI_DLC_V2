# Interaction Specification - Shared Platform Local Functionality

## Context

This interaction specification consumes `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. It defines the behavior expected from Shared Platform UI components before implementation begins.

## Primary Workflow

1. User signs in through Keycloak or an explicitly local bypass.
2. Reference Data workbench loads session and authorization state through BFF routes.
3. Workbench fetches reference sets, record list, and selected detail from backend-backed BFF routes.
4. Authorized user creates, edits, or deactivates a record.
5. BFF validates session and permission, then calls backend services.
6. Backend persists the change, writes history, creates outbox status, and returns correlation id.
7. UI refreshes list, detail, history, and publication status.
8. Seed, contract, and readiness surfaces expose supporting evidence for downstream module readiness.

## Component - Permission Banner

| Field | Value |
| --- | --- |
| Component | PermissionBanner |
| Description | Shows current write/read state, denial reason, and correlation id. |
| Category | feedback |

### States

| State | Description | Trigger |
| --- | --- | --- |
| loading | Permission request pending. | Workbench load. |
| writable | User can create/edit/deactivate. | Identity authorization allow. |
| read-only | User can inspect but cannot mutate. | Identity authorization deny for write. |
| denied | User cannot read the module. | Identity authorization deny for read. |
| error | Permission service unavailable. | BFF or identity-service failure. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| mode | string | yes | none | loading, writable, read-only, denied, or error. |
| reason | string | no | none | Human-readable denial or failure reason. |
| correlationId | string | yes | generated | Correlation id for support and logs. |
| requestAccessHref | string | no | none | Optional access-request target. |

### Responsive Behaviour

| Breakpoint | Behaviour |
| --- | --- |
| mobile below 768px | Full-width alert above filters. |
| tablet 768px to 1024px | Full-width alert inside workbench header. |
| desktop above 1024px | Compact status chip with expandable details. |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| ARIA role | `status` for normal changes, `alert` for denied/error. |
| Keyboard interaction | Request-access link is keyboard reachable. |
| Label | Visible text names permission state. |
| Contrast ratio | WCAG AA. |
| Screen reader | Announces state and denial reason. |
| Focus management | On denied read, focus moves to access-denied heading. |

## Component - Reference Set Navigator

| Field | Value |
| --- | --- |
| Component | ReferenceSetNavigator |
| Description | Lets users switch among the nine MVP reference sets. |
| Category | navigation |

### States

| State | Description | Trigger |
| --- | --- | --- |
| loading | Sets loading from backend. | Initial request. |
| default | Sets available. | Successful load. |
| selected | Current set selected. | User selection. |
| empty | No sets returned. | Backend returns empty list. |
| error | Sets cannot load. | BFF/backend failure. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sets | object[] | yes | empty array | Set code, display name, active count. |
| selectedSetId | string | yes | first set | Current reference set. |
| onSelect | function | yes | none | Loads records for the selected set. |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| ARIA role | `navigation` with labelled list. |
| Keyboard interaction | Arrow keys or Tab plus Enter selection. |
| Label | `Reference sets`. |
| Screen reader | Announces selected set and record count. |
| Focus management | Selection preserves focus on selected item. |

## Component - Records Table

| Field | Value |
| --- | --- |
| Component | RecordsTable |
| Description | Lists backend-backed reference records with search, paging, inactive filter, and row selection. |
| Category | display |

### States

| State | Description | Trigger |
| --- | --- | --- |
| loading | Query in progress. | Search/filter/page/set change. |
| empty | No matching records. | Backend returns no records. |
| default | Records available. | Successful query. |
| selected | Row detail loaded or loading. | Row activation. |
| error | Query failed. | BFF/backend error. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| records | object[] | yes | empty array | Paged reference records. |
| search | string | no | empty | Current search term. |
| includeInactive | boolean | yes | false | Includes inactive records. |
| page | number | yes | 1 | Current page. |
| onSelect | function | yes | none | Loads selected detail. |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| ARIA role | Native table with caption and column headers. |
| Keyboard interaction | Tab to row actions, Enter opens detail. |
| Label | Visible caption includes selected reference set. |
| Screen reader | Announces result count and selected row. |
| Focus management | After search, focus remains on search input. |

## Component - Mutation Drawer

| Field | Value |
| --- | --- |
| Component | MutationDrawer |
| Description | Create/edit form for reference records with backend validation and stale-version handling. |
| Category | input |

### States

| State | Description | Trigger |
| --- | --- | --- |
| create | New record form. | Create action. |
| edit | Existing record form. | Edit action. |
| saving | Mutation in progress. | Submit. |
| validation-error | Field errors returned. | Backend validation failure. |
| stale-version | Optimistic version conflict. | Backend conflict response. |
| success | Save persisted. | Backend success. |

### Props / Inputs

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| mode | string | yes | create | create or edit. |
| record | object | no | empty | Current record when editing. |
| schema | object | yes | none | Field metadata and immutable flags. |
| permission | object | yes | none | Write permission state. |
| onSubmit | function | yes | none | Calls BFF mutation route. |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| ARIA role | `dialog` with `aria-labelledby`. |
| Keyboard interaction | Tab cycle, Escape asks about unsaved draft, Enter does not bypass validation. |
| Label | Every field has visible label. |
| Screen reader | Validation summary announced as alert. |
| Focus management | Open focuses first editable field; errors focus first invalid field; close returns focus to triggering action. |

## Component - Deactivate Dialog

| Field | Value |
| --- | --- |
| Component | DeactivateDialog |
| Description | Confirms reference record deactivation and captures required audit reason. |
| Category | input |

### States

| State | Description | Trigger |
| --- | --- | --- |
| default | Reason input empty. | Dialog opens. |
| ready | Reason entered. | Input change. |
| submitting | Deactivate request in progress. | Submit. |
| error | Deactivation failed. | Backend/BFF failure. |
| success | Deactivation persisted. | Backend success. |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| ARIA role | `dialog`. |
| Keyboard interaction | Focus trapped; Escape closes only with no unsaved reason or after confirmation. |
| Label | Heading names the destructive operation and target record. |
| Screen reader | Impact text and required reason are announced. |
| Focus management | On close, focus returns to Deactivate button. |

## Component - Publication Status Panel

| Field | Value |
| --- | --- |
| Component | PublicationStatusPanel |
| Description | Shows outbox/event state for selected record and exposes retry where allowed. |
| Category | feedback |

### States

| State | Description | Trigger |
| --- | --- | --- |
| pending | Event enqueued but not published. | Mutation success. |
| published | Event published successfully. | Publisher success. |
| retrying | Publication is retrying. | Recoverable failure. |
| failed | Publication failed. | Exhausted or unrecoverable failure. |
| unavailable | Outbox status cannot load. | Backend failure. |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| ARIA role | `region` labelled `Publication status`. |
| Keyboard interaction | Retry action reachable when rendered. |
| Label | Status text is explicit and not color-only. |
| Screen reader | Announces status changes after mutation. |
| Focus management | Retry failure keeps focus on retry button and announces error. |

## Error and Recovery Rules

| Error | UI behavior | Trace |
| --- | --- | --- |
| Missing session | Redirect or sign-in prompt with return path. | US-005, FR-011 |
| Missing write permission | Disable write actions and show reason/correlation id. | US-006, FR-020 |
| Backend down | Show service-down state, no fixture fallback success. | US-007, NFR-003 |
| Validation failure | Preserve draft and show field errors. | US-008, FR-017 |
| Stale version | Show conflict and reload option. | US-009, FR-018 |
| Publication failure | Show failed/retrying status and retry option if authorized. | US-012, FR-027 |
| Seed partial failure | Show row-level failures and applied/skipped counts. | US-011, FR-023 |

## Review

Verdict: READY

Inline fallback review finds the interaction specification consistent with `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. It gives the later implementation stages concrete behavior for permissions, BFF/backend integration, validation, persistence evidence, event status, and accessibility.

