# Interaction Specification — W2-03 Charge Tariffs & Agreements

## Scope and Upstream Trace

This specification implements the approved [`wireframes.md`](../../ideation/rough-mockups/wireframes.md), [`user-flow.md`](../../ideation/rough-mockups/user-flow.md), [`stories.md`](../user-stories/stories.md), [`requirements.md`](../requirements-analysis/requirements.md), and [`team-practices.md`](../practices-discovery/team-practices.md). Charge owns the eight routed patterns below; Booking owns its existing page and receives only the minimum typed pricing-region addition. Browser traffic remains Browser → authenticated Next.js BFF → service API; browser-supplied actor identity is never authoritative.

## Route and Navigation Contract

| Route | Read/mutation | Ribbon | Primary entry/exit behavior |
|---|---|---|---|
| `/charge-agreements` | Read; New link when capable | Hidden | URL-backed list; open stable agreement version/detail. |
| `/charge-agreements/new` | Create Draft | Hidden | Cancel/back guards dirty state; success routes to new Draft detail. |
| `/charge-agreements/[agreementId]` | Read; lifecycle commands when capable | Hidden | Version remains addressable; successor/edit/approve only when valid. |
| `/charge-agreements/[agreementId]/edit` | Draft update only | Hidden | Approved target cannot edit; stale conflict preserves values. |
| `/charge-agreements/rates` | Read; New link when capable | Hidden | Unified category list with stable URL filters. |
| `/charge-agreements/rates/new` | Create Draft | Hidden | Category drives applicability; success routes to Draft detail. |
| `/charge-agreements/rates/[rateId]` | Read; Draft/lifecycle commands when capable; `?mode=edit` full-page Draft editor state | Hidden after DS-03 integration | History/dependency evidence; Draft edit stays inside this route pattern; successor never mutates Approved. |
| `/charge-agreements/manual-pricing` | Explicit Pricing Analyst evidence read | Hidden | Queue/selection preserves filters; no workflow mutations. |
| Existing Booking detail/pricing | Booking-owned read/reprice | Booking context unchanged | Typed current/prior snapshot; no route/nav redesign. |

Module-local Agreements / Rate entries / Manual pricing controls are ordinary links with `aria-current=page`, not a second global navigation system. Browser back/forward restores safe query/filter/selection context.

## End-to-End Interaction Flows

### Flow A — Rate to Agreement to Booking

1. Pricing Analyst opens Rate entries and creates one Draft each for OFR/BASE, BAF/SURCHARGE, and POL THC/LOCAL.
2. Each Save validates references/amount/window; each Approve dialog confirms match key and immutability. Approved state becomes Scheduled/Effective/Expired from the evaluated date.
3. Analyst creates an agreement Draft, selects one exact Approved version for each category, saves, reviews, and approves.
4. Booking requests pricing through its existing pricing port. Charge resolves the agreement first and returns exactly three itemised lines.
5. Booking persists and renders the typed immutable snapshot. UI evidence links the visible line/version values to the Charge detail and correlation.

### Flow B — Successor Reprice

1. Analyst creates/approves successor rate versions and a successor agreement version for the later requested-departure window.
2. Booking pricing-affecting amendment advances sequence and exposes Reprice; non-pricing amendment does not.
3. Reprice disables duplicate command, announces pending, sends the next revision-aware idempotency key, and appends the response.
4. Current/prior selector exposes both immutable snapshots and source versions; success does not overwrite the prior result.

### Flow C — No Rate and Ambiguity

1. Charge finds neither agreement nor complete tariff, persists one idempotent OPEN case, and returns 404 `NO_RATE`; ambiguity returns 422 `PRICING_VALIDATION` with a distinct reason and one OPEN case.
2. Booking projects `MANUAL_PRICING_REQUIRED`, blocks automatic confirmation, keeps reason/request/correlation, and renders no total.
3. Explicitly capable Pricing Analyst opens Manual pricing evidence, filters/selects the case, and navigates to related Booking/agreement/rate search only. No manual-resolution command exists.

## Component — Module Command and Filter Bar

| Field | Value |
|---|---|
| Component | `ChargeCommandBar` (domain composition) |
| Description | Module links, page search/filters, result count, and one primary create command. |
| Category | navigation / input / feedback |

### States

| State | Description | Trigger |
|---|---|---|
| default | Current module link, controls, result count | routed read complete |
| loading | Controls retained; affected result region busy | query change/read |
| filtered | Active values and visible Clear | non-default query |
| denied/read-only | No mutation command; data or denied route per capability | authorization |
| error | Filter values retained; region Retry | BFF/service read failure |

### Inputs and Events

