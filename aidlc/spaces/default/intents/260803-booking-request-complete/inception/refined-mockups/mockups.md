# Refined Mockups — W3-04 Booking Request Completeness

Status: binding Refined Mockups candidate for the W3-04 approval gate. These mockups specify page behavior; they do not approve routes, APIs, production code, `packages/ui`, or infrastructure changes.

## Source and authority

The mockups refine `ideation/rough-mockups/wireframes.md` and `ideation/rough-mockups/user-flow.md`, cover `inception/user-stories/stories.md`, implement `inception/requirements-analysis/requirements.md`, and preserve the ownership/testing constraints in `inception/practices-discovery/team-practices.md`.

Page-level detail comes from the approved `docs/ui-ux-design/25-booking-request-completeness.md`. Shared-shell, token, responsive, and accessibility decisions follow `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, and executable `@erp/ui`. Requirements and Stories win over older W1 field behavior.

## Design decisions

- `/booking` is canonical. `/bookings` is compatibility only.
- New and same-record correction share one Booking-owned request composition.
- The form uses five groups: Booking and parties, Cargo, Route and schedule, Equipment request, Review and save.
- Initial draft and confirmation contain equipment type x quantity with no assigned physical equipment ID.
- Requested departure is the user's POL-local date. Voyage schedule is read-only Reference Data evidence with provenance and visible variance.
- Draft work survives recoverable failures; server completeness, validation, price, authorization, revision, and confirmation gates remain authoritative.
- Detail shows exactly one authorized next lifecycle action and stable route-backed Overview, Charges, Journey, and Activity views.
- At 1024/1440, a review rail is allowed only when the main form remains usable. At 375/390/768, Review and actions are inline.

## Route and task flow

Proposed navigation for Application Design confirmation:

```text
[/booking queue]
      |
      +---- New request ----> [/booking/new]
      |                            |
      |                            v
      |                  [five-group request form]
      |                            |
      |                       Save draft
      |                            |
      +---- Open record ---------->+----> [/booking/{id}?tab=overview]
                                                |
                           +--------------------+--------------------+
                           |                    |                    |
                         Correct             Validate             Price
                           |                    |                    |
                           +---- same record ---+      [/booking/{id}?tab=charges]
                                                                    |
                                                                  Confirm
                                                                    |
                                                                    v
                                                       [confirmed; assignment pending]
