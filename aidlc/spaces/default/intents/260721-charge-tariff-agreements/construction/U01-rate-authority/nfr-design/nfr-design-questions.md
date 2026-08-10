# NFR Design Questions - U01 Rate Authority

## Context

The approved NFR requirements already fix the quantitative targets, security
boundary, local-only recovery proof, existing technology stack, and no-new-
topology constraint. These questions choose the concrete patterns needed to
meet those requirements without extending U01 into agreement selection,
pricing, Booking, or shared UI ownership.

## Questions

### Q1. How should U01 contain Identity and Reference Data failures?

- A. Keep synchronous fail-closed adapters with a two-second total deadline, bounded per-dependency permits, strict response bounds, and zero automatic mutation retries or cached commercial fallback; do not add a circuit-breaker library until measured need exists **(Recommended)**
- B. Add Resilience4j circuit breakers plus three automatic retries for both dependencies
- C. Cache the latest successful decisions/records and use them when a dependency is unavailable
- X. Other (please specify)

[Answer]: A - Keep synchronous fail-closed adapters with a two-second total deadline, bounded per-dependency permits, strict response bounds, and zero automatic mutation retries or cached commercial fallback; do not add a circuit-breaker library until measured need exists. **Mode:** guided

### Q2. How should database pooling and transactional contention be designed?

- A. Match the proven local Hikari posture (minimum idle 2, maximum pool 10, two-second acquisition timeout), keep each mutation in one transaction, use PostgreSQL key/row locks and constraints, and never automatically retry a whole Rate mutation **(Recommended)**
- B. Increase the local pool to 40 and add transparent transaction retries
- C. Leave pooling completely implicit and rely only on framework defaults
- X. Other (please specify)

[Answer]: A - Match the proven local Hikari posture (minimum idle 2, maximum pool 10, two-second acquisition timeout), keep each mutation in one transaction, use PostgreSQL key/row locks and constraints, and never automatically retry a whole Rate mutation. **Mode:** guided

### Q3. What read-scaling and cache design should U01 use?

- A. Use page-bounded indexed PostgreSQL reads with no application cache, replica, shard, or CQRS path; require measured evidence before a later scaling change **(Recommended)**
- B. Add an in-process Rate cache with time-based expiry
- C. Add Redis and a separate cached read model now
- X. Other (please specify)

[Answer]: A - Use page-bounded indexed PostgreSQL reads with no application cache, replica, shard, or CQRS path; require measured evidence before a later scaling change. **Mode:** guided

### Q4. What health and observability split should the design enforce?

- A. Keep liveness process-local; make readiness require database/Flyway and required non-local credential/adapter configuration, but not live downstream calls; emit low-cardinality operation/outcome metrics and safe correlation evidence **(Recommended)**
- B. Make both liveness and readiness call Identity, Reference Data, and PostgreSQL on every probe
- C. Use only a generic HTTP 200 health endpoint and application logs
- X. Other (please specify)

[Answer]: A - Keep liveness process-local; make readiness require database/Flyway and required non-local credential/adapter configuration, but not live downstream calls; emit low-cardinality operation/outcome metrics and safe correlation evidence. **Mode:** guided

### Q5. What migration and recovery mechanism should U01 design?

- A. Use exact-catalog Flyway adoption, forward-only additive migrations, RPO-0 hash/count verification, restore into a new isolated database, and later forward repair; never reset or edit an applied migration **(Recommended)**
- B. Allow destructive local reset as the normal recovery path
- C. Support down migrations by editing the original versioned SQL files
- X. Other (please specify)

[Answer]: A - Use exact-catalog Flyway adoption, forward-only additive migrations, RPO-0 hash/count verification, restore into a new isolated database, and later forward repair; never reset or edit an applied migration. **Mode:** guided
