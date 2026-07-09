# Reliability Requirements - UOW-01 Local Runtime Packaging

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Failed checks must identify component and remediation.
- Timeout each network/process check.
- Distinguish `blocked`, `failed`, `warning`, and `ready`.
- Evidence files must be overwritten atomically or written with unique timestamps.

## Degradation

- If Docker is unavailable, skip Compose startup and report Docker blocker.
- If Java/Maven are unavailable, skip backend tests and report prerequisite blocker.

