# Performance Design - U08

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Use short HTTP timeouts and sequential readable checks for local evidence. Avoid long Docker probes in host-runtime readiness.

## Validation

Readiness output records duration and checked URL.
