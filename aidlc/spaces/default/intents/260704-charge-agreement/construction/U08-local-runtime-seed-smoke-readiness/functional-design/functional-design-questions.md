# Functional Design Questions - U08 Local Runtime, Seed, Smoke, Readiness

## Answers

| Question | Answer |
| --- | --- |
| What runtime mode is primary now? | Host-runtime mode, because Docker/Compose is currently unhealthy. |
| What should seed data prove? | At least one agreement with terms can be created or verified for smoke/readiness. |
| What endpoints are checked? | Backend health, UI page, agreement API, active lookup, and Shared Platform dependency status. |
| How are Docker blockers reported? | Separately from host-runtime success. |

## Source Alignment

Answered from `requirements.md`, `services.md`, `team-practices.md`, `bolt-plan.md`, and `unit-of-work.md`.
