# Technology Stack Decisions - U04 Pricing Provider and Manual Cases

## Brownfield constraint

U04 extends the existing Charge service and v1 pricing provider. It selects no
new deployable, database, cache, broker, workflow engine, shared UI abstraction,
or external pricing provider. It consumes `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and brownfield `technology-stack.md`.

## Selected technologies

| Concern | Decision | Constraint/rationale |
| --- | --- | --- |
| domain/calculation | Java 21, framework-free value objects and `BigDecimal` | deterministic three-line USD/PER_CONTAINER math, scale two HALF_UP, no floating point |
| runtime/transaction | Spring Boot 3.3.7 and one Charge-datasource transaction | authorization adapters, fenced receipt completion, atomic case+MANUAL receipt |
| persistence | Spring JDBC and PostgreSQL 15 | indexed candidate queries, unique receipt/case keys, lease/fence conditional updates, exact JSON bytes |
| migration | U01-owned Flyway 10.10.0 V4 | U04 consumes and validates; no migration file ownership or destructive reset |
| API/contracts | existing Spring REST/OpenAPI `application/vnd.api.v1+json` pricing route plus additive default-JSON manual reads | required v1 fields/media preserved; optional enriched/error properties only |
| hashing/serialization | JDK SHA-256 and one configured existing JSON serializer | published canonical request order and serialize-once terminal snapshot; no reconstructed replay |
| identity/authority | existing service authorization/Reference ports, U03 W2 Agreement candidate port, U01 Rate candidate/link repositories | fail closed, exact typed queries, no browser/direct/cross-database authority |
| frontend/manual evidence | Next range `^15.1.3` (lock 15.5.19), React 18.3.1, TypeScript range `^5.7.2` (lock 5.9.3), Zod range `^3.24.1` (lock 3.25.76) | Charge-owned read-only page through U02; no RTK or shared shell/tokens change |
| tests | JUnit Jupiter 5.11.3, Spring/Testcontainers, provider/consumer JSON fixtures, Vitest range `^2.1.8` (lock 2.1.9), Playwright 1.61.1 | domain, JDBC/fence/fault, contract, component and U06 live/browser proof |
| runtime/evidence | existing Compose via `scripts/wave-a-compose.mjs` | project `linercore-wave-a`, 18088; manager 8088 probe-only |

## Significant decisions and alternatives

### Framework-free deterministic calculator

Use explicit ordered sources and `BigDecimal` operations. Rejected alternatives
are rule engines, floating-point arithmetic, configurable line order, partial
prices, FX/tax logic, and a generic pricing microservice—all outside this slice.

### PostgreSQL receipt lease and fencing

The existing request table is authoritative for claim, takeover, terminal bytes,
and replay. Conditional fence updates plus unique keys provide multi-instance
safety. Rejected alternatives are JVM locks, Redis, exactly-once claims, blind
retry, response regeneration, or an async job workflow.

### Agreement-first fixed repository resolution

Use U03 W2 candidates and exact linked versions; query U01's three standalone
sets only when Agreement count is zero. There is no legacy/specificity/price/
latest tie-break, copied master data, or cross-service SQL. Runtime ambiguity is
a safe terminal manual outcome rather than silent selection.

### Read-only manual evidence

Use Charge-local BFF/page composition and the service-owned case table. No
assignment, quote, approval, resolution, close, notes, or money fields are added.
URL/query/form-local state is sufficient; RTK is absent and not introduced.

## Quality and release gates

Backend build/tests, module changed-code coverage >=80%, candidate/calculator/
receipt/case/fencing/fault matrices, provider/consumer compatibility, migration
and legacy fixtures, authorization/secret/redaction scans, deterministic p99 and
capacity reports, frontend build/lint/type/component tests, and
`git diff --check` are blocking. Detection exit zero never substitutes for
manual security and fidelity review.

U06 owns isolated live known-agreement, tariff, no-rate, ambiguity/reprice,
API/DB/correlation and Playwright evidence, both demo guards, `aidlc-audit`, and
`erp-fidelity-audit`. Until observed, no Docker/live PASS is claimed and the W1
blocked/waived record remains explicit.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, selecting the minimum existing
stack required for sole-authority pricing and read-only manual evidence.

