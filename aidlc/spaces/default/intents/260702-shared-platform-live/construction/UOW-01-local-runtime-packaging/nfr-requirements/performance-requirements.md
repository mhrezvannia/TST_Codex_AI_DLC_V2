# Performance Requirements - UOW-01 Local Runtime Packaging

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

| Scenario | Target |
| --- | --- |
| Tool/port/env prerequisite scan | Complete under 10 seconds on a normal developer machine. |
| Compose config validation | Complete under 30 seconds excluding image build/pull time. |
| Readiness summary write | Complete under 1 second after checks finish. |

## Constraints

- Checks must not hang when Docker daemon is unavailable.
- Backend gate checks must quickly classify missing Java/Maven as blocked.
- Output must be deterministic enough for CI/self-hosted runner comparison.

