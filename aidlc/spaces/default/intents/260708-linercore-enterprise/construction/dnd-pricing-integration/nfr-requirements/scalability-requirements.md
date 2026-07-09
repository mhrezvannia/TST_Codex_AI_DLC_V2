# Scalability Requirements - dnd-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

This unit must support first-release D&D request/result volume and fallback evidence.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| D&D requests/results | At least 5,000 requests/results in local/CI evidence. |
| Manual fallback cases | At least 2,000 no-rule/conflict/manual-required cases. |
| Pact interactions | At least 20 interactions across success, validation, auth, timeout, no-rule, conflict, and fallback behavior. |
| D&D snapshots | At least 5,000 Booking D&D charge snapshot records. |

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines D&D trigger, request/result, snapshot, and fallback evidence. |
| `business-rules.md` | Defines ownership and integration rules. |
| `requirements.md` | Supplies D&D and local runtime requirements. |
| `technology-stack.md` | Supplies Spring, PostgreSQL, OpenAPI, Pact context. |
| `nfr-requirements-questions.md` | Q3 sets D&D scale baseline. |
