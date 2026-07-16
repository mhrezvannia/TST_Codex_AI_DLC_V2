# Code Generation Plan - Agreement Pricing

## Traceability

Unit: `agreement-pricing`

Stories covered: US-W1-003 and US-W1-004 from `unit-of-work-story-map.md`; pricing, manual-pricing, and confirmation constraints from `requirements.md`; Booking/Charge ownership from `components.md`; method contracts from `component-methods.md`.

## Implementation Steps

- [x] Step 1: Extend Charge pricing domain model to the v1 contract shape: `bookingRef`, `tradeLane`, `pol`, `pod`, `equipmentType`, `partyId`, `commodityCode`, flags, `dates`, and `quantities.amendmentSeq`.
- [x] Step 2: Add charge category support to terms and pricing lines while keeping legacy JSON compatibility through `FREIGHT` defaults.
- [x] Step 3: Implement Charge `requestPricing` idempotency around canonical `bookingRef:amendmentSeq`, request hashing, terminal replay, same-key conflict, and live in-progress rejection.
- [x] Step 4: Add the durable `pricing_requests` repository port, JDBC implementation, and schema table for `IN_PROGRESS`, `COMPLETED`, and `MANUAL` terminal states.
- [x] Step 5: Add the Charge `POST /pricing-requests` adapter with `application/vnd.api.v1+json`, safe error mapping, idempotency headers, itemized charges, pricing basis/reference, and manual/no-rate responses.
- [x] Step 6: Update Booking pricing request derivation to send canonical v1 contract fields and derive the idempotency key from `bookingId:revision`.
- [x] Step 7: Replace persisted aggregate `PRICING_PENDING` use in the price command with `VALIDATED -> PRICED` success and `MANUAL_PRICING` manual/failure state while preserving in-progress as non-terminal.
- [x] Step 8: Add Booking BFF/UI pricing action over the server-side proxy, plus PRICED and MANUAL_PRICING detail rendering.
- [x] Step 9: Update OpenAPI pricing v1 contract to require `quantities.amendmentSeq`.
- [x] Step 10: Add/update tests for Charge idempotency replay/conflict/in-progress, Booking manual lifecycle, frontend price action, and compatibility paths.
- [x] Step 11: Run backend, frontend, compose, diff, lint, and audit detector checks; record evidence in the summary.

## Test Files

- [x] `services/charge-agreement-service/application-service/src/test/java/com/linercore/platform/chargeagreement/applicationservice/ChargeAgreementApplicationServiceTest.java`
- [x] `services/booking-service/application-service/src/test/java/com/linercore/platform/booking/applicationservice/BookingApplicationServiceTest.java`
- [x] `apps/booking/app/bookings/[bookingId]/BookingValidationPanel.test.tsx`
