# Interaction Spec - W1-01 Booking

## Navigation & Shell Context

W1 runs inside the Booking-local app surface because W2-01 owns the global authenticated shell. The local profile may supply the guarded local service identity; non-local startup fails closed without service identity. `/` redirects to `/bookings`; browser back/forward preserves list query state. A future W2-01 migration wraps these same routes without changing route semantics.

## Screens & Routes

| Route | Type | Purpose |
|---|---|---|
| `/bookings` | List/work queue | Search/filter/sort/page and open a booking |
| `/bookings/new` | Create | Capture one contract-valid thin booking |
| `/bookings/{bookingId}` | Detail | Lifecycle, six sections, quote rail, valid next action, returned journey status |
| `/api/bookings` | BFF collection | List/create without exposing backend container URLs to the browser |
| `/api/bookings/{bookingId}` | BFF detail | Read detail/projection and lifecycle commands through explicit subpaths |

## List Page Spec

Columns: booking reference, customer, route (`loadUnLocode` → `dischargeUnLocode`), equipment type × quantity, lifecycle status, updated time. Default sort is updated descending. Search is debounced 250 ms and reflected in `?q=`; status in `?status=`; page in `?page=`. Only the booking reference is the primary row link. No bulk actions are in W1.

Loading preserves control/table dimensions with `Skeleton`. First-use empty offers New; filtered empty offers Reset. Retry is an icon button with `RefreshCw`, tooltip, and accessible label. Error does not replace known rows with demo data.

## Detail Page Spec

Header contains Back, booking reference/revision, status badge, customer, route summary, updated time, and refresh icon. The ordered lifecycle strip exposes completed/current/blocked steps in text and semantic icons.

Tabs are Overview, Routing, Equipment, Charges, Journey, Audit. Wide detail uses `minmax(0, 1fr) 320px`; the quote/action `aside` has no nested card. Only one lifecycle command is primary at a time. Confirm uses `Dialog`; cancel/Escape returns focus to Confirm, successful submit returns focus to the detail heading and starts bounded status polling.

Journey data is read-only. Pending state explains that Booking is confirmed and CMM is asynchronous. Poll every second only while visible/focused for a cumulative 30 seconds; success and timeout stop polling. Manual Retry starts a fresh bounded cycle. Duplicate requests are prevented with an in-flight guard and server idempotency.

## States

Every route implements loading, empty/not-found, permission/profile guard, service error, success, and partial/pending states. Detail additionally implements validation blocked, pricing pending, manual pricing, priced, confirm pending, and journey active. State messages use domain language and identify recovery; raw HTTP codes may appear only in Audit/support detail.

Toast is used for transient confirmation (`Booking created`, `Pricing requested`). Persistent business states stay inline. A polite live region announces asynchronous success; validation summaries use assertive focus, not repeated toast announcements.

## Design System Usage

Reuse `Button`, `Field`, `Input`, `Select`, `Badge`, `StatusBadge`, `Table`, `EmptyState`, `Skeleton`, `StatusStrip`, `Tabs`, `Combobox`, `Dialog`, and `Toasts` from `@erp/ui`. Use token classes/stylesheets rather than Booking-local inline style objects or hardcoded colors.

Add one shared `IconButton` primitive wrapping a native button, lucide icon, tooltip, `aria-label`, fixed square dimensions, focus ring, disabled state, and 44px minimum touch target. Add a small inline `Alert` primitive only if existing `StatusStrip` cannot express persistent info/warning/error semantics; do not create a Booking-only component library.

## Domain-True Forms

Customer, commodity, load/discharge location, voyage, and equipment type are live combobox selections backed by active reference records. Values submitted use canonical IDs/codes; labels are presentation only. Currency `USD` and quantity `1` are visible fixed fields. `equipmentId` is required, normalized uppercase, and validated as ISO 6346 before submission and on the server.

The route is represented as a one-item `routing[]` model and equipment as one-item `equipment[]`, so later multi-item scope extends the domain shape instead of replacing flat W1 fields.

## Component Behavior

| Component | Inputs/state | Events | Error behavior |
|---|---|---|---|
| BookingFilterBar | query, status, busy | search, status change, reset, create | Retains values on list error |
| BookingTable | rows, sort, page, total | sort, page, open | Skeleton/empty/error variants keep dimensions |
| BookingCreateForm | reference options, values, errors, submitting | field change, submit, cancel | Summary focus + linked field errors; preserve input |
| LifecycleStrip | status, validation/pricing/journey substate | step-link navigation only | Blocked step includes text reason |
| QuoteRail | pricing snapshot, next action, busy | validate, price, confirm | Manual reason inline; no partial amount |
| BookingTabs | six fixed sections, selected ID | keyboard/select | Arrow/Home/End behavior from `Tabs` |
| JourneyStatus | pending/status/timestamps/poll budget | stop, retry | Timeout is pending, not confirmation failure |
| ConfirmDialog | booking summary, open, busy | cancel, confirm | Retains open state on failed submit and shows message |

## Accessibility & Responsiveness

Meet WCAG 2.1 AA, visible focus, keyboard-only completion, programmatic labels/errors, 4.5:1 text and 3:1 large/non-text contrast, status independent of color, semantic table/heading/landmark structure, reduced-motion behavior, and polite async announcements. Dialog traps focus; combobox and tabs retain their tested ARIA keyboard patterns.

Breakpoints are >=1200 wide, 768-1199 compact, and 360-767 stacked. Controls never overlap or clip; sticky actions reserve space. See `accessibility-checklist.md` for executable checks.

## Open Questions

1. Confirm the detail-page tab set for Booking.
   - A. Overview, Routing, Equipment, Charges, Journey, Audit (recommended)
   - B. A reduced set
   - X. Other
   - `[Answer]:` A - Use all six operational tabs.

## Upstream Trace

This specification refines `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`.
