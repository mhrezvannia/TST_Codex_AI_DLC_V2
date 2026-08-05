# CI/CD Pipeline - U06 Replay and Restart Safety

## Deterministic Fault Matrix

JUnit injects failure after every provisional write for draft, validation apply, pricing claim/complete, confirmation/outbox, CMM receipt/journey/status outbox, and Booking receipt/projection, asserting full transaction rollback. Pricing tests control clock/owner to prove live lease, expired CAS takeover, and stale completion rejection.

Kafka integration and live Compose publish duplicate, stale, out-of-order, transient, and permanent records; inspect DLT; authorize unchanged replay after environmental repair; authorize corrected replay with same envelope ID and hash/diff audit; then restart Booking and CMM sequentially. The migration harness captures dump/catalog/count/hash, exercises empty/exact-legacy/known-history/partial fixtures, verifies two restarts, and tests restore/forward repair on a disposable copy.

## Security and Static Gates

Tests prove normal tokens cannot replay, actor/reason/coordinates are mandatory, token comparison/redaction work, tampering fails, correction fields are allow-listed, and no production fault endpoint/bean activation exists. Static analysis rejects DB credentials/table writes in replay tooling, raw secret/payload logs, destructive volume reset, unbounded replay loops, or fault collaborators reachable from production controllers.

All backend/frontend/contract tests, changed-code coverage >=80 percent, dependency/secret/static scans, migration checks, and `aidlc-audit` plus `erp-fidelity-audit` are blocking. Online build retries transient TLS failure without trust bypass.

## Run and Rollback

Compose runs with real Kafka/SR/PostgreSQL host 55432 and persistent volumes. A failed step stops dependent claims, writes diagnostics/manifest, and requires a fresh run ID. Rollback retains additive schemas/canonical subjects; data recovery uses tested dump or forward migration, never reset.

## Source Coverage

Pipeline enforces `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U06 `business-logic-model.md`.
