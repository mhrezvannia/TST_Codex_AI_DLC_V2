# NFR Requirements Questions - U06 Charge Agreements UI Workbench

## Questions

### Q1. What UI performance target applies?

A. First contentful render under 2 seconds p95 locally; field interaction under 100 ms p95; validation summary under 150 ms p95; API-backed actions show pending state within 100 ms.
B. Interactions are measured only through manual observation without p95 thresholds.
C. UI performance is deferred to operation.
X. Other (please specify)

[Answer]: A

### Q2. What accessibility is required?

A. Semantic landmarks, labels, focusable validation summary, status text, and keyboard-reachable status/action controls.
B. Visual labels only.
C. Accessibility is deferred until after backend completion.
X. Other (please specify)

[Answer]: A

### Q3. What security applies?

A. BFF isolates service URLs, propagates correlation/auth context, and relies on backend authorization for every protected action.
B. UI route guards are enough.
C. Store service tokens in browser storage.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
