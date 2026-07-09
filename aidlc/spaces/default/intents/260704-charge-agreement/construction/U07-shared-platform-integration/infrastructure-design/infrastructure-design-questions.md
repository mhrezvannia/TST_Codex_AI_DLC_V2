# Infrastructure Design Questions - U07

## Answers

| Question | Answer |
| --- | --- |
| Which shared services are used? | `identity-service` and `reference-data-service`. |
| What network pattern applies? | Local HTTP calls through service clients/BFF/backend adapters. |
| What failure mode is accepted? | Degraded reference status without data loss. |

## Source Alignment

Answered from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
