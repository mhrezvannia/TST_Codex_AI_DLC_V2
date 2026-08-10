# Refined Mockups — W2-03 Charge Tariffs & Agreements

## Design Frame and Traceability

These text-renderable mid/high-fidelity mockups refine [`wireframes.md`](../../ideation/rough-mockups/wireframes.md), [`user-flow.md`](../../ideation/rough-mockups/user-flow.md), [`stories.md`](../user-stories/stories.md), [`requirements.md`](../requirements-analysis/requirements.md), and [`team-practices.md`](../practices-discovery/team-practices.md). They inherit the shared authenticated shell and `@erp/ui`; shell chrome is omitted below. All Charge administration routes require no journey ribbon, but the currently observed `PlatformShell` lacks the suppression seam and remains blocked on named W2-02 dependency DS-03—this mockup is not evidence that the ribbon is already hidden. The existing Booking page is annotated only at its pricing region.

## Shared Routed Content Frame

```text
<main id="main-content">
  Back/breadcrumb when detail/editor
  h1 + stable object/page identity                         Primary command
  Agreement | Rate entries | Manual pricing               module-local links
  persistent status / read-only / service banner when applicable
  page-specific command/filter/task region
  page-specific evidence/history region
  polite async status region
</main>
```

At 1440/1024 px, content may use `minmax(0,1fr)` plus a compact evidence rail. At 768 px the rail follows the task. At 375 px commands wrap before content, forms are one column, and tables use semantic record rows or a named horizontal region. No route adds local shell/navigation, theme control, hero, KPI cards, chart, or workflow ribbon.

## Page 1 — Agreement List (`/charge-agreements`)

```text
Charge Agreements                                      [New agreement]
Agreements (24) | Rate entries | Manual pricing (2)

[Search agreements................] [Status: All v] [Valid on: yyyy-mm-dd]
[Customer............... v] [Lane............. v]      [Clear] [Apply filters]
24 agreements · Showing 1–20

Agreement  Customer              Version  Status    Lane/equipment      Validity        Action
AGR-1042   Acme Manufacturing    v3       Approved  CNSHA→DEHAM / 40HC  01 Jul–31 Dec   Open →
AGR-1048   Northwind Logistics   v1       Draft     SGSIN→NLRTM / 40HC  15 Jul–30 Nov   Open →
...

Pagination: [Previous]  Page 1 of 2  [Next]
```

- Page title and New agreement remain visible before filters. Only the agreement reference is the primary row link; actions are semantic links/buttons.
- Search/filter values are URL-backed. Apply announces the new result count. Clear resets only module filters.
- Loading preserves command/table dimensions with skeleton rows. First-use empty offers New agreement; filtered empty offers Clear filters. Service error preserves filters and offers Retry.
- Reader mode shows the same records without New/mutation commands. No Charge-read capability uses the shared denied route and discloses no counts.

## Page 2 — New Agreement (`/charge-agreements/new`)

```text
← Agreements
New agreement draft                                    Draft

Error summary (only after invalid submit; focus target)

Agreement identity                    Applicability and validity
Agreement number [AGR-_____]          Origin [CNSHA... v]
Customer [Search active customer..]   Destination [DEHAM... v]
Valid from [yyyy-mm-dd]                Equipment [40HC... v]
Valid to   [yyyy-mm-dd]

Exact approved rate versions
Category/code    Version selector                  Window/applicability          Remove
BASE / OFR       [R-OFR-004 · Effective... v]     USD 1,840.00 / lane / 40HC    —
SURCHARGE / BAF  [R-BAF-007 · Effective... v]     USD   220.00 / lane / 40HC    —
LOCAL / POL THC  [R-THC-003 · Effective... v]     USD   145.00 / POL / 40HC     —

Agreement becomes approvable only with one compatible approved version per category.
                                                       [Cancel] [Save draft]
```

- Create starts with the three required category rows, not an arbitrary blank commercial spreadsheet. Selectors show only Approved candidates but retain an unavailable selected value long enough to explain a stale conflict.
- Reference lookup has local skeleton/no-results/error/retry states and never replaces entered values.
- Save pending reads `Saving...`, blocks duplicate save, then announces and routes to the new Draft detail. Invalid save focuses the summary and links to fields/rows.
- Dirty Back/Cancel/browser navigation opens the unsaved-changes dialog; safe cancel restores the initiating control.

## Page 3 — Agreement Detail (`/charge-agreements/[agreementId]`)

