# Refined Mockups Questions — W2-02 Design-System Closure

## Fixed Design Context

The refinement must preserve `wireframes.md`, `user-flow.md`, the six Must stories in `stories.md`, the numbered gates in `requirements.md`, and the canonical-live posture in `team-practices.md`. WCAG 2.1 AA, both themes, widths 375/768/1024/1440, all named UI states, one shared shell, and `@erp/ui` consumption are already fixed and are not being re-asked.

## Q1. What fidelity and screen scope should the refined artifacts use?

A. Produce implementation-ready annotated Markdown mockups for the existing Booking list, create, and detail routes, including state, responsive, focus, and evidence annotations; add no new route or visual concept (recommended)
B. Produce only one desktop happy-path mockup and defer states/responsiveness
C. Add a new dashboard/landing page to showcase the design system
D. Replace the existing route family with a new prototype frontend
X. Other (please specify)

[Answer]: A — Annotated existing routes (Recommended) — 2026-07-21T13:58:50Z — **Mode:** guided

## Q2. How should the Booking list behave at narrow widths?

A. Preserve the shared semantic Table with a contained horizontal scroller and stable essential columns/actions; stack filters and keep the page itself overflow-free (recommended)
B. Replace every table row with a new local card component below 768px
C. Hide non-fitting columns and primary actions without an alternate access path
D. Allow page-level horizontal scrolling
X. Other (please specify)

[Answer]: A — Contained table scroll (Recommended) — 2026-07-21T13:58:50Z — **Mode:** guided

## Q3. How should the existing create journey be refined?

A. Keep one grouped, labelled form with progressive disclosure for secondary evidence, inline lookup/loading/error states, a validation summary, preserved values, and explicit create/cancel actions; do not invent a wizard (recommended)
B. Convert it into a new multi-step wizard
C. Put the full form in a modal
D. Auto-submit fields as they change
X. Other (please specify)

[Answer]: A — Grouped form (Recommended) — 2026-07-21T13:58:50Z — **Mode:** guided

## Q4. How should detail and lifecycle evidence be organized?

A. Keep identity/status/actions first, then summary and lifecycle sections; use shared Tabs only where the existing content benefits, and keep technical audit evidence collapsed and secondary (recommended)
B. Make raw event payloads and Kafka metadata the primary content
C. Turn every section into nested cards
D. Replace detail with an editable dashboard
X. Other (please specify)

[Answer]: A — Operational hierarchy (Recommended) — 2026-07-21T14:01:53Z — **Mode:** guided
