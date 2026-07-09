# Infrastructure Design Questions - U03

## Answers

| Question | Answer |
| --- | --- |
| What deployment impact exists? | Application-service is packaged into the backend service. |
| What shared services are abstracted? | Postgres, identity, reference-data, clock/id, and event publisher via ports. |

## Source Alignment

Answered from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
