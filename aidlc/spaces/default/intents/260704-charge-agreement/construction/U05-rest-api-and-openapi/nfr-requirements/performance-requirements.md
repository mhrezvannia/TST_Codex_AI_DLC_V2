# Performance Requirements - U05

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

| Endpoint class | Target |
| --- | --- |
| Search/list | Under 500 ms for 1,000 local records. |
| Detail/status | Under 300 ms locally. |
| Active lookup | Under 300 ms for normal candidate sets. |

## Validation

API tests cover response time budget where local environment is stable; smoke checks verify availability.