Inputs: current subroute, query object, reference filter options, total, busy, canMutate. Events: submit filters, clear filters, page change, create navigation. Filter submission updates the URL atomically and announces result count; it does not mutate on focus.

### Responsive Behaviour

At 375 px commands wrap before filters; filters use one column/collapsible labelled region without hiding Apply/Clear. At 768 px two-column filters are allowed. At 1024/1440 px one compact command row is preferred.

### Accessibility

Use native links/forms/labels, `aria-current`, a named result status, and native pagination navigation. Keyboard order follows heading → primary command → module links → filters → results. No clickable container substitutes for a link/button.

## Component — Agreement Draft Form

| Field | Value |
|---|---|
| Component | `AgreementDraftForm` |
| Description | Stable agreement identity, customer/applicability/validity, and exact three-version commercial basis. |
| Category | input / layout / feedback |

### States

Default, reference-loading, dirty, submitting, validation-error, stale-conflict, service-error, and saved-success. Approved data never enters editable state.

### Inputs / Events

Inputs: Draft/version identity, references, three line selections, field/row errors, dirty/submitting. Events: field blur/change, select exact version, save, cancel, open source/conflicting record. Save serializes stable IDs/versions only. Failed save preserves all values; a stale response provides current/expected version and explicit Review/Reload.

### Responsive Behaviour

Two grouped columns only where labels/controls remain readable; one column at 375 and normally 768. Line table becomes three labelled category records on narrow screens without changing data/action order.

### Accessibility

Persistent labels and error links; summary focus on invalid submit; combobox ARIA pattern; row action names include category/code. Dirty dialog restores the initiating control. Fixed category requirement is explained rather than hidden.

## Component — Rate Draft Form

| Field | Value |
|---|---|
| Component | `RateDraftForm` |
| Description | Category-specific exact flat USD per-container rate authority. |
| Category | input / feedback |

### Conditional Model

| Selected code/category | Required controls | Absent controls |
|---|---|---|
| OFR / BASE | Origin, Destination, Equipment | commodity/weight/volume/index/FX/locality |
| BAF / SURCHARGE | Origin, Destination, Equipment | commodity/weight/volume/index/FX/locality |
| THC / LOCAL | Origin, Equipment, read-only Locality=POL | Destination and all unsupported dimensions |

Changing to LOCAL removes Destination from validation, DOM, and focus order; changing back requires it afresh. Unit rate uses decimal input, USD and `PER_CONTAINER` are visible fixed facts, and effective dates explicitly say inclusive.

### States and Events

Default, reference-loading, dirty, blur-validation, overlap-warning/error, submitting, service-error, saved. Save creates/updates Draft only. Approval is a separate detail command. Overlap response identifies the exact conflicting version/window and provides Open existing without clearing input.

### Accessibility and Responsive Behaviour

Same form/error/dirty rules as Agreement Draft. At 375 px one-column reading order is identity → applicability → money/window → notes → actions. Conditional changes receive a concise polite announcement, not focus movement.

### Draft Edit Route-State Transition

- Edit is exposed only when the server says `status=Draft`, mutation capability is present, and the current concurrency version is supplied.
- Activating Edit navigates to `/charge-agreements/rates/[rateId]?mode=edit` and renders the full-page `RateDraftForm`; it never turns detail/table cells into inline commercial editors.
- Initial values retain stable rate/version identity and expected version. Save updates only that Draft with expected version, idempotency/correlation, and session-derived actor at the BFF/service boundary.
- Successful Save returns to `/charge-agreements/rates/[rateId]`, refreshes detail/history, focuses the detail heading, and announces the saved Draft version. Cancel/Back returns to detail after the dirty-state guard when needed.
- Direct edit mode for a non-Draft or unauthorized actor returns read-only detail plus an explanation. A stale conflict preserves values, exposes expected/current version and state, and offers Review/Reload rather than overwriting.

## Component — Approval Dialog

| Field | Value |
|---|---|
| Component | `CommercialApprovalDialog` using `@erp/ui/Dialog` |
| Description | Confirms exact version, applicability/window, dependencies, and irreversible immutability. |
| Category | feedback / command |

### Inputs and States

Inputs: record type/ID/version, customer or match key, validity/effective window, exact source versions or unit rate, dependency/line count, busy/error. States: open-review, approving, validation/conflict error, success-close.

### Interaction

Trigger opens and names dialog. Cancel/Escape before commit closes and restores trigger. Confirm changes text to `Approving...` and blocks duplicate submission. Validation/conflict retains the dialog/detail context and announces specific recovery. Success closes, updates inline identity/status/history, emits one concise toast/live message, and never edits the approved payload.

### Accessibility / Responsive Behaviour

