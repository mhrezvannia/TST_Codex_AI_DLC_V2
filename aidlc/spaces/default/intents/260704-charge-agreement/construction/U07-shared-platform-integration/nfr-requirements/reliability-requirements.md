# Reliability Requirements - U07

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Reliability

Reference service outage returns a non-destructive UI state and backend upstream-unavailable response where validation cannot complete.

## Recovery

Retrying reference loads should not reset agreement draft state.
