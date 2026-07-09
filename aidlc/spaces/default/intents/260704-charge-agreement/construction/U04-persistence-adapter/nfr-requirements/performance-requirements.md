# Performance Requirements - U04

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

Search returns within 500 ms for 1,000 local records. Detail lookup returns within 200 ms. Active candidate query uses indexed filters.

## Validation

Repository tests or integration tests seed representative records and verify bounded query behavior.