Dialog title and description name the affected version and immutable consequence; focus stays trapped and returns safely. At 375 px content wraps/scrolls inside dialog with actions visible and no page overflow.

The current shared `Dialog` does not itself trap Tab or restore the trigger. The Charge lifecycle-dialog composition must store the trigger, wrap the existing primitive with a scoped tabbable loop while open, and restore the trigger or stable detail heading after close/success. This is DS-01 domain behavior, not a new shared export; if Playwright cannot prove it without a W2-03 `packages/ui` edit, the cell is blocked pending W2-02.

## Component — Agreement Suspend / Expire Commands

| Field | Value |
|---|---|
| Component | `AgreementLifecycleCommands` + focused lifecycle dialog |
| Description | Secondary Approved-only commands that exclude authority from new pricing while retaining history. |
| Category | command / feedback |

### Preconditions and Placement

The BFF/service response must explicitly grant Pricing Analyst capability, current lifecycle must be Approved, and expected concurrency version must be present. Suspend and Expire appear as secondary commands in the agreement detail action cluster beside Create new version; they are absent for Draft/Suspended/Expired/read-only states. Existing service behavior permits each only from Approved.

### Confirmation and Submission

The dialog names agreement/version, validity, action consequence, unchanged historical Booking snapshots, and requires a reason. Submit includes action, stable ID, expected version, reason, correlation/idempotency, and server-derived actor. Confirm reads `Suspending...` or `Expiring...`; one in-flight guard prevents duplicates.

### Recovery and Success

Version/state conflict preserves dialog/detail context and reason, exposes current status/version, and offers Review/Reload. Service failure preserves reason and offers contract-safe Retry. Success replaces visible status, removes invalid commands, appends reason/actor/time/correlation in history/audit, focuses the stable detail heading/status region, and announces `Agreement … suspended/expired` once.

## Component — Commercial Detail and Version History

| Field | Value |
|---|---|
| Component | `CommercialDetail` + `VersionHistory` domain compositions |
| Description | Read-only identity, authority facts, source/dependency evidence, version selection, and collapsed audit. |
| Category | display / navigation |

### States

Skeleton, populated Draft/Approved/Suspended/Expired, read-only, section-error/retry, not-found, and long-content. Permitted commands derive from server capability/lifecycle facts; the browser does not infer permission from labels.

### Interaction / Accessibility

Stable record/version links keep history addressable. In-page tabs use the tested `Tabs` keyboard model only where content remains one route; ordinary links change versions/routes. Audit uses a native disclosure/tested equivalent. Identity/version/status and primary action precede secondary evidence in reading order.

## Component — Manual Evidence Queue

| Field | Value |
|---|---|
| Component | `ManualPricingEvidenceWorkspace` |
| Description | Filterable OPEN-case queue plus selected evidence; intentionally no case workflow. |
| Category | display / navigation / feedback |

### Inputs / Events

Inputs: explicitly authorized cases, selection, filters, total, busy/error. Events: filter, select/open case, copy evidence, open related Booking, search/open agreement/rate. There are no events for assign, quote, approve, resolve, or close.

### States

Loading, no open cases, filtered empty, populated, selection loading/error, denied/no disclosure, and long reason/identity. Replayed request retains one stable case.

### Accessibility / Responsive Behaviour

Queue rows are semantic links/buttons with selected state. Selection/result count changes announce once. Copy announces success. At 1440/1024 use master/detail; at 768/375 stack or navigate selection with Back to cases and preserved filters.

## Component — Booking Pricing Breakdown

| Field | Value |
|---|---|
| Component | Booking-owned `PricingBreakdown` extension |
| Description | Typed line itemisation, authority provenance, total, snapshot selection, reprice/manual/failure state. |
| Category | display / command / feedback |

### Inputs

Pricing state, requested departure, amendment/revision, current/prior immutable snapshots, ordered lines (code/category/basis/quantity/unit rate/amount/currency/source version), total, basis/reference/agreement version, correlation, canReprice, failure code/reason, busy.

### States and Failure Contract

