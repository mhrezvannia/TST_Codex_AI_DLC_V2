# NFR Requirements Questions - U07 Shared Platform Integration

## Questions

### Q1. What integration latency applies?

A. Reference selector data loads within 500 ms p95 locally for up to 500 options per set; cached reopen completes within 100 ms p95.
B. Reference selector latency follows unspecified local service budgets.
C. Reference data loads can block the full workbench.
X. Other (please specify)

[Answer]: A

### Q2. What security applies?

A. Use stable IDs, do not mutate reference data, and require `shared-platform/reference-data:read` for reference reads.
B. Copy reference administration into Charge Agreement.
C. Let unauthenticated users read all reference data.
X. Other (please specify)

[Answer]: A

### Q3. What reliability applies?

A. Reference outages degrade only affected selectors within 250 ms after failed response and preserve draft agreement input.
B. Reference outages can clear form state.
C. Reference integration failures should block every workbench action.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
