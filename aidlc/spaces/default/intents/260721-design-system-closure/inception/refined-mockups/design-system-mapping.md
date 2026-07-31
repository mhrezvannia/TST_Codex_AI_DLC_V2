# Design-System Mapping — Booking Reference Closure

## Authority and Upstream Coverage

This mapping refines `wireframes.md` and `user-flow.md`, traces the six Must outcomes in `stories.md`, enforces `requirements.md`, and follows `team-practices.md`. Authority remains the active intent → enterprise standards → `MASTER.md` and `SESSION-PROMPT.md` → executable `packages/ui` implementation. ui-ux-pro-max is advisory only.

## Screen-to-Primitive Mapping

| Screen/region | Shared primitive or token | Domain composition responsibility | Forbidden substitute |
|---|---|---|---|
| Global frame | Existing authenticated shell; DesignSystemStyles; ThemeToggle | Route metadata and Booking active state in existing shell | Booking-local header, nav, theme, or second main landmark |
| Page layout | Stack, Inline; `--erp-space-*`, `--erp-color-*` | Booking headings, commands, and domain copy | Local spacing/color map or raw hex |
| List commands | Input/Combobox, Select, Button, StatusStrip | Search/filter query and result count | Raw styled controls or local toolbar system |
| Results | Table, Badge/StatusBadge, Skeleton, EmptyState | Booking columns, row link, result data | Local table theme, blank loading screen |
| Pagination | Button/link semantics through shared styling | Existing paging state and filter retention | Pointer-only controls |
| Create fields | Field, Input, Select, Combobox | Existing Booking form type/mapping and reference lookups | Placeholder-only labels, app-local input styles |
| Create feedback | StatusStrip, Skeleton, Toasts | Validation, lookup, pending, error, success messages | Raw error text or spinner-only pending |
| Dirty cancel | Dialog, Button | Unsaved-scope copy and navigation action | Browser-only prompt or custom overlay |
| Detail identity | Badge/StatusBadge, Stack, Inline | Booking reference, lifecycle status, allowed actions | Color-only status or decorative hero |
| Detail grouping | Tabs only when justified; semantic sections | Summary, lifecycle, existing domain evidence | Tabs as decoration or nested cards |
| Lifecycle/action feedback | StatusStrip, Button, Toasts, Skeleton | Validate/price/confirm transitions and evidence | Local status palette or hidden error |
| Audit disclosure | Native/shared disclosure semantics with shared tokens | Existing technical evidence, collapsed | Raw payload as primary operator content |

## Token Mapping

| Need | Required source | Application rule |
|---|---|---|
| Background/surface/text | `--erp-color-bg`, `--erp-color-surface*`, `--erp-color-text*` | Consume variables only; no Booking palette. |
| Primary/focus | `--erp-color-primary`, `--erp-color-accent`, `--erp-focus-ring` | Commands and focus use shared roles, not copied hex. |
| Semantic status | `--erp-color-success/warning/danger` plus shared semantic backgrounds | Always pair with text/icon. |
| Typography | `--erp-font-sans`; `--erp-font-mono` for identifiers only | No remote Fira fonts or local typography scale. |
| Spacing/radius/shadow | `--erp-space-*` and shared component styles | No local design-token object; panels remain ≤8px radius where applicable. |
| Motion | Shared 150–250ms transitions and reduced-motion behavior | No scale/position hover effect. |

## Route and State Mapping

| Route family | Required shared states | Story/requirement trace |
|---|---|---|
| Booking list | Skeleton, populated Table, empty/no-match EmptyState, error/retry StatusStrip, denied, degraded | US-001; FR-001–FR-004, FR-007 |
| Booking create | Field controls, lookup Skeleton/error, validation summary, pending Button/status, dirty Dialog, success feedback | US-002; FR-002, FR-005, FR-006 |
| Booking detail | identity/status Badge, Skeleton, not-found/denied, partial/degraded section, pending/error/success action feedback | US-002; FR-004–FR-007 |
| Cross-route proof | shell, themes, responsive behavior, package inventory, lint negative probes | US-003–US-006; FR-008–FR-012 |

## Semantic-Native Exception Register

Native HTML is preferred where it provides the correct semantic foundation and no `@erp/ui` wrapper adds value. Every retained exception must use shared tokens/classes where styling is needed and have focused coverage.

| Element/category | Permitted purpose | Required proof | Not permitted |
|---|---|---|---|
| `main`, `section`, headings | Document landmarks and hierarchy inside existing shell | Landmark/heading assertions | Duplicate shell/main or heading-order break |
| `form`, `fieldset`, `legend` | Booking form and grouped controls | Label/group association test | Local form visual system |
| `details`/`summary` | Collapsed technical audit evidence if no shared disclosure wrapper exists | Keyboard/name/expanded-state test | Primary workflow hidden inside disclosure |
| `dl`/`dt`/`dd`, `time` | Summary facts and lifecycle timestamps | Semantic DOM assertion | Styled div-only facts |
| Link | Canonical navigation and record identity | Accessible-name and destination test | Clickable div or app-to-app URL |

Raw `button`, `input`, `select`, locally styled table controls, or local feedback primitives are not blanket exceptions merely because they are native. The shared primitives already own their operational styling/interaction boundary.

## Responsive Mapping

| Width | Shared composition | Booking-specific adaptation |
|---:|---|---|
| 375 | Canonical narrow shell; Stack; contained Table wrapper | Stack commands/fields/facts; keep primary action; contained table scroll only |
| 768 | Wrapping Inline/grid from shared spacing | Two-column short fields where logical; table remains primary |
| 1024 | Full shell and dense command bar | Stable columns, bounded form, aligned detail facts |
| 1440 | Same shell and max-width operational content | Do not stretch controls or add decorative space |

## Adoption and Enforcement

Implementation is complete only when:

1. applicable Booking presentation imports/renders `@erp/ui`;
2. duplicate Booking chrome/theme/palette is absent on canonical routes;
3. every semantic-native exception is listed with rationale and a test;
4. application TS/TSX/CSS hardcoded colors and local `CSSProperties` systems are rejected;
5. non-writing negative probes prove both rejection paths;
6. focused tests, lint, typecheck, production build, live Playwright, demo guards, and both audits are green.

No new Booking page override is required: every decision above is already expressible by the shared master and package. If implementation discovers a true shared primitive gap, add the smallest reusable behavior within W2-02 ownership and update this mapping; do not create an app-local substitute.
