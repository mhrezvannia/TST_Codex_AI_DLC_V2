# Accessibility Checklist - W3-01 D&D Rules & Rates

**Binding input:** approved page-level design `docs/ui-ux-design/18-dnd-rules-and-rates.md`.

**Handoff:** binding stage 2.5 accessibility and responsive evidence contract produced under `docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md`; unchecked implementation observations are deliberately not promoted to `PASS`.

**Upstream inputs:** rough `wireframes.md`, rough `user-flow.md`, approved `stories.md`, approved `requirements.md`, and affirmed `team-practices.md`.

## Target and evidence language

The design target is WCAG 2.2 AA, satisfying the project's WCAG 2.1 AA floor. This file specifies required behavior. `PASS` is reserved for observed evidence; implementation-dependent visual, keyboard, screen-reader, and automated checks remain BLOCKED until W3-01 routes exist on the isolated integrated stack.

## Structure and navigation

- [x] One routed `main` and one visible `h1` per screen are specified.
- [x] Section headings use sequential `h2` and `h3` levels.
- [ ] The shared skip link reaches the route main content — BLOCKED: current `PlatformShell` has no shared skip-link/main-content seam; UI-platform owner must supply it and W3-01 must not create a local shell workaround.
- [ ] Charge Agreements is identified from explicit route metadata — BLOCKED: current `PlatformShell` infers active state from title text; UI-platform owner must provide the master-required seam.
- [ ] Canonical rail membership/order is present — BLOCKED: current shared rail omits Container Movement and orders Reference Data before Charge Agreements.
- [x] Module-local route links use named links and `aria-current=page`.
- [x] Breadcrumbs retain list and record context.
- [x] Stable object identities are links; rows are not click-only targets.
- [x] No positive tab index or title-string inference is designed.
- [x] No Booking journey ribbon appears on Charge administration routes.

## Keyboard paths

### List

1. Shared skip link and navigation once the recorded UI-platform shell dependency is resolved; until then this first keyboard step remains BLOCKED.
2. Page heading and permitted Create command.
3. Module-local route links.
4. Search and filter controls, Apply, Clear, active filter removal.
5. Result count/status.
6. Sort controls and stable record links.
7. Pagination.

### Combined Draft

1. Heading and status.
2. Rule type, then announced fixed pair/derived side.
3. Pricing basis and exact version.
4. Port, trade lane, equipment, free days, amount, charge code.
5. Effective dates and change reason.
6. Cancel and Save Draft.
7. Error-summary links return focus to the exact invalid control.

### Detail and approval

1. Back/list context, heading, lifecycle/effective state, permitted commands.
2. Summary and pricing authority links.
3. Agreement relationships and history.
4. Audit disclosure.
5. Approval Dialog contains Tab/Shift+Tab, supports safe Escape, and restores the trigger.

### Successor Draft

1. `Create successor` moves to a visible successor heading and announces the predecessor identity once.
2. The read-only predecessor link and locked rule/movement/calendar facts precede editable copied values.
3. Effective dates and change reason are empty required controls; no inferred date is announced as a user choice.
4. Validation, overlap, provider, and version-conflict evidence receives the same linked-summary treatment as create/edit while all copied and entered values remain available.
5. Save success focuses the new Draft heading or persistent status and exposes named predecessor/successor links; it never returns focus to or mutates the Approved source.

### Agreement D&D section

1. The section follows primary AgreementVersion facts in DOM and visual order; it is not a tab.
2. Loading, empty, error/Retry, populated links, and denied/no-disclosure states keep the section heading stable.
3. Denied state exposes no relationship count, D&D identity, term, state, or link.

## Forms and validation

- [x] Every control has a persistent visible label; placeholders are examples only.
- [x] Required meaning, hints, and errors are programmatically associated.
- [x] Native form controls are preferred; ARIA supplements only real gaps.
- [x] Free days use whole-number input semantics and suitable `inputMode`.
- [x] Daily amount supports decimal input and scale-two display.
- [x] Reference comboboxes expose name, expanded state, active option, selection, no matches, and error meaning.
- [x] Settled options use code plus readable label.
- [x] Rule-type change announces the fixed DCSA pair and derived side politely without moving focus.
- [x] Visited fields validate on blur; untouched fields do not start in error.
- [x] Invalid submit focuses an assertive summary naming the error count.
- [x] Each summary link focuses the associated field and inline error.
- [x] Validation, service failure, overlap, and version conflict preserve entered values.
- [x] Approved terms render as readable facts, not disabled-looking form controls.

