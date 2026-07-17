# Accessibility Checklist - W1-01 Booking

## Global WCAG 2.1 AA

- [ ] One `main` landmark and one visible `h1` per route; heading order does not skip levels.
- [ ] Skip link reaches main content; browser title identifies list/create/specific booking.
- [ ] All actions complete with keyboard only; visible focus meets contrast and is never clipped.
- [ ] Text contrast is at least 4.5:1; large text and non-text UI at least 3:1 in light/dark themes.
- [ ] Status is conveyed by text and semantic icon as well as color.
- [ ] No content overlaps at 360, 768, 1200, and 1440px; 200% zoom remains operable.
- [ ] Motion honors `prefers-reduced-motion`; polling updates do not animate layout.
- [ ] Touch targets are at least 44x44px; desktop density does not reduce touch targets on coarse pointers.

## Booking List

- [ ] Search has visible label or accessible name; status filter has label; Reset appears only when applicable.
- [ ] Table has caption, scoped headers, deterministic sort announcement, and real booking links.
- [ ] Clickable-row styling does not replace link/button semantics.
- [ ] Loading skeletons are hidden from assistive tech and one concise loading status is announced.
- [ ] First-use empty, filter empty, and service error have distinct messages/recovery actions.
- [ ] Pagination announces current page and disables unavailable Previous/Next controls.

## Create Booking

- [ ] Customer, commodity, routing, voyage, equipment type, and equipment ID have persistent labels.
- [ ] Comboboxes expose `aria-expanded`, `aria-controls`, active option, selection, loading, and no-results states.
- [ ] Quantity/currency fixed values remain perceivable and explain why they cannot change.
- [ ] ISO 6346 errors are linked with `aria-describedby`; invalid controls expose `aria-invalid=true`.
- [ ] Failed submit focuses a summary whose links move focus to each invalid field.
- [ ] Busy submit prevents duplicate action without removing button text/dimensions; failure preserves values.
- [ ] Sticky mobile actions reserve page space and never cover the final field/error.

## Booking Detail

- [ ] Lifecycle strip is an ordered list with current step via `aria-current=step`; blocked reason is textual.
- [ ] Tabs use `tablist/tab/tabpanel`, arrow keys, Home/End, and visible selected/focus states.
- [ ] Quote `aside` has an accessible heading; exactly one primary lifecycle action is exposed.
- [ ] Confirm dialog names booking/route/equipment/total, traps focus, supports Escape before submit, and returns focus.
- [ ] Journey pending is announced once; each poll is not announced.
- [ ] Successful status update uses a polite live region; timeout remains a pending message, not an error alert.
- [ ] Retry/Refresh icon buttons have tooltip and accessible names; icons are decorative inside named buttons.
- [ ] Audit disclosure exposes expanded state and does not place transport internals in the primary reading order.

## Responsive and Content Stress

- [ ] Long customer names, booking refs, UN/LOCODEs, voyage/equipment codes, amounts, and translated messages do not overlap controls.
- [ ] Mobile list rows preserve label/value association instead of relying on table column position.
- [ ] Scrollable tabs show focus and do not trap horizontal keyboard navigation.
- [ ] Quote rail moves below lifecycle on tablet and collapses after lifecycle on mobile without changing action order.
- [ ] Error summaries and dialogs fit at 320-360px with internal wrapping, not horizontal page scroll.

## Verification Matrix

| Check | Tool/method | Gate |
|---|---|---|
| Component semantics | Testing Library + axe-compatible assertions if dependency is adopted | Blocking |
| Keyboard paths | Playwright list/create/detail/confirm/pending flow | Blocking |
| Contrast | Existing `packages/ui/src/contrast.test.ts` plus new states | Blocking |
| Desktop/mobile no-overlap | Playwright screenshots and bounding-box assertions | Blocking |
| Screen-reader announcements | DOM role/live-region assertions + manual spot check | Blocking for deterministic assertions |
| Reduced motion | Media emulation and transition check | Blocking |

## Upstream Trace

Checklist verifies UX behavior from `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`; detailed interaction decisions are in `interaction-spec.md` and `refined-mockups-questions.md`.
