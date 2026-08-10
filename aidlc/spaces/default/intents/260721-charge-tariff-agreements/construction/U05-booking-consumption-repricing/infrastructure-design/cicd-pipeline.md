# CI/CD Pipeline — U05 Booking Consumption and Repricing

## Inputs and posture

This pipeline consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.
Unit/Testcontainers jobs remain ephemeral; the only full-stack job uses
`scripts/wave-a-compose.mjs` and `linercore-wave-a`.

## Build and security

Build Booking domain/application/dataaccess/container, pricing contracts, BFF,
and pricing region from lockfiles. Run type/lint/unit/integration/contract and
the established pinned Semgrep/Gitleaks/Trivy/Syft/Yarn report-first suite with
closed current-UTC waivers. Tool/report failure or unwaived findings fail.

Runtime custody remains with the existing owners: Identity/W2-02 owns session
signing material, Booking owns its Charge service credential and database
secret. A rotation fixture restarts the bounded local services with fresh
values, proves the new credential succeeds and the retired value is denied,
and records only secret-version fingerprints; secrets never enter reports.

## Blocking verification

Tests cover three-phase transaction boundaries, Booking-then-receipt lock
order, owner/fence CAS, revision/sequence/fingerprint races, exact replay,
snapshot collision, cursor stability, confirmation guards, legacy decoding,
provider algebra, redaction, and accessible Price/Reprice/history UI.

Deterministic resilience tests prove two two-second calls, exact typed retry/
circuit predicates, five-failure opening, 30-second wait, one half-open probe,
`probeStartedAt+5s` rejection, synchronous resource release, and no detached
threads/futures. They assert exact 10-connection/permit, 100-ms acquire,
500-ms connect, 2-second response/overall, 64-KiB body, 32-thread/queue,
64-connection, and Hikari 2/10/2-second bounds. Large fixtures and query plans
use 10k/50k/100k and 10 clients.

Migration tests target the exact Booking-owned V3 path, validate every column/
check/FK/default/backfill, prove only the four-column DESC cursor and partial
PRICE-due indexes, and cover empty/V1/V2/V3/drift/repeat/192-character key.
Constraint tests prove IN_PROGRESS forbids replay fields, COMPLETED requires
immutable replay fields without due time, and RETRYABLE requires the same
immutable outcome plus due time and replays it byte-exactly until reclaim.

## Performance and promotion

Measure each fresh subtype directly: 50 first Agreement, 50 first Tariff, 50
successor Agreement Reprice, 50 changed-tariff Reprice. Gate direct p99
<=1,500 ms, capture p95 <=500 ms, completion/history p95 <=750 ms, and the
three-cycle resource rule. Component percentiles remain diagnostic.

Promotion validates Compose/config/migration hashes, runs manager guards,
starts the candidate with a 120-second readiness ceiling, runs live evidence,
and repeats guards. No manager resource or alternate full-stack project is
touched.

## Rollback and artifacts

Prior-image use requires validate-only/read-only schema compatibility, the
exact `incompatible_u05_rows` query returning zero, unchanged catalog/Flyway/
data hashes, byte-preserving legacy fixtures, and a drained SELECT-only role.
Fixtures include a W1 version-2 row without U05 JSON keys (eligible), a
pre-pricing U05 amendment, each U05 status/currentness field, a PRICE receipt,
and a typed snapshot (all ineligible); malformed JSON fails closed.
After the first U05 row, use candidate restart, forward repair, or the
promotion-tested U05 isolated restore. No down migration/reset is allowed.

Before promotion, `scripts/u05-booking-recovery.mjs` creates/checksums a custom
Booking dump, restores it into a verified wrapper-owned isolated database,
migrates/starts the candidate, proves legacy and U05 replay/history/fence state,
emits `artifacts/recovery/u05-booking-recovery.json`, and safely cleans only
exact owned resources. U06 later consumes this artifact.

The signed manifest contains source/locks, image digests, SBOM/scans/waivers,
schema/contracts, tests, raw latency/resource/query/client evidence, Compose
fingerprint, and both manager guards. Failed runs are never marked deployed.
