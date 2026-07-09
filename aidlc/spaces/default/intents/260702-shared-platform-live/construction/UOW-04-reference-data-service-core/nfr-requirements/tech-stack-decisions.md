# Tech Stack Decisions - UOW-04 Reference Data Service Core

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Decisions

| Area | Decision |
| --- | --- |
| Backend | Java 21 and Spring Boot 3.3.7. |
| Persistence | PostgreSQL 15 adapter behind repository ports. |
| Tests | JUnit Jupiter plus repository/application service tests. |
| API | Existing `/reference-sets` REST controller. |

## Rationale

Use existing service structure and add durable adapters without changing domain-core purity.

