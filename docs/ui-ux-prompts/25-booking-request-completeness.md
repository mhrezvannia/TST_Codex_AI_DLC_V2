$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in ocean-freight
booking request capture, party and cargo data, voyage schedules, equipment
requests, reference-data validation, commercial pricing gates, and accessible
high-throughput forms. This is an AI-DLC Inception design task for LinerCore
W3-04. Do not edit production code in this turn.

Inspect `docs/intents/W3-04-booking-request-completeness.md` and its complete
Context Pack, the approved W3-04 Requirements Analysis and User Stories, the
reviewed Booking queue/create/detail designs from prompts `10-13`, current
Booking create/detail source and contracts, the live Reference Data and Charge
provider behavior, shared `@erp/ui`, and the running demo.

Use only the field dictionary approved in W3-04 Requirements. The intent's
recommended baseline includes party/customer and customer reference, approved
cargo and canonical commodity facts, requested schedule, and one equipment
request line with editable quantity. Do not invent fields whose ownership,
validation, persistence, or downstream use is unresolved.

The initial FCL-dry request must not require or fabricate an ISO 6346 container
number. Keep USD/FCL dry explicit. Multi-leg routing, reefer/DG parameters,
cancellation, rolls/splits, capacity-allocation policy, multi-currency, special
equipment, and eBL issuance remain in their named later intents and must be
absent rather than shown as disabled promises.

Create this task flow:

1. Enter New Booking from the canonical Booking queue inside the shared shell.
2. Select canonical party/customer, commodity, locations, voyage, and equipment
   type; enter only the approved request facts and quantity.
3. Explain which route/schedule facts are derived from the selected voyage and
   what change clears or refreshes them.
4. Save a draft safely, preserve all values, and show reference-validation
   outcomes with field ownership and recovery.
5. Request live pricing with clear pending, no-rate/manual, validation, and
   provider-failure behavior.
6. Review the persisted request and commercial basis, confirm it, and land on
   the complete Booking detail without implying that a container is assigned.

Design the form hierarchy, canonical search behavior, dependent-field rules,
request-versus-derived facts, equipment type × quantity rows, review summary,
commercial gate evidence, and detail presentation. Protect user context through
dirty navigation and every recoverable failure.

Cover initial/loading, partial reference availability, all-reference failure,
no matches, stale/inactive selections, field and form validation, commodity
ineligible, no rate/manual pricing, pricing pending/timeout/error, denied and
read-only, duplicate submission, idempotency conflict, concurrent/stale record,
legacy-incomplete records, saved draft, confirmation pending, and complete
success. Technical evidence remains collapsed and safe.

Use the approved LinerCore operational design: one shell, compact headers,
light neutral surfaces, restrained maritime blue, semantic states, persistent
labels, Lucide icons, stable dimensions, `@erp/ui`, and no marketing, hero,
logo carousel, replacement palette/font, gradients, nested cards, decorative
stepper, or second Booking frontend.

At 375px and 390px use one-column labelled groups and an in-flow action area. At 768px
stack form and review while retaining task order. At 1024/1440px a primary form
and compact review/evidence rail may coexist when the approved field count
supports it. Meet WCAG 2.2 AA with linked error-summary focus, keyboard-complete
comboboxes, logical focus order, announced async states, non-color meaning,
reduced motion, and no page-level horizontal overflow.

Produce:

1. Roles, task flow, field-source/ownership map, and explicit assumptions.
2. Route and entry/return proposal for Application Design review.
3. Desktop/mobile wireframes for create, correction, review, pricing, confirm,
   and complete detail.
4. High-fidelity field grouping, dependency, validation, and commercial-gate
   specifications.
5. Complete state, recovery, legacy-record, and concurrency matrix.
6. Responsive and accessibility behavior at every required viewport check.
7. `@erp/ui` mapping and missing-platform-dependency list without editing the
   shared package.
8. Requirements/story traceability plus Playwright and visual-regression
   acceptance checklist.
9. Proposed page-override content for review; do not write or treat it as
   binding until the design and Refined Mockups gate are approved.

Do not implement until W3-04 requirements, stories, and design are approved.
