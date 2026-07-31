# Rough Mockups Questions - W2-03 Charge Tariffs & Agreements

Upstream context: [`intent-statement.md`](../intent-capture/intent-statement.md), [`scope-document.md`](../scope-definition/scope-document.md), and [`intent-backlog.md`](../scope-definition/intent-backlog.md).

## Q1. Entry points and screens

Which Charge-owned screen structure should the rough mockups use?

- A. Separate list, create/edit, and detail routes for agreements and rate entries, plus a no-rate exception view under `/charge-agreements` (recommended)
- B. Keep every workflow in one page without shareable record routes
- C. Redesign shared navigation, shell, overview, or other module pages
- X. Other (please specify)
- `[Answer]:` A - Stable routes (Recommended)

## Q2. Core user flow

What core happy path should anchor the UI?

- A. Create an effective rate, attach it to a draft agreement version, approve, then observe the itemised result in the existing Booking pricing surface (recommended)
- B. Stop after Charge administration
- C. Center a generic pricing simulator ahead of the agreement/Booking flow
- X. Other (please specify)
- `[Answer]:` A - Rate to Booking (Recommended)

## Q3. Information hierarchy

What information should be most prominent?

- A. Identity/status/actions, applicability and validity, itemised commercial lines/version source, then collapsed audit evidence (recommended)
- B. Decorative KPI cards and summary tiles
- C. Health, correlation, schemas, and raw payloads first
- X. Other (please specify)
- `[Answer]:` A - Operational evidence (Recommended)

## Q4. Design-system inheritance

How should `ui-ux-pro-max` recommendations be applied?

- A. Keep the shared shell, IBM Plex typography, existing tokens/primitives, and record only Charge-specific page additions (recommended)
- B. Replace LinerCore colors/fonts with the skill's generic recommendations
- C. Create a module-local palette, typography, navigation, and component set
- X. Other (please specify)
- `[Answer]:` A - LinerCore first (Recommended)

## Q5. Responsive form factors

Which form factors must support the Charge workflow?

- A. Design for 375, 768, 1024, and 1440px with intentional table scrolling/stacking and no page-level overflow (recommended)
- B. Make create/edit unavailable on mobile and tablet
- C. Introduce a separate mobile navigation and visual system
- X. Other (please specify)
- `[Answer]:` A - All four widths (Recommended)

## Q6. Accessibility target

What accessibility target should the mockups specify?

- A. WCAG 2.1 AA with semantic landmarks/headings, full keyboard operation, visible focus, labels/errors, announcements, reduced motion, and light/dark contrast (recommended)
- B. Rely on automated scans only
- C. Check contrast only
- X. Other (please specify)
- `[Answer]:` A - WCAG 2.1 AA (Recommended)

## Contradiction Review

- The earlier single-workbench mockup is useful history but conflicts with the current requirement for stable/shareable operational routes; the new model preserves its list/detail/editor concepts without preserving its routing limitation.
- `ui-ux-pro-max` recommended a marketing "Enterprise Gateway," new blue/amber colors, Fira fonts, spinners, and generic bulk edit. Those conflict with the [`intent-statement.md`](../intent-capture/intent-statement.md), [`scope-document.md`](../scope-definition/scope-document.md), [`intent-backlog.md`](../scope-definition/intent-backlog.md), and binding LinerCore master, so they are rejected.
- Booking-visible price lines remain part of the flow and acceptance seam, but W2-03 does not redesign Booking routes or shared shell/navigation.
