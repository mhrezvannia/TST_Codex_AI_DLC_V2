# Performance Requirements - U08

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

Readiness checks should complete in under 30 seconds when services are already running. Individual HTTP checks should use bounded timeouts.

## Validation

Extend local smoke/readiness scripts after endpoints exist.
