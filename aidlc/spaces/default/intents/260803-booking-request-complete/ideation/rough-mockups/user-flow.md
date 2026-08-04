# User Flow — W3-04 Booking Request Completeness

## Flow basis

This flow realizes the customer outcome in `intent-statement.md`, the complete vertical slice in `scope-document.md`, and the dependency order in `intent-backlog.md`. It preserves the established Booking queue, one-page request entry, and route-backed operational record while adding commercial completeness, authoritative schedule provenance, quantity without a physical container identifier, safe legacy correction, exact pricing, and compatible confirmation.

## Actors and entry points

| Actor | Primary entry | Goal |
|---|---|---|
| Booking-desk user | `New booking` from Booking queue | Create and progress a complete FCL-dry request |
| Customer-service user | Existing Booking record | Reopen, explain, or correct a request without losing facts |
| Read-only operational/audit user | Existing Booking record or filtered queue | Inspect request, pricing basis, state, and evidence without unauthorized commands |

The shared authenticated shell owns navigation and access boundaries. Booking owns only its routed content and page composition.

## Primary happy path

```text
[Booking queue]
      |
      | New booking
      v
[Grouped request form]
      |
      | select canonical parties, commodity, ports, voyage, equipment type
      | enter customer reference, cargo measures, requested date, quantity
      | review derived schedule and completeness
      v
{Locally valid enough to save?} -- no --> [Linked errors] --> [Correct fields]
      |
     yes
      v
[Save draft once]
      |
      v
[Booking detail / Overview: Draft]
      |
      | Validate references
      v
{Required facts current and valid?} -- no --> [Validation blocked] --> [Correct same record]
      |
     yes
      v
[Validated / Request pricing]
      |
      v
[Charges: exact itemised pricing]
      |
      | Confirm booking
      v
[Review impact dialog]
      |
      v
[Confirmed record + compatible downstream publication]
      |
      v
[Overview/Charges/Journey/Activity inspection]
```

The user never enters or sees a fabricated initial container identifier. Confirmation publishes only the approved current routing/equipment state downstream; party and cargo remain Booking-owned.

## Create and correction flow

```text
CREATE
Queue -> New booking -> Empty grouped form -> Save draft -> New record

CORRECT CURRENT RECORD
Detail blocker -> Correct booking -> Same grouped form with existing facts
               -> Save correction -> Updated revision -> Validate again

LEGACY RECORD
Detail -> Explicit incomplete reasons -> Correct booking
       -> Authoritative legacy facts prefilled
       -> Unknown/missing values labelled for review
       -> Save correction -> Updated revision
```

Rules:

1. Correction never opens an unrelated empty request.
2. Safe authoritative facts are preserved; unsupported legacy values are not guessed.
3. Optional consignee, notify party, and volume may remain empty.
4. Any pricing-determining correction visibly invalidates stale pricing and requires repricing before confirmation.
5. A schedule-affecting correction requires an authoritative compatible voyage and refreshed derived facts.

## Reference and schedule flow

```text
[Choose POL + POD + requested departure]
                 |
                 v
        [Choose compatible voyage]
                 |
                 v
[Show read-only carrier voyage, ETD, ETA,
 cargo cutoff, documentation deadline + source]
                 |
                 v
{Reference current and complete?}
      | yes                         | no / degraded
      v                             v
[May validate]              [Preserve request; show affected
                             facts; block dependent progress;
                             offer bounded retry/reselection]
```

Requested departure remains an editable POL-local date. Derived schedule facts remain timezone-aware and must never be silently converted into editable or guessed values.

## Pricing and confirmation flow

```text
[Validated request]
      |
      | Request pricing once for the current determining facts
      v
{Provider result}
  | priced          | pending/uncertain        | no-rate/error
  v                 v                          v
[Charges]      [Refresh same request]     [Explain exact state]
  |                 |                          |
  |                 +-----------<--------------+ retry/manual path when approved
  v
[Confirm enabled only with complete authoritative pricing evidence]
      |
      v
[Impact dialog: request + route/schedule + quantity/type + pricing basis]
      |
      v
{Command outcome}
  | confirmed       | uncertain/replay       | conflict/rejection
  v                 v                        v
[Success]      [Same command identity]   [Keep record; focus recovery;
                                          review latest/correct]
```

