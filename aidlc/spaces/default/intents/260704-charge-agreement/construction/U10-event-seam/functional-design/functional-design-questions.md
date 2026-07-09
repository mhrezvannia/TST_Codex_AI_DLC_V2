# Functional Design Questions - U10 Event Seam

## Answers

| Question | Answer |
| --- | --- |
| Is live Kafka required now? | No, the seam is required; live publication can wait until Docker/Compose is healthy. |
| Which facts are needed? | Agreement changed and agreement approved. |
| Where is the seam defined? | Application-service event publisher port plus published-language DTO/fact records. |
| How is it tested? | Unit tests verify facts are created/enqueued through the port. |

## Source Alignment

Answered from `requirements.md`, `services.md`, `component-methods.md`, `unit-of-work.md`, and `team-practices.md`.
