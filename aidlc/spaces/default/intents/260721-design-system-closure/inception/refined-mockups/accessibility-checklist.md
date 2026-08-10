# Accessibility Checklist — Booking Reference Closure

## Scope and Evidence Status

This checklist refines `wireframes.md` and `user-flow.md`, provides acceptance detail for `stories.md` and `requirements.md`, and follows the live-proof rule in `team-practices.md`. Target: WCAG 2.1 AA-oriented project compliance for the changed Booking surfaces. This document is a specification, not a PASS claim; every unchecked item requires live or automated evidence under `artifacts/w2-02-live/`.

## Global Shell and Structure

- [ ] Exactly one banner, navigation system, and main landmark exist on canonical Booking routes.
- [ ] The skip link is the first practical focus target and moves focus to main content.
- [ ] Booking is identified as the current navigation item without color-only meaning.
- [ ] Every route has one descriptive h1 and logical h2/h3 order.
- [ ] Page language and title remain correct through the existing shell.
- [ ] Route changes do not produce unexpected focus movement or duplicate announcements.

## Keyboard and Focus

- [ ] Every command, filter, row action, form control, disclosure, tab, and lifecycle action is reachable without a pointer.
- [ ] Tab order matches visible reading/task order at 375, 768, 1024, and 1440.
- [ ] Every interactive element has a visible `--erp-focus-ring` indicator in both themes.
- [ ] No keyboard trap exists outside an active Dialog.
- [ ] Dialog focus is trapped, Escape closes when safe, and dismissal restores focus to its trigger.
- [ ] Shared Tabs, when present, use arrow-key selection and Tab entry/exit semantics.
- [ ] Contained table scrolling is keyboard accessible and does not trap page navigation.
- [ ] Filtering and pagination retain a sensible focus target.

## Booking List

- [ ] Search and status filters have persistent visible labels.
- [ ] Result count changes are announced politely after settled filtering.
- [ ] Table headers, cells, and sort state retain semantic relationships.
- [ ] Booking row actions expose the record reference in their accessible name.
- [ ] Status Badge includes readable text/icon and is not color-only.
- [ ] Loading Skeleton uses one appropriate busy/status announcement without repeated noise.
- [ ] Empty dataset and no-match states are distinguishable and expose the correct create/reset action.
- [ ] Error/retry, denied, and degraded states identify impact and recovery in plain language.
- [ ] At 375px, essential columns/actions remain available within a contained scroller and the page has no horizontal overflow.

## Booking Create

- [ ] Every control has a persistent programmatic label; placeholders are supplementary only.
- [ ] Help and error text are connected with `aria-describedby` or equivalent semantics.
- [ ] Related fields use headings or fieldset/legend where grouping benefits comprehension.
- [ ] Appropriate input types/input modes are preserved.
- [ ] Lookup loading/error/empty behavior is scoped to the dependent field and does not erase other values.
- [ ] Blocked submit moves focus to a validation summary that links to each invalid field.
- [ ] Inline errors are specific, textual, and announced without repeating on every keystroke.
- [ ] Pending submission is announced and duplicate submission is prevented.
- [ ] Service failure preserves valid values and provides keyboard-reachable retry.
- [ ] Success is announced before canonical detail navigation.
- [ ] Dirty-cancel Dialog identifies unsaved scope and restores trigger focus.

## Booking Detail and Lifecycle

- [ ] Reference, textual status, and permitted actions appear before secondary evidence.
- [ ] Summary facts use semantic definitions or equivalent structured markup.
- [ ] Lifecycle entries expose readable label, timestamp, source/evidence, and state without color-only meaning.
- [ ] Long identifiers wrap or provide the full accessible value.
- [ ] Not-found and denied states are distinct and provide safe canonical navigation.
- [ ] Partial/degraded sections preserve available content and scope Retry correctly.
- [ ] Pending/error/success action updates identify the action and Booking reference.
- [ ] Technical audit disclosure has an accessible name/state and remains secondary.
- [ ] Raw payload content does not create an unexpected focus burden while collapsed.

## Perceivable, Theme, Motion, and Reflow

- [ ] Project contrast tests pass for normal text (4.5:1 target), large text (3:1), and UI/focus indicators (3:1) in both themes.
- [ ] Semantic state is communicated by text and/or icon in addition to color.
- [ ] Content reflows at 375, 768, 1024, and 1440 with no overlap, clipped controls, hidden primary action, or page-level horizontal scroll.
- [ ] At 200% zoom, task content and controls remain operable without two-dimensional page scrolling except the intentional data-table region.
- [ ] `prefers-reduced-motion` removes non-essential animation; no transition moves/scales layout.
- [ ] Skeletons reserve final dimensions and do not cause material layout shift.
- [ ] No flashing, parallax, scroll-jacking, remote-font delay, or decorative animation is introduced.

## Automated and Manual Evidence Matrix

| Evidence ID | Route/state | Method | Required result |
|---|---|---|---|
| A11Y-001 | `/booking` populated, empty, error, denied | Playwright + accessibility scan | zero critical/serious violations; state roles/names present |
| A11Y-002 | `/booking/new` initial, validation, pending, error | keyboard Playwright + DOM assertions | complete tab path, labels/errors connected, values preserved |
| A11Y-003 | created Booking detail populated/degraded/action states | keyboard Playwright + accessibility scan | focus/status/lifecycle assertions pass |
| A11Y-004 | dirty-cancel Dialog | keyboard Playwright | trap, Escape, name, description, and restoration pass |
| A11Y-005 | both themes | contrast unit tests + live scan | project contrast gates pass |
| A11Y-006 | widths 375/768/1024/1440 | screenshots + overflow assertions | no page overflow, overlap, clipping, or hidden primary action |
| A11Y-007 | reduced motion | emulated media query | non-essential transitions removed; state remains understandable |
| A11Y-008 | full create-to-confirm | keyboard-only live route | no inaccessible dead end; announcements and focus targets recorded |

## Manual Review Record

For each evidence ID record:

- commit and canonical URL;
- Compose project (`linercore-wave-a`);
- viewport, theme, reduced-motion setting, and browser;
- setup/state-generation method;
- keyboard sequence and expected/actual focus target;
- expected/actual live announcement;
- screenshot, trace, and automated scan paths;
- PASS/FAIL with defect reference.

The manager demo must be guarded before and after this evidence run. A failed or missing row keeps W2-02 acceptance-pending; it may not be replaced by source inspection, a detached component harness, or the historical W1 waiver.
