# Technology Stack Decisions - U03 Agreement Authority

## Brownfield constraint

U03 extends the existing Charge ports-and-adapters service, service-owned
PostgreSQL, and transactional outbox described by `technology-stack.md`. It
implements `business-logic-model.md`, `business-rules.md`, and `requirements.md`
without a new deployable, database, cache, broker, shared UI abstraction, or
pricing service. Managed versions remain governed by the Maven reactor,
workspace lock, and existing images.

## Selected technologies

| Concern | Decision | Constraint/rationale |
| --- | --- | --- |
| domain/application | Java 21, existing Charge modules and value objects | immutable Agreement/version/link model, exact typed commands, ports-and-adapters boundaries |
| runtime/transactions | Spring Boot 3.3.7 and one Charge-datasource `@Transactional` boundary | commercial/activity/outbox atomicity; publisher remains post-commit |
| persistence/locking | Spring JDBC and PostgreSQL 15 | explicit SQL, optimistic version, row locks, advisory transaction lock, indexed inclusive-overlap query |
| migration | Flyway 10.10.0 line adopted by U01 | U03 consumes V3/V4 schema and validates semantics; it does not own/edit migrations |
| REST/contracts | existing Spring REST/OpenAPI with default JSON legacy adapter and exact W2 vendor media | no field-guessing or adapter fallthrough; additive routes only |
| identity/reference/rates | existing HTTP/service authorization ports plus Charge-owned RateVersion repository port | fail closed; no browser authority, copied master data, or cross-database SQL |
| events | existing Spring Kafka, Avro 1.11.4, Confluent 7.7.1 registry/serializer line, and JDBC outbox relay | additive nullable/default-null 1.1.0 fields; same subjects/topics; at-least-once with stable dedupe |
| frontend | Next package range `^15.1.3` (lock 15.5.19), React 18.3.1, TypeScript range `^5.7.2` (lock 5.9.3), Zod range `^3.24.1` (lock 3.25.76) | U02 BFF/vendor media and Charge-owned pages only |
| UI/state | existing `@erp/ui`, LinerCore tokens, URL/query/form-local state | no `packages/ui`, shell/nav/type/palette change; RTK absent and not introduced |
| tests | JUnit Jupiter 5.11.3, Spring/Testcontainers, contract/Avro fixtures, Vitest range `^2.1.8` (lock 2.1.9), Playwright 1.61.1 | domain/JDBC/race/media/schema/component/live evidence; U06 owns browser/live closure |
| runtime/evidence | `scripts/wave-a-compose.mjs`, project `linercore-wave-a`, nginx 1.27 | isolated 18088; manager 8088 remains probe-only |

## Significant decisions and alternatives

### Immutable aggregate history in PostgreSQL

Use stable header plus immutable-numbered versions, exact link rows, append-only
activity, and lifecycle/row-version columns under database constraints and
locks. Rejected alternatives are snapshot-upsert W2 authority, mutable Approved
terms, JVM-only locks, and a separate agreement database/service.

### Media-selected compatibility adapters

Default JSON preserves the LEGACY contract and queries only LEGACY headers;
exact vendor media selects W2 administration/dual-read semantics. This is
preferred to guessing dialect from fields or route fallback, which would risk
stale W2 projection disclosure and ambiguous errors.

### Existing transactional outbox and compatible Avro evolution

Commands enqueue before transaction return through the same JDBC transaction;
the relay publishes later. The schema adds only nullable/default-null fields and
retains topics/subjects. Rejected alternatives are inline Kafka publication,
new event types/topics, exactly-once claims, and a new broker/workflow service.

### Authoritative reads without cache

Search/detail/approval/candidates use Charge PostgreSQL with bounded paging and
indexes. A cache could stale Draft/overlap/lifecycle or leak authorization and is
not justified by the confirmed local fixture. Query/index tuning precedes any
future infrastructure proposal.

## Quality and release gates

Backend build/tests, module coverage >=80% for changed code, migration/catalog
tests, two-context contention, authorization/reference/link/media matrices,
legacy byte fixtures, Avro compatibility, outbox faults/recovery, dependency/
secret/redaction scans, and `git diff --check` are blocking. The baseline lacks
complete Java coverage wiring, so implementation adds only minimum module-scoped
reporting rather than inferring coverage from test count.

U06 owns live Compose, API/DB/correlation evidence, Charge/Booking Playwright,
pre/post `demo:guard`, `aidlc-audit`, and `erp-fidelity-audit`. Until those run,
no artifact upgrades Docker/live evidence or the W1 blocked/waived history to
PASS.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, selecting only the minimum
brownfield technologies needed for U03 Agreement authority and compatibility.

