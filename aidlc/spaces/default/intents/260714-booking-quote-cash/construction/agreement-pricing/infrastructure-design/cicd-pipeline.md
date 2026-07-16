# CI/CD Pipeline - U03 Agreement Pricing

## Build and Contract Gates

The online Maven pipeline builds contracts, Charge, and Booking against pinned Flyway 10.10.0, Resilience4j 2.2.0, and Pact 4.6.17. It runs consumer/provider Pact verification for operational `AGREEMENT` and `NO_RATE`, exact OpenAPI/catalog/example checks, domain money/category tests, JDBC lease/fencing tests, API media/auth/error tests, and Booking client/apply tests.

Static gates reject cross-service SQL, a durable Booking pending state before HTTP, unbounded retry/bulkhead/term lists, floating dependencies, automatic Flyway baseline, raw pricing logs, and non-local local-auth activation. Dependency/secret/static scans and changed-code line coverage >=80 percent are blocking.

## Compose and Failure Matrix

Compose seeds >=100 active/expired/overlapping agreements and <=100 terms, then executes happy-path pricing, no-rate manual, same-key replay, changed-hash conflict, concurrent claim, live lease, expired takeover, stale completion, timeout/503 retry, breaker recovery, restart at each claim/calculate/complete point, and guarded migration fixtures. PostgreSQL host port is 55432 and volumes are never reset to manufacture success.

The fixed 1,000-request load and browser quote/manual states run through nginx. Rollback uses prior images plus additive-compatible schema or tested dump/forward repair; terminal Charge results and Booking snapshots remain readable. `aidlc-audit` and `erp-fidelity-audit` close the unit gate.

## Artifact and Secret Handling

CI injects target-specific tokens and DB credentials from protected environment storage. Pact/load/test/migration evidence is hashed and retained; sensitive dumps are excluded from Git. U07 signs and finalizes release-safe evidence.

## Source Coverage

Pipeline enforces `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U03 `business-logic-model.md`.
