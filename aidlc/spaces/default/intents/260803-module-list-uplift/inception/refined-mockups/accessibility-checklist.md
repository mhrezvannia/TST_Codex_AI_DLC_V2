# Accessibility Checklist - W4-01 Module List-Detail Uplift

## Scope and Evidence Standard

This checklist consumes the approved `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, `team-practices.md`, `mockups.md`, `interaction-spec.md`, and `design-system-mapping.md`. It applies to Reference Data, Charge Agreements, and Container Movement inside the single LinerCore shell.

The design target is WCAG 2.2 AA; W4 acceptance must at minimum prove the approved WCAG 2.1 AA baseline. A checked design-intent item is not a runtime conformance claim. Runtime rows remain BLOCKED until verified on the integrated isolated Compose stack.

## Structure and Navigation

- [ ] Each route has exactly one descriptive H1 and ordered H2/H3 hierarchy.
- [ ] Existing shell header, navigation, main, and complementary landmarks remain unique and correctly named.
- [ ] Skip-to-main is the first focusable shell control and lands before route content.
- [ ] Breadcrumbs and Back links have descriptive names and do not rely on browser history alone.
- [ ] Current module and tab/view are exposed programmatically and visually.
- [ ] Direct deep links and refresh preserve exact identity and focus starts at a logical heading.
- [ ] Denied routes expose no provider data before authorization resolves.
- [ ] Safe `returnTo` restores supported query state and row focus; rejected context falls back safely.

## Keyboard and Focus

- [ ] Every action is operable with native link, button, input, select, and disclosure semantics.
- [ ] No clickable row/card/icon, hover-only affordance, keyboard trap, or positive `tabindex` is introduced.
- [ ] Shared focus indicators remain visible at 3:1 non-text contrast in both themes.
- [ ] Tab order follows DOM and visual order at every viewport; CSS does not reorder meaning.
- [ ] Tables use one native identity link per row; visual arrows are not duplicate focus targets.
- [ ] Tabs use the executable shared keyboard pattern and associate tab and panel correctly.
- [ ] An overflow wrapper is focusable/labelled only while it scrolls and never traps navigation.
- [ ] Dialogs, where used, trap focus, support Escape when safe, and restore the trigger.
- [ ] In-flow mobile/tablet tasks focus their heading/field and restore the trigger on Cancel.

## Forms, Validation, and Outcomes

- [ ] Every field has a persistent visible label, programmatic association, help/error links, and input mode.
- [ ] Required meaning is explicit; placeholders do not substitute for labels.
- [ ] Canonical Reference values use approved lookups; raw IDs are fallbacks, not editable guesses.
- [ ] Validation runs on submit and selectively on blur without noisy per-keystroke announcements.
- [ ] Error summary receives focus and links to invalid controls; values remain after recoverable failure.
- [ ] Pending state is announced once and prevents duplicate submission without disabling unrelated recovery.
- [ ] Success is announced only after authoritative provider response/re-read.
- [ ] Version conflict, duplicate, and sequence rejection focus a persistent summary and retain input.
- [ ] Unknown network outcome provides authoritative refetch without a false success claim.
- [ ] Dirty-navigation confirmation clearly names the consequence and provides safe Cancel.

## Tables, Lists, Timelines, and Data

- [ ] Tables have captions, real headers, correct scopes, and no layout-table semantics.
- [ ] Counts/page status come from provider evidence; absent totals are not fabricated.
- [ ] Empty copy distinguishes true empty from filtered empty only where a real filter exists.
- [ ] Mobile records use semantic lists/headings/definition relationships and one identity link.
- [ ] CMM timeline uses `ol`/`li`; static evidence is not a tab stop.
- [ ] Provider code is paired with readable meaning in visible and accessible text.
- [ ] Dates include year/timezone; money includes currency/basis; IDs wrap and remain copyable.
- [ ] Missing, stale, partial, and unavailable meaning is textual and scoped.
- [ ] Technical details are collapsed, sanitized, access-appropriate, and omit secrets/raw payloads.

## Status, Color, Motion, and Content

- [ ] Status, permission, freshness, conflict, publication, and application never rely on color alone.
- [ ] Normal text meets 4.5:1; large text and UI/focus boundaries meet 3:1 in both themes.
- [ ] Icons have adjacent text or names; decorative icons/connectors/skeletons are hidden.
- [ ] Shared tokens supply all color, spacing, typography, focus, elevation, and motion.
- [ ] Reduced motion removes nonessential transition without hiding state.
- [ ] Skeletons reserve stable shapes and avoid repetitive live announcements.
- [ ] Copy uses domain language, actionable recovery, and safe references; no raw stack traces.
- [ ] Persistence, publication, and Booking application are distinct only when evidenced.

## Responsive, Zoom, and Touch

- [ ] Core flows work at 375, 390, 768, 1024, and 1440 CSS pixels.
- [ ] Both supported LinerCore themes pass at every width.
- [ ] No page-level overflow; intentional table/tab overflow is local, labelled, keyboard reachable.
- [ ] Interactive targets are at least 44 by 44 CSS pixels with usable spacing.
- [ ] At 200%/400% zoom, content reflows without overlap, clipping, or lost action.
- [ ] Text spacing and long localized labels do not obscure identities, errors, statuses, or actions.
- [ ] At 768px action rails stack in DOM order; no domain-local Drawer or trap is introduced.
- [ ] At 1024/1440px bounded widths preserve readable measure and operational density.

## Async, Failure, and Recovery Announcements

| Event | Announcement | Focus rule |
| --- | --- | --- |
| Filter/page/limit/Refresh | Polite provider-backed count/page/returned update. | Invoking control retains focus. |
| Route load | No repetitive message; final H1/status is available. | Route heading or restored target. |
| Partial/stale | Dependency, trusted time, and disabled unsafe action named. | Stay in current region. |
| Validation failure | One summary plus linked field errors. | Error summary. |
| Save/capture pending | One polite pending message. | Action/form remains context. |
| Accepted | Persisted/CMM-accepted only after re-read. | Success summary/detail heading. |
| Conflict/rejection | Provider current state and safe guidance. | Conflict summary. |
| Provider failure | Safe failure and Retry/reference. | Failed-region heading or Retry. |

Polling or background refresh must not repeatedly announce unchanged content or move focus.

## Module-Specific Acceptance

### Reference Data

- [ ] Set/record links include code and readable label.
- [ ] Include-inactive/pagination updates announce provider-backed results and retain focus.
- [ ] Attributes are labelled values, not raw JSON.
- [ ] History failure remains scoped when other views are usable.
- [ ] Edit conflicts retain the draft and expose current version.

### Charge Agreements

- [ ] Agreement number, version, lifecycle, customer, coverage, and validity have context.
- [ ] Amounts include currency, basis, category, and exact bound version.
- [ ] D&D unavailable/degraded copy does not imply zero allowance or success.
- [ ] Approved immutability and read-only state are textually explicit.
- [ ] Unsupported Booking links and generic search/sort are absent, not disabled promises.
- [ ] Exact supporting rate links name rate/category/version and restore Agreement context safely.
- [ ] Rate Authority list/detail/history retains one H1, provider-backed filtering, immutable approved evidence, and scoped failure recovery.
- [ ] Manual-pricing evidence identifies Booking/reason/opened time/status while exposing no resolution controls.
- [ ] Approval Queue kinds remain independently labelled, filtered, paged, and announced; unavailable server filtering is not simulated in the browser.

### Container Movement

- [ ] No CMM frontend/runtime accessibility PASS is claimed before implementation.
- [ ] Recent list offers only limit/Refresh and announces `returned`, not total.
- [ ] Timeline distinguishes Planned/Recorded and pairs code with readable meaning.
- [ ] Capture appears only with server permission and `captureEnabled=true`.
- [ ] Capture errors/conflicts/unknown outcomes retain values and focus correctly.
- [ ] No correction, publication, or Booking application state appears without public evidence.
- [ ] Booking-to-Journey lookup announces exact link, `Journey not created`, denied, or dependency failure without guessing an ID; return focus restores the Booking relationship region.

## Test Evidence Matrix

- [ ] Axe returns no serious/critical violations on every route/state fixture.
- [ ] Keyboard-only walkthrough covers shell, lists, tabs, forms/tasks, conflicts, links, and return focus.
- [ ] NVDA on Windows plus one additional target AT verifies structure, tables/records, forms, live regions, and timeline.
- [ ] Contrast is measured in both themes, including status, focus, read-only, error, and conflict.
- [ ] Playwright covers all widths/themes, long/missing data, empty/error/denied/stale/partial, and no overflow.
- [ ] Zoom/reflow, text spacing, reduced motion, and touch measurements are retained.
- [ ] Integrated shell tests prove no duplicate shell/theme, no denied-data flash, and exact deep-link/return behavior.
- [ ] Live Compose, `aidlc-audit`, and `erp-fidelity-audit` are green before a release claim.

## Blocked Evidence

All implementation-dependent checkboxes remain unchecked. CMM frontend/mount, provider capabilities, cross-link identifiers, shared primitive gaps, and live browser/Compose evidence have named owners and exit conditions in `interaction-spec.md` and `design-system-mapping.md`. Static design review cannot close them.

## Review

**Verdict: READY FOR PRODUCT REVIEW.** The checklist covers the approved requirements, stories, rough flows, team practices, complete state matrix, five-width/two-theme contract, and provider-truth boundaries without claiming runtime conformance.
