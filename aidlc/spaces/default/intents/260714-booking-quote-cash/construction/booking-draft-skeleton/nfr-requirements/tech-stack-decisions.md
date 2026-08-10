# Tech Stack Decisions - U01 Booking Draft Skeleton

## Retained Stack

| Concern | Selection | Rationale |
|---|---|---|
| Domain/API | Java 21, Spring Boot 3.3.7 | Existing ports/adapters and transaction model. |
| Persistence | Spring JDBC, PostgreSQL | Existing repository style and database-enforced idempotency. |
| Migration | `org.flywaydb:flyway-core:10.10.0` + `org.flywaydb:flyway-database-postgresql:10.10.0` (Spring Boot 3.3.7 BOM) | Deterministic V1 baseline/V2 upgrade; replaces `spring.sql.init`. |
| UI/BFF | Next.js 15.1.3, React 18.3.1, TypeScript 5.7.2 | Existing app/runtime and stable server route boundary. |
| Tests | JUnit 5, Vitest, Testing Library, Playwright live proof | Covers domain, JDBC, component, and browser behavior. |

## Constraints

No ORM, alternate database, shared service database, frontend state framework, or custom migration runner is introduced. Yarn 4/Turbo remain the root frontend toolchain. Compose PostgreSQL maps host 55432 to container 5432. Maven effective-POM evidence must resolve both Flyway artifacts to 10.10.0 before code generation is accepted.

## Source Coverage

Decisions implement U01 `business-logic-model.md` and `business-rules.md`, meet `requirements.md`, and deliberately reuse or minimally extend `technology-stack.md`.
