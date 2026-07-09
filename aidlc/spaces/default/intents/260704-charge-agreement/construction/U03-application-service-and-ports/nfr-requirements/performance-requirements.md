# Performance Requirements - U03

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

Application orchestration overhead stays under 100 ms excluding repository and reference-data calls.

## Validation

Application-service tests use fake ports to verify command, query, and active-lookup behavior deterministically.