| State | Display/action | Result constraint |
|---|---|---|
| priced | Lines, total, provenance; Reprice if eligible | Typed snapshot only |
| repricing | Preserve current; `Repricing...`; no duplicate | Append nothing until terminal success |
| no rate | `MANUAL_PRICING_REQUIRED`, `NO_RATE`, reason/evidence link | No total; confirmation blocked |
| ambiguity | `MANUAL_PRICING_REQUIRED`, `PRICING_VALIDATION`, ambiguity reason | No total; distinct from no-rate |
| timeout | `MANUAL_PRICING_REQUIRED` plus timeout/outage reason | At most one idempotent retry, then queue/flag manual; block confirmation; no price/snapshot |
| HTTP 503 | `MANUAL_PRICING_REQUIRED` plus `PRICING_UNAVAILABLE`/503 reason | At most one idempotent retry, then queue/flag manual; block confirmation; no price/snapshot |
| circuit open | Manual-required outage plus circuit-open reason | Skip immediate call; queue/flag manual until half-open policy permits a probe; block confirmation; no price/snapshot |
| denied | Denied code/recovery | No retry/price/manual-rate case |
| malformed request | `PRICING_BAD_REQUEST` integration-error state | Correct client/request; no retry; block confirmation; no price/snapshot/manual-rate case |
| semantic validation / commodity eligibility | `PRICING_VALIDATION` or `COMMODITY_NOT_ELIGIBLE` with exact reason | Correct data; no retry; block confirmation; no price/snapshot; only ambiguity creates an OPEN case |
| idempotency conflict | Conflict; preserve current context/snapshot | No automatic retry/append |
| in progress | `PRICING_IN_PROGRESS` pending + `Retry-After` guidance | Retry only after guidance; no duplicate/confirmation/new snapshot |

### Interaction / Accessibility / Responsive Behaviour

Current/prior controls expose selected amendment and retain focus context. Reprice success selects/announces the new snapshot once. Pricing table has caption/headers; total is programmatically related. At narrow widths use a named horizontal region or labelled line records. This component does not change Booking route, tabs, shell, or navigation.

## BFF, Server-State, and Mutation Behaviour

- Initial routed reads should follow existing app conventions and authenticated BFF/service adapters; ui-ux-pro-max server-component advice does not authorize bypassing `api-core`, query cache, BFF security, or current ports.
- BFF derives actor/service identity from the signed session/configured service boundary. Client payload contains domain values and idempotency/correlation inputs only where contract-authorized.
- Reads expose explicit loading/not-found/denied/service-error states; no hardcoded/fallback commercial rows replace failed service data.
- Save/approve/reprice commands use one in-flight guard plus server idempotency. Pending labels remain visible and stable. On validation/service error, preserve form/current snapshot and provide contract-safe retry only.
- Successful mutations invalidate/revalidate only owned Charge or Booking keys/routes; they do not import app-to-app code or read another service database.
- The canonical pricing consumer/provider contract is `POST /pricing-requests`; additive line/provenance changes require synchronized OpenAPI, provider, and Booking consumer evidence.

## Shared UI Dependencies and Honest Acceptance

| Dependency | Observed current behavior | W2-03 boundary | Gate treatment |
|---|---|---|---|
| DS-01 `Dialog` | Focuses dialog container and handles Escape; no Tab trap or trigger restoration. | Charge-local lifecycle-dialog behavior wrapper around existing `Dialog`; no shared export or package edit. | Playwright must prove trap/restore, otherwise blocked pending W2-02. |
| DS-02 `Combobox` | Keyboard selection exists; no `aria-activedescendant` or explicit async loading/error props. | Surround with `Skeleton`/`StatusStrip`, mount after settled options; no custom shared combobox. | Full active-option/async AA cell blocked until W2-02 or an approved existing alternative is integrated. |
| DS-03 `PlatformShell` | Always renders title-inferred ribbon; no route-metadata suppression seam. | No Charge CSS/shell workaround; integrate W2-02 seam. | All no-ribbon Charge cells blocked until the running integrated shell proves suppression. |

The design intent does not convert these observed gaps into PASS. Evidence must name the integrated revision and running Playwright result.

## Focus and Announcement Sequence

| Event | Focus | Announcement |
|---|---|---|
| Routed load | Shared skip link/main heading remains target | One loading then page-ready status only if useful |
| Invalid submit | Error summary | Assertive summary count; field text remains linked |
| Save success | New detail heading or stable form heading per navigation | Polite “Draft … saved” + concise toast |
| Approval open/cancel | Dialog first safe control / restored Approve trigger | Dialog name/consequence through description |
| Approval success | Stable detail heading/status region | Polite Approved version identity |
| Reprice pending/success | Reprice trigger/region; no forced move | `Repricing...`; then new amendment/snapshot identity once |
| Queue filter/select | Trigger/selected evidence heading where navigation changes | New count/selection once |
| Copy evidence | Copy trigger unchanged | Polite “Correlation copied” |

## Verification Hooks

Every component/state above must be reachable using real BFF/API-controlled fixtures or live state in tests. Playwright covers direct navigation/reload/back, successful create/approve/price/reprice/no-rate flows, validation/conflict, distinct failures, authorization, keyboard/focus, light/dark, and 375/768/1024/1440. Static source inspection or hardcoded demo data is insufficient.
