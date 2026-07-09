# Tech Stack Decisions - UOW-03 Identity Authorization

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Decisions

| Area | Decision |
| --- | --- |
| Backend | Java 21, Spring Boot 3.3.7. |
| Tests | JUnit Jupiter 5.11.3. |
| Persistence | PostgreSQL adapter behind existing repository ports. |
| API | Existing `/internal/identity` JSON REST controller. |

## Rationale

Preserves the existing hexagonal service split and avoids framework imports in domain-core.

