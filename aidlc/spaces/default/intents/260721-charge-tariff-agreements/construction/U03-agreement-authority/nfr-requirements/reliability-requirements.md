# Reliability Requirements - U03 Agreement Authority

## Objectives and boundary

U03 requires RPO 0 for every committed W2 Agreement header, version, link,
activity, and outbox row. On a healthy isolated dependency set, restart-command
acceptance to readiness plus one authenticated Agreement detail read is <=120
seconds. These are local acceptance objectives, not production RTO/SLO claims.

The objective consumes `business-logic-model.md`, `business-rules.md`, program
`requirements.md`, and brownfield `technology-stack.md`. U01 owns migration
files; U03 verifies that Agreement semantics survive their adoption/replay.

## Transaction, concurrency, and immutability

Create/edit/approve/successor/suspend/expire commits its complete header/version/
links/activity/outbox set in one Charge-datasource Spring transaction. Reference,
rate-link, authorization, constraint, activity, or enqueue failure rolls the set
back. A process stop before commit leaves no row; after commit, exact state
survives even if the HTTP response or event publication is lost.

Approval acquires the canonical authority-key advisory transaction lock before
revalidation and inclusive overlap. Successor locks the stable header before
version allocation. Edit and terminal transitions use exact optimistic version.
The repeated race matrix proves one valid winner and exact conflict losers with
no partial state. Approved/suspended/expired commercial snapshots and links are
hash-identical before and after later successor/lifecycle/restart operations.

## Failure and recovery matrix

| Failure | Required state/outcome | Recovery evidence |
| --- | --- | --- |
| missing/invalid browser session | BFF 401; no service call/write | valid signed session |
| trusted subject exact DENY | 403 before protected disclosure/write | correct grant |
| Identity transport/timeout/malformed | typed 503; no write | healthy dependency, explicit retry |
| missing non-local secret/bypass enabled | readiness false/configuration abort | correct config and restart |
| inactive/mismatched reference or rate link | 422; no header/version/link/activity/outbox residue | correct input |
| reference/Identity unavailable | typed 503; no residue | restore dependency, explicit retry |
| stale/overlap/existing Draft/concurrent loser | exact 409; winner/source remains valid | reload detail/history |
| DB/pool unavailable | readiness false and absent or wholly committed transaction | reconnect/restart and canonical hash check |
| process stop before commit | zero new business/activity/outbox rows | restart and deliberate retry |
| process/response loss after commit | one complete committed set with pending/published outbox | authoritative detail/activity/outbox reconciliation |
| broker/registry unavailable | commercial commit remains; same outbox row/key retryable; relay attempt metadata only may change | restore dependency; all 100 controlled backlog rows publish-confirm within 120 seconds |
| crash after broker ack and before outbox mark | retry may publish a duplicate with identical event/dedupe identity; no second commercial/activity row | restart relay, compare event identity/payload/key and consumer dedupe fixture |
| malformed/unsupported media | 400/406/415 in selected dialect; no adapter fallthrough/write | correct media/grammar |
| migration catalog drift | startup aborts; never destructive reset/baseline | verified restore or later forward repair |

No failure converts LEGACY into W2 authority, serves stale W2 projection through
legacy readers, silently retires an Approved version, or publishes inline as a
substitute for committed outbox evidence.

## Outbox and restart recovery

Every committed mutation has exactly one outbox row with stable event type,
Agreement key, version identity/number, resulting row version, correlation, and
dedupe key. Relay delivery is at least once. Retry increments only bounded relay
attempt/status metadata; it cannot alter event payload identity, activity, links,
or commercial snapshots. After healthy broker restoration, a controlled
100-event failed-publication backlog has all 100 rows publish-confirmed within
120 seconds, with none pending/lost and all event/dedupe identities unchanged.
A separate injected crash after broker acknowledgement but before the outbox
mark proves the permitted duplicate has identical event/dedupe identity and
creates no second commercial or activity row.

RPO 0 proof captures counts and canonical hashes for W2 headers, versions,
links, activities, outbox payload/keys, and Flyway history before and after two
bounded service restarts. U06's backup/restore targets a new isolated database,
verifies old LEGACY plus W2 reads and event compatibility, and uses only a later
ordered forward repair for applied-migration defects.

## Compatibility, readiness, and observability

Default-media legacy fixtures remain byte/semantic compatible and exclude W2
headers. Vendor media dual-reads explicit LEGACY history but never makes it
eligible. Avro 1.0.0 consumers read evolved 1.1.0 events; old retained fixtures
still deserialize. No error falls through between adapters.

Readiness is false for migration/catalog/DB failure, required non-local Identity/
Reference configuration failure, or missing production outbox wiring. Broker
readiness may be reported separately because commands can durably enqueue during
a bounded broker outage; health cannot be used as command proof.

Metrics cover query/command latency/outcomes, authority conflicts, lock/pool,
activity/outbox enqueue, relay pending/retry/publish, and media dialect with
bounded labels. One correlation joins API, authorization/reference/link checks,
commercial mutation, activity, outbox, and relay evidence with redaction green.

## Validation and upstream coverage

Transaction fault injection, two-context PostgreSQL races, restart/hash checks,
broker/registry relay faults, legacy/W2 contract fixtures, and schema-registry
compatibility tests are blocking. This artifact names and consumes
`business-logic-model.md`, `business-rules.md`, `requirements.md`, and
`technology-stack.md`; live integrated closure remains U06-owned.
