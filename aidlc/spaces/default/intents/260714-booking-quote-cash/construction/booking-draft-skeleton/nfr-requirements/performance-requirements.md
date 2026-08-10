# Performance Requirements - U01 Booking Draft Skeleton

## Local Request Budgets

- On the warmed Compose stack, create and detail API calls shall each meet p95 <=500 ms and p99 <=1 s over 100 measured requests at concurrency 10; failures remain in the sample and fail the check.
- List queries shall return the first bounded page (maximum 100 rows) within p95 <=500 ms using deterministic indexed ordering.
- The `/bookings/new` to persisted detail transition shall complete within two seconds excluding deliberate user input, preserving budget for the approved five-second confirm-to-visible-status flow.
- JSON snapshot upcast/backfill is not performed on every steady-state read after canonical V2 persistence.

## Resource and Measurement Constraints

Measurements use monotonic client time after ten warm-up requests and record commit, image IDs, row count, concurrency, errors, and raw durations. Database query plans must use booking-number/customer-status/update indexes for representative W1 data. No N+1 Reference/Charge/CMM calls occur in U01 list/detail.

## Source Coverage

Targets decompose `requirements.md` through U01 `business-logic-model.md` and `business-rules.md` while retaining Java/Spring/PostgreSQL/Next.js from `technology-stack.md`.
