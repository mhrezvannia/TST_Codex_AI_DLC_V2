$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in ocean-freight
commercial pricing, tariff management, customer agreements, approval controls,
versioning, and data-dense ERP workbenches. This is an AI-DLC inception design
task for LinerCore. Do not edit production code in this turn.

Inspect `http://127.0.0.1/charge-agreements/`, the current
`ChargeAgreementWorkbench`, rate and agreement APIs, approval and binding
actions, reference-data dependencies, Booking pricing integration, and running
demo. Redesign it as a credible commercial pricing workspace.

LinerCore is an enterprise ERP for an ocean shipping company. Pricing analysts
create and version rates, approvers authorize them, commercial users manage
customer agreements, and Booking consumes exact approved rate snapshots.

Existing capabilities:

- View rate versions by Freight, Surcharge, and Local category.
- Inspect charge code, trade lane, equipment, optional location, amount,
  currency, validity, status, and version.
- Create a rate draft.
- Approve a draft.
- Select one approved version per category.
- Bind a complete three-category authority to a customer agreement.
- Preview the itemized Booking total.

Do not squeeze the entire lifecycle into one undifferentiated page. Create
stable views or tabs:

1. Agreements.
2. Rate Authority.
3. Approval Queue.

The default view must be table-first and optimized for scanning. Provide search,
category/status filters, effective-date context, sorting, version comparison,
sticky table header, pagination, and a contextual detail drawer.

Use realistic data:

- Customer Northstar Retail.
- Route USNYC to NLRTM.
- Equipment type 22G1.
- Currency USD.
- Ocean Freight line.
- Bunker Adjustment surcharge.
- Terminal Handling local charge.
- One approved version from each category.
- One customer agreement with a visible version and approval state.

Rate creation must use canonical comboboxes for charge code, lane, equipment,
location, and currency where reference data exists. Show amount, pricing basis,
valid-from, valid-to, previous version, and reason for change. Detect overlapping
validity and conflicting active rates.

Approval requires a concise impact summary: rate, scope, effective dates,
superseded version, affected agreement/booking behavior, and actor authority.
Use confirmation only for the consequential approval.

Agreement binding must show:

- Selected customer agreement and version.
- Coverage for Freight, Surcharge, and Local.
- Missing requirements.
- Exact selected rate versions.
- Itemized preview and total with tabular numerals.
- Consequence for future Booking quotes.

Use the shared LinerCore ERP system: persistent module navigation, compact top
bar and breadcrumbs, light neutral surfaces, near-black text, restrained
maritime blue, semantic green/amber/red, Source Sans 3 or Inter, tabular
numerals, Lucide icons, 4-8px radii, subtle borders, stable table dimensions,
and no gradients, hero layout, decorative card wall, nested cards, excessive
whitespace, or blue-only palette.

Design draft, approved, suspended, expired, overlapping validity conflict, no
matching rate, manual pricing, stale version, incomplete category coverage,
loading, empty, permission-limited, and service-unavailable states. Meet WCAG
2.2 AA and define behavior at 390, 768, 1024, and 1440px.

Produce:

1. Pricing and approval role/task assumptions.
2. Information architecture for Agreements, Rates, and Approval Queue.
3. Desktop and mobile wireframes for each view.
4. High-fidelity table, drawer, form, comparison, approval, and binding
   specification.
5. Permission and primary-action rules.
6. Conflict, loading, empty, manual-pricing, and unavailable matrix.
7. `@erp/ui` component mapping.
8. Keyboard and screen-reader behavior.
9. Playwright and visual-regression acceptance checklist.

Do not implement until the design is approved.
