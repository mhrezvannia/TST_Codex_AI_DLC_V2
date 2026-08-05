$ui-ux-pro-max

Act as a principal enterprise UX designer and design-system architect with deep
experience in ocean-carrier operations, freight booking, commercial pricing,
reference-data governance, identity and access management, and container track
and trace.

This is an AI-DLC inception design task for LinerCore, an enterprise ERP for an
ocean shipping company. Do not edit production code in this turn. Inspect the
existing `@erp/ui` package, all Next.js app layouts, the running demo at
`http://127.0.0.1`, and the current routes before proposing the design.

LinerCore users include booking agents, customer-service operators, pricing
analysts, pricing approvers, reference-data stewards, equipment controllers,
operations supervisors, auditors, and platform administrators. They work in the
system for long periods, scan dense tables, compare versions, resolve exceptions,
and need every important decision to be traceable.

Create the shared design system and application shell for the whole Phase 1
demo. The product must feel like one quiet, credible, task-focused ERP across
Auth, Shell, Booking, Reference Data, Charge Agreements, and future Container
Movement.

Use these design principles:

- Optimize for scanning, comparison, repeated action, and low error rates.
- Use dense but organized layouts with predictable navigation.
- Use a persistent left module navigation with Lucide icons and text labels.
- Use a compact top bar with LinerCore, environment, global search,
  notifications, help, and user menu.
- Use breadcrumbs and compact page headers within modules.
- Do not show a decorative journey ribbon on every page.
- Use white and cool-neutral surfaces, near-black body text, restrained maritime
  blue for navigation and information, teal/green for success, amber for
  warnings, and red only for errors or destructive actions.
- Do not make the whole interface blue.
- No gradients, glassmorphism, decorative blobs, giant hero sections, floating
  page sections, marketing layouts, nested cards, or illustration-first pages.
- Use 4-8px radii, subtle borders, minimal shadows, and stable hover states.
- Use Source Sans 3 or the existing Inter stack for body text. Lexend may be
  used sparingly for headings. Use tabular numerals for money, quantities,
  versions, and timestamps.
- Use tables for comparison, definition lists for record facts, tabs for stable
  views, checkboxes for selection, comboboxes for canonical data, and dialogs
  only for focused decisions.
- Use Lucide icons only. Do not use emoji or hand-drawn SVG icons.
- Status indicators must combine text, shape, and color.
- Technical diagnostics and correlation IDs belong in a collapsible support
  area, not in primary business content.
- Preserve stable toolbar, control, row, and panel dimensions.

Meet WCAG 2.2 AA. Provide a skip link, complete keyboard navigation, visible
focus, logical focus order, accessible async announcements, reduced-motion
behavior, and at least 4.5:1 text contrast. At 390px, do not create horizontal
page overflow or hide critical status and actions. Define behavior for 390,
768, 1024, and 1440px.

The implementation stack is Next.js App Router with shared `@erp/ui`. Prefer
Server Components for initial data and minimal client islands. The future
implementation must preserve existing routes, API contracts, authorization
boundaries, domain behavior, and test IDs used by automated tests.

Produce:

1. Design principles and explicit anti-patterns.
2. Information architecture and global navigation map.
3. Desktop and mobile shell wireframes using labeled regions.
4. Color, typography, spacing, elevation, border, focus, and motion tokens.
5. Component inventory for navigation, tables, forms, filters, statuses,
   notifications, dialogs, drawers, tabs, timelines, and record headers.
6. Density modes and responsive behavior.
7. Loading, empty, partial-data, stale-data, permission, validation, conflict,
   unavailable, and success patterns.
8. Role-aware navigation and action visibility.
9. Mapping from the proposed components to `@erp/ui`.
10. A Playwright and visual-regression acceptance checklist.

Clearly separate decisions that should be global tokens from page-specific
choices. End with open domain questions and a recommendation for the first
implementation slice. Do not implement or modify files until the design has
been reviewed and approved.
