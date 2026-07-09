# Infrastructure Design Questions - U01

## Answers

| Question | Answer |
| --- | --- |
| What deployment proves U01? | Host-runtime backend on 8084, UI on 3002, proxy route `/charge-agreements/`. |
| What shared infrastructure is used? | Existing local Node/Yarn, Java/Maven, reverse proxy, and Shared Platform ports. |
| What is out of scope? | Docker parity, Postgres schema, Kafka, and full API behavior. |

## Source Alignment

Answered from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
