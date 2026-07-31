# Accessibility Checklist — W2-03 Charge Tariffs & Agreements

## Upstream and Standard

This checklist verifies the approved [`wireframes.md`](../../ideation/rough-mockups/wireframes.md), [`user-flow.md`](../../ideation/rough-mockups/user-flow.md), [`stories.md`](../user-stories/stories.md), [`requirements.md`](../requirements-analysis/requirements.md), and [`team-practices.md`](../practices-discovery/team-practices.md). WCAG 2.1 AA is blocking for changed Charge routes and the minimum existing Booking pricing-region change.

## Global Route Checks

- [ ] Exactly one visible `h1` and one routed `main`; heading order is sequential and the shared skip link lands at the content heading.
- [ ] Charge administration routes suppress the journey ribbon through the integrated W2-02 route-metadata seam; current title-inferred always-rendered ribbon is dependency DS-03 and must remain a failed/blocked cell until integrated. No local CSS/shell workaround is permitted.
- [ ] Browser title identifies page and stable object identity; route reload/back/forward preserve safe list/filter context.
- [ ] All actions complete with keyboard only in visual order; focus uses the shared `--erp-focus-ring` and is never clipped.
- [ ] Text contrast is at least 4.5:1 and large/non-text UI at least 3:1 in light and dark themes.
- [ ] Status, category, validation, and selection never rely on color alone; readable text/icon remains at 200% and 400% zoom.
- [ ] Touch targets are at least 44×44 CSS px for coarse pointers; dense desktop layout does not shrink action targets below operability.
- [ ] `prefers-reduced-motion` disables nonessential transitions; no layout-shifting or scale hover behavior.
- [ ] One concise polite live region handles async status; raw repeated polling/loading changes are not repeatedly announced.

## Lists and Queue

- [ ] Search/filter controls have persistent labels, current values, clear/reset behavior, and keyboard-reachable Apply where used.
- [ ] URL-backed filters do not submit on focus/change unexpectedly; updated result count is announced once.
- [ ] Tables have captions/labelled regions, scoped column headers, real row links, stable sort indicators, and non-color status.
- [ ] Pagination is a named navigation region; current page is announced and unavailable Previous/Next controls are disabled.
- [ ] Loading skeletons preserve table/record dimensions, are hidden from assistive technology, and have one loading status.
- [ ] First-use empty, filtered-empty, service error, denied, and populated states have distinct domain copy and recovery.
- [ ] At narrow widths, a table uses labelled keyboard-reachable overflow or semantic labelled record rows; no page-level horizontal scroll.
- [ ] Manual queue selection exposes selected state and result changes without turning a row into a pointer-only control.

## Agreement and Rate Forms

- [ ] Every input has a persistent visible label, optional/required indication, hint, and linked error via `aria-describedby`/`aria-invalid`.
- [ ] Customer/location/equipment/rate-version controls expose expanded, active option, selection, loading, no-results, and service-error states. Current shared `Combobox` cannot satisfy active-option/async semantics alone (DS-02); surrounding states may use `Skeleton`/`StatusStrip`, but the full cell stays blocked until the shared capability or an approved existing alternative is integrated.
- [ ] Category changes update applicability fields predictably: LOCAL removes Destination from focus/semantics; BASE/SURCHARGE require it.
- [ ] Fixed USD and `PER_CONTAINER` facts remain perceivable and explain why they are read-only.
- [ ] Monetary input uses decimal input mode and accepts no more than two decimals; dates have clear inclusive-window labels.
- [ ] Failed submit focuses an error summary whose links move focus to the invalid field; values persist after validation/service errors.
- [ ] Save pending keeps button dimensions/text context (`Saving...`), blocks duplicates, and does not disable unrelated reading/navigation.
- [ ] Dirty-navigation dialog describes unsaved scope, traps focus, supports safe Escape/Cancel, and restores the initiating focus.
- [ ] Editable charge-line table remains keyboard operable; add/remove controls have names including row/code and never use icon alone.

## Detail, Approval, and History

