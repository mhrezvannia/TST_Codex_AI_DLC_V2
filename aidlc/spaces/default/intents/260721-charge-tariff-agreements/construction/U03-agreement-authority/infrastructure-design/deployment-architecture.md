# Deployment Architecture - U03 Agreement Authority

## Deployment boundary

U03 extends the existing `charge-agreement-service`,
`apps-charge-agreements`, and Charge database. It creates no deployable,
database, cache, broker, topic, network, gateway, cloud resource, or production
topology. Full-stack proof uses only guarded `linercore-wave-a` on loopback
nginx 18088; CI component/integration jobs use processes/Testcontainers.

The executable path is browser -> nginx -> Charge BFF -> Charge service ->
Identity/Reference Data/Charge PostgreSQL. A committed lifecycle event later
flows Charge outbox -> U03 bounded relay -> existing Kafka/Schema Registry.
Broker work is never inside the commercial transaction.

## Compute, network, and storage

The Charge service retains the existing 384 MiB local container/JVM posture and
one Hikari pool (min 2, max 10, acquire <=2 s) until the fixed 10k Agreement/
50k version/150k link fixture proves heap/GC/RSS/CPU and connection headroom.
Ten administrative commands hold at most ten connections. Relay publication
holds no connection while waiting for broker acknowledgement.

Inter-container traffic uses Compose DNS. All Wave A host mappings are
loopback-only and browser traffic uses nginx. U03 adds no public backend URL.
Port 8088 and manager resources remain probe-only under before/after
`demo:guard`.

PostgreSQL database `linercore_pricing` is the sole Agreement/version/link/
activity/outbox authority. U01 owns immutable V1-V4 migration files; U03 uses
the V3 physical contract and cannot edit applied migrations. A missing column,
index, discriminator, activity structure, or Flyway mismatch keeps Charge
unready and requires forward repair through a later migration.

## Ingress identity and media

U02 fixes Agreement policies to
`application/vnd.linercore.charge-agreement-v2+json` and sends the exact
versioned `X-LinerCore-Subject-Assertion` contract from U02 Infrastructure
Design. U03 shares
`contracts/security/charge-subject-assertion-v1.json`, key ID
`w2-03-wave-a-v1`, and the dedicated assertion secret.

The Java verifier strictly decodes fixed-order UTF-8 byte-length claims,
base64url and HMAC-SHA-256; binds issuer, key, method, normalized path,
correlation, 30-second lifetime and five-second skew; and atomically claims the
nonce in a 4096-entry process-local map until `exp+5`. Duplicate is 401 and
capacity exhaustion is 503 before service authorization. The Wave A single-
process/restart replay limitation remains explicit and is not a production or
multi-instance claim.

Default JSON routes select the legacy adapter only. Vendor media selects the W2
adapter only. No 404/validation/denial fallback crosses adapters. Browser
actor/subject/service/assertion/media headers are removed/replaced by U02.

## Relay deployment and single ownership

When `charge.outbox.bounded-relay.enabled=true`, both schedulers use one total
classifier:
`u03_owned = event_id LIKE 'w2agr-%' OR (event_type in the five Agreement
lifecycle types AND snapshot.authorityModel='W2_VERSIONED')`.

The U01-owned V3 migration adds the immutable, strict
`charge_try_jsonb(text)` database helper: it returns the parsed JSONB value and
catches SQLSTATE `22P02` to return NULL for malformed input. Claim SQL evaluates
`COALESCE(charge_try_jsonb(snapshot)->>'authorityModel' = 'W2_VERSIONED',
false)`, which reads only the top-level property and cannot abort the claim
query. The `event_id LIKE 'w2agr-%'` arm remains independent and therefore
always sends malformed prefixed rows to U03 PERMANENT quarantine. CI fixtures
cover invalid JSON, a nested-only marker, a valid top-level W2 marker, and a
prefixed malformed snapshot.

- the existing Charge relay claims only `NOT u03_owned`;
- the U03 coordinator claims exactly `u03_owned`;
- U03 publishes only prefix + five exact lifecycle types + W2 model + supported
  1.1.0 snapshot. Any other owned row is PERMANENT integrity quarantine.

