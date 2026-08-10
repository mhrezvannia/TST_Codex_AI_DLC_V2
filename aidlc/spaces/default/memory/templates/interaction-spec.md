<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces product-grade UX, not a workbench. -->

# Interaction Spec — <feature / screen>

## Navigation & Shell Context

<Where this lives in the app shell: which nav entry, breadcrumb path, and how the user arrives here. Assumes a single authenticated shell with global nav — NOT a standalone workbench page. State the auth/session requirement (real session, no hardcoded user).>

## Screens & Routes

<Every route this feature adds. For each entity there MUST be a list route and a detail route (`/<entity>` and `/<entity>/[id]`). Name them explicitly.>

| Route | Type | Purpose |
| --- | --- | --- |
| `/<entity>` | List | filter/search/sort/paginate, row actions |
| `/<entity>/[id]` | Detail (master-detail) | header, timeline, tabbed sections, action rail |

## List Page Spec

<Columns, filters, search, sort, pagination, empty state, row-level actions, bulk actions if any.>

## Detail Page Spec

<Master-detail layout: header/summary, lifecycle timeline, tabbed sections (map each to a real domain relationship — e.g. Routing, Equipment, Charges, Journey, History), and the right-hand action rail with the state-machine actions. Cross-links to related records in other modules.>

## States

<Define every data-surface state: loading (skeleton), empty, error, no-permission, success. No screen may show only a raw status string.>

## Design System Usage

<List the @erp/ui primitives and tokens used (Button, Input, Combobox for reference lookups, Table, Badge, Tabs, Drawer, Toast, EmptyState, Skeleton). NO local inline `styles` objects, NO hardcoded hex — colors/space/type come from tokens. Note any new primitive this feature needs added to @erp/ui.>

## Domain-True Forms

<Confirm the forms can capture the real entity (e.g. routing builder with UN/LOCODE comboboxes, equipment lines with type×quantity, commodity, reefer/DG) — reference-data fields use live lookups, not free text.>

## Accessibility & Responsiveness

<WCAG AA commitments: contrast, keyboard paths, focus management, labels, aria. Responsive breakpoints. Reference inception/refined-mockups/accessibility-checklist.md.>

## Open Questions

1. Confirm the detail-page tab set for this entity.
   - A. Summary · Routing · Equipment · Charges · Journey · History (recommended for Booking)
   - B. A reduced set (list it)
   - X. Other
   - `[Answer]:`
