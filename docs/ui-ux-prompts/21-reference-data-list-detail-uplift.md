$ui-ux-pro-max

Act as a principal enterprise UX designer with expertise in master-data
governance, canonical shipping reference data, version history, publication,
and accessible ERP list-detail workflows. This is the Reference Data unit of
the LinerCore W4-01 AI-DLC Inception design. Do not edit production code in this
turn.

Inspect `docs/intents/W4-01-module-list-detail-uplift.md` and its complete
Context Pack, the design approved from `14-reference-data-workbench.md`, current
Reference Data routes/components/APIs, permission and history behavior, shared
`@erp/ui`, the interaction-spec template, and the running demo.

Replace the single-page workbench composition with canonical authenticated
list/detail routes while preserving every real capability and authorization
boundary. Do not add new reference-data capabilities, bulk actions, saved views,
global search, or client-only fake pagination.

Design these route responsibilities for Application Design confirmation:

1. Reference-set list for set identity, ownership, status, record count, and
   last change.
2. Record list within one set with server-backed search, filters, sorting,
   pagination, result count, stable row links, and URL-preserved state.
3. Record detail with `Summary`, `Attributes`, and `History` tabs plus only
   permitted actions.

The record list should prioritize code/key, label/name, active/effective state,
validity, version, and last change. Filters must reflect provider capability.
Returning from detail must restore selected set, filters, sort, and page.

The detail header must show set, record identity, active/effective state,
version, and validity. Summary contains readable primary fields and ownership.
Attributes renders labelled domain values, not raw JSON. History shows ordered
versions/changes with actor/source/time and changed values. Raw payload belongs
in a collapsed support disclosure when necessary.

Preserve create/edit behavior supported by the old workbench. In read-only mode,
mutation commands must be absent with a concise reason and request-access path
where supported. Forms retain canonical controls, validation, unsaved-change
protection, optimistic-version conflict handling, publication progress, and
audit evidence.

Design set/record loading, no sets, empty set, no filter match, populated, not
found, denied, read-only, validation, save pending/success/conflict/error,
history unavailable, publication pending/failed, stale fallback, and partial
service states. Preserve usable sections across scoped failures.

Use the approved LinerCore list-detail grammar: compact headers, breadcrumbs,
dense tables, stable tabs, compact action rail, light neutral surfaces,
restrained maritime blue, semantic status tokens, tabular versions/timestamps,
Lucide icons, 4-8px radii, and no workbench cramming, gateway/marketing layout,
card wall, new palette/fonts, or spinner-only loading.

At 390px use semantic record rows and a full-page detail drill-in. At 768px use
labelled inner table overflow and stack the action/evidence rail. At 1024/1440px
use compact tables and a detail action rail without excessive whitespace. Meet
WCAG 2.2 AA with captions, true headers, result announcements, linked errors,
visible focus, and keyboard-reachable row/action links.

Produce:

1. Binding interaction specification using the repository template.
2. Final route/list/detail information architecture and migration from the old
   workbench entry point.
3. Desktop/mobile wireframes for set list, record list, record detail, and form.
4. Table, filter, tab, action, history, and publication specifications.
5. Complete state and recovery matrix.
6. Responsive, keyboard, focus, and screen-reader behavior.
7. Shared-versus-domain `@erp/ui` component mapping.
8. Playwright and visual-regression acceptance checklist.

Do not implement until this first W4-01 pattern is reviewed and approved.
