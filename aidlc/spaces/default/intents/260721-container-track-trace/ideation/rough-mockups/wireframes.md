# Rough Wireframes - W2-04 Container Movement

## Sources and design boundary

These low-fidelity concepts implement the equipment-control workflow in
[`intent-statement.md`](../intent-capture/intent-statement.md), the complete thin
slice in [`scope-document.md`](../scope-definition/scope-document.md), and the
risk-first outcomes in [`intent-backlog.md`](../scope-definition/intent-backlog.md).
They use the existing authenticated LinerCore shell and its tokens/primitives.
W2-04 owns only Container Movement composition; it does not redesign the shell,
`packages/ui`, or Booking.

Graphify identifies the enterprise `MovementTimeline` interaction as the prior
useful source. Codebase-memory confirms real journey list/detail/capture APIs and
the Booking journey-status panel, while no Container Movement application UI is
currently indexed. The `ui-ux-pro-max` data-dense, filtering, keyboard, form-
label, error-recovery, and responsive-table advice is adopted. Its marketing
gateway, hero, sales CTA, alternative colors/fonts, remote fonts, and spinners
are rejected in favor of the LinerCore master.

## Information architecture

```text
Shared authenticated shell (owned by W2-02)
|
+-- Container Movement                         /container-movement
|   +-- Journey list, filters, result count
|   +-- Loading / empty / error / denied states
|
+-- Journey detail                            /container-movement/journeys/{id}
    +-- Identity, lifecycle status, actions
    +-- Route and equipment facts
    +-- Expected + actual movement timeline
    +-- Manual ACT movement capture
    +-- Collapsed audit/evidence
    +-- Canonical Booking detail link          /booking/{bookingId}
```

No third canonical Container Movement route is needed for the thin slice.

## Screen 1 - Journey list, desktop 1024/1440

```text
+------------------------------------------------------------------------------+
| [Shared shell: top bar, breadcrumbs, user, health]                            |
| [Shared nav]  Container Movement                                              |
|                                                                              |
| Container journeys                                      [Refresh]             |
| Find an assigned container and review its operational progression.           |
|                                                                              |
| [Search booking / equipment / journey____] [Status v] [Reset]                |
| 24 journeys                                           Showing 1-20  [<] [>]  |
| +----------------------------------------------------------------------------+|
| | Equipment | Booking | POL -> POD | Lifecycle    | Next expected | Updated  ||
| | MSKU...1  | BKG-104 | SGSIN->NLRTM| Gated-out   | LOAD / SGSIN  | 10:42    ||
| | TCLU...8  | BKG-099 | CNSHA->USLAX| In-transit  | DISC / USLAX  | 09:58    ||
| +----------------------------------------------------------------------------+|
| Row Enter/click -> journey detail; status is text + icon, never color alone.  |
+------------------------------------------------------------------------------+
```

Accessibility note: one `h1`; shared `header`/`nav` and page `main`; keyboard
entry starts at the shell skip link, then filters, result table, pagination.
Sortable headers announce direction; rows expose descriptive journey links.

## Screen 1a - Journey list, mobile 375

```text
+---------------------------------------+
| [Shared compact shell]                |
| Container journeys                    |
| [Search____________________________]  |
| [Status v] [Reset]                    |
| 24 journeys                           |
| +-----------------------------------+ |
| | MSKU...1  Gated-out [text+icon]   | |
| | BKG-104   SGSIN -> NLRTM          | |
| | Next: LOAD at SGSIN   Updated 10:42| |
| | [Open journey]                    | |
| +-----------------------------------+ |
| +-----------------------------------+ |
| | TCLU...8  In-transit [text+icon]  | |
| | BKG-099   CNSHA -> USLAX          | |
| | Next: DISC at USLAX   Updated 09:58| |
| | [Open journey]                    | |
| +-----------------------------------+ |
| [Previous]  Page 1 of 2  [Next]      |
+---------------------------------------+
```

Accessibility note: one `h1` inside `main`; record rows are semantic list items
with one named link each; 44px controls, logical focus order, no page overflow.

