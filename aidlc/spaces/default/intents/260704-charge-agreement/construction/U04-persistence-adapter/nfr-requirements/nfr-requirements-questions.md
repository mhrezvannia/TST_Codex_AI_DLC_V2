# NFR Requirements Questions - U04 Persistence Adapter

## Questions

### Q1. What persistence performance is needed?

A. Search completes under 500 ms p95 for 1,000 local records and preserves indexability for production growth.
B. Search performance is not measured.
C. Only single-record lookup performance matters.
X. Other (please specify)

[Answer]: A

### Q2. What security applies?

A. Store reference IDs and agreement metadata only; no secrets in data rows; activity rows audit status changes.
B. Store identity tokens for troubleshooting.
C. Store denormalized reference records owned by Shared Platform.
X. Other (please specify)

[Answer]: A

### Q3. What reliability applies?

A. Transactional save across header, terms, and activity, with production RPO 15 minutes, RTO 60 minutes, and 7-year agreement/activity retention.
B. Header and terms can be saved independently without recovery.
C. Local in-memory persistence is production-ready.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
