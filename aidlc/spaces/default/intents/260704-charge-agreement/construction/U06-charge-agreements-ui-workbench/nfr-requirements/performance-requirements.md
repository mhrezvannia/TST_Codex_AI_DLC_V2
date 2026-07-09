# Performance Requirements - U06

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

| Target | Requirement |
| --- | --- |
| Workbench first render | First contentful render within 2 seconds p95 on local host-runtime with stable loading states. |
| Field interaction | Keystroke echo and local validation feedback within 100 ms p95 for forms up to 100 charge lines. |
| Validation summary | Submit-time validation summary appears within 150 ms p95 when failures are client-detectable. |
| API-backed actions | Pending state appears within 100 ms and completion follows U05 API latency targets. |
| Large list handling | Search and table repaint remain under 500 ms p95 for 1,000 local agreements. |

## Validation

Vitest/RTL tests cover form behavior and error preservation; local browser smoke verifies page response.
