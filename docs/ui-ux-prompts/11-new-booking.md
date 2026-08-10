$ui-ux-pro-max

Act as a principal enterprise UX designer with experience in ocean-freight
booking creation, reference-data-driven forms, cargo/equipment validation, and
high-volume ERP data entry. This is an AI-DLC inception design task for
LinerCore. Do not edit production code in this turn.

Inspect `http://127.0.0.1/bookings/new`, the existing `BookingCreateForm`,
reference-option APIs, validation rules, idempotency behavior, and running demo.
Redesign it as an efficient and safe booking-draft workflow.

LinerCore is an enterprise ERP for an ocean shipping company. Primary users are
booking agents and customer-service operators who repeatedly create bookings and
must avoid route, customer, equipment, and voyage errors.

Existing fields and behavior:

- Customer from canonical party/customer reference data.
- Load UN/LOCODE.
- Discharge UN/LOCODE.
- Voyage from canonical vessel/voyage data.
- Voyage selection may populate load and discharge locations.
- Equipment Type from canonical equipment reference data.
- Equipment ID validated as an ISO 6346 identity including check digit.
- Commodity Code.
- Current MVP values: USD, FCL dry, non-reefer, non-dangerous goods.
- Submission creates a Draft and uses an idempotency key to prevent duplicates.
- Field errors and a linked error summary already exist and must be preserved.

Design a focused workflow with sections:

1. Customer.
2. Route and voyage.
3. Equipment and cargo.
4. Review and create.

For the current MVP, prefer one efficient page with grouped sections and a
compact sticky summary over an artificial multi-step wizard. Use searchable
comboboxes showing both code and display name. Make auto-populated route values
visible and explain their source. Allow edits only where the domain permits.

Validate:

- Required canonical references.
- Different load and discharge locations.
- Voyage-route compatibility.
- UN/LOCODE format.
- ISO 6346 equipment identity.
- Equipment type compatibility.
- Duplicate equipment.
- Stale or inactive reference values.

Use `Create draft` as the primary action and `Cancel` as the secondary action.
Prevent duplicate submission, show progress inside the button, retain entered
data on recoverable failure, and warn before abandoning unsaved changes.

Use realistic selectable data: customer Northstar Retail, route USNYC to NLRTM,
voyage VOY-LOCAL-002, equipment type 22G1, equipment LCRU1000055, currency USD,
and FCL dry cargo.

Use the shared LinerCore ERP visual system: persistent module navigation,
compact page header, light neutral surfaces, near-black text, restrained
maritime blue, semantic status colors, Source Sans 3 or Inter, Lucide icons,
4-8px radii, visible focus, and no gradients, hero layout, decorative cards,
nested cards, excessive whitespace, or free-text IDs where canonical choices
exist.

At 390px use one column, native-friendly controls, appropriate input modes, and
reachable actions that do not obscure fields. Meet WCAG 2.2 AA.

Design reference options loading/unavailable, invalid route-voyage combination,
duplicate equipment, stale reference, field validation, server rejection,
submitting, successful creation and redirect, and unsaved-change states.

Produce:

1. User/task assumptions and form information hierarchy.
2. Desktop and mobile wireframes.
3. High-fidelity form and review specification.
4. Field inventory, labels, help text, and validation messages.
5. Keyboard order, focus-on-error, and announcement behavior.
6. State and recovery matrix.
7. `@erp/ui` component mapping.
8. Playwright acceptance checklist including duplicate-submit prevention.

Do not implement until the design is approved.
