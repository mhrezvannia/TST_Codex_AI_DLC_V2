# User Flow - W1-01 Booking Quote-to-Cash

## Source And Actor

This flow implements `ideation/intent-capture/intent-statement.md`, remains inside `ideation/scope-definition/scope-document.md`, and traces to the six vertical increments in `ideation/scope-definition/intent-backlog.md`.

**Persona:** booking-desk or customer-service agent.

**Entry points:** Booking list/work queue, New booking command, and a stable Booking detail URL. W1 is Booking-local; the global authenticated application shell remains W2-01.

## Primary Happy Path

```text
[Open Booking list]
        |
        v
[Select New booking]
        |
        v
[Choose customer, commodity, USD, route, voyage, and one dry FCL line]
        |
        v
[Create draft]
        |
        v
[Booking detail / DRAFT]
        |
        v
[Validate live references]
        |
        +---- validation fails ----> [Correct named field] ----+
        |                                                    |
        v                                                    |
[Booking detail / VALIDATED] <-------------------------------+
        |
        v
[Request live Charge quote]
        |
        +---- pricing fails -------> [Retry from preserved draft]
        |
        v
[Booking detail / PRICED with USD quote]
        |
        v
[Review and confirm]
        |
        v
[Booking detail / CONFIRMED and movement PENDING]
        |
        v
[CMM journey/status returns asynchronously]
        |
        v
[Booking detail shows movement status and last-updated time]
```

Success outcome: the agent remains on the stable detail route and can scan the carrier booking reference, revision, route, equipment, quote, confirmation state, and linked CMM status without re-keying data or opening an infrastructure console.

## Flow Specification

| Step | Screen/state | User action | System response | Proto-Unit |
|---:|---|---|---|---|
| 1 | Booking list loading/populated | Search or select New booking | Loads real bookings or opens create route | PU-01 |
| 2 | Create form | Select canonical values and submit | Creates one draft and navigates to detail | PU-01, PU-02 |
| 3 | Detail / DRAFT | Select Validate | Calls live Reference Data and advances or shows field/domain errors | PU-02 |
| 4 | Detail / VALIDATED | Select Price | Calls live Charge and persists/displays USD quote | PU-03 |
| 5 | Detail / PRICED | Select Confirm, review dialog, approve | Commits confirmation/outbox and returns independently of CMM | PU-04 |
| 6 | Detail / CONFIRMED, movement pending | Wait or select Refresh | Polls Booking projection; preserves last known state on transient error | PU-04, PU-05 |
| 7 | Detail / movement returned | Inspect status | Shows contract-backed CMM move/classifier/timestamps | PU-05 |
| 8 | Same journey after restart/redelivery | Reopen detail | Shows one stable journey/projection without duplicates | PU-06 |

## Error And Recovery Paths

### Booking list unavailable

```text
[List request fails] ---> [Inline error; no fake rows] ---> [Retry]
                                  |
                                  +-----------------------> [New booking remains available
                                                             only if create dependencies are healthy]
```

### Reference validation failure

```text
[Validate]
    |
    +---- inactive/missing reference ---> [Name the affected field and value]
    |                                              |
    |                                              v
    +<------------------------------------- [Correct and retry]
```

### Pricing failure

```text
[Price] ---> [Timeout/provider error] ---> [Preserve VALIDATED state and form facts]
                                                   |
                                                   v
                                                [Retry]
```

### Confirmation and CMM independence

```text
[Confirm]
    |
    +---- Booking transaction fails ---> [Remain PRICED; show retryable error]
    |
    +---- Booking commits -------------> [Show CONFIRMED immediately]
                                                   |
                                                   +---- CMM unavailable ---> [Movement pending]
                                                                                |
                                                                                v
                                                                      [Poll or manual refresh]
```

The confirmation screen never reports failure merely because CMM is temporarily unavailable after Booking committed successfully.

### Movement refresh failure

```text
[Last known movement status]
             |
             +---- refresh fails ---> [Keep last known status + show update error]
                                                |
                                                v
                                             [Retry]
```

## Lifecycle Visibility Rules

| Booking state | Current step | Available primary action | Movement region |
|---|---|---|---|
| DRAFT | Request | Validate | Not started |
| VALIDATED | Validate complete | Price | Not started |
| PRICED | Price complete | Confirm | Not started |
| CONFIRMED, no CMM projection | Confirm complete | None | Pending with refresh and last checked |
| CONFIRMED, CMM projection | Confirm complete | None | Latest valid move/classifier/time |
| EXCEPTION / action failure | Failed step | Retry when valid | Preserve last known movement state |

Buttons for invalid future steps are either absent or disabled with a text reason. Status changes are communicated by label/icon and live announcement, not color alone.

## Navigation And State Preservation

```text
[List filters/page] ---- open ----> [Detail]
        ^                               |
        |                               |
        +---------- browser back -------+

[List] ---- New booking ----> [Create]
  ^                               |
  |                               +---- success ----> [Detail]
  +----------- cancel/back --------+
```

- Search, filter, and page state are encoded in URL parameters or otherwise restored when returning from detail.
- Refreshing a detail URL reloads the same Booking from the server; it does not depend on in-memory selection.
- A not-found detail offers Back to bookings without redirect loops.
- Mutation success updates server-backed detail state; fallback demo rows are forbidden.

## Responsive And Accessibility Flow

- Desktop uses the W2-02 operational visual cues and wide quote rail; tablet/mobile preserve the exact semantic order: header, lifecycle, valid action, route, equipment, quote, movement.
- Each route has one `h1`, a `main` landmark, and logical `h2` sections. Global header/nav landmarks are not fabricated inside W1.
- The first focusable control is a skip link, followed by route-level navigation and the primary task controls.
- All lifecycle actions, comboboxes, table links, dialog controls, refresh, and pagination are keyboard operable.
- Form errors are summarized and tied to fields; mutation and asynchronous movement updates use polite live regions.
- Confirmation dialog focus is trapped and restored. Polling never moves focus or repeatedly announces unchanged content.
- The flow must remain usable at 200% zoom and 320px width with no page-level horizontal scrolling.

## Contract And Ownership Trace

| User-visible moment | Owning module | Real seam |
|---|---|---|
| Canonical option and validation result | Reference Data | Booking-to-Reference Data HTTP |
| USD quote and pricing basis | Charge | Booking-to-Charge HTTP |
| Confirmation accepted | Booking | Booking transaction and outbox |
| Journey pending/created | CMM projected into Booking | `booking.confirmed` Kafka consumption |
| Movement move/classifier/time | CMM projected into Booking | `containermovement.status` Kafka consumption |

No UI copy implies that Booking owns pricing calculation, that CMM is called synchronously by Confirm, or that broker diagnostics are business status.
