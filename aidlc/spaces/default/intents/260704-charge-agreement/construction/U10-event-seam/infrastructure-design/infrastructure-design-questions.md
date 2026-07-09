# Infrastructure Design Questions - U10

## Answers

| Question | Answer |
| --- | --- |
| Is Kafka required? | No, only the event seam and local no-op/in-memory adapter are required now. |
| What future infrastructure is expected? | Kafka and Schema Registry when Compose recovers. |

## Source Alignment

Answered from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
