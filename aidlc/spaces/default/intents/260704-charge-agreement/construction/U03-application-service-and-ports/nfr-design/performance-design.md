# Performance Design - U03

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Keep orchestration linear and delegate filtering to repository ports. Use fake ports in tests to measure application overhead separately.

## Validation

Active lookup tests verify candidate filtering contract without loading unrelated agreements.
