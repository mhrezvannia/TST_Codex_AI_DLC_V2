# Intent Statement — W2-02 Design-System Foundation

## Intent

`@erp/ui` becomes a real design system — tokens + primitives + patterns — and one app (Booking) is migrated onto it as the reference, eliminating per-app inline hex styling. Fulfils the atomic-design mandate in the Enterprise Tech-Env. **Driver: UI team.**

## Context Pack (read before starting)

1. `docs/erp-business-ui-gap-analysis.md` Part 3.3 (design-system findings: 1-file package, 138 inline-hex hits)
2. `docs/enterprise-technical-environment.md` (atomic design + skeleton-states mandate)
3. `packages/ui/src/index.tsx` (current placeholder)
4. `design-inputs/claude-ui-export/` (visual direction from the original UI export)
5. `inception/refined-mockups/accessibility-checklist.md` of the enterprise intent (a11y baseline)

## Vertical Slice Definition

Tokens → primitives → one migrated production screen, end-to-end: define tokens (color/space/type/radius/elevation, light+dark) → build primitives on them → rebuild the Booking workbench screens with **zero local style objects** → visual + a11y checks pass on the running app.

- **Thinnest viable form:** the ~12 primitives the current screens actually need: Button, Input, Select, Combobox (reference lookups), Table, Badge, Tabs, Card/Panel, Dialog/Drawer, Toast, EmptyState, Skeleton.
- **Deferred:** migrating the other four apps (W4-01); advanced patterns (data-grid virtualization, saved views).

## In Scope / Out of Scope

- **In:** token set as CSS variables; primitives with a11y built in (focus rings, labels, keyboard paths); form patterns; Booking app migrated; lint rule banning hex literals and local `CSSProperties` style objects in `apps/**`.
- **Out:** brand identity work (tokens are neutral, swappable); other apps.

## Actors & Journey

Developer builds a screen exclusively from `@erp/ui`; user gets consistent, accessible surfaces. Journey proven by the migrated Booking screens.

## Cross-Module Seams (must be real)

None at runtime — the seam is the package boundary: apps consume `@erp/ui` only; the lint gate enforces it.

## Standards Alignment

WCAG 2.1 AA (contrast, keyboard, focus, labels); skeleton loading states mandated for every async surface.

## Definition of Done (observed, not "tests pass")

On the running Booking app: (1) every screen renders from `@erp/ui` primitives — `erp-fidelity-audit` detector 6b reports ~0 inline-hex in `apps/booking`; (2) keyboard-only walkthrough completes create→confirm; (3) contrast checks pass on both themes; (4) skeleton/empty/error states visible by toggling network conditions; (5) the lint gate fails a PR that adds a hex literal to `apps/**`.

## Dependencies

None (root — runs parallel with Wave 0/1). W4-01 consumes it. Coordinate with W1-01: if W1-01's detail pages land first they migrate here as part of the Booking migration unit; if this closes first, W1-01 builds directly on the primitives (preferred).

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) tokens + 6 core primitives + one migrated screen; (U02) remaining primitives + forms/comboboxes; (U03) full Booking migration + lint gate.

## Open Questions

1. Styling technology for tokens/primitives?
   - A. CSS variables + CSS modules (no runtime dep, SSR-safe) (recommended)
   - B. Tailwind with token config
   - C. vanilla-extract / CSS-in-TS
   - X. Other
   - `[Answer]:` A — CSS variables + CSS modules (no runtime dep, SSR-safe).