```text
← Agreements
AGR-1042 / v3            [Approved]                 [Create new version]
Acme Manufacturing · CNSHA→DEHAM · 40HC · 01 Jul–31 Dec 2026

Overview | Charge lines | Version history | Audit

Commercial basis                              Pricing evidence
Customer         Acme Manufacturing           Agreement ref     AGR-1042/v3 [Copy]
Lane/equipment   CNSHA→DEHAM / 40HC            Approved          21 Jul 2026 10:32
Validity         01 Jul–31 Dec 2026 inclusive  Correlation       corr-... [Copy]

Code  Category    Basis          Unit rate      Version       Applicability
OFR   BASE        Per container  USD 1,840.00   R-OFR-004     CNSHA→DEHAM / 40HC
BAF   SURCHARGE   Per container  USD   220.00   R-BAF-007     CNSHA→DEHAM / 40HC
THC   LOCAL/POL   Per container  USD   145.00   R-THC-003     CNSHA / 40HC

Version history
v3 Approved  current · 01 Jul–31 Dec · opened 21 Jul
v2 Expired             · 01 Jan–30 Jun · open →

Audit evidence [collapsed ▾]
```

- Draft variant exposes Edit and Approve; Approved never exposes edit-in-place. Suspended/Expired show readable reason/effective consequence and permitted successor action only.
- Approval dialog summarizes version, customer/lane/equipment, validity, the three exact rate versions, and immutability. Failure retains context; success updates status/history and restores focus to the prior Approve location/detail heading as appropriate.
- Version selection uses links or in-page panels while keeping each version addressable. Audit is collapsed by default and contains actor/correlation/transport detail.

### Approved Agreement Lifecycle Commands

- **Preconditions:** server response explicitly grants the Pricing Analyst capability and current state is Approved. Suspend and Expire are secondary lifecycle commands beside Create new version; neither appears for Draft/Suspended/Expired or read-only users. The browser never infers capability from the label.
- **Confirmation:** a focused dialog names agreement/version, current validity, command consequence for new pricing, unchanged historical snapshots, and a required reason. Suspend states “excluded from new pricing until a later supported lifecycle action”; Expire states “terminal for new pricing.”
- **Submission:** command carries expected version, reason, idempotency/correlation, and session-derived actor. Confirm reads `Suspending...`/`Expiring...`; duplicate submission is blocked.
- **Conflict/service recovery:** deterministic version/state conflict preserves detail context and reason, shows current status/version, and offers Review/Reload. Service failure preserves reason and offers safe Retry only when the contract permits.
- **Success:** detail status becomes Suspended/Expired, command disappears, history/audit appends the actor/reason/time/correlation event, and one polite announcement names the new state. Focus moves to the stable detail heading/status region, not an absent trigger.

## Page 4 — Edit Agreement Draft (`/charge-agreements/[agreementId]/edit`)

The layout is Page 2 with a stable header `AGR-1042 / Draft v4`, a link to source Approved v3, and a visible statement: “Changes affect Draft v4 only; Approved v3 remains unchanged.”

```text
← AGR-1042 / v4
Edit agreement Draft v4                                Draft
Based on Approved v3 [Open source]

[same grouped fields and exact-version rows as create]

Stale-version status (conditional):
Another update changed Draft v4. Your values are preserved. [Review changes] [Reload]
                                                       [Cancel] [Save changes]
```

- Direct navigation to edit an Approved version redirects/returns to detail with an immutable-state explanation; it never silently creates a successor.
- Concurrent/stale response keeps values, identifies the expected/current version, and requires explicit review/reload.
- Category completeness and effective-coverage errors are line-specific plus summary-linked.

## Page 5 — Unified Rate List (`/charge-agreements/rates`)

```text
Rate entries                                             [New rate entry]
Agreements | Rate entries (38) | Manual pricing (2)

[Search........] [Category: All v] [Status: Effective v] [Valid on: date]
[Origin...... v] [Destination... v] [Equipment... v]      [Clear] [Apply]
38 versions · Showing 1–20

Code Category       Applicability          Basis          USD unit rate  Window          Ver/State
OFR  Base           CNSHA→DEHAM / 40HC     Per container  1,840.00       Jul–Dec 2026    v4 Effective →
BAF  Surcharge      CNSHA→DEHAM / 40HC     Per container    220.00       Jul–Dec 2026    v7 Effective →
THC  Local · POL    CNSHA / 40HC           Per container    145.00       Jul–Dec 2026    v3 Effective →

[Previous] Page 1 of 2 [Next]
```

