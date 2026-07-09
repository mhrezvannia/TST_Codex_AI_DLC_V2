# NFR Design Questions - U03

## Answers

| Question | Answer |
| --- | --- |
| Which resilience pattern applies? | Ports isolate repository, reference, auth, clock, ID, and events. |
| Which security pattern applies? | Use cases call authorization port before work. |
| Which performance pattern applies? | Repository-side active candidate filtering. |

## Source Alignment

Answered from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
