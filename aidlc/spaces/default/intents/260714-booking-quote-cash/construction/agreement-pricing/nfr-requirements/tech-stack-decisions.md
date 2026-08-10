# Tech Stack Decisions - U03 Agreement Pricing

## Selections

| Concern | Selection | Rationale |
|---|---|---|
| API/domain | Java 21, Spring Boot 3.3.7 | Existing Charge/Booking service boundaries. |
| Persistence | Spring JDBC/PostgreSQL plus Flyway core/PostgreSQL 10.10.0 from Boot BOM | Atomic SQL claim/fencing and additive V1/V2 migration. |
| Resilience | `io.github.resilience4j:resilience4j-spring-boot3:2.2.0` | Pinned retry/circuit-breaker semantics and metrics compatible with Boot 3. |
| Contract | OpenAPI 3.1; `au.com.dius.pact.consumer:junit5:4.6.17` and `au.com.dius.pact.provider:junit5spring:4.6.17` (test scope) | Exact bilateral executable HTTP consumer/provider contract. |
| Tests/load | JUnit/Pact plus checked-in monotonic Node 24 harness under Yarn 4.5.3 lock | Unit/race/contract and fixed p99 evidence. |

## Constraints

No distributed lock, Redis idempotency, ORM, floating-point money, custom circuit breaker, tariff placeholder data, or Booking-side rate calculation is introduced. Maven effective-POM/dependency-tree evidence must resolve the listed coordinates exactly before implementation is accepted.

## Source Coverage

Decisions realize U03 `business-logic-model.md`, `business-rules.md`, and `requirements.md` while minimally extending `technology-stack.md`.