- One table/system covers all categories. Destination shows “Not used for POL local” or is omitted in compact rows; it is never a hidden discriminator.
- Draft, Scheduled, Effective, and Expired are text/icon statuses. Effective state is derived for the selected valid-on date.
- Narrow record rows preserve Code/Category, applicability, unit rate, version/state, window, and Open action in that order.
- Overlap filters may reveal conflicting historical data but list UI never offers bulk edit/approval.

## Page 6 — New Rate (`/charge-agreements/rates/new`)

```text
← Rate entries
New rate Draft                                          Draft

Commercial identity                 Applicability
Charge code [OFR v]                 Origin [CNSHA... v]
Category    [BASE · derived/read]    Destination [DEHAM... v]
Basis       [PER_CONTAINER · fixed] Equipment [40HC... v]
Currency    [USD · fixed]

Unit rate [1840.00]                 Effective from [yyyy-mm-dd]
                                      Effective to   [yyyy-mm-dd]
Notes [optional........................................................]

Potential overlap/conflict region appears after required match fields are known.
                                                       [Cancel] [Save draft]
```

- Selecting THC changes category to LOCAL, shows “Locality: POL”, retains Origin + Equipment, and removes Destination from the DOM/focus order. OFR/BAF require Origin + Destination + Equipment.
- Unsupported commodity, weight, volume, FX, indexed, and destination-local controls do not appear.
- Amount validates on blur as non-negative USD with no more than two decimals. Dates state inclusive semantics.
- Existing-authority overlap response names the conflicting version/window and offers Open existing; it preserves all input and creates no Approved authority.

## Page 7 — Rate Detail (`/charge-agreements/rates/[rateId]`)

```text
← Rate entries
BAF surcharge / R-BAF / v7        [Effective]           [Create successor]
CNSHA→DEHAM · 40HC · PER_CONTAINER · USD 220.00

Rate facts                         Dependencies
Effective window  01 Jul–31 Dec   Approved agreements using v7 (3)
Approved          20 Jun 2026     AGR-1042/v3 [Open]
Derived state     Effective       AGR-1050/v1 [Open]
Source/version    R-BAF-007       ...

Version history
v7 Approved/Effective current
v6 Approved/Expired  [Open]

Audit evidence [collapsed ▾]
```

- Draft variant exposes Edit and Approve. Edit navigates within the same approved route pattern to `/charge-agreements/rates/[rateId]?mode=edit`; it is a full-page editor state, not table/field inline editing. The server must return Draft status, current immutable version identity, and expected concurrency version before fields render.
- In rate edit mode, Save updates that Draft only and includes the expected version. Success removes `mode=edit` and returns to the same detail identity with saved evidence. Cancel/Back returns to detail; dirty navigation uses the unsaved-changes dialog. A stale conflict preserves values, names expected/current version, and offers Review/Reload. Direct edit mode for non-Draft or unauthorized users returns to read-only detail with an explanation.
- Approval dialog describes exact match key, unit rate/window, overlap check, and immutability.
- Approved detail is read-only. Successor begins a new Draft prefilled from the selected version but receives a new immutable version identity.
- Dependency links explain why the approved version cannot be edited/deleted; they do not create cross-domain mutation.

## Page 8 — Manual Pricing Evidence (`/charge-agreements/manual-pricing`)

```text
Manual pricing required                                  2 OPEN cases
Agreements | Rate entries | Manual pricing (2)

[Booking/ref........] [Reason: All v] [Received: range] [Clear] [Apply]

Queue (master)                              Selected evidence
BKG-781 · NO_RATE                            MPC-2041 · OPEN
CNSHA→USLAX / 40HC                           MANUAL_PRICING_REQUIRED
10:42 · Open →                              No approved agreement or complete tariff

BKG-790 · PRICING_VALIDATION                 Booking/request   BKG-781 / pricing-...
Ambiguous OFR authority                      Context           customer/lane/equipment/date
10:49 · Open →                              Correlation       corr-... [Copy]
                                             Opened            21 Jul 10:42
                                             [Open Booking] [Search agreements] [Open rates]
                                             Audit evidence [collapsed ▾]
```

- Only an explicitly capable Pricing Analyst receives counts/data. Denied users receive no case metadata. Charge-read alone grants no implicit manual-case access.
- The page is evidence and owned navigation only. It never exposes assignee, manual amount, approval, resolution, closure, or celebratory empty-state behavior.
- `NO_RATE` and ambiguity remain readable and distinct. Timeout/503/circuit/denied/other validation/in-progress do not masquerade as OPEN missing-rate cases.
- At 1440/1024 the queue and selected case may be split; at 768/375 selection navigates or stacks with a clear Back to cases link and preserved filters.

## Annotated Existing Booking Pricing Region — Integration Only