Classifier/complement and quarantine cases are blocking SQL fixtures. No row can match both or neither
because of a runtime toggle race: scheduler activation is validated once at
startup and both beans derive from the same immutable configuration. Other
service relays are unchanged.

U03 claims <=50 rows with `FOR UPDATE SKIP LOCKED`, records PROCESSING plus
random worker and database claim time, publishes <=10 concurrently with a
two-second acknowledgement deadline, then fences marks on worker+claim time.
Lease is 30 seconds; polling <=5 seconds; claim/mark transactions <=1 second.
PUBLISHED/PERMANENT are terminal.

## Configuration and lifecycle

Required configuration includes datasource/Flyway, assertion secret/key/cache,
 Identity/Reference URLs and credentials, vendor media, Kafka/Schema Registry,
and exact relay values:

- batch 50, publish concurrency 10, poll 5 s, lease 30 s, ack 2 s;
- retry delays after failures 1-7 are 5/15/30/60/60/60/60 s, jitter <=1 s;
  failure 8 becomes PERMANENT;
- reserved prefix `w2agr-` and five closed event types.

Missing/invalid assertion, datasource, outbox, or authorization/reference
wiring fails readiness. Broker/registry outage reports relay degradation and
backlog but does not make already-valid commercial commands unready: enqueue is
durable and bounded.

Each claim/mark allows <=2 seconds pool acquisition and <=1 second transaction.
The saturation proof starts ten commands plus relay work against the max-10 pool
and requires relay acquisition <=2 seconds. Recovery arithmetic is 103 seconds
for normal retry and 72 seconds for lease expiry.

Spring graceful shutdown stops HTTP and new relay claims, allows 15 seconds for
bounded command transactions and active send/mark work, then rolls back/leases
remaining work; Compose grants 20 seconds. Restart readiness plus one authorized
vendor detail read must complete within 120 seconds locally.

## Environment and infrastructure-as-code

Developer/CI/Wave A use the same code and service topology at different
fixture/lifecycle scales. Staging and production are undefined. Versioned
infrastructure is Compose/Wave A override, Charge image/config, U01 Flyway
resources, Kafka/Schema config, and observability definitions. Rendered config,
image digests, Flyway/catalog hashes, relay predicates, and manager guards are
retained.

## Upstream traceability

This deployment consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It implements
their Agreement authority, assertion, V3, exact media, pool/lock, relay,
restart, and preservation decisions.

## Review

**Iteration 1 verdict: NOT-READY.**

The existing Charge service/PostgreSQL/Wave A topology, U01 ownership of the
immutable V3 physical contract, U02 compact assertion fixture and replay
limits, vendor/legacy media isolation, max-10 shared pool, PostgreSQL lock
authority, atomic Agreement/activity/outbox transaction, fenced relay state
machine, typed retry/permanent outcomes, eight-attempt terminal retention,
95/64/120-second recovery arithmetic, forward-only post-event rollback,
current-UTC security gates, and manager 8088/W1 preservation are otherwise
coherent. All five primary artifacts have the required section depth, reference
the eight stage inputs, and contain no TypeScript/JavaScript snippets.

### Blocking findings

1. **P0 — the consumed security design contradicts the exact U02 assertion
   contract.** `security-design.md` still says the BFF sends separate
   server-created actor, issuer, time, nonce, and signature headers and describes
   only a generic 30-second nonce cache. The infrastructure artifacts instead
   require the single compact `X-LinerCore-Subject-Assertion` header, exact
   byte-length-framed payload, key ID, five-second skew, 4096-entry map through
   `exp+5`, and the shared
   `contracts/security/charge-subject-assertion-v1.json` vectors. Both cannot be
   authoritative, and an implementer following the required NFR input will not
   interoperate with U02. Revise the U03 security design to consume the exact
   compact U02 contract and explicitly prohibit every alternate identity/assertion
   header grammar.

