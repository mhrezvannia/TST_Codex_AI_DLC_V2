# Infrastructure Services — U04 Pricing Provider and Manual Cases

## Input contract and service selection

This artifact consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

U04 reuses PostgreSQL 15, the existing Charge JVM, nginx, the Charge app,
Identity, and Reference Data. It selects no cache, queue, event topic, search
engine, CDN, replica, object store, or new external service.

## PostgreSQL access paths

| Operation | Required bounded access path |
| --- | --- |
| claim/replay | unique `pricing_requests.idempotency_key` |
| takeover | key + IN_PROGRESS + database-time lease with conditional fresh owner token |
| completion | key + current owner token + IN_PROGRESS |
| Agreement selection | U03 exact key/lifecycle/validity and bounded links |
| tariff selection | U01 category equality prefix/lifecycle/validity/order |
| canonical OPEN case | unique versioned request/reason identity |
| manual list | status/filter plus `opened_at DESC NULLS LAST, case_id ASC` |
| manual detail | unique case ID with no candidate join |

The existing Hikari pool remains maximum 10 with 2-second acquisition. Claim,
candidate snapshot, and terminal completion never overlap their connection
holds. Query-plan evidence rejects sequential scans on the 100,000-receipt
fixture where the declared unique index applies.

The exact manual order is `opened_at DESC NULLS LAST, case_id ASC`. U01's
`idx_manual_cases_status_opened(status, opened_at, case_id)` narrows OPEN rows,
then PostgreSQL performs an explicit bounded sort because default index ordering
cannot directly satisfy the mixed directions. On the 10,000-row fixture,
`EXPLAIN (ANALYZE, BUFFERS)` must show at most 10,000 candidate rows, no disk
spill, sort memory at or below 4 MiB, a returned page at most 100, and p95
at or below 750 ms. This accepts the U01 index without authorizing a migration.

## Receipt, case, and replay contract

An absent key creates IN_PROGRESS with a cryptographically random owner token
and a 10-second lease calculated by PostgreSQL. The token is the fence.
Same-hash live ownership returns 409 without resolver work; different hash
always conflicts; expired same-hash ownership atomically receives a fresh
random token and a new database-time lease. Completion matches key, current
owner token, and IN_PROGRESS.

Terminal replay first reauthorizes, then returns stored status and exact bytes
without calculation, rendering, or case mutation. Content type is derived only
from stored status: pricing-v1 media for 200 and standard JSON for 404/422.
Malformed legacy terminal evidence fails closed with 503.

No-rate and the four ambiguity reasons create-or-get one canonical OPEN case in
the same terminal transaction. An existing deterministic legacy winner remains
unchanged; missing legacy evidence is represented honestly.

## Identity, reference, and discovery

Compose DNS resolves all services. Human manual evidence requires the signed
session and exact `charge-manual-cases:read` at BFF and service before any
count/query. Pricing requires trusted service identity and
`charge-agreement:price` before receipt access. Browser-selected actor,
assertion, service, or display headers are rejected/overwritten by the
established U02 boundary.

Reference Data remains an external validator/label source, never a copied
commercial authority. Pricing candidates come only from the Charge database;
Booking never reads it and Charge never joins Booking storage.

## Degradation and recovery

Pool exhaustion or bounded query timeout produces a typed failure and no
unbounded retry. A dependency/integrity failure leaves an unacknowledged claim
recoverable after lease expiry. A stale owner cannot complete. Response loss
after commit is reconciled by byte-exact replay.

Offline reconciliation is read-only by default: it reports expired IN_PROGRESS
rows and terminal receipt/canonical-case mismatches without changing
acknowledged bytes. Any repair or replay is a separately audited forward action.

## Capacity and ownership

U01 owns the physical V4 schema and Charge pool; U03 owns Agreement authority;
U04 owns receipt/case behavior and manual evidence APIs; U05 owns Booking
consumption; U06 owns live Compose/restore proof; W2-02 owns the shared shell
and `packages/ui`. These boundaries are enforced in review and path-scoped
tests.

Production archival, partitioning, replication, retention, and scaling policy
remain undefined. Evidence reports table/index size, dead tuples, vacuum
health, pool saturation, and query plans without presenting local fixture
capacity as a production guarantee.
