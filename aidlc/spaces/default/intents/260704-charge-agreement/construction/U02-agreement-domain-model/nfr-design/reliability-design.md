# Reliability Design - U02

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Validate replacement terms before mutating aggregate state. State transitions either fully succeed or leave the prior state unchanged.

## Validation

Tests assert failed approval/replacement does not mutate status or terms.
