# Infrastructure Design Questions - U08

## Answers

| Question | Answer |
| --- | --- |
| What runtime mode is primary? | Host-runtime mode. |
| What scripts are extended? | Local smoke/readiness scripts. |
| How is Docker handled? | Report as blocked until healthy; do not claim parity. |

## Source Alignment

Answered from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
