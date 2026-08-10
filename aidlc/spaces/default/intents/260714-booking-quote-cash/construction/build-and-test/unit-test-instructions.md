# Unit Test Instructions - W1-01

## Upstream Inputs

Unit tests trace to the implemented behaviors recorded in each unit `code-generation-plan.md` and `code-summary.md`. The required coverage is the W1-01 quote-to-cash path: draft creation, reference validation, pricing, confirmation, CMM event consumption, returned status projection, replay/restart fencing, and live acceptance harness behavior.

## Backend Unit Scope

Run the full service test suite because the W1-01 units span shared domain, application, messaging, dataaccess, and container modules:

```powershell
cd D:\TST_Codex_W1-01\services
mvn -o -q test
```

Key expected areas:

| Area | Expected checks |
|---|---|
| Booking domain/application | canonical routing/equipment, lifecycle, idempotency, confirmation, projection consumption |
| Charge application/domain | pricing request hash, conflict, replay, in-progress, expired lease takeover, fenced completion |
| CMM application/domain | booking-confirmed consumption, journey reconciliation, movement status outbox mapping |
| Messaging | Avro serde and mapper round trips for `booking.confirmed` and `containermovement.status` |
| Platform messaging | real/noop guard behavior with `messaging.require-real=true` |
| Reference Data | validation and seed behavior consumed by Booking |

## Frontend Unit Scope

Run the Booking app Vitest suite:

```powershell
cd D:\TST_Codex_W1-01
yarn workspace @erp/app-booking test
```

Expected coverage includes form mapping, BFF helper behavior, reference validation panel, create form handling, and `JourneyStatusPanel` polling/timeout states.

## Coverage Expectations

This intent uses `Test Strategy: Standard`, so the expected unit gate is targeted rather than exhaustive:

| Component | Minimum expectation |
|---|---|
| Booking lifecycle | happy path plus conflict/replay/error cases |
| Charge pricing | terminal replay, changed-payload conflict, in-progress and expired-lease paths |
| Messaging mappers | exact contract field names and nested Avro data shapes |
| UI helpers/components | success, server error, and pending/timeout UI states |
| Acceptance scripts | dry-run, blocked classification, redaction, preflight rules |

## Test Data Management

Use committed fixtures and builders from the existing Java and TypeScript test suites. Do not use production data. Local live tests that touch PostgreSQL should use the configured local database on host port `55432` and isolate schemas where the test already implements isolation.
