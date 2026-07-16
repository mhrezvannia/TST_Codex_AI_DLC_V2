# Reliability Requirements - U07 Live Release Acceptance

## Release Integrity

- One continuous real run proves create, validate, price, confirm, both topics, CMM journey/outbox, Booking projection/UI, negative states, replay, migration, and two service restarts.
- PostgreSQL host port is 55432 while container port is 5432; acceptance volumes persist and are never reset to manufacture success.
- Schema Registry cutover captures before/after fingerprints, canonical version 1, and BACKWARD compatibility; unknown/non-local history blocks.
- Every gate command has timestamp/exit/output/hash. PASS additionally requires a verified detached signature over the canonical evidence root plus a dedicated Git evidence commit and annotated run tag whose target/tree match the signed manifest. Missing, contradictory, partial, unsigned, or failed evidence yields run `FAILED`.

## Quality and Recovery Gates

All Maven/frontend/contract/seed/readiness/domain-purity tests, changed-code line coverage >=80 percent, accessibility/no-overlap checks, `aidlc-audit`, and `erp-fidelity-audit` must be green. Failed/finalized runs are content-addressed and signed; filesystem read-only marking is only an operational guard. Rerun uses a new ID. Failed transactions leave zero partial effects and committed state survives service restart within existing volumes; host/volume loss RPO is the latest captured dump. Local restart RTO is <=60 seconds after dependency health.

## Source Coverage

Scenarios aggregate U07 `business-logic-model.md`, `business-rules.md`, and all release/reliability clauses in `requirements.md` on `technology-stack.md`.