2. **P0 — old/U03 relay predicates are disjoint but not collectively
   exhaustive.** The old relay claims `event_id NOT LIKE 'w2agr-%'`; the U03
   claim SQL requires both `event_id LIKE 'w2agr-%'` and one of five event types.
   A prefixed row with an invalid or unexpected type therefore matches neither
   coordinator and can never reach the promised PERMANENT integrity outcome.
   Conversely, a five-type row lacking the prefix is eligible for the old relay.
   The current outbox schema has no constraint coupling prefix and event type,
   so the deployment claim that no row can match neither is false. Make U03 own
   every `w2agr-%` row at claim time and classify invalid type/model/schema as
   PERMANENT before publish, or add an equally complete enforced invariant plus
   startup/repair behavior. Update coexistence and rollout fixtures to prove
   exactly one owner for valid and malformed rows.

### Nonblocking findings

1. The four retry delays do not state the attempt-five-through-seven mapping.
   Define the schedule explicitly, for example 5/15/30/60 seconds followed by
   a 60-second cap until failure eight becomes PERMANENT, so the 61-second
   maximum next-at bound is not inferred.

2. The max-10 pool equals the accepted ten-command concurrency and leaves no
   reserved relay connection. State whether the 120-second recovery workload
   excludes concurrent administrative saturation or add a combined-load gate
   proving claim/mark acquisition still fits the recovery bound.

### Iteration 2

**Verdict: NOT-READY.**

The prior assertion blocker is resolved: U03 `security-design.md` now consumes
the single compact U02 header, exact byte framing/signature/context, shared
golden-vector schema, 4096/4097 replay behavior, expiry, and restart limitation.
The prior relay-gap blocker is resolved in claim/publish behavior: U03 owns the
total classifier `prefix OR (five-type AND W2)`, the old relay owns its exact
complement, and owned rows failing prefix/type/model/schema publication checks
are retained as PERMANENT integrity quarantine. Retry failures 1-7 now map
exactly to 5/15/30/60/60/60/60 seconds and failure 8 is PERMANENT. Pool
acquisition is included in the corrected 103-second normal and 72-second lease
bounds, with a ten-command saturation gate. The remaining topology, V3/media/
transaction/fencing/security/manager controls remain coherent.

#### Blocking findings

1. **P0 — rollback and shared ownership still use the old prefix-only boundary,
   not the total classifier.** `cicd-pipeline.md` allows rollback to the old
   coordinator whenever no `w2agr-` row exists, but the corrected classifier
   also owns a five-lifecycle-type W2 row without that prefix and deliberately
   quarantines it. With such a row present, the stated rollback check passes
   even though disabling U03 can strand the row or expose it to an older
   unpartitioned relay. `shared-infrastructure.md` likewise says U03 owns only
   `w2agr-` five-type rows, contradicting its later total-classifier paragraph.
   Make rollback eligible only when **no row matching `u03_owned` exists in any
   active or terminal/quarantined state**, use that same predicate in pre-start
   and compatibility checks, and update the ownership registry. Preserve
   PERMANENT quarantine rows as U03-owned evidence across forward repair.

#### Nonblocking findings

1. Define the SQL-safe extraction behavior for
   `snapshot.authorityModel` from the existing TEXT snapshot column. The total
   classifier must return a deterministic boolean for malformed/non-JSON
   snapshots without aborting the claim query; prefixed malformed rows must
   still reach U03 quarantine.

## Post-review lead corrections

The iteration-2 verdict above remains the reviewer’s final formal verdict.
Within the two-iteration cap, the lead corrected its remaining blocking finding:

- rollback, pre-start, and compatibility eligibility now require zero active,
  terminal, or quarantined rows matching the complete `u03_owned` classifier;
- the shared ownership registry uses the same total classifier and separates
  ownership from the narrower publish-valid subset;
- PERMANENT quarantine is retained as U03-owned evidence across forward repair.

The nonblocking extraction finding is also closed with the safe V3 JSONB helper,
deterministic NULL-to-false handling, and malformed/nested-marker fixtures. No
third review is claimed; the historical verdict is preserved for the
stage-wide gate.