## Screen 2 - Journey detail and capture, desktop 1024/1440

```text
+------------------------------------------------------------------------------------------------+
| [Shared shell]  Container Movement / MSKU1234561                                                |
|                                                                                                |
| MSKU1234561  Gated-out [text+icon]            [Open Booking BKG-104] [Capture movement]        |
| Journey JRN-204 | Booking revision 7 | One leg | Last actual GTOT 21 Jul 10:42                 |
|                                                                                                |
| +-- Route and equipment --------------------------------+ +-- Capture ACT movement -----------+ |
| | POL SGSIN        POD NLRTM                            | | Next expected: LOAD at SGSIN      | |
| | Laden            ISO 6346 MSKU1234561                | | Event code [LOAD v]               | |
| +-------------------------------------------------------+ | Classifier ACT (fixed)             | |
|                                                           | Location [SGSIN________]            | |
| Expected and actual timeline                               | Occurred [date/time_______]         | |
| +-------------------------------------------------------+ | Empty indicator [LADEN v]         | |
| | [done] GTOT Gate out          Actual 21 Jul 10:42     | | Source [MANUAL v]                 | |
| |        SGSIN | ACT | Accepted                         | | [Cancel] [Record movement]         | |
| |        [Show occurred/received/source]                | +------------------------------------+ |
| | [next] LOAD Loaded           Expected SGSIN           |                                        |
| | [plan] DISC Discharged       Expected NLRTM           |                                        |
| | [later] GTIN Gate in empty   Awaiting prior moves     |                                        |
| +-------------------------------------------------------+                                        |
| [Audit and event evidence v]  collapsed; correlation/source available, raw payload secondary     |
+------------------------------------------------------------------------------------------------+
```

On submission, the capture action shows an in-button busy label while retaining
stable dimensions. Accepted input adds the event and moves focus to a polite
success summary before returning to the timeline. Rejected input remains in the
panel; a focusable error summary links to field/reason detail and the timeline
keeps its unchanged-state marker.

Accessibility note: one `h1`; route facts and timeline use `h2`; capture uses a
labelled `aside`/form. Focus enters the capture heading from its trigger, labels
persist, errors use `aria-describedby`, and status updates use polite live text.

## Screen 2a - Journey detail and capture, 375/768

```text
+---------------------------------------+
| [Shared compact shell]                |
| MSKU1234561                           |
| Gated-out [text+icon]                 |
| BKG-104  [Open Booking]               |
| SGSIN -> NLRTM | Laden                |
|                                       |
| Timeline                              |
| 1 [done] GTOT Actual / Accepted       |
|   SGSIN | 21 Jul 10:42                |
|   [Show details]                      |
| 2 [next] LOAD Expected / SGSIN        |
| 3 [plan] DISC Expected / NLRTM        |
| 4 [later] GTIN Awaiting prior moves   |
|                                       |
| [Capture movement]                    |
| [Audit and event evidence v]          |
+---------------------------------------+

Capture trigger -> labelled drawer at 768,
or in-flow section immediately after trigger at 375:

+---------------------------------------+
| Capture ACT movement             [X]  |
| Next expected: LOAD at SGSIN           |
| Event code [LOAD v]                    |
| Classifier ACT                         |
| Location [SGSIN________]               |
| Occurred [date/time_______]            |
| Empty indicator [LADEN v]             |
| [Cancel] [Record movement]             |
+---------------------------------------+
```

Accessibility note: headings stay ordered; drawer traps focus only while modal
at 768 and restores focus to its trigger. At 375 the in-flow form does not trap
focus. Timeline order matches DOM order; details are keyboard expandable.

## Validation, rejection, and success states

