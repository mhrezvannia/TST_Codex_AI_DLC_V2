# Design-System Mapping — W2-03 Charge Tariffs & Agreements

## Authority and Scope

This mapping refines [`wireframes.md`](../../ideation/rough-mockups/wireframes.md), [`user-flow.md`](../../ideation/rough-mockups/user-flow.md), [`stories.md`](../user-stories/stories.md), [`requirements.md`](../requirements-analysis/requirements.md), and [`team-practices.md`](../practices-discovery/team-practices.md). Authority remains `design-system/linercore/MASTER.md` → executable `@erp/ui` → `design-system/linercore/pages/charge-and-agreements.md`. W2-03 owns Charge-domain compositions only and does not modify the shared shell, navigation, tokens, typography, palette, or `packages/ui`.

## Source-Verified Existing Primitives

The current `packages/ui/src/{primitives,interactive}.tsx` exports were checked after a code-graph-first discovery attempt. W2-03 may consume:

| Existing export | Charge use | Constraints |
|---|---|---|
| `Stack`, `Inline` | Page/section/command layout | Shared spacing only; no nested card grid. |
| `Button` | Create, Save, Approve, Reprice, Retry, Cancel | One primary command per region; stable pending text/dimensions. |
| `Field`, `Input`, `Select` | Persistent labels, dates, money, filters | Blur validation; native `type=date`/`inputMode=decimal`; linked hint/error. |
| `Combobox` | Customer, location, equipment, rate-version references after options load | Current export supports keyboard selection but lacks `aria-activedescendant` and async loading/error props; W2-02 dependency DS-02 below is explicit. Surrounding Charge regions use `Skeleton`/`StatusStrip` and mount the combobox only with a settled option set. |
| `Card` | Focused repeated record or framed tool only | Avoid nested/general-purpose cards; ordinary sections remain semantic regions. |
| `Badge`, `StatusBadge` | Draft/Approved/Scheduled/Effective/Expired/manual states | Text plus semantic tone; never color alone. |
| `Table` | Agreement/rate/version/manual/pricing data | Caption, scoped headers, stable columns, intentional narrow overflow/record mode. |
| `EmptyState` | First-use and filtered-empty states | Task/recovery copy, not marketing illustration. |
| `Skeleton` | Routed reads and affected async regions | Stable size; hidden from assistive technology with one concise live status. |
| `StatusStrip` | Persistent validation/degraded/read-only/no-rate status | Use instead of inventing a generic Alert. |
| `Tabs` | Charge module links only if ordinary-link semantics remain; detail sections where appropriate | Module-local routes should remain real links; tab widget only for in-page panels. |
| `Dialog` | Approval and dirty-navigation confirmation | Current export focuses the container and handles Escape but does not trap Tab or restore the trigger. A Charge-local lifecycle-dialog composition may wrap the existing primitive to retain/restore its trigger and enforce a scoped Tab loop; shared remediation remains W2-02 dependency DS-01. |
| `Toasts` | Concise save/approve/reprice success | Persistent business state remains inline; toast does not replace evidence. |
| `ThemeToggle` | Shared shell only | Charge pages do not render another theme control. |

`PlatformShell` is consumed through the existing shared shell integration and must not be instantiated or restyled by Charge routes. The current export still infers active stage from title and always renders the ribbon; it has no route-metadata suppression seam. No-ribbon acceptance is therefore W2-02 dependency DS-03 and remains visibly blocked until the integrated shared shell provides it.

## Page-to-Primitive Mapping

| Route pattern | Required mapping | Charge-local composition |
|---|---|---|
| `/charge-agreements` | `Stack`, `Inline`, `Field`, `Input`, `Select`, `Button`, `Table`, `Badge`, `Skeleton`, `EmptyState`, `StatusStrip` | URL-backed filter form, result count, ordinary module links, pagination semantics. |
| `/charge-agreements/new`, `/edit` | `Field`, `Input`, `Select`, `Combobox`, `Button`, `Table`, `StatusStrip`, `Toasts`, `Dialog` | Grouped agreement form and exact-version line editor; dirty-state guard. |
| `/charge-agreements/[agreementId]` | `Badge`, `Button`, `Table`, `Tabs`, `Dialog`, `StatusStrip`, `Toasts`, `Skeleton` | Identity header, applicability facts, immutable terms, version history, audit disclosure. |
| `/charge-agreements/rates` | Same list primitives | Unified category filter; BASE/SURCHARGE lane and LOCAL/POL applicability presentations. |
| `/charge-agreements/rates/new` | Form primitives and `StatusStrip` | Category-driven fields without teaser controls; USD/per-container fixed facts. |
| `/charge-agreements/rates/[rateId]` | Detail/version primitives | Derived state, effective window, dependent agreements, successor action. |
| `/charge-agreements/manual-pricing` | Filter/table/status/skeleton primitives | Queue + selected evidence region; no assignment/manual amount/approve/resolve/close controls. |
| Existing Booking pricing region | `Table`, `Badge`, `Button`, `StatusStrip`, `Skeleton`, `Tabs`/ordinary selector | Minimum itemisation/provenance/current-prior composition only; Booking owns page/navigation. |