```

Text fallback: the queue opens either the new request form or an existing record. Saving returns to the same record. Correct, Validate, Price, Refresh/Retry, Confirm, or Inspect is selected by the one-next-action precedence. Charges contains detailed pricing evidence; confirmation returns to the confirmed record with physical assignment still pending.

## Screen RM-01 — Booking queue integration

The approved Booking queue remains the entry and return surface. W3-04 adds no new queue shell or local navigation.

```text
+------------------------------------------------------------------------------+
| Canonical LinerCore shell                                                    |
+------------------------------------------------------------------------------+
| Booking                                              [New booking request]   |
| [Search] [Status] [Attention] [Clear filters]                               |
|------------------------------------------------------------------------------|
| Booking     Customer       Route       Departure      Status      Attention  |
| BK-...      ...            ...         ...            Draft       Incomplete |
| BK-...      ...            ...         ...            Priced      Confirm    |
|------------------------------------------------------------------------------|
| Showing ...                                              [Prev] [Next]       |
+------------------------------------------------------------------------------+
```

- New request enters `/booking/new`.
- Opening a row retains a validated `returnTo` containing queue filters/page/sort.
- Legacy incomplete and pricing/manual attention are text/icon states, not color-only markers.
- W3-04 does not add unsupported bulk actions, cancellation, allocation, rolls, or splits.

## Screen RM-02 — New or correct request, 1440px

```text
+------------------------------------------------------------------------------+
| Canonical shell: top bar, navigation, session, user, global status           |
+------------------------------------------------------------------------------+
| Booking / New request                               Draft - not yet saved    |
| New booking request                                                         |
| Complete the commercial request. Container assignment happens later.        |
|                                                                              |
| +---------------------------------------------+ +--------------------------+ |
| | 1 Booking and parties                       | | 5 Review and save        | |
| | [Booking customer       ] [Customer ref   ] | | Customer     Not chosen | |
| | [Shipper                ] [Consignee opt. ] | | Cargo        Incomplete | |
| | [Notify party optional  ]                    | | Route        Incomplete | |
| |                                             | | Schedule     Incomplete | |
| | 2 Cargo                                     | | Equipment    Incomplete | |
| | [Cargo description.......................]  | | USD / FCL dry           | |
| | [Commodity              ] [Package type   ] | | Assignment pending      | |
| | [Package count] [Gross weight KGM]          | |                          | |
| | [Volume MTQ optional]                       | | [Save draft] [Cancel]    | |
| |                                             | +--------------------------+ |
| | 3 Route and schedule                        |                              |
| | [POL] [POD] [Requested departure]           |                              |
| | [Voyage search...........................]  |                              |
| | +-----------------------------------------+ |                              |
| | | Carrier schedule - derived/read-only   | |                              |
| | | Voyage / ETD / ETA / cutoffs / source  | |                              |
| | | Requested date differs by N days       | |                              |
| | +-----------------------------------------+ |                              |
| |                                             |                              |
| | 4 Equipment request                         |                              |
| | [Equipment type] [Quantity]                 |                              |
| | USD | FCL dry | Reefer No | DG No           |                              |
| | No container number is assigned yet.        |                              |
| +---------------------------------------------+                              |
+------------------------------------------------------------------------------+
```

Correction mode changes the header to **Correct booking {reference}**, the primary label to **Save corrections**, and populates every persisted accepted field. It does not create a replacement draft.

### Refined form annotations

1. Canonical comboboxes display code plus governed label. Search text is not a value until an option is committed.
2. Optional party controls are explicitly labeled “optional.” Blank optional roles remain null.
3. Cargo description uses the required shared multiline `TextArea` with a 500-character limit; adjacent Field hint/count text exposes the constraint without announcing every keystroke. The primitive is a W2-02/UI Platform dependency and must not be copied into Booking.
4. Package count and equipment quantity accept integers only; weights/volume accept the approved precision and fixed units.
5. POL/POD changes visibly invalidate an incompatible voyage. Requested departure never auto-selects a voyage.
6. Carrier schedule reserves its dimensions during load and shows reference version/source. Missing/stale/inconsistent facts block confirmation, not draft recovery.
7. Equipment request has no equipment-ID field or placeholder container row.
8. Review says “Not yet saved” until the authoritative create/correct response returns.

## Screen RM-03 — Reference and validation states

### Partial authority failure

```text
+---------------------------------------------+
| Some reference choices are unavailable      |
| Party and package-type choices could not be |
| refreshed. Your entered text and numbers    |
| are retained.                               |
| [Retry reference data]                      |
+---------------------------------------------+
| Booking customer [Unavailable]              |
| Customer ref     [retained value]           |
| Cargo description[retained value]           |
| Commodity        [available combobox]       |
+---------------------------------------------+
```

Only dependent controls are disabled. An all-reference failure adds one page-level strip and exact affected groups; it does not replace the whole form with a blank error page.

### Failed save or validate

```text
+---------------------------------------------+
| Booking not saved                           |
| 3 fields need attention.                    |
| - Select a current booking customer         |
| - Package count must be 1 to 999999         |
| - Select a route-compatible voyage          |
+---------------------------------------------+
| ...                                         |
| Package count                               |
| [0                  ]                       |
| Package count must be 1 to 999999           |
+---------------------------------------------+
```

Focus moves to the summary heading after the failed action. Activating a summary link moves focus to the field. Other entries remain unchanged.

## Screen RM-04 — Carrier schedule states

### Complete with variance

```text
+------------------------------------------------------+
| Carrier schedule                         Current     |
| Voyage                 LC1042 / Vessel name          |
| Requested departure   2026-08-21 (POL local)         |
| Carrier ETD            2026-08-23 18:00 +04           |
| Difference             2 calendar days later         |
| ETA                    2026-09-04 09:00 +02           |
| Cargo cutoff           2026-08-22 08:00 +04           |
| Documentation deadline 2026-08-21 16:00 +04           |
| Source                 Voyage V17 / Reference Data    |
+------------------------------------------------------+
```

The variance is explanatory, not automatically an error. Requested departure and ETD are never overwritten.

### Incomplete, stale, or incompatible

```text
+------------------------------------------------------+
| Carrier schedule                         Incomplete  |
| Documentation deadline is unavailable for voyage V17|
| The draft can be saved. Validation and confirmation  |
| remain blocked until current schedule authority is   |
| available.                                           |
| [Refresh voyage]                                     |
+------------------------------------------------------+
```

## Screen RM-05 — Inline Review at 768px

```text
+------------------------------------------------------+
| Canonical compact shell                              |
| Booking / New request                                |
| New booking request                                  |
| [page-level state]                                   |
|                                                      |
| 1 Booking and parties                                |
| [controls in one column; two-up only if each >=260]  |
| 2 Cargo                                              |
| [controls]                                           |
| 3 Route and schedule                                 |
| [controls]                                           |
| [Carrier schedule]                                   |
| 4 Equipment request                                  |
| [controls]                                           |
| 5 Review and save                                    |
| [summary rows]                                       |
| [Save draft] [Cancel]                                |
+------------------------------------------------------+
```

Review is not sticky at 768px. Actions may align right only when labels fit; otherwise they stack without reordering.

## Screen RM-06 — Mobile request at 375px and 390px

```text
+--------------------------------------+
| Canonical shell menu        User     |
+--------------------------------------+
| Booking / New                       |
| New booking request                 |
| [status or linked error summary]    |
|                                     |
| 1 Booking and parties               |
| [full-width controls]               |
|                                     |
| 2 Cargo                             |
| [full-width controls]               |
|                                     |
| 3 Route and schedule                |
| [POL]                               |
| [POD]                               |
| [Requested departure]               |
| [Voyage]                            |
| [derived schedule label/value rows] |
|                                     |
| 4 Equipment request                 |
| [Equipment type]                    |
| [Quantity]                          |
| [fixed commercial facts]            |
|                                     |
| 5 Review and save                   |
| [summary rows]                      |
| [Save draft - full width]           |
| [Cancel - full width]               |
+--------------------------------------+
```

- 16px content gutter; minimum 44px touch controls.
- Actions stay in flow; no fixed bottom bar obscures errors or evidence.
- Combobox lists inherit the shared Field width, cap at the executable 240px height, scroll vertically, and wrap long labels. Booking keeps Field containers within the page gutter and reserves at least 256px of block-end scroll space below the final reference field; no automatic collision/flip behavior is claimed.
- No page-level horizontal scroll at 375 or 390px.

## Screen RM-07 — Operational detail, 1024/1440px

```text
+------------------------------------------------------------------------------+
| Booking / BK-...          [Completeness] [Lifecycle]       [One next action] |
| Customer / POL to POD / requested date / carrier ETD / type x quantity      |
| [Overview] [Charges] [Journey] [Activity]                                   |
|                                                                              |
| +-------------------------------------------+ +----------------------------+ |
| | Overview                                  | | Readiness                  | |
| | Booking and parties                       | | Request      Complete      | |
| | Cargo                                     | | References   Current       | |
| | Requested and carrier schedule            | | Schedule     Complete      | |
| | Equipment request                         | | Price        Current       | |
| | Type x quantity / Assignment pending      | | Next         Confirm       | |
| +-------------------------------------------+ +----------------------------+ |
|                                                                              |
| > Audit and support evidence (collapsed, privacy-safe)                       |
+------------------------------------------------------------------------------+
```

The four view links are stable for every authorized reader. Unknown `tab` values fall back to Overview. At narrow widths the header, readiness, and content stack; the link list scrolls intentionally if localization requires it.

## Screen RM-08 — Charges and one-next-action states

Charges uses the existing pricing-evidence composition, extended to the approved outcome vocabulary.

```text
+------------------------------------------------------+
| Pricing evidence                 [Price | Reprice]   |
| Current request: customer / route / equipment x qty |
| [current or prior snapshot selector]                 |
|------------------------------------------------------|
| State-specific panel                                 |
| - Priced: itemized authoritative lines and total     |
| - Pending/unknown: Refresh same request identity     |
| - No rate/manual/validation: Correct                 |
| - Explicit unavailable/timeout: Retry once, same ID  |
| - Malformed: inspect safe correlated contract error  |
| - Conflict: Refresh latest                           |
+------------------------------------------------------+
```

No state shows a guessed amount, automatically retries a protected 4xx outcome, or discards prior authoritative evidence.

## Screen RM-09 — Confirmation impact and success

### Confirmation dialog

```text
+------------------------------------------------------+
| Confirm booking BK-...?                              |
| Booking customer      ...                            |
| Route                  POL to POD                     |
| Requested departure    ...                            |
| Carrier voyage / ETD   ... / ...                      |
| Equipment request      45G1 x 3                       |
| Physical assignment    No container assigned         |
| Revision               ...                            |
| Pricing authority      USD ... / agreement or tariff |
|                                                      |
| [Keep reviewing]                    [Confirm booking] |
+------------------------------------------------------+
```

While confirmation is pending, duplicate Confirm is disabled. If acceptance is unknown, the sole next action becomes Refresh status with the same identity.

### Confirmed state

```text
+------------------------------------------------------+
| Booking confirmed                                    |
| The current request is confirmed.                    |
| Equipment requested: 45G1 x 3                        |
| Physical assignment: Pending                         |
| [Inspect booking]                                    |
+------------------------------------------------------+
```

Success never creates synthetic container rows, physical journeys, or allocation claims.

## Complete state matrix

| State | Surface | Recovery or terminal behavior |
|---|---|---|
| Initial/untouched | Form | Begin entry; no early errors |
| Queue empty dataset | Booking queue | Explain that no bookings exist; offer New booking request only when authorized |
| Queue filtered empty | Booking queue | Preserve filters and offer Clear filters; do not imply the dataset is empty |
| Routed loading | Form/detail | Stable Skeleton; polite completion announcement |
| Reference loading | Affected controls | Await; other inputs available |
| Partial reference failure | StatusStrip + affected fields | Retry affected authority; preserve all entries |
| All reference failure | Page strip + groups | Retry or return safely; no free-text canonical commit |
| No matches | Combobox | Change search; no selection created |
| Stale/inactive reference | Field status | Refresh or Correct; retain stale evidence |
| Voyage mismatch | Voyage/schedule | Select compatible voyage |
| Partial/invalid schedule | Schedule panel | Save draft; refresh/Correct; confirm blocked |
| Validation blocked | Linked summary + fields | Correct, then Validate |
| Save pending | Review/action | Await; duplicate disabled |
| Save outcome unknown | Detail/review | Refresh same command identity; no resubmit |
| Save unavailable/timeout, not accepted | StatusStrip | Retry once with same identity |
| Saved | Detail success | Inspect persisted request |
| Duplicate replay | Detail | Inspect previously recorded result |
| Idempotency conflict | ConflictStrip | Refresh authoritative state |
| Revision/concurrent conflict | ConflictStrip | Refresh latest, explicitly reapply edits |
| Legacy incomplete | Overview | Correct same record |
| Read-only | Form/detail evidence | Inspect; mutations absent |
| Denied/session boundary | FailureState | Sign in or return; no protected facts |
| Reference validation pending | Overview | Await/Refresh existing operation |
| Commodity ineligible | Charges/Overview | Correct; Validate before new Price |
| Pricing pending/in progress | Charges | Refresh/poll same request ID; no second request |
| Pricing outcome unknown | Charges | Refresh same ID; no retry |
| No rate/manual | Charges | Correct; no automatic retry |
| Pricing validation | Charges + linked facts | Correct, Validate, then Price |
| Pricing denied | Safe boundary | No protected retry |
| Pricing unavailable/timeout, not accepted | Charges | Retry once with same ID |
| Malformed pricing response | Charges | Inspect safe correlated error; confirm blocked |
| Pricing conflict | ConflictStrip | Refresh latest state |
| Pricing replay | Charges | Show recorded outcome |
| Reprice required | Charges/Overview | Price current revision; retain prior evidence |
| Confirmation pending | Dialog/detail | Await; if unknown, Refresh same ID |
| Confirmation outcome unknown | Detail | Refresh status with the same identity; do not resubmit or announce success |
| Confirmation conflict | Detail | Refresh latest; no optimistic success |
| Confirmed | Detail | Inspect; assignment remains pending |
| Service unavailable | Current surface | Bounded Retry/Refresh; preserve context |
| Not found/protected absence | FailureState | Return to Booking without existence detail |

## Responsive behavior

| Width | Form | Review/action | Detail |
|---|---|---|---|
| 375px | One column, 16px gutter, 44px controls | Inline, stacked full width | Stacked facts; intentionally scrollable view links |
| 390px | Same, with wider option rows | Inline | Approved mobile baseline |
| 768px | One column; two-up only if each control is at least 260px | Inline; wrap/stack safely | Content then readiness |
| 1024px | Grid only when main content remains at least 640px | Compact rail may stick when height permits | Two-column overview/readiness when usable |
| 1440px | Main approximately 760px plus 280-340px rail inside 1180px | Rail sticky within content only | Dense two-column operational record |

Every width supports long labels, 200% zoom, no page-level horizontal scroll, visible unclipped focus, and in-flow mobile actions.

## Traceability

| Designed surface/action/state | Requirements | Story acceptance coverage | Evidence |
|---|---|---|---|
| RM-02 complete form and Review | FR-001–FR-005, FR-025 | US-01, US-02 | Create/reopen/round-trip Playwright |
| RM-03 reference/validation | FR-006–FR-007, FR-027, FR-030 | US-05, US-10 | Live OHS state fixtures and linked-error checks |
| RM-04 schedule | FR-008–FR-010 | US-03 | Variance, partial/stale/mismatch screenshots/tests |
| Correction and legacy state | FR-011–FR-014 | US-04 | Same-record revision and migration cases |
| RM-07 one next action | FR-015, FR-024–FR-027 | US-09 | Permission/state precedence matrix test |
| RM-08 pricing | FR-016–FR-018 | US-06, US-07 | Exact request capture and every provider outcome |
| RM-09 confirmation | FR-019–FR-023 | US-08 | Idempotency, nullable ID, quantity >1, CMM pending proof |
| Permission/privacy/diagnostics | FR-028–FR-030 | US-10, US-12 | Independent permissions and redaction assertions |
| All responsive/live states | NFR-001–NFR-010, AC-001–AC-014 | US-11 | Live Compose, Playwright, a11y and visual evidence |

### Story acceptance-criterion traceability

| Story criterion | Designed surface | Action or state | Required evidence |
|---|---|---|---|
| US-01.1 | RM-02 request form + RM-04 schedule | Save draft with quantity 3 and null `equipmentId`; Saved | Live create response with stable ID/revision |
| US-01.2 | RM-07 Overview | Reopen persisted draft; assignment pending | UI/API round-trip assertion for route, date, voyage, type, quantity, null ID |
| US-01.3 | RM-02 Review and save | Duplicate click/Enter/touch; Save pending/replay | One draft/audit/outbox effect for reused identity |
| US-01.4 | RM-02/RM-03 | Routed/reference loading, validation, timeout, service error | Skeleton, focus, and input-preservation browser checks |
| US-02.1 | RM-02 five-group form + RM-07 Overview | Boundary-valid save/reopen | Exact normalized field/unit/value round-trip checks |
| US-02.2 | RM-02 Cargo/parties | Optional consignee/notify/volume absent or present | Completeness and optional round-trip cases |
| US-02.3 | RM-03 validation summary | Invalid length, precision, range, unit, or canonical text | Stable linked field errors; unrelated-input preservation |
| US-02.4 | RM-02 Equipment + RM-07 Overview/Journey | Quantity greater than one; assignment pending | Quantity retained; zero synthetic equipment rows/IDs |
| US-03.1 | RM-04 Carrier schedule | Requested date differs from carrier ETD | Both values, variance, and no-overwrite screenshot/assertion |
| US-03.2 | RM-04 + RM-07 Overview | Save/reopen current schedule snapshot | Voyage version and ordered timezone-aware fact assertions |
| US-03.3 | RM-04 incomplete variant | Partial/stale/incompatible/invalid schedule | Draft save allowed; exact blocker; confirmation denied |
| US-03.4 | RM-03 partial authority | One Reference Data subset degraded | Unaffected section remains usable; dependent action only blocked |
| US-04.1 | RM-07 legacy-incomplete Overview | Read/upcast pre-W3 record | Preserved authority, explicit missing reasons, no defaults |
| US-04.2 | RM-07 Activity/diagnostics | Migration rerun/restart | Stable ledger source/target/outcome and drift checks |
| US-04.3 | RM-07 one next action + correction form | Correct same record/revision | Identity-chain assertion; no replacement draft |
| US-04.4 | RM-03/RM-07 ConflictStrip | Migration/correction conflict | Refresh latest; no silent overwrite |
| US-05.1 | RM-07 readiness | Validate current revision | Live role/version/reference/schedule validation proof |
| US-05.2 | RM-03 + RM-04 | Invalid/stale/role/route reference | Linked exact field/reason; draft retained; downstream blocked |
| US-05.3 | RM-07 action region | Read allowed, Validate denied | Action absent and server denial before provider work |
| US-05.4 | RM-07 Overview/Charges | Pricing-basis fact changes | Validation/price invalidated; exact next action recalculated |
| US-06.1 | RM-08 Charges | Price current validated request | Captured exact customer/commodity/POL/POD/type/date/qty/USD request |
| US-06.2 | RM-08 Charges priced state | Authoritative price accepted | Quantity-scaled lines and immutable basis/total/fingerprint/correlation |
| US-06.3 | RM-08 provider-state variants | Refresh, Retry once, Correct, deny, Inspect, Refresh latest, replay | One exact action for every FR-018 outcome; same identity |
| US-06.4 | RM-08 recovery | Provider error/degradation | Request/tab/list context retained; no guessed total |
| US-07.1 | RM-07 readiness + RM-08 Charges | Edit pricing-determining fact; Reprice required | Historical price retained; confirmation blocked until current |
| US-07.2 | RM-08 outcome unknown | Repeated Refresh status | Same identity; zero new provider requests |
| US-07.3 | RM-08 unavailable/timeout | Retry once | Same identity; bounded retry; uncertainty returns to Refresh |
| US-07.4 | RM-03/RM-08 ConflictStrip | Refresh latest revision/provider state | Authoritative state shown; explicit reapply/retry only |
| US-08.1 | RM-09 confirmation dialog | Open Confirm impact | Booking/customer/route/schedule/type×qty/no-ID/revision/price present |
| US-08.2 | RM-09 pending/success | Confirm or replay same command | One transition/outbox/audit/event with quantity 3 and null ID |
| US-08.3 | RM-07 Journey pending state | Inspect CMM result | Pending requested count/type; no synthetic ID/journey |
| US-08.4 | RM-07 Activity/Technical details | Compatible channel rollout | Consumer, catalog, AsyncAPI, Compose, runtime convergence evidence |
| US-08.5 | RM-07 action region | Confirm denied | Action absent/server denied before mutation; no protected detail |
| US-09.1 | RM-01 queue + RM-02/RM-07 | Enter via `/booking` or `/bookings` compatibility | One canonical shell/form/detail journey; redirect/delegate proof |
| US-09.2 | RM-07/RM-08 one-next-action region | Every record/provider/permission condition | Precedence matrix shows exactly one authorized action or safe path |
| US-09.3 | RM-07 route views | Navigate Overview/Charges/Journey/Activity | Owned evidence appears once; route/tab context retained |
| US-09.4 | RM-02–RM-09 | Every designed state at all widths/themes/zoom | Keyboard, focus, live-region, reflow, reduced-motion visual evidence |
| US-10.1 | RM-01/RM-02/RM-07 action surfaces | Independent read/create/correct/validate/price/confirm permissions | UI visibility plus server authorization matrix |
| US-10.2 | RM-03/RM-07 FailureState | Denied, expired session, protected absence | No existence/payload/provider hint; safe sign-in/list action only |
| US-10.3 | RM-07 Overview/Activity/Technical details | Inspect persisted/confirmed snapshot | Minimum governed snapshots only; no copied raw reference records |
| US-10.4 | RM-03/RM-08 diagnostics | Validation/provider/conflict/contract failure | Safe code/field/correlation/state; redaction assertions |
| US-11.1 | RM-02–RM-09 complete journey/matrix | Live create→correct→validate→price→confirm→consume→detail | Intent-tagged Compose evidence; zero duplicate/lost/fabricated facts |
| US-11.2 | All mapped surfaces | Unit/contract/migration/auth/provider/browser test execution | Per-module changed-line coverage ≥80% plus required test classes |
| US-11.3 | RM-02–RM-09 responsive variants | 375/390/768/1024/1440, 200% zoom, keyboard, reduced motion, themes | Real-route Playwright/a11y/visual evidence with no overflow/clipping |
| US-11.4 | RM-02/RM-07/RM-08/RM-09 async states | Time create/read/validate/price/confirm/timeout/recovery | Local durations and 2.5-second boundary labeled non-production |
| US-11.5 | Evidence/verification state | Evaluate missing or complete prerequisites | Missing prerequisite yields BLOCKED; otherwise all named audits green |
| US-12.1 | RM-07 Technical details | Expand provider/reference/conflict/migration/contract diagnostics | Safe code/correlation/revision/provider/owner; no sensitive/raw payload |
| US-12.2 | RM-07 primary workflow | Keep diagnostics collapsed; keyboard scan | Business status and one next action remain primary; focus restores |
| US-12.3 | RM-07 FailureState | Diagnostics/detail requested without read | Denial precedes lookup; no existence or hidden-content hint |

## Implementation handoff boundaries

- Application Design resolves the correction route/mode, BFF/REST representations, client/server component boundaries, and enriched provider ownership.
- W3-04 requires the reviewed design's shared multiline `TextArea` and character-count support for cargo description; this is an explicit W2-02/UI Platform implementation dependency and cannot be replaced by a Booking-local primitive. Existing `Combobox`, `Skeleton`, `StatusStrip`, and `DefinitionList` behavior covers loading, no-match, stale, long-label, and mobile states through Booking-owned composition; live viewport evidence must confirm page-scroll containment or route a general Combobox extension to W2-02.
- Booking owns domain compositions; Reference Data owns canonical options and schedule; Charge owns pricing authority; CMM owns later physical assignment.
- No production route, API, test, package, infrastructure, page override, or design-system master was modified by this stage.

### Review resolution

- WCAG 2.1 AA remains the binding accessibility authority. Any later WCAG 2.2 technique is advisory unless separately approved and traced.
- Confirmation dialogs initially focus the shared Dialog container labeled by their `h2`. Save success focuses `#booking-record-title`; confirmation success focuses `#booking-confirmation-status`; validation and conflict outcomes focus `#booking-errors` and `#record-conflict`, respectively.
- Cargo uses the reviewed shared multiline contract and therefore carries an explicit W2-02 `TextArea`/counter dependency. Governed-reference behavior uses the current shared Combobox contract without claiming unsupported collision/flip or custom announcement behavior.

## Open questions

No field, schedule, role, state, responsive, or accessibility decision blocks approval. Application Design must choose the explicit correction route versus correction mode and confirm exact contract/component boundaries. Live browser/Compose visual evidence remains unavailable in this session and must be captured before implementation approval.

## Review

**Verdict: READY**

- All 49 story acceptance criteria (`US-01.1` through `US-12.3`) are present exactly once and trace to a designed surface, exact action/state, and required evidence; no positive, negative, permission, recovery, preservation, migration, contract, or live-proof criterion is orphaned.
- The five artifacts remain faithful to approved W3-04 scope and give engineering and QA a complete, deterministic state/action contract: FR-015 precedence forbids lower-action substitution, provider outcomes retain one exact recovery, and responsive/accessibility behavior is testable at 375/390/768/1024/1440px plus zoom, keyboard, focus, announcements, themes, and reduced motion.
- Executable `@erp/ui` supports the mapped shared primitives and does not expose `TextArea`; the handoff correctly records the shared multiline/counter as a blocking W2-02 dependency with no Booking-local substitute. Page-override approval is limited to the proposed page contract and does not authorize writing the file, changing `MASTER.md`/`packages/ui`, or modifying production code.
