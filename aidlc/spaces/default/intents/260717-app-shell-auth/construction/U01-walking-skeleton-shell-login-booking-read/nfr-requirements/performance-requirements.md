# Performance Requirements - U01 Walking Skeleton

## Source Context

These performance requirements consume U01 `business-logic-model.md`, U01 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U01 runs on the existing Yarn/Next.js, Java/Spring, Docker Compose, Nginx, Keycloak, and PostgreSQL stack.

## Local Acceptance Targets

| ID | Requirement | Measurement |
| --- | --- | --- |
| PERF-01 | Protected shell route `/` or `/booking` through Nginx should complete auth redirect or authenticated shell response within 3 seconds p95 during a single-user local evidence run, excluding first container cold start. | Browser/proof transcript timestamps. |
| PERF-02 | Authenticated `/booking` read inside shell should complete Booking BFF -> booking-service response within 3 seconds p95 during the U01 evidence run. | Scenario timing plus BFF/backend logs if available. |
| PERF-03 | Booking BFF backend fetch timeout remains bounded at or below the existing 2500 ms timeout unless implementation records a W2-01-specific reason. | Code/config inspection and failure proof. |
| PERF-04 | Shell layout and Booking read must avoid client-side libraries that add broad state or styling overhead: no Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. | Dependency diff and `package.json` review. |

## Resource Constraints

- Do not add new runtime services, caches, queues, or cloud components for U01.
- Use existing Next.js server rendering/App Router patterns and Booking BFF fetch behavior.
- Preserve current Java/Spring booking-service read behavior; U01 changes actor propagation and shell mounting, not query algorithms.

## Benchmark Evidence

U01 performance evidence is acceptable when the live proof records route timings for login redirect/return and `/booking` read. If Docker/Compose runtime cannot start, record a W2-01 blocker rather than claiming performance PASS from isolated unit tests.
