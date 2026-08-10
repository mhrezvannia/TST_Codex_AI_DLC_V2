# Design System Mapping - W1-01 Booking

## Visual Tokens

| Concern | Existing token/use |
|---|---|
| Typography | `--erp-font-sans`; `--erp-font-mono` for references/codes/amounts |
| Density | `--erp-space-1` through `--erp-space-8`; compact 32-40px desktop controls, 44px touch target |
| Radius | `--erp-radius-sm` and `--erp-radius-md` only; no pill containers except status badges |
| Surfaces | `--erp-color-bg`, `surface`, `surface-2`; unframed sections with border separators |
| Commands | `--erp-color-primary` / `on-primary`; one primary lifecycle command |
| Status | success, warning, danger, info foreground/background pairs plus visible text/icon |
| Focus | `--erp-focus-ring`; never suppress native/programmatic focus |

Both light and dark token themes already have contrast tests. W1 does not add a color family, gradient, decorative blob, or local hardcoded hex.

## Primitive Mapping

| UI element | `@erp/ui` primitive | W1 adaptation |
|---|---|---|
| Search/reference selectors | `Input`, `Combobox`, `Field` | Server-backed options, loading/empty/error text |
| Status and lifecycle | `Badge`, `StatusBadge`, `StatusStrip` | Add explicit lifecycle step semantics/icons in Booking composition |
| Work queue | `Table`, `Skeleton`, `EmptyState` | Real links, sorting/paging, semantic caption |
| Section navigation | `Tabs` | Six domain sections; scrollable compact layout |
| Commands | `Button` | Exactly one primary; icon-only for refresh/new where familiar |
| Confirm | `Dialog` | Booking/route/equipment/quote review and focus return |
| Transient feedback | `Toasts` | Creation/pricing command acknowledgement only |
| Layout | `Stack`, `Inline` plus CSS classes | No Booking-local inline style objects |

## New Shared Capability

`IconButton` is the only required new primitive: native button semantics, lucide icon, tooltip, accessible label, fixed 44px target, and stable disabled/loading dimensions. Use `Plus`, `RefreshCw`, `ArrowLeft`, `Search`, `ChevronLeft`, and `ChevronRight` from `lucide-react`; do not draw SVGs manually.

An `Alert` primitive is optional only if `StatusStrip` cannot expose persistent `role=status`/`role=alert` variants with title/body/action. Prefer extending the existing semantic primitive over a duplicate.

## Composition Rules

- Page bands and domain sections are unframed; no card-inside-card composition.
- The quote rail is an `aside` separated by border, not a floating card.
- Dialog is the only confirmation overlay; creation is not a drawer/wizard.
- Table rows remain dimensionally stable across loading/hover/selection.
- Labels, errors, badges, and long reference codes fit at 360px without overlapping actions.
- Operator UI hides Kafka offsets/schema internals; Audit shows correlation/event identity only when expanded.

## W2-02 Inheritance Boundary

W1 reuses the W2-02 tokens, primitives, typography, semantic colors, and operational density already merged into `@erp/ui`. It does not implement global shell navigation, app-wide theme migration, fake capacity, D&D content, extra equipment behavior, or unrelated module redesign.

## Upstream Trace

Mapping implements `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md` against current `packages/ui` capabilities.
