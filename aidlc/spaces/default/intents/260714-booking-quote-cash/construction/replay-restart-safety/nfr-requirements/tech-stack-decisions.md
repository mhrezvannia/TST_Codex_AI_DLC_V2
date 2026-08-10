# Tech Stack Decisions - U06 Replay and Restart Safety

## Selections

| Concern | Selection | Rationale |
|---|---|---|
| Fault execution | JUnit test collaborators + Docker Compose stop/restart/broker controls | Exercises real boundaries without production hooks. |
| Replay | Spring Kafka producer path + protected local script/API | Preserves contract/authorization and source-topic behavior. |
| Migration proof | Flyway history + PostgreSQL dump/query checksums | Deterministic brownfield preservation. |
| Evidence | PowerShell/Node scripts, JSON/CSV/Markdown, SHA-256 | Existing portable tooling and machine-readable results. |
| UI proof | Playwright via existing browser toolchain | Confirms persisted recovery state. |

## Constraints

No shared inbox, chaos platform, production fault endpoint, database patch replay, alternate broker, or destructive reset tooling is introduced. Existing Java/Spring/Kafka/PostgreSQL/Next.js versions from `technology-stack.md` remain authoritative.

## Source Coverage

Decisions implement U06 `business-logic-model.md`, `business-rules.md`, and `requirements.md` with existing `technology-stack.md` tooling.