## Dialogs, pending commands, and focus

- [ ] Approval Dialog has a labelled title and programmatically related description — PARTIAL/BLOCKED: title, focus trap, Escape, and restore are source-observed; the current shared Dialog has no `aria-describedby` seam. No Charge-local Dialog fork is permitted.
- [x] Focus is contained while the Dialog is open and restored to the opener on close.
- [x] Escape closes only when cancellation is safe.
- [x] Dirty-state Dialog names the unsaved scope and restores the initiating control.
- [x] Save, approval, and successor commands expose stable pending text and block duplicates.
- [x] Pending state retains focus unless successful navigation occurs.
- [x] Success navigation focuses the stable detail heading or status region.
- [x] Inline success does not steal focus.
- [x] Toasts supplement persistent outcomes and never carry the only evidence.

## Tables, records, and evidence

- [x] Tables have captions or labelled regions and scoped column headers.
- [x] Sort controls are named and the active column exposes `aria-sort`.
- [x] Desktop and mobile records expose the same named detail link and business meaning.
- [x] Named inner overflow regions are keyboard reachable only where comparison requires a table.
- [x] Money includes ISO currency, amount, and per-calendar-day basis.
- [x] DCSA codes include readable movement labels and EMPTY/LADEN meaning.
- [x] Dates have readable display and exact ISO value where precision matters.
- [x] Status combines text with shared semantic tone/icon; color is never the sole meaning.
- [x] Selected, current, predecessor, and successor versions have explicit text meaning.
- [x] Technical identifiers and correlation evidence remain secondary in a named disclosure.

## Announcements

| Event | Channel | Required announcement |
| --- | --- | --- |
| List loading/result/filter change | Polite status | Loading or result count once |
| Rule-type derivation | Polite status | Readable fixed pair and derived side |
| Save/approval/successor pending | Polite status | Exact command pending once |
| Save/approval success | Polite status | Exact version/status once |
| Validation summary | Assertive alert | Error count and correction instruction |
| Scoped provider error | Persistent status, polite unless urgent | Affected section and allowed recovery |
| Version/overlap conflict | Persistent conflict region | Exact conflict meaning and next actions |
| Partial/degraded data | Persistent notice | Known data, unavailable section, recovery owner |

Do not announce decorative Skeleton pulses, every table row, or repeated status during rerender.

## Authentication, authorization, and disclosure

- [x] Unauthenticated/session-expired and forbidden are distinct states.
- [x] Forbidden routes reveal no counts, terms, versions, pricing relationships, or audit evidence.
- [x] Read-only capability removes mutation commands and explains the available mode.
- [x] Authorization is revalidated by server/BFF boundaries, never cached as last-known permission.
- [x] Reference-provider degradation never broadens authorization.
- [x] Outcome-specific audit evidence omits source versions, result IDs, calculations, and amounts when the outcome did not produce them.

## Responsive and reflow checklist

### 375 and 390 pixels

- [x] Shared mobile shell remains coherent.
- [x] Filters expand in flow with `aria-expanded`; no new Drawer is required.
- [x] Tables become semantic records where possible.
- [x] Forms are one column and commands wrap without hiding labels.
- [x] Evidence follows primary task content.
- [x] No sticky action overlays content and no page-level horizontal scroll is designed.

### 768 pixels

- [x] Two-column filters/forms appear only when labels and controls remain readable.
- [x] Detail rail follows content or uses an accessible disclosure.
- [x] Comparison tables use a labelled inner overflow region.

### 1024 pixels

- [x] Compact list table and main detail plus narrow evidence/action rail are specified.
- [x] Primary action remains visible without a sticky overlay.
- [x] Nested cards are absent.

### 1440 pixels

