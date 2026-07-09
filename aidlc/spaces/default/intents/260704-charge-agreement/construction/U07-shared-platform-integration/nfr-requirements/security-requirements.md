# Security Requirements - U07

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

Reference data is read-only from this module. BFF/backend calls propagate correlation and auth context according to Shared Platform conventions.

## Data Protection

Store stable IDs, not duplicated reference records.