Duplicate clicks, Enter activation, touch, and retries do not create a second draft, pricing request, confirmation, lifecycle event, or downstream publication.

## Negative and degraded branches

| Trigger | User-visible branch | Data/context retained | Exit from branch |
|---|---|---|---|
| Session or permission invalid | Canonical signed-out/denied boundary | Safe destination only; protected facts removed | Sign in, request access if supported, or return |
| One reference set fails | Affected field unavailable; other sections remain usable | Every committed and entered value | Retry only the affected source |
| Selected reference becomes stale | Value remains visible with explicit warning | Whole request and field identity | Reselect or refresh; confirmation stays blocked |
| Required fact missing/invalid | Linked summary and field error | Whole request | Correct field; focus/announcement confirms result |
| Draft save times out | Outcome-unknown status | Frozen payload and request identity | Check/retry same request identity |
| Legacy record lacks new facts | Explicit incomplete blocker | All authoritative legacy facts | Correct same record |
| Concurrent edit detected | Revision conflict | User edits, active view, queue return context | Load/review latest; deliberately reapply if needed |
| Pricing pending | Waiting state in Charges | Exact current pricing basis and request identity | Refresh same request; no duplicate price action |
| No rate/manual pricing | Controlled commercial state | Complete request and known provider evidence | Approved manual route or responsible-team guidance |
| Pricing provider unavailable | Inline recoverable error | Record, tab, inputs and list context | Retry when safe |
| Confirmation outcome uncertain | Stable Confirming/check state | Reviewed revision, pricing snapshot and command identity | Resolve same command identity |
| Booking read unavailable | Compact recoverable record state | Safe `returnTo`, active view where safe | Retry or Back to bookings |
| Not found/masked denial | Approved terminal state | No protected existence facts | Back/request access when supported |

## Screen and state transitions

| From | Action | To | Focus/announcement |
|---|---|---|---|
| Queue | New booking | Empty request form | Page `h1`; normal keyboard entry begins at first field |
| Form | Blocked Save draft | Same form with errors | Linked summary focused; errors announced once |
| Form | Successful Save draft | Draft Overview | Record `h1`; `Draft saved` announced politely |
| Draft Overview | Validate | Validation result | Busy state remains stable; result announced once |
| Blocked Overview | Correct booking | Same-record correction form | Correction `h1`, then first incomplete field by user navigation |
| Correction | Conflict | Same form plus conflict | Conflict heading focused; no silent resubmit |
| Validated Overview | Request pricing | Charges/pricing state | Charges heading or focused action status |
| Priced record | Confirm booking | Impact dialog | Initial focus on Cancel; focus trapped |
| Dialog | Confirm | Confirming record state | Progress announced; duplicate activation disabled |
| Confirming | Success | Confirmed Overview | Updated status/heading; confirmation announced once |
| Any route-backed view | Choose another view | Same record/view route | New view `h2` focused; browser history preserved |

## Responsive flow behavior

- At 375/390 px the journey order remains linear; no action is hidden behind horizontal page scrolling or a sticky keyboard-obscuring footer.
- At 768 px grouped fields pair only when persistent labels, errors, and values remain readable.
- At 1024/1440 px the review/completeness summary may remain visible beside the form, but it does not become a second navigation rail.
- The same decisions, errors, recovery paths, and lifecycle actions exist at every breakpoint; mobile is not a reduced-function workflow.

## Accessibility flow contract

- The skip link leads to one `main`; every route has one `h1`; form groups and detail sections have meaningful headings.
- Canonical selector results, loading, no-match, stale, and retry outcomes are announced without repeating unchanged status.
- Error summaries link to labelled fields; nearby errors are programmatically associated; status is never conveyed by color alone.
- Dialogs trap and restore focus; route-backed view navigation uses links and `aria-current`; reduced motion preserves text/progress meaning.
- Recoverable failures keep user entries. Security-boundary changes remove protected values rather than retaining them in browser storage.

## Scope and handoff boundaries

The flow covers all five proto-increments in `intent-backlog.md`: authoritative request spine, commercial completeness, legacy correction, exact pricing, and compatible confirmation/live proof. Exact field lengths, precision, copy, authorization, API behavior, and test acceptance remain for Requirements Analysis and User Stories. High-fidelity component and visual decisions remain for Refined Mockups, where the user-prescribed W3-04 prompt and execution guide will be used only after those approval gates.
