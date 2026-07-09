# Scalability Requirements - U01

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Capacity

The skeleton has no data workload. It must remain horizontally stateless so later units can scale the backend behind the same REST boundary.

## Growth Trigger

No scaling work is required until U05 introduces API traffic and U08 introduces runtime evidence.
