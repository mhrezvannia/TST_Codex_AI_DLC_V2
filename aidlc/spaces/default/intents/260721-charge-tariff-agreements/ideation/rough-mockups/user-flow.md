# User Flow - W2-03 Charge Tariffs & Agreements

This flow connects the [`intent-statement.md`](../intent-capture/intent-statement.md), [`scope-document.md`](../scope-definition/scope-document.md), and [`intent-backlog.md`](../scope-definition/intent-backlog.md) without expanding W2-03 into shared-shell, Booking-page, D&D, settlement, or general RMS redesign.

## Primary Happy Path

```text
Pricing analyst          Charge UI/API              Booking UI/service
      |                       |                            |
      | Create rate Draft     |                            |
      |---------------------->| validate references       |
      |<----------------------| saved Draft/version ID     |
      | Review + Approve rate |                            |
      |---------------------->| immutable Approved version |
      |                       |                            |
      | Create agreement v1   |                            |
      | attach OFR/BAF/THC -->| validate applicability     |
      | Save draft            |                            |
      |<----------------------| Draft v1                   |
      |                       |                            |
      | Review + Approve      |                            |
      |---------------------->| immutable Approved v1      |
      |<----------------------| approval evidence          |
      |                       |                            |
Booking desk                                            Create/open Booking
      |                                                    |
      |                                                    | request pricing
      |                       |<----------------------------|
      |                       | match approved agreement    |
      |                       | calculate OFR/BAF/THC       |
      |                       |---------------------------->|
      |                                                    | persist snapshot
      |                                                    | show line breakdown
```

Text fallback: analyst creates effective rate versions, attaches them to a draft agreement, approves an immutable version, and Booking receives/persists/displays the real itemised result.

## Repricing Branch

```text
Booking detail -> create amendment/change pricing input
               -> request pricing with next amendment sequence
               -> Charge matches versions effective for the new request
               -> Booking stores a new pricing snapshot
               -> UI shows current result and retained prior result/version
```

The Charge UI may link to related Booking proof but does not redesign Booking. The user must be able to distinguish original versus repriced snapshot by amendment sequence, pricing reference, agreement/rate versions, and time.

## No-Rate Branch

```text
Booking pricing request
        |
        v
Charge searches approved agreement and effective rate versions
        |
        +-- match --> itemised pricing result --> Booking PRICED snapshot
        |
        `-- no match
             |--> persist manual-pricing case
             |--> return manual-pricing result/reason
             |--> Booking status MANUAL_PRICING_REQUIRED
             `--> Charge Manual pricing queue exposes evidence and owned links
```

No-match never becomes zero price, partial total, transient failure, or guessed rate. Timeout, 503, circuit-open, denied, validation, conflict, and in-progress remain separate outcomes and recovery paths.

## Agreement Lifecycle Branches

| Starting state | Permitted primary action | Result | Lookup/pricing effect |
|---|---|---|---|
| Draft | Edit, save, approve | Approved version becomes immutable | Eligible only after approval and validity match |
| Approved | Create new version, suspend, expire where authorized | New draft or lifecycle transition | Original history retained |
| Suspended | View/audit; expire where authorized | Explicit lifecycle evidence | Excluded from active lookup while suspended |
| Expired | View/audit/create new version | Historical record remains | Excluded after validity end |

Approval failure keeps the user on the draft, focuses the validation summary, and links to invalid fields or missing rate versions. Stale/overlap conflicts preserve input and provide Reload/Review options.

## Rate Version Flow

```text
Rate entries list -> New rate entry
                  -> choose OFR/BAF/THC and category
                  -> BASE/SURCHARGE: select origin + destination + equipment
                  -> LOCAL/POL THC: select origin port + equipment; no destination
                  -> enter flat per-container USD amount/effective window
                  -> validate overlap and reference availability
                  -> save Draft version
                  -> Pricing Analyst approves immutable version
                  -> derive Scheduled/Effective/Expired from approved window
                  -> attach exact Approved version to an agreement draft
```

Unsupported commodity/weight/volume/index/FX dimensions do not appear as teaser controls. A changed commercial amount creates a new version rather than mutating one used by an approved agreement.

## Role and Authorization Flow

| Role | Permitted flow |
|---|---|
| Charge reader/auditor | Read agreements, rates, manual evidence, and audit only |
| Pricing analyst | Create/edit/approve rate and agreement versions, perform permitted suspend/expire actions, and investigate the manual-pricing role queue |
| Booking desk | Trigger reprice and inspect pricing/manual state in the existing Booking surface; no Charge mutation |

