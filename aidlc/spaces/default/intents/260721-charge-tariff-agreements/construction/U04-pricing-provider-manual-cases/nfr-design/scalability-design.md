# Scalability Design - U04 Pricing Provider and Manual Cases

## Scale posture

U04 scales vertically in the existing Charge process and PostgreSQL database.
It adds no cache, queue, service, replica, search engine, or CQRS store. The
local fixture is 100,000 receipts, 10,000 OPEN cases, U03 agreements, U01
tariffs, and 10 concurrent pricing clients.

One synchronous authoritative path keeps replay, fencing, and RPO 0 independent
of eventual consistency.

## Bounded request work

Each call performs one receipt lookup/claim; one bounded read-only
`REPEATABLE READ` transaction containing the agreement query and, only after no
agreement, up to three tariff queries; exactly three success lines; at most one
case create-or-get; and one terminal update. Manual pages contain at most 100
rows. Candidate ports return enough evidence for zero, one, or ambiguity rather
than all history. The snapshot transaction holds no writer lock and closes
before rendering.

## Persistence and indexes

`pricing_requests.idempotency_key` remains unique. The baseline plus U01-owned
V4 provide request hash, exact bytes, HTTP status, pricing/correlation time,
case reference, random owner token, and lease. The current owner token is the
fence; U04 adds no normalized-request or numeric-fence column. Content type is derived from
stored terminal status and the fixed endpoint contract, so U04 requires no
content-type column or migration. Takeover predicates on key/status/lease;
completion predicates on key/current-owner-token/status.

Manual cases add a versioned canonical key unique for OPEN identity while
retaining legacy IDs/snapshots. List uses exact
`opened_at DESC NULLS LAST, case_id ASC` ordering with the accepted bounded
sort after the status-leading index; detail uses case ID. Agreement/tariff paths reuse
U03/U01 equality, lifecycle, validity, and ordering indexes.

## Connection and concurrency scaling

Reuse the U01 Hikari pool, maximum 10. Claim and terminal transactions are
short; the bounded read-only snapshot is separate and excludes serialization.
One request holds at most one connection at a time.

Database uniqueness and compare-and-set coordinate multiple instances; there
are no JVM locks. Same-key calls contend on one receipt, while unrelated keys
and manual reads remain independent.

## Growth controls

The 100,000-receipt gate proves indexed replay/claim without table scans.
Terminal bytes are stored once and directly returned; no application cache
retains them. JDBC mapping bounds each page, and frontend state retains only the
active page/detail.

Archival, partitioning, and production capacity policy are outside this intent
because no production volume/retention SLO exists. Evidence still reports
table/index size, dead tuples, plans, and vacuum health.

## Degradation and signals

Readiness is false for DB, catalog/schema, repository, or nonlocal-posture
failure. Pool/query timeouts produce typed failures without unbounded retry.
Signals cover pool use, claim/candidate/replay/page latency, takeovers,
stale-owner rejection, and duplicate-case convergence using bounded labels.

## Verification and traceability

Verification loads 100,000 receipts and 10,000 OPEN cases, runs pricing at 10
clients, checks pages up to 100, inspects query plans, executes 20 cross-context
races, and runs three post-GC heap/RSS cycles.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
