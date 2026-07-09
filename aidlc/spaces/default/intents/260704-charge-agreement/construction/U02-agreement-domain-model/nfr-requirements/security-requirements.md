# Security Requirements - U02

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

Domain-core has no authentication implementation, but it must require actor metadata for auditable status changes.

## Boundary

No Spring, persistence, messaging, HTTP, or frontend dependencies are allowed in domain-core.