```text
Pricing: Priced · Amendment 2                              [Reprice]
[Current amendment 2] [Previous amendment 1]
Basis AGREEMENT · Ref AGR-1042/v3 · Requested departure 15 Jul 2026

Code Category    Basis          Qty  Unit rate      Line amount    Currency  Source
OFR  Base        Per container  2    1,840.00       3,680.00       USD       R-OFR-004
BAF  Surcharge   Per container  2      220.00         440.00       USD       R-BAF-007
THC  Local/POL   Per container  2      145.00         290.00       USD       R-THC-003
                                                    Total 4,410.00 USD

Agreement v3 · Pricing ref/correlation [Audit ▾]
```

- This adds no new Booking route, shell, navigation, tab set, or page composition. It replaces only opaque/flattened pricing content with the typed itemisation and provenance.
- Reprice pending shows `Repricing...`, blocks duplicates, preserves current data, and appends/selects the new immutable snapshot on success.
- No-rate variant shows `MANUAL_PRICING_REQUIRED`, exact reason/evidence link, blocks automatic confirmation, and shows no total.

### Booking Failure Variants in the Existing Region

| Condition | Visible region content | Operator action | Confirmation/snapshot |
|---|---|---|---|
| Timeout | `MANUAL_PRICING_REQUIRED` + timeout/outage reason, not `NO_RATE` | At most one idempotent Retry; then manual queue/flag evidence | Block; no price or snapshot |
| HTTP 503 | `MANUAL_PRICING_REQUIRED` + `PRICING_UNAVAILABLE`/503 reason | At most one idempotent Retry; then manual queue/flag evidence | Block; no price or snapshot |
| Circuit open | Manual-required outage + circuit-open reason | No immediate call; explain manual queue and half-open recovery | Block; no price or snapshot |
| Denied | Denied code/correlation and authorization recovery | No retry and no missing-rate case | Block; no price or snapshot |
| Malformed request | `PRICING_BAD_REQUEST` integration-error state | Correct request/client; no retry | Block; no price or snapshot |
| Semantic validation / commodity eligibility | `PRICING_VALIDATION` or `COMMODITY_NOT_ELIGIBLE` + field/domain reason | Correct data; no retry. Only ambiguity creates OPEN case | Block; no price or snapshot |
| Idempotency body conflict | `IDEMPOTENCY_CONFLICT`; current snapshot/context retained | Review conflicting amendment/body; no automatic retry | Block new result; append nothing |
| Existing request in progress | `PRICING_IN_PROGRESS` + pending status and `Retry-After` guidance | Retry only after guidance; no duplicate claim | No confirmation/new snapshot while pending |

## State Matrix by Surface

| State | Lists/queue | Editors | Details | Booking region |
|---|---|---|---|---|
| Loading | Stable table/record skeleton | Reference-region skeleton only | Identity/section skeleton | Pricing-region skeleton only |
| Empty/not found | First-use or filtered-empty recovery | Not applicable | Not-found + back/search | No snapshot/pending guidance |
| Populated | Real counts/pagination | Real references/values | Real versions/evidence | Typed lines/snapshots |
| Validation/conflict | Filter hint only | Summary + field/row links; preserve values | Invalid lifecycle/stale explanation | Distinct validation/conflict state, no price |
| Pending command | Affected filter region | `Saving...` | `Approving...` | `Repricing...`/in-progress |
| Success | Count announced | Toast + routed Draft detail | Inline status/history + toast | New snapshot announced |
| Service/degraded | Region Retry, no fake data | Preserve values + safe Retry | Preserve identity + section Retry | Timeout/503/circuit manual-outage semantics |
| Denied/read-only | No data or mutation | denied route | readable facts if explicitly capable | existing Booking authorization treatment |
| Manual/no-rate | manual queue rows only | not applicable | related evidence link only | manual state, reason, no total |
| Long/overflow | named table overflow/records | labels/IDs wrap | copyable IDs, line table region | named line table region |

## Visual and Responsive Acceptance

- Use quiet token surfaces, compact headings, 12–24 px shared spacing, 8 px maximum panel radius, stable 150–250 ms color/border transitions, and no decorative animation.
- At 375 px, no primary command disappears; module links may scroll as a named region or wrap; evidence follows the task; dialogs and error summaries fit without page overflow.
- At every width/theme, long customer names, agreement/rate IDs, reason text, dates, and money remain readable. Light/dark is a token change, not a separate composition.
- Playwright must exercise real routed/API-backed pages. Source review, static screenshots, or hardcoded demo rows cannot satisfy completion.

## Review