- [x] Full compact columns and controlled line length are specified.
- [x] Additional space improves grouping rather than enlarging headings/cards.

### Stress cases

- [ ] Long identifiers, port/trade labels, and translated status strings observed without overlap.
- [ ] Three-digit free days and large scale-two money observed without clipping.
- [ ] Localized dates and long validation/conflict messages observed.
- [ ] Zero, one, and many relationships/history rows observed.
- [ ] 200% zoom observed with reflow and no loss of content/function.
- [ ] Reduced-motion preference observed with nonessential transitions removed.
- [ ] Light and dark themes observed at every required width.

## Contrast and visual meaning

- [x] Normal text target is at least 4.5:1; large text at least 3:1.
- [x] Focus indicators and UI boundaries target at least 3:1 against adjacent colors.
- [x] Shared semantic and focus tokens are required; no local hex palette is allowed.
- [x] Hover/focus does not scale or shift layout.
- [x] Draft, Approved, Scheduled, Effective, Expired, Read-only, error, zero amount, and conflict meanings are textual.
- [ ] Integrated light/dark contrast measurement remains BLOCKED.

## State accessibility matrix

| State | Focus behavior | Announcement | Non-color meaning | Status |
| --- | --- | --- | --- | --- |
| Loading | Retain route focus; no focus into Skeleton | Polite loading once | Skeleton plus text status | BLOCKED pending route |
| True/filtered empty | Heading or result region remains logical | Result count/empty once | Distinct copy and recovery | BLOCKED pending route |
| Read-only | Commands absent; reading order unchanged | Capability status once | `Read-only` text | BLOCKED pending route |
| Unauthenticated/forbidden | Shared flow focus contract | Shared route status | Explicit state text | BLOCKED pending route |
| Validation | Summary receives focus | Assertive count/message | Text and linked fields | BLOCKED pending form |
| Pending/success | Trigger focus retained or detail heading focused | Polite exact command/result | Stable pending/success text | BLOCKED pending route |
| Conflict/overlap | Conflict region or summary focused | Exact conflict once | Text, IDs/window, actions | BLOCKED pending route |
| Provider error/degraded | Known content remains reachable | Affected section/recovery | Persistent notice | BLOCKED pending provider |
| Approved history | Normal reading order | No unsolicited announcement | Explicit immutable/version text | BLOCKED pending route |

## Future verification evidence

- [ ] Playwright direct navigation, reload, back, forward, filter preservation, and stable links.
- [ ] Keyboard-only list, create/edit, approval/successor, history, relationship, and evidence flow.
- [ ] Dialog focus trap, safe Escape, pending behavior, and trigger restoration.
- [ ] Combobox active-descendant, arrows, Enter, Escape, no-match, loading, and error with real Reference Data.
- [ ] Automated axe scan with no critical or serious violations.
- [ ] Manual visible-focus and logical-order review.
- [ ] Screenshot plus bounding-box/scroll assertions at 375, 390, 768, 1024, and 1440.
- [ ] Light/dark contrast, 200% zoom, and reduced-motion observations.
- [ ] Shared shell identifies Charge Agreements and suppresses the journey ribbon.
- [ ] No evaluation-preview route, panel, form, or command renders.

## Traceability

| Accessibility behavior | Requirement/story evidence |
| --- | --- |
| Keyboard, focus, labels, errors, breakpoints | FR-09, NFR-06, US-01 AC4, AC-10, RV-02 |
| Fixed DCSA labels and derived meaning | FR-01, FR-02, US-01 AC1, AC-01 |
| Money/date/version readability | FR-02, FR-03, FR-05, FR-07, US-02-US-03 |
| Auth/no-disclosure and attributable commands | FR-06, FR-12, NFR-03-NFR-04, US-04, AC-06, AC-10 |
| Error/conflict/recovery preservation | FR-06, FR-08, US-01 AC3, US-04, AC-02, AC-06, AC-09 |

## Open questions

No unresolved accessibility design decision remains. Integrated proof stays BLOCKED until Application Design resolves provider/capability contracts and Construction implements the W3-01 routes on the isolated stack.
