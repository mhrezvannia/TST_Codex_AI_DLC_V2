# NFR Requirements Questions - U02 Agreement Domain Model

## Questions

### Q1. What quality target matters most?

A. Pure, fast, deterministic domain tests that run without framework, persistence, messaging, or frontend dependencies.
B. End-to-end tests only.
C. Manual verification is enough for domain invariants.
X. Other (please specify)

[Answer]: A

### Q2. What security applies?

A. No framework, persistence, messaging, or frontend dependency enters domain-core; actor metadata is required for auditable status changes.
B. Domain-core should call identity services directly.
C. Security is handled only at the API boundary.
X. Other (please specify)

[Answer]: A

### Q3. What reliability applies?

A. Domain invariants reject invalid states before adapters persist them, and invalid transitions are deterministic test failures.
B. Let persistence reject invalid states.
C. Let UI validation handle status consistency.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
