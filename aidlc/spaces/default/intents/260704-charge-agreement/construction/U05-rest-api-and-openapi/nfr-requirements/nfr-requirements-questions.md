# NFR Requirements Questions - U05 REST API and OpenAPI

## Questions

### Q1. What API latency is needed?

A. List/search under 500 ms p95 locally; status/detail/lookup under 300 ms p95 for normal data.
B. Latency can be defined after implementation.
C. Only health endpoint latency is measured.
X. Other (please specify)

[Answer]: A

### Q2. What security applies?

A. Auth checks use the endpoint permission matrix, correlation IDs are required, validation blocks unsafe input, and direct DB exposure is forbidden.
B. UI disablement is sufficient for status actions.
C. REST endpoints can share one coarse permission.
X. Other (please specify)

[Answer]: A

### Q3. What reliability applies?

A. Stable error model, deterministic no-match lookup, production API SLO 99.5% monthly, 5xx below 0.5% per rolling 30 days, and 5 second client-visible timeout budget.
B. Errors can use ad hoc payloads.
C. No-match lookup should return 404.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
