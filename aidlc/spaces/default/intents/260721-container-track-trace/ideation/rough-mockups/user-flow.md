# User Flow - W2-04 Container Journey and Track-Trace

## Sources and actors

This flow realizes `intent-statement.md`, the boundary in `scope-document.md`,
and PB-01 through PB-04 in `intent-backlog.md`. The primary actor is the
equipment-control clerk. Customer service observes the same progression through
the existing Booking detail. A release reviewer observes evidence but is not the
primary business user.

## Entry points and route ownership

| Entry | Destination | Owner |
|---|---|---|
| Shared navigation “Container Movement” | `/container-movement` | W2-04 domain composition |
| Journey row/open action | `/container-movement/journeys/{id}` | W2-04 domain composition |
| Journey “Open Booking” | `/booking/{bookingId}` | Booking/shared-shell owner |
| Booking movement-status link | Related Container Movement journey detail | Cross-module canonical link |

The shared shell, navigation ordering, session, tokens, primitives, and Booking
page remain owned outside W2-04.

## Core happy path

```text
booking.confirmed received
        |
        v
Journey appears in list with expected LOAD/DISC
        |
        v
Clerk opens journey detail and reviews next expected move
        |
        v
Clerk opens Capture movement, enters ACT GTOT, submits
        |
        v
Server validates -> commits movement/lifecycle/outbox -> UI shows accepted
        |
        v
containermovement.status is published -> Booking projection pending/applied
        |
        v
Clerk repeats LOAD -> DISC -> GTIN in legal order
        |
        v
Timeline and Booking show Returned-empty completion
```

Text fallback: a real confirmed booking creates the planned journey; the clerk
reviews the plan, records each legal actual movement, sees the accepted lifecycle
change, and can follow the published progression to Booking.

## Detailed primary flow

**Flow:** Find journey and record the next actual movement  
**Persona:** Equipment-control clerk  
**Trigger:** A confirmed assigned-container booking has produced a journey.

1. **Journey list / loading** -> data resolves -> stable skeletons become the
   filterable list without layout shift.
2. **Journey list / populated** -> clerk searches by equipment or booking and
   opens a row -> shell navigates to the stable journey route.
3. **Journey detail** -> clerk scans identity, lifecycle, route facts, and one
   expected/actual timeline -> the next expected code/location is clear.
4. **Capture panel** -> clerk activates Capture movement -> focus enters the
   labelled form; ACT is fixed and the four thin codes are available.
5. **Capture / submitting** -> clerk submits -> button announces progress while
   dimensions and entered values remain stable.
6. **Accepted result** -> a live status summary announces code and lifecycle;
   the timeline receives the actual event; Booking state says pending or applied
   without claiming delivery early.
7. **Cross-module verification** -> clerk or customer service opens Booking ->
   canonical Booking detail shows the consumed movement projection.

**Success outcome:** the same DCSA-coded progression is visible in the Container
Movement timeline and Booking detail.

## Duplicate rejection flow

```text
Open capture -> submit same occurrence identity
             -> server returns duplicate with original event reference
             -> error summary receives focus/announcement
             -> form values remain
             -> journey lifecycle and timeline stay unchanged
             -> no new Booking progression is shown
             -> clerk reviews original audit evidence or corrects input
```

The duplicate label, original reference, unchanged lifecycle, and recovery action
are readable text, not color-only evidence.

## Out-of-sequence rejection flow

```text
Timeline says next = LOAD
        |
Clerk selects DISC from the constrained thin-code list and submits
        |
Server rejects: “DISC cannot follow GTOT; record LOAD next”
        |
Form values remain; Event code receives linked error guidance
        |
Timeline still shows Gated-out and no new published/Booking state
        |
Clerk changes to LOAD and retries successfully
```

The client highlights the expected option but does not silently reorder data or
replace server authority. This makes the rejection observable and recoverable.

## Alternate and recovery flows

| Condition | Visible response | Recovery |
|---|---|---|
| No matching journeys | Empty result with current filters | Reset or change filters |
| Service load failure | Plain-language error, correlation hidden in Audit | Retry without losing filters |
| Read denied | Missing-capability message with safe navigation | Request access outside this intent |
| Capture denied | Journey remains readable if permitted; action absent/disabled with reason | Authorized role performs capture |
| Reference validation failure | Field-linked location/equipment guidance | Correct from reference lookup |
| Status publication pending | Accepted movement remains accepted; Booking labelled pending | Relay retries; refresh/poll shows applied time |
| Booking projection stale/duplicate | Audit disclosure shows consumer outcome | No false second progression |
| Runtime degraded | Last-known received time and affected action policy | Retry/read runbook path; never show fresh success |
| Journey ID not found | Not-found explanation and list link | Return to filtered list |

## Responsive interaction flow

- **1440/1024:** compact list table; detail timeline and capture panel share the
  workspace without nested cards.
- **768:** table has intentional horizontal handling; capture opens as a labelled
  drawer with focus trap and trigger restoration.
- **375:** list becomes scannable semantic record rows; detail is single-column;
  capture expands in flow after its trigger, avoiding a cramped modal.
- At every width, the primary command, next expected movement, readable status,
  and recovery action remain visible and keyboard reachable.

## Accessibility flow contract

The shell skip link enters `main`. Each route has one `h1`; section headings are
ordered. Timeline events form an ordered list. Capture uses persistent labels,
native controls, an error summary, field associations, and polite status
announcements. Drawer focus is trapped and restored; in-flow mobile capture is
not. Updates do not steal focus, motion respects user preferences, and code/
status meaning never depends on color.

## Evidence handoff

PB-01 proves the list/detail skeleton and one GTOT through Booking. PB-02 proves
departure plus duplicate/sequence recovery. PB-03 completes DISC/GTIN. PB-04
synchronizes the W2-02 UI baseline and captures Playwright evidence for every
state, theme, keyboard path, and required viewport on the isolated live stack.
