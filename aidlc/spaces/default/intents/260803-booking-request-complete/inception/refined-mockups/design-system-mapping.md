# Design System Mapping — W3-04 Booking Request Completeness

## Source and authority

This mapping refines `ideation/rough-mockups/wireframes.md` and `ideation/rough-mockups/user-flow.md`, supports `inception/user-stories/stories.md`, implements `inception/requirements-analysis/requirements.md`, and follows `inception/practices-discovery/team-practices.md`.

Binding UI authority is `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, executable `packages/ui`, and approved Booking designs 10–13. Page detail is the approved `docs/ui-ux-design/25-booking-request-completeness.md`. No W3-04 page override currently exists; proposed content is recorded here but not written to the design-system tree.

## Authority resolution

| Topic | Decision |
|---|---|
| Shell/chrome/session | Canonical shared authenticated shell; Booking does not recreate it |
| Route family | `/booking` canonical; `/bookings` compatibility only |
| Tokens | Executable `--erp-*` variables from `packages/ui/src/styles.ts` |
| Typography | `--erp-font-sans` (IBM Plex Sans/system stack); older Inter page note is superseded |
| Icons | Shared Lucide mappings; no emoji/status glyph invention |
| Theme | Light-first and shared dark tokens; no Booking-local or dark-default palette |
| Status | Semantic token + text and/or icon; never color alone |
| Accessibility | Binding LinerCore and approved-requirements baseline: WCAG 2.1 AA; selected WCAG 2.2 techniques are advisory only |
| Responsive | Verify 375, 390, 768, 1024, 1440; no page-level mobile overflow |

UI/UX Pro Max recommendations retained: data-dense operational form/detail, clear recovery, persistent labels, stable Skeletons, visible focus, keyboard-complete controls, non-layout-shifting async feedback, App Router loading boundaries. Rejected: marketing gateway, hero/video, logo carousel, sales CTA, replacement palette/font, decorative charts, ornamental gradients, and spinner-led blank screens.

## Ownership map

| Layer | Owner | Reuse/extension rule |
|---|---|---|
| Top bar, navigation, session, user menu, breadcrumbs, skip link, global status | Shared shell | Reuse unchanged |
| Tokens, general inputs, feedback, Dialog, route-link primitives | W2-02 / `packages/ui` | Reuse; propose shared gaps to owner |
| Request form and five semantic sections | Booking | Booking composition of shared primitives |
| Completeness and one-next-action precedence | Booking | Domain composition driven by authoritative state/permissions |
| Canonical parties, commodity, package, locations, voyage/schedule, equipment type | Reference Data | Live governed options and provenance; no copied master lists |
| Pricing states and amounts | Charge authority captured by Booking | Display only authoritative result; retain immutable history |
| Pending/physical assignment and journeys | CMM/later assignment intent | W3 shows pending request; invents no container |

## Shared primitive mapping

| Designed need | `@erp/ui` primitive | Usage notes |
|---|---|---|
| Page breadcrumb/title/status/action | `Breadcrumbs`, `PageHeader`, `RecordHeader` | Shell-aligned framing; one `h1` |
| Detail view navigation | `RouteTabs` | Stable link navigation with current page semantics |
| Vertical/horizontal layout | `Stack`, `Inline` | Token spacing; no inline style system |
| Bounded evidence groups | `Card`, `DefinitionList` | Avoid decorative card nesting; use for real grouped evidence |
| Persistent form label/help/error | `Field` | Active hint/error IDs; visible optional labels |
| Text/date/numeric input | `Input` | `type`/`inputMode` by data; browser spinners not required for operation |
| Multiline cargo description | Shared `TextArea` + count support (missing dependency) | Must follow Field label/help/error and token contracts; owned by W2-02/UI Platform, not Booking |
| Small controlled enum where appropriate | `Select` | Not for searchable governed reference sets |
| Canonical reference search | `Combobox` | Existing query filtering, committed-option, visible `emptyLabel`, invalid/described-by, keyboard, full-Field-width list, long-label wrapping, 240px max height, and vertical scrolling; no collision/flip or custom count/selection announcement claim |
| Primary/secondary/retry actions | `Button` | Busy/disabled semantics and explicit labels |
| Lifecycle/completeness markers | `Badge`, `StatusBadge` | Text plus semantic tone/dot/icon; domain map may need additive statuses |
| Inline async/recovery state | `StatusStrip` | Dedicated live semantics; no whole-form live region |
| Loading | `Skeleton` | Content-shaped, dimension-reserving, hidden from accessibility tree |
| Partial data | `PartialDataNotice` | Missing safe evidence with precise recovery |
| Concurrent/revision conflict | `ConflictStrip` | Focusable programmatically after failed action |
| Safe terminal state | `FailureState` | Denied/not-found/unavailable without protected leakage |
| Confirmation/discard | `Dialog` | Focus trap/restore and safe Escape behavior |
| Collapsed diagnostics | `TechnicalDetails`, `IdentifierValue`, `CopyButton` | Safe code/correlation only; no raw party/cargo payload |
| Icons | `LucideIcon` | Shared names/sizing; hidden when decorative |

## Booking-owned compositions

These remain in Booking because they encode domain rules:

| Composition | Shared building blocks | Domain responsibility |
|---|---|---|
| `BookingRequestForm` | Field/Input/Combobox/Button/Stack | Five groups, create/correct, preservation, pricing-basis dirty state |
| `ReferenceFieldState` | Field/Combobox/StatusStrip/Skeleton | Governed ID/version/role/active-state truth |
| `CarrierScheduleEvidence` | DefinitionList/StatusStrip/Skeleton | Requested-versus-derived schedule and provenance |
| `BookingReviewAndSave` | DefinitionList/Button/StatusStrip | Unsaved/saving/saved truth and draft/correction actions |
| `BookingCompletenessSummary` | Badge/StatusStrip/DefinitionList | Missing/invalid/stale reasons from server authority |
| `BookingNextAction` | Button/StatusStrip | FR-015 precedence and permission-specific result |
| `BookingConfirmationImpact` | Dialog/DefinitionList/Button | Revision, price, route/schedule, type x quantity, no assignment |
| Route-backed Overview/Charges/Journey/Activity | RecordHeader/RouteTabs/domain compositions | Stable Booking operational record |

## Shared-platform mapping and remaining gaps

| Gap | Proposed action | Owner | W3-04 constraint |
|---|---|---|---|
| Cargo description | Add/reuse a shared multiline `TextArea` with token-consistent character-count support | W2-02 / `packages/ui` | Required by the reviewed page design for the 1–500 character commercial description; W3-04 must not substitute a Booking-local primitive or silently reduce it to a single-line `Input` |
| Combobox loading | Compose `Skeleton` plus `StatusStrip` before mounting the shared Combobox | W3-04 | Preserve dimensions and do not fork the primitive |
| Combobox no-match/invalid | Use `emptyLabel`, `invalid`, and `describedBy` | W3-04 | No free-text commit |
| Stale/inactive selected reference | Preserve prior snapshot in `DefinitionList`/`StatusStrip`; offer a replacement shared Combobox without feeding the stale value | W3-04 | Booking owns domain recovery; Reference Data remains authoritative |
| Combobox keyboard/long-label/mobile list | Use the existing shared listbox keyboard contract, full-Field width, wrapping, 240px max height, and vertical scrolling. Booking keeps Fields within page gutters and reserves at least 256px block-end page space below the final reference field. | W3-04 + W2-02 review | No automatic collision/flip claim; verify page-scroll containment at every required viewport and route any general collision/flip extension to W2-02 |
| Combobox announcements | Use visible `emptyLabel` for no-match and native listbox/value semantics. Booking-owned `#reference-status` announces loading, stale/authority failure, and explicit Retry/Refresh outcomes. | W3-04 | No custom option-count or selection-change live announcement claim |
| Additive Booking lifecycle/status vocabulary | Extend shared StatusBadge mapping only through owner review where truly cross-domain | W2-02 | Booking can supply visible domain label without local palette |
| Role-aware/enriched Reference Data options | Add provider/BFF contracts and live projections | Shared Platform | No copied option lists or guessed schedule |

