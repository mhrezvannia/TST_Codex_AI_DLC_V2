# Scope Definition Questions - W1-01 Booking Quote-to-Cash

Source context: `ideation/intent-capture/intent-statement.md`, `ideation/feasibility/feasibility-assessment.md`, and `ideation/feasibility/constraint-register.md`.

## Q1. Minimum viable release

What is the minimum release boundary that delivers the W1-01 outcome?

- A. One agent completes one direct-leg, one dry FCL line, quantity-one, USD booking from create through live validation, live pricing, Kafka confirmation, CMM status return, and Booking detail rendering (recommended)
- B. Stop after Booking confirmation and defer the CMM return loop and detail rendering
- C. Expand the release to multi-leg, amendments, D&D, authentication, and the global shell
- X. Other (please specify)
- `[Answer]:` A. Full thin loop (Recommended)

## Q2. Must-have capability boundary

Which capability set is release-blocking?

- A. Contract-true Booking model and migration, create/read UI/API, live Reference Data validation, live Charge pricing, both Kafka consumers, Kafka-only cutover, idempotency, and live evidence are Must; broader UX and workflows are Won't Have for W1-01 (recommended)
- B. Only backend APIs and producer events are Must; consumers and UI proof are optional
- C. Treat every deferred program capability as a W1-01 Must
- X. Other (please specify)
- `[Answer]:` A. Complete spine (Recommended)

## Q3. Dependency structure

How should the capabilities depend on one another?

- A. Preserve records and align contracts first; then complete create/read, validation, and pricing; then add both consumers and prove Kafka delivery before removing HTTP callbacks; finish with UI and restart/redelivery evidence (recommended)
- B. Remove HTTP callbacks before consumers exist
- C. Build the final UI first against stubs and integrate services at the end
- X. Other (please specify)
- `[Answer]:` A. Contracts first (Recommended)

## Q4. Sequencing heuristic

Which heuristic should prioritize the proto-Unit backlog?

- A. Walking-skeleton and risk-first: establish a green Booking app baseline, retire contract/migration risk early, then extend one observable vertical journey to the live exit gate (recommended)
- B. Value-first UI breadth, even when backed by placeholders
- C. Organize horizontal batches by database, backend, messaging, and frontend
- X. Other (please specify)
- `[Answer]:` A. Risk-first spine (Recommended)

## Q5. Deadline and quality policy

Is there a hard deadline that changes the W1-01 capability boundary?

- A. No supplied calendar deadline changes scope; contract fidelity, compatible migration, live Compose proof, tests, and both audits remain fixed exit conditions (recommended)
- B. A deadline permits skipping live Compose and audit evidence
- C. Close W1-01 on implementation completion and defer redelivery/restart proof
- X. Other (please specify)
- `[Answer]:` A. No exception (Recommended)
