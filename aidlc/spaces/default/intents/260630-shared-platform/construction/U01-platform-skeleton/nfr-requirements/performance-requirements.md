# Performance Requirements - U01 Platform Skeleton

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines U01 as workspace initialization, backend/frontend skeleton setup, local runtime composition, shared conventions, and walking-skeleton enablement. `business-rules.md` fixes structural, runtime, convention, and validation rules. `requirements.md` provides NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-012, NFR-017, and constraints C-001 through C-006.

## Scope

U01 does not implement final reference-data read paths, authorization policy, or event publication logic. Its performance requirement is to create a buildable skeleton and runtime baseline that later units can measure consistently.

## Target Requirements

| Requirement | U01 obligation |
|---|---|
| Reference read p95 <= 300 ms | Provide service/module boundaries, API placeholders, and smoke/performance script hooks that later U03/U06 validation can run through. |
| Event freshness p95 <= 60 seconds | Provide Kafka/Schema Registry runtime placeholders, correlation conventions, and outbox/event folder layout so U04/U10 can measure commit-to-publish freshness. |
| Build feedback | Root scripts must expose stable backend compile/test and frontend type/test commands for CI. |
| Local startup | Docker Compose core profile should start enough dependencies for later smoke paths without manual wiring. |
| Health checks | Every service/app skeleton must reserve a common health/readiness endpoint shape for smoke and deployment gates. |

## Latency Budgets

U01 reserves the following budget placeholders for later implementation:

| Path | Skeleton budget decision |
|---|---|
| BFF to backend service | Must use server-side route handlers and keep room for downstream service latency measurement. |
| Reference provider read | Must expose timing hooks for p95 <= 300 ms validation once U03 implements the API. |
| Reference mutation to Kafka event | Must preserve correlation and event timestamp fields for p95 <= 60 second freshness measurement once U04 implements publication. |
| Health endpoint | Must be lightweight and not depend on slow business queries. |

## Resource Constraints

- Local Compose must support core development on a single workstation profile.
- Optional observability services may be profile-gated so core smoke checks are not blocked.
- Skeleton modules must avoid unnecessary framework dependencies in `domain-core` to keep compile and test cycles predictable.
- Frontend apps must use TypeScript strict mode and shared package placeholders without adding prohibited dependency stacks.

## Benchmark and Validation Hooks

- Root commands must allow CI to invoke backend compile/test and frontend type/test checks consistently.
- Health endpoints must be callable by local smoke scripts and future staging gates.
- Correlation id conventions must allow latency evidence to be linked across BFF, service, audit/outbox, and event paths.
- Performance validation must defer final load profile to later NFR/performance-validation work because `requirements.md` leaves that profile open.

## Non-Goals

- U01 does not set final production throughput.
- U01 does not implement caching, batching, or outbox publisher tuning.
- U01 does not prove the final p95 read or freshness targets by itself; it creates the measurement surface.