## Token and visual rules

- Background, surfaces, borders, text, semantic states, radius, shadow, spacing, motion, and focus come only from `--erp-*` tokens.
- Use `--erp-focus-ring`; never remove or clip visible focus.
- Dense operational typography is preferred; no oversized marketing title or decorative hero.
- Page content maximum is approximately 1180px inside the shell. At 1440, form target is about 760px plus 280–340px review rail. At 1024, retain a grid only when the form remains at least 640px.
- Control height is 40px desktop and at least 44px on mobile. Long governed labels wrap; meaningful codes/quantities remain visible.
- Use spacing/border hierarchy rather than stacks of decorative cards.
- Async motion remains 150–300ms only where helpful, does not shift layout, and respects reduced motion.

## Responsive mapping

| Width | Shell | Form/detail mapping |
|---|---|---|
| 375/390 | Canonical mobile shell/drawer | One column; 16px gutter; Review/actions inline; view links may scroll intentionally |
| 768 | Canonical compact shell | One column; two-up only if each control ≥260px; readiness stacks |
| 1024 | Approved collapsible shell behavior | Form/rail only if usable; detail two-column when content supports it |
| 1440 | Persistent approved shell | 1180px content; main/rail composition and dense detail workbench |

No breakpoint introduces a fixed mobile action bar, hidden required evidence, page-level horizontal scrolling, alternative navigation, or duplicated shell.

