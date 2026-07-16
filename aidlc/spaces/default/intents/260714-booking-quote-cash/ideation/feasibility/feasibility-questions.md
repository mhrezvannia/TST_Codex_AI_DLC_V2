# Feasibility Questions - W1-01 Booking Quote-to-Cash

Source context: `ideation/intent-capture/intent-statement.md`, `ideation/market-research/competitive-analysis.md`, `ideation/market-research/market-trends.md`, and `ideation/market-research/build-vs-buy.md`.

## Q1. Runtime target

Which environment is authoritative for W1-01 feasibility and exit proof?

- A. The repository's local Docker Compose stack, using a non-default PostgreSQL host port; cloud deployment remains a later operation concern (recommended)
- B. AWS production deployment must precede local end-to-end proof
- C. Host-only service processes are sufficient; Compose is optional
- X. Other (please specify)
- `[Answer]:` A. Local Compose (Recommended)

## Q2. Brownfield migration

How should existing Booking data and APIs be handled while moving from flat fields to routing and equipment lines?

- A. Use explicit database migrations and compatibility mappings where needed, preserve existing records, and make the contract-true model authoritative (recommended)
- B. Drop existing Booking data and rebuild the schema without migration
- C. Keep the flat domain model indefinitely and translate only the event payload
- X. Other (please specify)
- `[Answer]:` A. Explicit compatible migration (Recommended)

## Q3. Booking-to-CMM cutover

How should the synchronous confirmation delivery path be retired?

- A. Prove the Kafka consumer path, then remove synchronous confirmation delivery from the live request path with no dual-delivery steady state (recommended)
- B. Keep HTTP and Kafka delivery active indefinitely
- C. Retain HTTP as authoritative and treat Kafka as telemetry
- X. Other (please specify)
- `[Answer]:` A. Kafka-only cutover (Recommended)

## Q4. Compliance boundary

What compliance posture applies to this thin internal carrier workflow?

- A. No card or health data; minimize customer data on events, preserve authorization, correlation, audit evidence, encryption expectations, and configurable retention (recommended)
- B. Treat the booking event as public data with no access controls
- C. Assume PCI-DSS cardholder processing is in scope for W1
- X. Other (please specify)
- `[Answer]:` A. Internal controlled data (Recommended)

## Q5. Performance and reliability

What feasibility target should W1 commit to now?

- A. Preserve the frozen pricing timeout/latency behavior, keep request confirmation independent of CMM availability, and prove retry/idempotency rather than inventing an unsupported volume target (recommended)
- B. Require global production-scale load testing before the thin slice
- C. Ignore timeout, retry, and redelivery behavior until operations work
- X. Other (please specify)
- `[Answer]:` A. Contract behavior and idempotency (Recommended)

## Q6. Delivery constraint

How should schedule pressure affect feasibility decisions?

- A. No date-driven exception to contract fidelity, tests, live Compose proof, or both audits; blockers are surfaced explicitly (recommended)
- B. Skip live proof if implementation takes longer than expected
- C. Accept temporary placeholder integrations and close the intent
- X. Other (please specify)
- `[Answer]:` A. No quality exception (Recommended)
