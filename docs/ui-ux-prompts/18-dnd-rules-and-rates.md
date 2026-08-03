$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in ocean-freight
demurrage and detention, tariff administration, versioned commercial rules,
charge calculation evidence, and data-dense ERP workbenches. This is an AI-DLC
Inception design task for LinerCore W3-01. Do not edit production code in this
turn.

Inspect `docs/intents/W3-01-dnd-rules-and-rates.md` and its complete Context
Pack, the current Charge Agreements routes and APIs, approved rate/version
patterns, DCSA movement vocabulary, shared `@erp/ui`, the output approved from
`00-shared-design-system.md`, and the running demo at `http://127.0.0.1`.

Design Charge-owned administration for D&D rule types and rates. Container
Movement provides movement facts but never owns or edits D&D rules. Booking and
Finance integration are outside this prompt.

Cover these MVP meanings exactly:

- Demurrage: `DISC` to `GTOT`.
- Detention: `GTOT` to `GTIN`.
- Combined D&D where the approved domain contract permits it.
- Port-local calendar-day counting.
- Free days followed by a daily monetary rate.
- Effective, immutable versioned rule/rate/agreement evidence.

Create a stable information architecture for:

1. Rule-type list, create, detail, status, and version history.
2. D&D rate list, create, detail, effective dates, and agreement linkage.
3. Agreement D&D relationship view.
4. A bounded evaluation action from rule/rate detail.

The list views must support real server-backed search, filters, sorting,
pagination, result count, stable row links, loading skeletons, empty and
filtered-empty states. Do not invent bulk editing or saved views.

Rule forms must show readable start/end movement labels, counting basis,
status, version, and change reason. Rate forms must show rule, port/trade scope,
free days, daily amount, currency, validity, version, and linked agreements.
Use canonical comboboxes where Reference Data owns the value. Validate on blur,
preserve entered values, protect dirty forms, and provide review before an
approval or version-changing command.

The evaluation flow accepts a reviewed movement pair and occurred timestamps.
Its result must show elapsed days, free days, chargeable days, daily rate,
calculation, total, currency, and the exact rule/rate/agreement versions. Zero
within free time is a successful calculated result, not an empty state.

Design loading, no data, no filter match, read-only, denied, validation blocked,
save/evaluation pending, success, version conflict, no applicable rate, expired
rate, service unavailable, and degraded-evidence states. Prevent duplicate
submission and never allow approved history to appear editable.

Use the approved LinerCore ERP visual language: light neutral surfaces,
restrained maritime blue, semantic status tokens, Source Sans 3 or Inter,
tabular money/dates/versions, Lucide icons, compact tables, 4-8px radii, subtle
borders, stable dimensions, and no marketing gateway, hero, gradients,
decorative dashboards, nested cards, replacement palette, or spinner-only
loading.

Meet WCAG 2.2 AA and define 390, 768, 1024, and 1440px behavior. DCSA codes need
readable labels; money needs currency and basis; status cannot rely on color.
Define error-summary focus, dialog/drawer focus trap and restore, keyboard table
navigation, and accessible async announcements.

Produce:

1. Roles, tasks, domain assumptions, and explicit ownership boundaries.
2. Route and information-architecture proposal for Application Design review.
3. Desktop and mobile wireframes for list, detail, forms, and evaluation.
4. High-fidelity tables, forms, version history, agreement links, and result
   calculation specification.
5. Rule/rate/evaluation state and recovery matrix.
6. Responsive and accessibility behavior.
7. `@erp/ui` component mapping and missing-primitive list without editing it.
8. Playwright and visual-regression acceptance checklist.
9. Open contract questions that must be resolved before Application Design.

Do not implement until the design and W3-01 contracts are reviewed and approved.
