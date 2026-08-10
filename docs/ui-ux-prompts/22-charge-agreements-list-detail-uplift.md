$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in ocean-freight
commercial agreements, versioned rates, approvals, D&D linkage, pricing
provenance, and accessible ERP list-detail workflows. This is the Charge unit
of the LinerCore W4-01 AI-DLC Inception design. Do not edit production code in
this turn.

Inspect `docs/intents/W4-01-module-list-detail-uplift.md` and its complete
Context Pack, designs approved from `16-charge-agreements-workbench.md`,
`18-dnd-rules-and-rates.md`, and `21-reference-data-list-detail-uplift.md`, the
current Charge routes/APIs/actions, Booking pricing links, shared `@erp/ui`, and
the running demo.

Replace obsolete workbench entry points with canonical Agreement list/detail
routes while preserving the approved Rate Authority and Approval Queue behavior.
Apply the repeated W4-01 list-detail grammar without flattening Charge-specific
versioning, approval, or binding workflows.

The Agreement list must provide real server-driven search, customer/status/
effective-date filters, sorting, pagination, result count, URL-preserved state,
stable row links, and loading/empty/error/denied/populated states. Prioritize
agreement number/name, customer, coverage, status, version, validity, pricing
readiness, and last change.

The Agreement detail must use these stable views:

- `Summary`: identity, customer, lane/equipment scope, validity, status,
  version, and pricing readiness.
- `Rates`: exact bound Freight, Surcharge, and Local versions, itemized preview,
  currency, and gaps.
- `D&D`: approved rule/rate linkage and evidence from W3-01.
- `Status history`: lifecycle, approvals, version/binding changes, actor/time.

If W3-01 is not merged or available, do not fabricate D&D data. Design an honest
empty/unavailable state with the provider seam explicit. Technical correlation
and raw payload evidence belongs in a collapsed support disclosure.

Keep the action rail role-aware: edit/version, bind rate authority, approve,
suspend, or other actions appear only when current capability and policy permit
them. Consequential actions show a concise impact summary and prevent duplicate
submission. Preserve the existing dedicated Rate Authority and Approval Queue
views rather than forcing their complete workflows into Agreement detail.

Design loading, empty, filtered-empty, not found, denied, read-only, incomplete
coverage, manual pricing, overlapping validity, stale version, approval pending,
conflict, service unavailable, D&D unavailable, partial/degraded, and success
states.

Use the approved LinerCore and W4-01 grammar: dense tables, compact record
headers, stable tabs, action rail, light neutral surfaces, restrained maritime
blue, semantic status tokens, tabular money/versions/dates, Lucide icons, and no
marketing layout, decorative cards/charts, bulk actions, fake filters, new
palette/fonts, or page-level mobile overflow.

Meet WCAG 2.2 AA. Define 390px semantic list records and stacked detail, 768px
labelled table overflow and stacked action rail, and 1024/1440px dense table and
detail layouts. Status, coverage, and D&D availability need non-color meaning.
Specify keyboard row links, tab/action order, focus recovery, and async
announcements.

Produce:

1. Binding Charge interaction specification using the repository template.
2. Route map and obsolete-workbench redirect/deletion plan for review.
3. Desktop/mobile Agreement list and detail wireframes.
4. High-fidelity tables, tabs, action rail, coverage, D&D, and history specs.
5. State, permission, conflict, and recovery matrix.
6. Responsive and accessibility behavior.
7. Shared-versus-Charge `@erp/ui` component mapping.
8. Cross-links to Booking and Reference Data with return-context behavior.
9. Playwright and visual-regression acceptance checklist.

Do not implement until the Reference Data pattern and this Charge design are
reviewed and approved.
