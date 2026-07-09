# Reliability Requirements - U03

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Reliability

No-match lookup returns a stable result. Upstream validation outages are distinguishable from business validation errors.

## Recovery

Use cases are retry-safe only where commands include expected version and idempotency is explicitly designed.
