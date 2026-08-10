# Shared Infrastructure - U03 Agreement Authority

## Ownership registry

| Shared resource | Owner | U03 boundary |
| --- | --- | --- |
| Charge V1-V4 files/catalog | U01 | consume V3 physical contract; later forward repair only |
| Charge BFF/nginx/assertion issuer | U02 | consume exact vendor media and assertion vectors |
| Agreement domain/repos/pages | U03 | own W2/legacy adapter behavior and activity |
| Charge Hikari/database | Charge shared | one max-10 pool; service-owned DB only |
| U01 RateVersion data | U01 | read exact Approved links; never mutate |
| Charge outbox table | Charge shared | own every row matching the full `u03_owned` classifier; publish only the valid five-type, W2-versioned subset |
| Kafka/Schema Registry/topic | messaging platform | publish compatible lifecycle events only |
| shared UI/shell | W2-02 | consume unchanged |
| Wave A/evidence | U06 | guarded deployment/final proof |

## Database and transaction boundaries

Agreement header/version/links/activity/outbox enqueue share one Charge
transaction. Broker calls never share it. PostgreSQL locks and constraints, not
JVM state, decide commercial concurrency. Other services/databases are never
queried through SQL.

U03 cannot change V3 after application. Physical omissions become forward
repair. U04 may read eligible Agreement authority later but cannot mutate U03
history or relay ownership.

## Relay coexistence

U03 owns the total classifier `w2agr-` prefix OR five-type/W2-authority row;
old Charge relay owns its exact complement. Only valid prefix/type/model/schema
rows publish; malformed owned rows are quarantined PERMANENT. Legacy five-type
and unrelated Charge rows remain old-relay owned. Startup verifies one
scheduler per complementary predicate.

The relay shares Kafka/Schema Registry but not row state with other services.
At-least-once duplicate uses identical event/dedupe identity. Eight-attempt
PERMANENT rows are retained and require separate audited repair.

## Shared security and observability

U02/U03 share only the dedicated assertion key material and golden-vector
contract. The BFF and backend still enforce different capability/authorization
boundaries. Identity, Reference Data, Rate data and vendor media remain
independent authorities.

Metrics use closed operation/outcome/media/event/state labels. No customer,
match, rate link, reason, subject, nonce, correlation, payload or amount becomes
a metric label. Correlation joins redacted evidence.

## Capacity and failure containment

The max-10 pool and PostgreSQL process are shared with U01/U04, so U03 records
sibling health and cannot raise connections unilaterally. Relay publish
concurrency 10 has no held DB connection. Broker outage affects event freshness,
not committed commercial authority.

Wave A wrapper/project/network/loopback resources are the only controlled
full-stack infrastructure. Manager 8088 and original W1 blocked/waived evidence
remain unchanged and non-PASS.

## Upstream traceability

This contract consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It fixes U01,
U02, U03, U04, messaging, UI, and acceptance ownership without a new topology.
