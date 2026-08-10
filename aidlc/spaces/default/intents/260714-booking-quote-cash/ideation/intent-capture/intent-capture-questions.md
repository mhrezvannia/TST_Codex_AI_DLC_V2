# Intent Capture Questions - W1-01 Booking Quote-to-Cash

## Q1. Business outcome

Which problem is this intent expected to solve?

- A. Deliver one real booking quote-to-cash spine across Booking, Reference Data, Charge, Kafka, CMM, and the Booking detail UI (recommended)
- B. Complete the Booking module broadly before integrating other modules
- C. Improve only the Booking user interface while retaining current backend seams
- X. Other (please specify)
- `[Answer]:` A. Real booking spine (Recommended)

## Q2. Primary user

Who is the primary beneficiary of the thin slice?

- A. A customer-service or booking-desk agent creating, pricing, confirming, and tracking a booking (recommended)
- B. A platform administrator configuring infrastructure
- C. An external customer using a self-service portal
- X. Other (please specify)
- `[Answer]:` A. Booking-desk agent (Recommended)

## Q3. Thin-slice boundary

What is the smallest booking shape that must work end to end?

- A. One POL-to-POD leg, one dry FCL equipment line with quantity one, and USD pricing (recommended)
- B. Multi-leg routing with transshipment from the first release
- C. Include reefer, dangerous goods, amendments, and cancellation now
- X. Other (please specify)
- `[Answer]:` A. One-leg dry FCL (Recommended)

## Q4. Real integration requirement

How should the cross-module seams behave for Definition of Done?

- A. Use live Reference Data and Charge HTTP calls plus real Kafka and Schema Registry events in both Booking-to-CMM and CMM-to-Booking directions (recommended)
- B. Use live HTTP calls but keep asynchronous seams mocked
- C. Use stubs for all cross-module calls until later intents
- X. Other (please specify)
- `[Answer]:` A. All seams live (Recommended)

## Q5. Success evidence

What evidence closes this intent?

- A. Drive the live Compose journey, observe both Kafka events and persisted states, verify restart and redelivery idempotency, and pass quality plus both fidelity audits (recommended)
- B. Unit and integration tests pass without a live runtime demonstration
- C. Services and containers start successfully, without driving the business journey
- X. Other (please specify)
- `[Answer]:` A. Live journey plus audits (Recommended)

## Q6. Why now

What is the trigger for prioritizing W1-01 next?

- A. W0 eventing and reference-data prerequisites are closed, and W1-01 unblocks later journey, amendment, observability, and track-and-trace intents (recommended)
- B. A broad visual redesign should precede business integration
- C. No dependency-driven reason; schedule it after all module-local work
- X. Other (please specify)
- `[Answer]:` A. Dependencies closed (Recommended)
