# Design System Mapping - Shared Platform MVP

## Source Trace

This mapping is based on `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, `team-practices.md`, and `refined-mockups-questions.md`. It assumes Enterprise Technical Environment v1.1 and the `@erp/ui` atomic-design component library. No separate LinerCore brand system is introduced in this stage.

## Component Mapping

| UX element | Preferred `@erp/ui` component class | Notes |
|---|---|---|
| App header | AppShell/Header | Product name, environment badge, user menu. |
| Side navigation | Navigation/SideNav | Persistent desktop nav, collapsible tablet/mobile nav. |
| Mobile menu | Navigation/MenuButton/Drawer | Exposes `aria-expanded`; includes reference-set selector. |
| Page title and sections | Typography/Heading, Layout/Section | One h1 per route, h2 for form sections. |
| Search | Form/Input, Button | Debounce only if it does not hide validation; submit remains explicit. |
| Filters | Form/Select, Form/Checkbox, SegmentedControl | Active/inactive status and set-specific filters. |
| Reference table | DataDisplay/Table, Pagination | Caption, column headers, stable pagination. |
| Mobile result cards | DataDisplay/Card/ListItem | Read-only lookup cards; no nested card layout. |
| Detail panel | Layout/Panel or PageSection | Shows identifiers, metadata, relationships, event status. |
| Form fields | Form/Input, Select, Textarea, FieldError | React Hook Form and Zod validation mapping. |
| Validation summary | Feedback/Alert, FieldErrorList | Text errors with links to fields. |
| Confirmation | Overlay/Dialog | Publish/deactivate/reactivate/sign-out confirmation. |
| Toast/status | Feedback/Toast, StatusBadge | Must not be the only record of an important result. |
| Event status | StatusBadge, DescriptionList, Timeline/Table | Pending, published, failed, stale. |
| Contract tabs | Tabs, CodeBlock, DescriptionList | OpenAPI, Avro events, compatibility, examples. |
| Copy actions | IconButton/Button | Accessible label for event id and correlation id copy. |

## Route Mapping

| Route | Primary components | Story trace |
|---|---|---|
| `apps/auth/signin` | AuthActionPanel, Button, Alert | US-001 |
| `apps/auth/callback` | AuthActionPanel loading/status | US-001 |
| `apps/auth/access-denied` | AuthActionPanel denied, RequestAccess action | US-003 |
| `apps/auth/signout` | ConfirmationDialog, AuthActionPanel | US-002 |
| `apps/reference-data` | ReferenceWorkspaceShell, Set overview | US-005 |
| `apps/reference-data/sets/[set]` | ReferenceDataTable, filters, detail panel | US-005, US-006 |
| `apps/reference-data/sets/[set]/new` | ReferenceForm, EventStatusPanel preview | US-007, US-010 |
| `apps/reference-data/sets/[set]/[id]` | ReferenceForm or read-only detail, history | US-006, US-008, US-009, US-011 |
| `apps/reference-data/events/[eventId]` | EventStatusPanel, change history | US-011, US-019, US-020 |
| `apps/reference-data/contracts` | ContractViewer | US-016, US-017, US-018 |

## Token and Layout Mapping

| Concern | Mapping |
|---|---|
| Color | Use platform semantic tokens for surface, text, border, focus, success, warning, danger, and info. |
| Typography | Use existing type scale; no viewport-scaled font sizing. |
| Spacing | Use platform spacing scale; dense operational layout with clear grouping. |
| Focus | Use platform focus ring token with at least 3:1 contrast against adjacent colors. |
| Radius | Follow `@erp/ui` defaults; avoid oversized marketing-style cards. |
| Tables | Stable row height, persistent headers, no layout shift on hover/focus. |
| Forms | Field labels always visible; helper/error text reserves space where practical. |
| Status | Text plus icon/status badge; never color-only. |

## Responsive Mapping

| Breakpoint | App shell | Workspace | Forms | Contract viewer |
|---|---|---|---|---|
| Mobile <768px | Header + menu drawer | Read-only lookup cards | Editing hidden/deferred by default | Tabs stack or horizontal scroll with accessible labels |
| Tablet 768-1024px | Collapsible side nav | Reduced table columns, detail below | Single-column form, aside below | Tabs with full-width panels |
| Desktop >1024px | Persistent side nav | Full table plus right aside | Two-column form with sticky actions | Full tabbed layout |

## Frontend Implementation Constraints

- Use Next.js App Router only.
- Use TypeScript strict mode.
- Use Tailwind through approved project configuration.
- Use React Hook Form with Zod for forms and validation.
- Use TanStack Query for server state and cache invalidation.
- Use Zustand only for appropriate local UI state.
- Use Axios through `@erp/api-core`.
- Use approved `@erp/ui` components before adding custom components.
- Do not introduce prohibited frontend libraries or package managers.

## Out of Scope

- New brand identity work.
- Charge, Booking, or Container Movement runtime UI.
- Customer-facing shipper/BCO identity.
- Mobile create/edit parity.
- Spreadsheet-style bulk maintenance.