Without Charge-read capability, the shared denied route is shown. With Charge-read but no mutation capability, details remain readable and mutation commands are absent with explanatory text.

## Existing Booking Rendering Seam

The current Booking pricing region, without a route/navigation redesign, shows current state and amendment sequence; `pricingBasis`/`pricingRef`; code/category/basis/quantity/source unit rate/calculated line amount/currency per line; total; agreement and rate-version provenance; and current/prior snapshots after repricing. For no-rate it shows `MANUAL_PRICING_REQUIRED`, reason, and a link to case evidence. Provider `amount` is the line amount; any additive provenance fields require synchronized provider/consumer contract evidence.

Pending Reprice disables duplicate submission and announces `Repricing...`. Success announces and focuses no new region; the operator remains on the pricing section. Timeout, 503, circuit-open, denied, validation, and no-rate remain visibly different.

## Navigation and Focus Flow

1. Shared shell activates Charge Agreements and supplies skip-to-main; W2-03 does not alter it.
2. Module-local tabs change among Agreements, Rate entries, and Manual pricing using ordinary links with current-page indication.
3. List filters preserve values in the URL where supported; Back returns to the same result position.
4. New/Edit routes warn on dirty navigation and return focus to the initiating control after cancellation.
5. Invalid submit focuses the error summary; summary links focus the associated field.
6. Approval dialog focuses its heading/first safe control, traps focus, supports Escape before commit, and restores focus.
7. Save/approve/queue updates announce concise status through a polite live region without moving focus.
8. All Charge administration routes explicitly hide the workflow ribbon through existing route metadata.

## Responsive Flow

| Width | Flow behavior |
|---|---|
| 1440px | Full table/detail evidence rail when useful; one primary command per region |
| 1024px | Same routes and tasks; compact rail and stable table scroll |
| 768px | Evidence follows main content or accessible disclosure; forms reflow to one/two columns |
| 375px | Commands stack, filters collapse accessibly, records use compact rows or named horizontal scroll; create/edit/approve remain reachable |

## Screen-State Recovery

| Condition | Operator-visible response | Recovery |
|---|---|---|
| Reference lookup loading | Stable control/row skeleton | Wait; no layout shift |
| Reference service error | Region banner, unsaved input retained | Retry lookup |
| No list results | Explain active filters | Clear filters or create |
| Authorization denied | Explain required role; mutation absent | Back to permitted list/detail |
| Validation failure | Summary plus inline field text | Correct and resubmit |
| Stale agreement version | Preserve input; show changed version | Reload/review before save |
| Overlapping rate window | Identify conflicting version/window | Adjust dates or inspect existing rate |
| No applicable rate | Manual case and exact reason | Search/create rate or agreement; Booking stays manual |
| Provider timeout/503/circuit | Distinct degraded message | Existing retry/manual contract behavior; no false no-rate |

## Command State Contract

| Command | Pending | Success | Failure/recovery |
|---|---|---|---|
| Save Draft | Disable Save/Cancel only as needed; `Saving...`; prevent duplicate | Announce saved version and route to detail | Preserve fields; summary-first validation or safe Retry |
| Approve rate/agreement | Disable dialog confirm; `Approving...` | Announce immutable Approved version/status | Keep dialog or detail context; show specific conflict/validation |
| Reprice Booking | Disable Reprice; `Repricing...` | Announce new snapshot; retain prior selector | Preserve current snapshot; distinct timeout/503/circuit/manual treatment |
| Filter/select manual case | Busy state only in affected region | Announce result/selection | Preserve filters/selection; Retry region |

## Accessibility Acceptance Notes

- WCAG 2.1 AA applies in light and dark themes.
- All flows are keyboard-completable in visual order with visible `--erp-focus-ring` focus.
- Native links, buttons, forms, tables, headings, and dialogs are preferred; ARIA supplements rather than replaces semantics.
- Form labels persist; errors are programmatically associated and async state changes use polite announcements.
- Status uses text/icon plus token color; reduced motion disables nonessential transitions.
- Later Playwright/manual proof covers 375, 768, 1024, and 1440px, keyboard-only flow, loading/empty/error/denied/populated states, and approval focus restoration.

## Upstream Traceability

The `intent-statement` supplies the price/reprice/no-rate outcomes. The `scope-document` provides the Charge-only and shared-shell boundaries. The `intent-backlog` drives the happy-path skeleton first, followed by version depth, repricing, and manual/release closure.