Iteration: 1  
Verdict: NOT-READY

Findings:

1. **Draft-rate editing has no implementable route or transition.** Page 7 exposes `Edit`, and `RateDraftForm` claims update behavior, but the eight-route contract contains no rate-edit route and the artifacts do not say whether `/charge-agreements/rates/[rateId]` enters an edit mode, navigates with a defined query/state, or uses another approved transition. Specify the destination, initial data/version guard, Save/Cancel/back behavior, success destination, and stale-conflict recovery while preserving the approved eight-route boundary and the prohibition on inline commercial editing.
2. **Agreement suspension and expiry are named but not interaction-specified.** FR-003, FR-205, FR-602, the page override, and US-05 require permitted suspend/expire lifecycle actions, yet the detail mockup only describes how already Suspended/Expired records render. Define capability/state preconditions, command placement, confirmation content, pending/duplicate guard, deterministic conflict/service recovery, success focus/announcement, and resulting history/status evidence; otherwise engineering and QA cannot build or test this required branch.
3. **The constrained Booking seam regresses the approved failure matrix into vague grouped behavior.** `interaction-spec.md` combines timeout/503/circuit-open and malformed/semantic-validation paths and delegates recovery to “the bilateral contract”; `mockups.md` similarly points to US-11 instead of specifying the visible code, retry/manual action, confirmation rule, and snapshot result. Restore all eight distinct US-11 outcomes in this interaction layer so the minimum Booking-region change is implementation-ready without redesigning the Booking page.
4. **The “source-verified existing primitives” mapping overstates current `@erp/ui` and shell capability.** The current shared `Dialog` focuses the dialog container and handles Escape but does not trap Tab focus or restore the trigger; `Combobox` does not expose the active option with `aria-activedescendant` or provide the specified async loading/error contract; and `PlatformShell` still renders the ribbon from title inference with no route-metadata suppression seam. Because W2-03 must not change `packages/ui` or redesign the shell, record these as explicit W2-02 dependencies (or specify a permitted domain composition using existing tokens) and make the blocked accessibility/ribbon acceptance cells honest rather than asserting unsupported behavior.

## Revision After Review Iteration 1

- Defined Draft-rate edit as full-page `?mode=edit` state inside the existing rate-detail route pattern, including Draft/capability/version guard, Save/Cancel/back, success destination, dirty guard, and stale-conflict recovery.
- Added complete Approved-agreement Suspend/Expire interaction preconditions, required reason/confirmation, expected-version command, pending/duplicate guard, conflict/service recovery, and success history/focus/announcement.
- Restored all eight Booking failure variants with visible content, action, confirmation, and snapshot outcomes inside the constrained pricing region.
- Recorded observed shared `Dialog`, `Combobox`, and `PlatformShell` limitations as DS-01/DS-02/DS-03 W2-02 dependencies, permitted only a Charge-local dialog behavior wrapper, and made unintegrated acceptance cells explicitly blocked rather than passed.

## Review — Iteration 2

Verdict: NOT-READY

The four iteration-1 findings are resolved: Draft-rate editing is a guarded same-route `?mode=edit` transition; Approved-only Suspend/Expire behavior is implementation-testable; the constrained Booking region specifies all eight preserved failure variants; and DS-01/DS-02/DS-03 accurately record current shared limitations, W2-03 ownership boundaries, and blocked evidence cells.

Remaining material finding:

1. **Manual-evidence authorization is still contradictory in the revised Charge page override.** `design-system/linercore/pages/charge-and-agreements.md` grants the “Charge reader/auditor” role “Read evidence” in the Manual queue column, while the refined mockups, accessibility checklist, US-12, and the same override's surrounding contract require an explicit Pricing Analyst manual-evidence capability and state that Charge-read alone grants no entitlement. Remove the reader/auditor grant or name and trace a separate explicit capability consistently; until then engineering and QA cannot determine who may receive protected case counts, reasons, Booking references, and correlations.

## Post-Reviewer-Limit Resolution

The two Product Lead iterations are preserved above as NOT-READY and are not rewritten. After the iteration limit, the lead corrected the sole remaining contradiction in `design-system/linercore/pages/charge-and-agreements.md`: Charge reader/auditor now has no implicit Manual queue access, and both the role matrix and route text require the explicit Pricing Analyst manual-evidence capability before disclosing case counts, reasons, Booking references, or correlations.

Lead final consistency check: the page override, US-12, refined mockups, interaction specification, and accessibility checklist now agree on the same capability/no-disclosure rule. No reviewer finding remains open. This supports the human stage gate but is not represented as a Product Lead READY verdict.
