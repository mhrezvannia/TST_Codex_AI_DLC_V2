# LinerCore Design System Master

This is the binding UI baseline for every Phase 1 module. It synthesizes the
`ui-ux-pro-max` data-dense dashboard, logistics color, accessibility, loading,
table, and Next.js recommendations with the established `@erp/ui` token set.
Existing product conventions win over marketing-oriented search results.

Before building a page, check `design-system/linercore/pages/<page>.md`. A page
file may document a domain-specific override, but it must not replace the shell,
token vocabulary, typography, or interaction rules in this master.

## Authority Order

Resolve UI decisions in this order:

1. The active intent statement, its Context Pack, and observable Definition of Done.
2. `docs/program-vision-document.md` and `docs/erp-workflow-map.md`.
3. `docs/enterprise-technical-environment.md` frontend standards.
4. This master and the executable `@erp/ui` implementation.
5. A page-specific file under `design-system/linercore/pages/`.
6. `design-inputs/claude-ui-export/` as visual direction only.

Record conflicts in the active intent and follow the higher authority. Skill output
is expert input, not permission to replace binding project decisions.

## Product Character

- Product: enterprise liner-shipping ERP and operations workspace.
- Users: pricing analysts, booking desk and customer-service users, equipment
  controllers, supervisors, platform administrators, and auditors.
- Experience: quiet, dense, predictable, accessible, and optimized for repeated work.
- Primary composition: persistent shell, filters, data tables, list/detail workspaces,
  forms, status evidence, and exception handling.
- Not a marketing site: no heroes, conversion sections, logo carousels, bento showcases,
  ornamental gradients, oversized cards, or floating promotional actions.

## Canonical Shell

- One authenticated shell owns the top bar, module navigation, user menu,
  breadcrumbs, global status, and sign-out.
- Canonical Phase 1 routes are `/booking`, `/reference-data`,
  `/charge-agreements`, and `/container-movement` under the shared edge URL.
- A module owns its routed content and domain workflows, but must not recreate
  shell chrome or expose a second canonical UI.
- Workflow ribbons appear only on transactional journey pages. Overview,
  Reference Data, authentication, access-denied, and administration pages do not
  select Booking or show a misleading journey stage.
- Sidebar order is Overview, Booking, Charge Agreements, Container Movement,
  then Reference Data.
- Active module and journey state come from route metadata or explicit context,
  never title-string inference.

## Design Tokens

`packages/ui/src/styles.ts` is the executable source of truth. UI code consumes
`--erp-*` variables and `@erp/ui` primitives; it does not introduce local palettes.

| Role | Canonical token | Light value |
|---|---|---|
| App background | `--erp-color-bg` | `#f4f7fb` |
| Surface | `--erp-color-surface` | `#ffffff` |
| Secondary surface | `--erp-color-surface-2` | `#eef3f9` |
| Primary text | `--erp-color-text` | `#102235` |
| Muted text | `--erp-color-text-muted` | `#5a6b7d` |
| Primary action/navigation | `--erp-color-primary` | `#11427a` |
| Focus/accent | `--erp-color-accent` | `#2f73c4` |
| Success | `--erp-color-success` | `#136b45` |
| Warning | `--erp-color-warning` | `#8a5200` |
| Danger | `--erp-color-danger` | `#b42318` |

Dark-mode values, borders, shadows, semantic backgrounds, and focus rings come
from the same token file. New hardcoded colors in module applications are forbidden.

## Typography And Density

- Use `--erp-font-sans` (`IBM Plex Sans` with system fallbacks) for the interface.
- Use `--erp-font-mono` only for identifiers, references, and technical evidence.
- Do not add remote font dependencies during Phase 1.
- Page titles use `--erp-font-size-2xl`; panel headings use `lg` or `xl`.
- Body and control text use `sm` or `md`; labels remain readable at 12px minimum.
- Letter spacing is zero except compact uppercase table metadata where an existing
  primitive already defines it.
- Use the `--erp-space-*` scale. Prefer 12-24px content gaps and compact table rows.

## Component Rules

- Use `@erp/ui` Button, Input, Select, Combobox, Table, Badge, Tabs, Card/Panel,
  Dialog, Toast, EmptyState, Skeleton, Stack, Inline, and StatusStrip primitives.
- Use Lucide icons when an icon is needed. Do not use emoji or hand-drawn SVG icons.
- Buttons represent commands. Modes use tabs or segmented controls, booleans use
  toggles/checkboxes, and option sets use selects or menus.
- Cards are reserved for repeated records, modals, or framed tools. Do not nest cards
  or turn every page section into a floating card.
- Cards and panels use an 8px maximum radius unless an existing shared primitive
  requires otherwise.
- Data tables provide filtering, stable column dimensions, status badges, row hover,
  keyboard access, empty/error/loading states, and horizontal handling on small screens.
- Hover feedback uses color, border, or shadow transitions of 150-250ms. Do not scale
  elements or shift the layout.

## Page Patterns

- List pages use a compact page header, command bar, search/filters, table or
  responsive record list, result count, and pagination.