## Proposed page override

**Approval status:** Proposed and pending the Refined Mockups gate. Gate approval accepts this page-level contract for later governed use; it does not authorize creating the file, editing `MASTER.md`, changing `packages/ui`, or modifying production code.

Proposed future `design-system/linercore/pages/booking-request-completeness.md` content; do not write it in this stage:

```markdown
# Booking Request Completeness

- `/booking` is canonical; `/bookings` is compatibility only.
- Use Booking and parties, Cargo, Route and schedule, Equipment request, Review and save.
- Initial draft/confirmation uses equipment type x quantity and null `equipmentId`; never fabricate a container.
- Requested departure is a POL-local preference; derived voyage schedule is read-only provenance-backed evidence.
- Preserve user input across reference, validation, save, pricing, conflict, and service failures.
- Detail exposes one authorized next action; Charges owns detailed pricing evidence.
- Review rail is conditional at 1024/1440 and inline at 375/390/768; mobile actions stay in flow.
- Use shared shell, `@erp/ui`, and `--erp-*`; Booking domain compositions remain in Booking.
```

## Compliance checklist

- [x] One authenticated shell and canonical Booking route family
- [x] Shared tokens/primitives reused before extension
- [x] No local palette, font, auth/session, shell, icon set, or copied primitive
- [x] No marketing, hero, decorative, or dark-default pattern
- [x] Domain-specific compositions stay with Booking
- [x] Required form/reference behavior maps to shared primitives or an explicitly owned UI Platform dependency; no Booking-local primitive is authorized
- [x] 375/390/768/1024/1440 behavior specified
- [x] Loading, empty/no-match, error, denied, pending, success, conflict, and degraded states mapped
- [x] Keyboard/focus/live-region/non-color requirements referenced
- [ ] Running light/dark/viewport evidence remains to be captured when browser/Compose access is available

## Open questions

No product-design conflict blocks the Refined Mockups gate. The shared multiline `TextArea`/counter remains an explicit W2-02 implementation dependency, and live viewport evidence must confirm that the current Combobox containment is sufficient or route a general extension to W2-02. Application Design must preserve these ownership boundaries and must not implement a Booking-local primitive substitute.
