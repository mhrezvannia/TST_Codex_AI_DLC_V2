# Reliability Requirements - U02

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Reliability

Domain invariants are deterministic and fail atomically; invalid `replaceTerms` must not partially update the aggregate.

## Recovery

Domain methods should be side-effect free except for aggregate state changes, making failures repeatable in tests.
