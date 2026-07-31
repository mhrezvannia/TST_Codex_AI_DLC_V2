# Accessibility Checklist - W2-04 Container Movement

## Scope, Standard, and Evidence Status

This design checklist refines the accessibility notes in `wireframes.md` and
`user-flow.md`, covers the UI acceptance in `stories.md` and `requirements.md`,
and follows the risk/evidence posture in `team-practices.md`. It applies to
`/container-movement` and `/container-movement/journeys/[id]` inside the shared
authenticated shell.

Target is WCAG 2.2 AA intent and at least the binding LinerCore WCAG 2.1 AA
floor. `Specified` means the behavior is defined in this stage; it is not a test
PASS. `Pending` items require implementation and Playwright/manual evidence after
W2-02 integration.

## Semantic Structure and Navigation

| Check | Design status | Required implementation/evidence |
|---|---|---|
| One h1 per route | Specified | List: Container journeys; detail: equipment reference |
| Shared landmarks and skip link | Specified | Reuse shell header/nav/main and verify first keyboard path |
| Ordered h2 hierarchy | Specified | Facts, Timeline, Capture, Evidence without skipped levels |
| Breadcrumb and active module | Specified | Shared shell semantics; current item not a link |
| Named route links | Specified | Equipment/detail and Booking links describe destination |
| Back navigation retains list context | Specified | Filters/sort/page preserved and focus restored logically |
| Automated semantic scan | Pending | axe/Playwright on both routes and required states |

## Journey Results

| Check | Design status | Required implementation/evidence |
|---|---|---|
| Table has accessible name/caption | Specified | Verify screen-reader table navigation at 768+ |
| Sort state announced | Specified | Native button/header plus `aria-sort` where supported |
| Rows are not click-only | Specified | Equipment is a named link reachable by Tab/Enter |
| Mobile results are semantic list | Specified | One named journey link per record; no nested interactive card |
| Result count updates announced | Specified | Polite live region without announcing every render |
| Inner table overflow is labelled | Specified | Keyboard-reachable at 768; no page-level horizontal scroll |
| Empty/error/denied recovery | Specified | Reset/Retry/safe return have descriptive names |

## Timeline

| Check | Design status | Required implementation/evidence |
|---|---|---|
| Timeline is an ordered list | Specified | DOM order equals sequence/business order |
| Code has readable label | Specified | GTOT - Gated out, LOAD - Loaded, DISC - Discharged, GTIN - Gated in empty |
| State is not color-only | Specified | Text plus icon/position; icons hidden if decorative |
| Expected/actual/current/next terms stated | Specified | No dependence on shape/location alone |
| Evidence disclosure has native semantics | Specified | `aria-expanded`, named region, keyboard toggle |
| Long IDs/locations/times wrap | Specified | 200%/400% zoom and long-content Playwright cases |
| Background updates avoid focus theft | Specified | Pending-to-applied status uses polite announcement only when meaningful |

## Capture Form

| Check | Design status | Required implementation/evidence |
|---|---|---|
| Persistent visible label for every field | Specified | Placeholder never substitutes for label |
| Related controls grouped | Specified | Named form and fieldset/legend as appropriate |
| Read-only facts exposed as text | Specified | ACT, equipment, MANUAL readable by assistive technology |
| Next-code guidance associated | Specified | Description linked to Event code; suggestion not color-only |
| Live reference Combobox keyboard pattern | Specified | Type, arrows, Enter, Escape, and announced result count |
| Occurred input has format/time-zone help | Specified | Label/help/error associations and suitable input mode |
| Blur validation plus submit validation | Specified | No error on every keystroke; server remains authority |
| Error summary links to fields | Specified | Summary focused on failed submit; links move to controls |
| Values retained after all failures | Specified | Validation, 409, reference, auth, retryable service cases |
| Busy state prevents double submit | Specified | Stable button dimensions, `aria-busy`, readable `Recording...` |
| Dirty dismissal guarded | Specified | Drawer/flow close does not silently lose entered data |

## Responsive Capture Focus