```text
Rejected capture (duplicate)
+---------------------------------------------------------+
| [!] Movement not recorded                               |
| GTOT at SGSIN with this occurrence identity already     |
| exists as event EVT-101. Journey remains Gated-out.     |
| [Review original in Audit]                              |
|                                                         |
| Event code [GTOT v]   Location [SGSIN____]              |
| Occurred [unchanged input______________]                |
| [Cancel] [Try corrected movement]                       |
+---------------------------------------------------------+

Rejected capture (out of sequence)
+---------------------------------------------------------+
| [!] Movement not recorded                               |
| DISC cannot follow GTOT. Record LOAD next.              |
| Journey remains Gated-out; no Booking update published. |
| [Focus Event code]                                      |
+---------------------------------------------------------+

Accepted capture
+---------------------------------------------------------+
| [check] LOAD recorded and status published.             |
| Journey is now In-transit. Booking update is pending /  |
| applied, shown as text with last received time.          |
+---------------------------------------------------------+
```

The four-code selector contains GTOT, LOAD, DISC, and GTIN only. It highlights
the next legal choice without pretending client rules are authoritative. Server
duplicate/sequence outcomes are announced, preserve values, and show the same
lifecycle before and after rejection.

## Required route states

| State | List concept | Detail/capture concept |
|---|---|---|
| Loading | Stable table/row skeletons | Stable identity, facts, timeline, and form skeletons |
| Empty | “No journeys match” plus reset filters; no create CTA because booking confirmation creates journeys | Not applicable for a valid ID; missing journey uses not-found guidance |
| Error/retry | Actionable service message and Retry | Keep known identity; mark timeline unavailable and Retry |
| Denied | Missing capability, safe return link; no data leakage | Same; capture action absent when read is denied |
| Populated | Filterable journeys and count | Identity, facts, combined timeline, capture if permitted |
| Validation | N/A | Field errors plus summary; values retained |
| Duplicate/sequence rejection | N/A | Stable reason, original/audit link, unchanged-state statement |
| Success/pending | Updated row status | Accepted movement plus Booking projection pending/applied text |
| Degraded | Freshness warning without fake success | Last-known timeline labelled with received time; capture policy explicit |

All states are specified for light/dark themes, keyboard focus, reduced motion,
and 375/768/1024/1440 layouts. Visual status always includes readable text.

## Shared-component mapping

Use existing `@erp/ui` Button, Input, Select/Combobox, Table, Badge, Panel,
Drawer/Dialog where available, Toast/live status, EmptyState, Skeleton, Stack,
Inline, and StatusStrip. Lucide provides any icons. Missing primitives are
reported to W2-02; W2-04 does not add or redesign them in `packages/ui`.

The primary operator view never leads with Kafka topic, schema, raw payload, or
correlation identifiers. Those belong in the collapsed audit/evidence section.

## Concept acceptance checklist

- One shared shell and canonical routes; no module-local chrome.
- Expected and actual events appear in one ordered list.
- DCSA code and readable label remain visible together.
- Duplicate and sequence rejection preserve input and prove unchanged state.
- Booking is linked, not reimplemented.
- Loading, empty, error/retry, denied, validation, success, pending, and degraded
  states are designed.
- Keyboard, focus, screen-reader announcements, themes, reduced motion, and all
  four required widths are explicit.

## Review

**Verdict: READY**

Findings:

- The concepts faithfully implement answered questions Q1-Q6: canonical
  list/detail routes, responsive detail capture, operational information
  hierarchy, observable server-side duplicate/sequence rejection, the required
  responsive transformations, and the full state/accessibility/theme contract.
- W2-04 ownership remains limited to Container Movement composition. The shared
  shell and primitives are consumed, Booking is linked rather than rebuilt, and
  missing shared primitives are correctly deferred to W2-02.
- Every wireframed screen/form-factor variant includes an accessibility note
  covering headings, landmarks or semantic structure, and keyboard entry/focus
  behavior. Required loading, empty, retryable error, denied, populated,
  validation, rejection, success/pending, and degraded states are explicit.
- The low-fidelity diagrams and matching flow descriptions are clear enough to
  carry the interaction model into refinement without introducing a third route
  or an out-of-scope dashboard/portal.

Validation results:

| Artifact | `required-sections` | `upstream-coverage` |
|---|---|---|
| `wireframes.md` | PASS | PASS |
| `user-flow.md` | PASS | PASS |
