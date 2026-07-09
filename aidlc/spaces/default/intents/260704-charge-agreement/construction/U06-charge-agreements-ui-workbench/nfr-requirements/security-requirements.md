# Security Requirements - U06

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

BFF route handlers hide backend URLs, propagate correlation IDs, avoid exposing secrets, and surface local bypass status visibly.

## Input Protection

Client validation improves UX but backend remains the authority for validation and authorization.
