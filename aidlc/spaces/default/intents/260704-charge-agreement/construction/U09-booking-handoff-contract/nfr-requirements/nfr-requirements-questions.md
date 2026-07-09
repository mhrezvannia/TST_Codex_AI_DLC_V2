# NFR Requirements Questions - U09 Booking Handoff Contract

## Questions

### Q1. What latency target applies?

A. Active lookup completes under 300 ms p95 locally for normal candidate sets.
B. Active lookup latency is not measured.
C. Booking can query the database directly for speed.
X. Other (please specify)

[Answer]: A

### Q2. What security applies?

A. Booking calls the API boundary, uses `charge-agreement/agreement:read`, and never receives direct DB access.
B. Booking can share Charge Agreement database credentials.
C. Booking bypasses authorization for internal calls.
X. Other (please specify)

[Answer]: A

### Q3. What reliability applies?

A. Backward-compatible no-match and error semantics with correlation IDs across Booking and Charge Agreement.
B. No-match semantics can change without coordination.
C. Correlation IDs are optional.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