- [ ] Object identity, version, lifecycle, validity/effective window, and permitted primary action are in the initial reading order.
- [ ] Approval dialog names agreement/rate version, validity, source rate versions/line count, and immutable consequence.
- [ ] Dialog traps focus, supports Escape before commit, disables duplicate approval, retains context on failure, and restores the Approve trigger. Current shared `Dialog` lacks trap/restore; the Charge-local wrapper described by DS-01 must prove both without editing `packages/ui`, otherwise this cell is blocked.
- [ ] Version-history table identifies current/selected version and never conveys changes by strike-through/color alone.
- [ ] Audit disclosure uses a native disclosure or tested equivalent with expanded state; raw transport evidence is outside primary reading order.
- [ ] Read-only/denied state removes mutation actions from focus order and states the capability requirement without exposing protected data.

## Manual-Pricing Evidence

- [ ] Only explicitly capable Pricing Analysts can reach case data; denied actors receive no count, row, reason, or correlation disclosure.
- [ ] `MANUAL_PRICING_REQUIRED`, OPEN, reason, request/Booking reference, context, correlation, and timestamps are readable as text.
- [ ] Evidence links/buttons are named by destination/record; copy actions announce success without moving focus.
- [ ] No assignment, manual amount, approval, resolution, closure, or implied workflow control exists.
- [ ] No-rate/ambiguity evidence remains distinct from timeout/503/circuit/denied/validation/in-progress states.

## Booking Pricing Region

- [ ] Pricing region has an `h2`/labelled landmark and exposes current state/amendment before line data.
- [ ] Itemised table headers identify code, category, basis, quantity, unit rate, line amount, and currency; total is programmatically related.
- [ ] Agreement/tariff reference and exact agreement/rate versions are readable/copyable without raw payload dominance.
- [ ] Current/prior snapshot controls expose selected state, revision/amendment, and keyboard operation; switching does not lose focus context.
- [ ] Reprice pending blocks duplicates, announces `Repricing...`, preserves the current snapshot, and announces the appended result once.
- [ ] Manual state blocks automatic confirmation and exposes reason/evidence with no total; the eight preserved failure paths retain distinct visible code/action.

## Responsive, Theme, and Content Stress Matrix

| Width | Required checks |
|---|---|
| 375 px | One-column forms, stacked commands, record rows/named table overflow, evidence after task, dialogs/error summaries fit, no hidden primary action. |
| 768 px | Filters/forms reflow without label clipping; evidence follows main content or accessible disclosure; keyboard order matches visual order. |
| 1024 px | Compact main/evidence layout; tables remain readable with intentional overflow; actions do not collide with identity. |
| 1440 px | Full main + compact evidence rail where useful; no excessive line length or nested-card sprawl. |

- [ ] Every width is checked in light and dark themes with long customer names, IDs, reasons, dates, money, zero/one/many rows, and 200% zoom.
- [ ] Contrast and focus pass in both themes; screenshots alone do not substitute for DOM/keyboard assertions.

## Verification Matrix

| Check | Method | Gate |
|---|---|---|
| Semantics/labels/errors | Testing Library plus axe-compatible assertions where available | Blocking |
| Keyboard/focus/dialog/combobox/tabs | Playwright real routes | Blocking |
| Async/live announcements | DOM role/live-region assertions + manual screen-reader spot check | Blocking |
| Light/dark contrast | Existing shared contrast tests plus rendered-state checks | Blocking |
| 375/768/1024/1440 no-overlap | Playwright screenshots and bounding-box/scroll assertions | Blocking |
| Zoom/content stress | Browser zoom/manual plus deterministic overflow assertions | Blocking |
| Reduced motion | Playwright media emulation | Blocking |
| Authorization/no disclosure | BFF/API + routed UI tests | Blocking |

## Shared Dependency Honesty

- [ ] DS-01, DS-02, and DS-03 appear as named evidence cells with observed current behavior, owner, integration revision, and pass/blocked result.
- [ ] No W2-03 report converts a dependency-blocked cell into PASS based on design intent, source review, or another branch's claim.
- [ ] A W2-02 integration may satisfy the cell only after the exact running `linercore-wave-a` build passes the corresponding Playwright assertion.
