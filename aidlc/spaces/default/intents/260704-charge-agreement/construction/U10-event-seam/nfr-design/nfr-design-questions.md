# NFR Design Questions - U10

## Answers

| Question | Answer |
| --- | --- |
| Which reliability pattern applies? | Event port with no-op/in-memory local adapter. |
| Which security pattern applies? | Facts exclude secrets and persistence internals. |
| Which scalability pattern applies? | Kafka adapter can be added later behind the port. |

## Source Alignment

Answered from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
