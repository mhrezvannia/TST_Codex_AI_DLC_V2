# Scalability Requirements - U06

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Capacity

List UI renders paged results, not unbounded records. Selectors should support future search/filter behavior.

## Growth

Keep client state scoped to the workbench and avoid global stores until repeated cross-page needs appear.
