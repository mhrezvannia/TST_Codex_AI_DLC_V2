$ui-ux-pro-max

Act as a principal enterprise UX designer with expertise in master-data
governance, shipping reference data, event publication, auditability, and
high-density ERP workbenches. This is an AI-DLC inception design task for
LinerCore. Do not edit production code in this turn.

Inspect `http://127.0.0.1/reference-data/`, the current
`ReferenceDataWorkbench`, permission API, reference-set and record APIs,
contract-catalog content, create/edit behavior, and running demo. Redesign it as
a high-efficiency workbench for reference-data stewards.

LinerCore is an enterprise ERP for an ocean shipping company. Reference data
feeds Booking, Charge Agreements, Container Movement, and other modules.
Changes must be canonical, permission-controlled, auditable, and visibly
published.

Existing capabilities:

- Switch among reference sets.
- Inspect canonical records.
- See code, display name, lifecycle status, and event-publication status.
- Inspect record ID, business key, classification, relationships, and updated-by
  audit data.
- Create and edit records when write permission is granted.
- Show read-only permission and request access.
- Inspect contract compatibility and contract findings.
- Use fallback records when the live service is unavailable.

Use realistic sets:

- Currency.
- Location and UN/LOCODE.
- Party Customer.
- Vessel and Voyage.
- Equipment Type.
- Charge Code.

Design a three-region desktop workspace:

1. Compact reference-set navigation with search and counts.
2. Dominant canonical-record table.
3. Resizable detail panel or drawer for the selected record.

On smaller screens, use a full-screen record drill-in rather than crushing three
columns together. Provide search, status filters, sorting, pagination, sticky
table header, row focus/selection, active/inactive counts, and a clear `Create`
command.

Separate business record governance from technical contract governance. Use
stable tabs or secondary navigation such as `Records` and `Contracts`; do not
place a grid of contract cards permanently beneath every record table.

The record create/edit workflow must include:

- Canonical code.
- Display name.
- Lifecycle status where editable.
- Reason for change.
- Set-specific fields and validation.
- Unsaved-change protection.
- Version/conflict handling.
- Publication progress and result.
- Success confirmation and audit metadata.

Mark sensitive sets clearly without making every record alarming. Disable
actions with a reason when the user is read-only. Avoid free-text values when a
canonical relationship exists.

Use the shared LinerCore ERP system: persistent module navigation, compact top
bar and breadcrumbs, light neutral surfaces, near-black text, restrained
maritime blue, semantic green/amber/red, Source Sans 3 or Inter, tabular
numerals, Lucide icons, 4-8px radii, subtle borders, stable table dimensions,
and no gradients, hero layout, nested cards, decorative dashboards, or blue-only
palette.

Design read-only, empty set, loading, stale fallback data, records-service
unavailable, publication pending, publication failed, version conflict, partial
outage, and access-denied states. Meet WCAG 2.2 AA and define behavior at 390,
768, 1024, and 1440px.

Produce:

1. Steward roles, tasks, and governance assumptions.
2. Information architecture for Records and Contracts.
3. Desktop and mobile wireframes.
4. High-fidelity table, detail, form, and contract-view specification.
5. Set navigation and responsive behavior.
6. Permission, publication, conflict, stale, loading, empty, and error matrix.
7. `@erp/ui` component mapping.
8. Keyboard and screen-reader behavior.
9. Playwright and visual-regression acceptance checklist.

Do not implement until the design is approved.
