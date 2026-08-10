# Frontend Components - U06 Replay and Restart Safety

## UI Scope

U06 adds no new end-user workflow and no DLT control to the Booking app. It hardens and verifies the existing stable detail components defined by U01-U05.

## Persistence Behavior

`BookingDetailPage`, `PricingSummary`, `ConfirmationStatus`, and `JourneyStatusPanel` must render from a fresh server read after Booking restart with no dependency on prior browser/client state. The same persisted business identity and latest projection appear after refresh.

During a Booking restart:

- retain already rendered data where the framework can do so safely;
- show local detail unavailable and explicit Retry;
- never replace persisted data with demo/fallback content;
- recover through the same stable `/bookings/{bookingId}` route when health returns.

During CMM/Kafka restart, Booking detail remains readable and shows its last persisted status; pending/delayed applies only when no returned projection exists.

## Duplicate and Replay Presentation

- Replayed confirmation/status envelopes do not add duplicate visible facts.
- Stale/out-of-order status delivery never regresses `MovementFact` or creates a second current timeline entry.
- A newer valid status replaces the projection once and announces once.
- Browser polling remains bounded and does not multiply command/event replay.
- Correlation/event identity in collapsed audit detail remains stable across replay.

## Test Harness Surface

Browser tests preserve a Booking URL and business IDs while test orchestration restarts services outside the browser. Assertions cover:

1. Complete detail before restart.
2. Explicit unavailable during restart without layout/data corruption.
3. Same canonical detail after health recovery and full refresh.
4. Unchanged status after duplicate/stale replay.
5. Correct one-time update after a valid newer fact.

Desktop/mobile screenshots verify no overlap for unavailable/recovery/replay provenance. Accessibility checks cover focus after Retry, live announcement only on genuine state advancement, and no repeated announcement for duplicate delivery.

## Operator Boundary

DLT inspection/replay is a command/script or protected operational API outside the end-user Booking UI. The UI may show a safe attention state derived from Booking-owned outbox/audit data, but it never exposes raw payloads, broker controls, replay authorization, or internal infrastructure.

## Source Coverage

Components verify U06 in `unit-of-work.md`, US-W1-006 from `unit-of-work-story-map.md`, persisted/restart acceptance in `requirements.md`, C10-C12 ownership in `components.md`, stable detail/API behavior from `component-methods.md`, and service isolation/restart semantics in `services.md`.