| Width | Design status | Focus contract |
|---|---|---|
| 375 | Specified | In-flow region after trigger; `aria-expanded`; no focus trap |
| 768 | Specified | Drawer heading receives focus, trap active, Escape/Cancel rules, trigger restoration |
| 1024 | Specified | Persistent panel follows timeline in logical DOM/tab order |
| 1440 | Specified | Same contract as 1024; bounded content width |

All interactive targets are at least 44 by 44 CSS pixels on touch layouts, with
at least 8px separation where controls are adjacent.

## Dynamic Outcome and Recovery

| Outcome | Design status | Announcement/focus/recovery |
|---|---|---|
| Accepted | Specified | Inline summary focused/politely announced; code/lifecycle/next move stated |
| Publication pending | Specified | `Booking update pending`; no false applied claim |
| Booking applied | Specified | Observed time announced without stealing focus |
| Duplicate | Specified | Alert/error summary focus, original evidence, unchanged lifecycle, retained values |
| Out of sequence | Specified | Alert/error summary focus, required next code, Event-code link, retained values |
| Validation | Specified | Summary plus field errors and correction guidance |
| Capture denied | Specified | No active capture control; direct 403 has safe explanation and no state leak |
| Degraded | Specified | Last-known time, disabled capture reason, Retry |

Toast is never the only success or error surface. Polling and repeated retry
states are deduplicated so live regions do not become noisy.

## Visual, Theme, and Motion

| Check | Design status | Required implementation/evidence |
|---|---|---|
| Text contrast at least 4.5:1 | Specified | Token-based light/dark automated/manual check |
| Large text/UI contrast at least 3:1 | Specified | Focus, borders, icons, controls in both themes |
| Visible focus never removed | Specified | `--erp-focus-ring` verified on every interactive element |
| No local hardcoded colors | Specified | Lint/source review and erp-fidelity audit |
| No color-only status | Specified | Lifecycle/outcomes all include text/icon |
| Reduced motion | Specified | Disable nonessential transition/animation via media query |
| No layout-shift hover | Specified | Color/border/shadow transition only |
| Skeleton does not pulse excessively | Specified | Reduced-motion/static variant and stable dimensions |

## Viewport and State Evidence Matrix

Playwright must capture both themes at 375, 768, 1024, and 1440 for the
following minimum matrix. Equivalent parameterized coverage is acceptable when
the evidence manifest preserves exact width/theme/state identifiers.

| Route/surface | Required states |
|---|---|
| Journey list | loading, populated, empty, retryable error, denied, degraded |
| Journey detail | loading, populated Allocated and later lifecycle, not found, retryable error, denied, degraded |
| Capture | default, validation, submitting, accepted/pending, duplicate, out of sequence, capture denied |
| Booking cross-link | pending and applied latest projection, canonical return/link behavior |

## Keyboard Test Script

1. Activate the shared skip link and confirm focus enters the list h1/main.
2. Search/filter/reset, open a named journey, and confirm visible focus/order.
3. Expand timeline evidence using Enter/Space and return without a trap.
4. Open capture at each responsive pattern and confirm the specified focus
   placement/restoration.
5. Submit invalid data, use summary links, correct fields, and resubmit.
6. Exercise duplicate and out-of-sequence outcomes; confirm retained values and
   recovery links.
7. Trigger degraded/denied states and confirm unavailable actions have textual
   explanations.
8. Follow the Booking link and return without losing route/list context.

## Completion Gate

- [x] Semantics, focus, keyboard, labels, error recovery, live regions, themes,
  motion, zoom, and responsive contracts are specified.
- [x] Required list/detail/capture state matrix is specified.
- [x] No inaccessible marketing/decorative skill recommendation was adopted.
- [ ] React Testing Library assertions implemented.
- [ ] Playwright keyboard/viewport/theme/state evidence captured on the real
  shared-shell routes after W2-02 integration.
- [ ] Manual screen-reader and contrast spot checks recorded.
- [ ] `aidlc-audit` and `erp-fidelity-audit` green after implementation.