## Shared-Primitive Gaps and Ownership

| Gap | W2-03 treatment | Owner/follow-up |
|---|---|---|
| No exported `IconButton` | Use a native named `<button>` with Lucide icon, token classes, fixed 44px coarse-pointer target, tooltip/title, and existing focus ring. Keep composition inside Charge/Booking owner; do not publish a new shared abstraction. | Record as a possible W2-02 shared primitive; W2-03 does not edit `packages/ui`. |
| No exported pagination primitive | Compose native `<nav aria-label="Pagination">`, `Button`, links, current-page text, and total count locally. | Possible W2-02 primitive; no W2-03 package change. |
| No generic `Alert` | Use `StatusStrip` plus semantic heading/text and native links/buttons. | No gap requiring package work. |
| No date picker | Use labelled native date input with `Field`/`Input`; ISO value and locale-readable display on detail. | No new dependency. |
| No data-grid/bulk editor | Do not add one; inline/bulk commercial mutation is outside the approved interaction model. | Explicitly rejected. |

### Blocking Shared-Capability Dependencies

| ID | Current observed limitation | W2-03 permitted treatment | Acceptance status |
|---|---|---|---|
| DS-01 | Shared `Dialog` focuses its container and handles Escape but does not trap Tab or restore the trigger. | Charge lifecycle-dialog composition wraps the existing `Dialog`, stores/restores the trigger, and scopes a Tab loop while open. It is domain code, not exported/shared. W2-02 remains owner of a general fix. | Must be proven in Charge Playwright; if the wrapper cannot meet it without changing `packages/ui`, the accessibility cell is blocked, not passed. |
| DS-02 | Shared `Combobox` lacks `aria-activedescendant` and explicit async loading/error inputs. | Use surrounding `Skeleton`/`StatusStrip`; mount only after settled options. Do not claim full active-option semantics. Use existing native `Select` only where the complete option set is small/usable. | Full combobox AA cell remains blocked until W2-02 enhancement is integrated or an approved standards-compliant existing primitive is available. |
| DS-03 | Shared `PlatformShell` always renders a title-inferred ribbon; no route-metadata suppression seam exists. | Charge does not hide/restyle shell with local CSS. Integrate the W2-02 shell seam through the program merge protocol. | All Charge no-ribbon Playwright cells are blocked until DS-03 is integrated. |

These local compositions are page/domain code, not a parallel component library. Any reusable shared proposal follows the Wave A merge protocol and W2-02 ownership.

## Token and Content Mapping

- Consume only `--erp-*` tokens and shared token-aware primitives. No raw hex values, gradients, remote fonts, or Charge-local theme variables.
- Use `--erp-font-sans`; use mono only for agreement/rate/pricing/correlation identities and copyable evidence.
- Status labels are Draft, Approved, Scheduled, Effective, Suspended, Expired, and `MANUAL_PRICING_REQUIRED`; semantic color is always paired with text/icon.
- Money always displays currency, unit rate, basis, quantity, calculated line amount, total, and source version/reference.
- Primary operator copy uses domain language. HTTP/status codes appear only where they are the actionable business code or in collapsed audit evidence.

## Skill Recommendations Accepted and Rejected

Accepted: data-dense scannable tables, filtering, blur validation, explicit error announcements, keyboard order, stable hover feedback, reduced motion, responsive table handling, and testing at 375/768/1024/1440.

Rejected: Enterprise Gateway/marketing structure, hero/video, logo carousel, Contact Sales, industry tabs, KPI/chart dashboard, new blue/amber palette, Fira fonts, remote imports, spinner-first loading, scale hover, new shell/nav, and changes to `packages/ui`. The Next.js skill suggestion to default every mutation to Server Actions is advisory only; Application Design must preserve the existing authenticated BFF, `api-core`, query/state, and security seams.

## Verification Gate

- [ ] No W2-03 diff under `packages/ui` or shared shell/navigation/token files.
- [ ] Every changed page imports existing shared primitives/tokens before local semantic composition.
- [ ] No local palette, typeface, theme control, generic UI library, chart dependency, or remote font.
- [ ] DS-01 dialog wrapper/shared fix proves Tab trap and trigger restoration without a `packages/ui` W2-03 edit.
- [ ] DS-02 combobox semantics are either satisfied by integrated W2-02 capability or the affected acceptance cell remains explicitly blocked.
- [ ] DS-03 integrated shared-shell route metadata hides the workflow ribbon; Booking retains its existing journey context. Current title inference is not a pass.
- [ ] Required states, four widths, two themes, keyboard paths, and real API data are evidenced in Playwright.