- Create/edit pages use grouped labelled fields, inline validation, reference-data
  lookup, dirty-state protection, and explicit save/cancel actions.
- Detail pages show object identity, status, permitted actions, summary facts,
  domain sections or tabs, lifecycle evidence, and a collapsed audit surface.
- Timeline pages show expected and actual milestones, code plus readable label,
  occurred/received times, source, validation state, and ordering warnings.
- Overview pages show operational queues and exceptions with direct links into
  the owning module. They contain no journey ribbon or marketing composition.
- Money pages show currency, line-item basis, source rate/agreement version,
  total, and pricing reference. Movement pages show DCSA code and readable meaning.
- Kafka topics, schema details, and raw payloads stay out of the primary operator
  workflow and appear only in an audit/evidence disclosure when useful.

## Workflow And State

- Every async surface has stable-size Skeleton content before data arrives.
- Empty, permission-denied, validation-blocked, service-error, and retry states are
  designed states, not raw text fallbacks.
- Status is never conveyed by color alone; pair semantic color with text and/or icon.
- Preserve user-entered form data after validation or service errors.
- Destructive and irreversible actions require explicit confirmation and clear scope.
- Cross-module links land on the canonical shell route and exact related record.

## Accessibility

- WCAG 2.1 AA contrast is required in light and dark themes.
- All functionality is keyboard reachable in visual reading order.
- Focus indicators use `--erp-focus-ring` and are never removed without replacement.
- Nav-heavy layouts include a skip link to the main content.
- Inputs have persistent labels, useful error associations, and suitable `inputMode`.
- Dialogs trap focus, close with Escape when safe, and restore focus to their trigger.
- Respect `prefers-reduced-motion`; loading and status updates use appropriate live regions.

## Responsive Contract

Verify every changed screen at 375px, 768px, 1024px, and 1440px.

- No incoherent overlap, clipped control text, or page-level horizontal scrolling.
- Fixed-format controls use stable dimensions and responsive constraints.
- Tables use an intentional scroll or compact representation below their minimum width.
- On narrow screens, navigation and toolbars reflow without hiding primary commands.
- Do not scale typography with viewport width.

## Next.js Rules

- Next.js App Router, React, and strict TypeScript are binding.
- Prefer server-rendered reads and focused client components for interaction.
- Reserve dimensions for async content to prevent layout shift.
- Use loading boundaries and Skeleton primitives for routed and deferred data.
- Keep large optional visualizations behind dynamic imports.
- Run production builds and inspect bundle impact for new libraries.
- Apps import shared packages only; app-to-app imports are prohibited.
- Shared tokens and primitives belong in `packages/ui`; domain compositions stay
  in the owning app.
- The Enterprise Technical Environment's Tailwind plus `clsx` standard remains
  binding. CSS Modules require an approved standards waiver; W2-02 must resolve
  any older artifact that says otherwise.

## Required UI/UX Skill Invocation

Before rough mockups, refined mockups, application design, code generation, or UI
review, load this file and invoke `ui-ux-pro-max` with this project framing:

```powershell
python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "internal enterprise liner shipping carrier ERP operational dashboard dense data tables forms master-detail workflow exception management accessible light-first shared shell" `
  --design-system -p "LinerCore Enterprise Carrier Platform" -f markdown
```

Run focused follow-up searches for the active page's table, form, timeline,
accessibility, and `nextjs` needs. Reject marketing, hero, conversion, decorative,
OLED-default, or generic SaaS recommendations that conflict with this master.

## Wave A Parallel Ownership

- W2-02 owns `packages/ui`, shared tokens/primitives, Booking reference migration,
  and this master file.
- W2-03 owns Charge domain pages and may add
  `design-system/linercore/pages/charge-and-agreements.md`.
- W2-04 owns Container Movement domain pages and may add
  `design-system/linercore/pages/container-movement.md`.
- W2-03 and W2-04 do not independently redesign `packages/ui` or the global shell.
  Missing shared primitives are recorded for W2-02 and integrated through the
  program merge protocol.

## Forbidden Patterns

- Duplicate module UIs with independent visual behavior.
- Per-module shell chrome, palettes, typography, or auth/session handling.
- Hardcoded colors or local `CSSProperties` style systems in applications.
- Decorative gradients, purple-dominant palettes, bokeh/orb decoration, or ornate themes.
- Marketing landing-page composition inside operational modules.
- Unfiltered operational tables, blank loading screens, color-only status, or hidden focus.
- Direct standalone module ports presented as the canonical user journey.

## Delivery Gate

- [ ] The page runs inside the shared authenticated shell.
- [ ] It uses `@erp/ui` tokens and primitives with no local color system.
- [ ] Loading, empty, error, denied, and success states are observable.
- [ ] Keyboard-only primary workflow passes with visible focus.
- [ ] Light and dark contrast checks pass.
- [ ] Screenshots pass at 375, 768, 1024, and 1440px with no overlap or overflow.
- [ ] Playwright verifies the real running route and journey-ribbon visibility.
- [ ] Cross-module navigation uses canonical shell routes.
- [ ] Production build, relevant tests, `aidlc-audit`, and `erp-fidelity-audit` are green.
