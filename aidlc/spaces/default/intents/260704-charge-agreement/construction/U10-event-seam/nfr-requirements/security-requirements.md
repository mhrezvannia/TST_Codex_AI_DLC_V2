# Security Requirements - U10

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

Published facts include IDs, status, actor, timestamp, and correlation ID but no secrets or direct persistence entity dumps.

## Boundary

Domain-core does not depend on messaging frameworks.
