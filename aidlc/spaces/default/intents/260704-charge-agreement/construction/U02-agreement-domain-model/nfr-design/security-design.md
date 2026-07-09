# Security Design - U02

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Domain methods require actor metadata for auditable lifecycle changes but do not implement authorization.

## Boundary

No framework, messaging, HTTP, or persistence imports in domain-core.
