$ui-ux-pro-max

Act as a principal enterprise UX designer and shipping-operations product
designer. This is an AI-DLC inception design task for LinerCore. Do not edit
production code in this turn.

Inspect the current authenticated root page at `http://127.0.0.1/`, the
`ShellFrame`, `PlatformShell`, navigation routes, session summary, and running
demo. Redesign the ERP shell overview as the operational home for an ocean
shipping company.

Users include booking agents, pricing analysts and approvers, reference-data
stewards, equipment controllers, supervisors, auditors, and administrators.
They need a stable workspace for long sessions, fast scanning, keyboard access,
exception triage, and traceable actions.

Create a persistent left module navigation with Lucide icons and text labels for
Home, Booking, Charge Agreements, Reference Data, Container Journeys when
available, and Administration where authorized. Create a compact top bar with
LinerCore, environment, global search, notifications, help, and user menu. Add a
skip link, breadcrumbs, and clear active-page indication.

Replace technical walking-skeleton cards with a role-aware operational overview:

- `My work` list with actionable records.
- Bookings requiring validation or manual pricing.
- Pricing approvals or rate conflicts.
- Reference-data publication failures.
- Pending or exceptional movement events.
- Recently viewed records.
- Compact module shortcuts.

Use realistic demo data: 6 active bookings, 1 manual-pricing exception, 3
approved rate versions, 1 approved customer agreement, 2 journeys, and 1
pending movement event. Every count must link to the corresponding filtered
queue. Do not create a decorative wall of oversized KPI cards.

Move correlation IDs and service diagnostics into a collapsed support drawer.
Show a restrained degradation banner only when action is needed.

Use a quiet data-dense ERP style: white and cool-neutral surfaces, near-black
text, restrained maritime blue, semantic green/amber/red, Source Sans 3 or
Inter, tabular numerals, 4-8px radii, minimal shadows, Lucide icons, and no
gradients, giant hero, decorative illustrations, floating sections, nested
cards, or blue-only palette.

Design full, first-login, no assignments, partial permissions, service
degradation, loading, and stale-data states. Meet WCAG 2.2 AA. Define 390, 768,
1024, and 1440px behavior without horizontal overflow.

Produce:

1. Role and task assumptions.
2. Navigation and information architecture.
3. Desktop and mobile wireframes.
4. High-fidelity specification and token usage.
5. Component and responsive behavior specification.
6. Interaction and state matrix.
7. `@erp/ui` component mapping.
8. Accessibility acceptance criteria.
9. Playwright and visual-regression checklist.

Do not implement until the design is approved.
