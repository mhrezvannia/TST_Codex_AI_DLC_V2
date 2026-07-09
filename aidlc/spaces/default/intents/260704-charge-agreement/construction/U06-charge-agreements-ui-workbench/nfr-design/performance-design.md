# Performance Design - U06

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Use stable panel dimensions, lightweight local state, paged list rendering, and pending indicators for BFF calls.

## Validation

Vitest/RTL tests cover loading, validation errors, and state preservation.
