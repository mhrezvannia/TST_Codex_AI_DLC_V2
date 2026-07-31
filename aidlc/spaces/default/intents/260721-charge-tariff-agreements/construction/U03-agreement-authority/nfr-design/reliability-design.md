# Reliability Design - U03 Agreement Authority

## Reliability objectives

Every committed W2 Agreement header, version, exact link, activity, and outbox
row has local RPO 0 within the existing PostgreSQL volume. After a bounded
service restart with healthy dependencies, readiness plus one authorized detail
read completes within 120 seconds. These are isolated Compose acceptance
objectives, not production availability, RTO, or host/volume-loss guarantees.

## Command atomicity and uncertain outcomes

Each mutation follows one all-or-nothing writer boundary:

1. validate trusted subject, command shape, references, rate identities, and
   aggregate/version ownership;
2. acquire the command-specific lock and re-read mutable authority;
3. apply exactly one domain transition;
4. write header/version/links as applicable, append one activity, and enqueue one
   immutable outbox event through the same transaction-bound datasource; and
5. commit before any broker publication.

A stop before commit leaves zero new rows. A stop after commit may lose the HTTP
response but leaves one complete set. Recovery starts with authorized
detail/activity/outbox reconciliation; automatic blind mutation retry is
forbidden. Approved/suspended/expired commercial snapshots and exact links are
hash-stable across successors, terminal transitions, restarts, and relay faults.

## Failure containment matrix

| Failure | Containment | Recovery |
| --- | --- | --- |
| session/subject/authorization | 401 at BFF or service 403/503; no protected lookup/write | restore session/grant/dependency, then explicit command |
| reference or linked rate invalid | safe 422; no residue | correct IDs/window/applicability |
| dependency timeout/unavailable | typed 503; no residue | restore dependency; explicit retry |
| stale/overlap/Draft race | exact 409; winner/source remains valid | reload authoritative detail/history |
| database/pool unavailable | readiness false; transaction absent or complete | reconnect/restart; compare counts/hashes |
| process stop before commit | no new business/activity/outbox rows | restart and deliberate retry |
| response loss after commit | one complete committed set | reconcile by detail/activity/outbox identity |
| broker/registry unavailable | commercial commit remains; outbox row becomes bounded retryable | restore broker; relay clears backlog |
| ack-before-mark crash | permitted duplicate with identical event/dedupe identity only | lease expiry, republish, consumer dedupe proof |
| migration/catalog drift | startup abort; no reset/baseline guess | restore or later ordered forward repair |
| unsupported media/grammar | 400/406/415 in selected adapter; no fallthrough | correct explicit media and request |

## Outbox recovery design

Command transactions only enqueue. The Charge-local opt-in coordinator claims
in a short transaction, publishes outside that transaction, and marks outcomes
separately. A claim selects no more than 50 eligible PENDING/RETRYABLE rows with
`FOR UPDATE SKIP LOCKED` and atomically records PROCESSING, a random worker ID,
and database `claimed_at`. The lease is 30 seconds. Outcome updates predicate on
PROCESSING plus the exact worker ID and `claimed_at`; a takeover changes both,
so a stale worker's mark updates zero rows. PUBLISHED and PERMANENT are terminal,
and repeated marks are idempotent no-ops.

Poll delay is at most five seconds, publication concurrency is ten, broker
acknowledgement deadline is two seconds per send, each claim/mark allows <=2
seconds pool acquisition plus <=1 second transaction, retry delays after
failures 1-7 are 5/15/30/60/60/60/60 seconds, and retry jitter is at most one
second. The normal worst case is
`61 + 5 + 6 + 20 + 6 + 5 = 103 seconds`: maximum retry wait, poll detection,
two claims, two 50-row batches at five two-second waves each, two marks, and
scheduler/GC margin. A previously claimed row follows the non-additive lease
route `30 + 5 + 6 + 20 + 6 + 5 = 72 seconds`. Both are below 120 seconds.

This behavior is confined to the Charge bean and existing Charge outbox
columns. The feature switch, exact property defaults, compatibility posture,
and U01 migration ownership are specified in `scalability-design.md`; no shared
relay consumer changes behavior implicitly.

The coordinator owns every row selected by the total classifier: reserved
`w2agr-` ID or a five-type lifecycle row declaring W2 authority. It publishes
only rows satisfying prefix + five type + W2 model + supported schema; any
other owned row becomes PERMANENT integrity failure. The old relay owns the
exact classifier complement.
Typed transport/timeout/429/5xx failures are RETRYABLE; serialization/schema,
auth, topic/configuration, payload, or model-integrity failures are PERMANENT.
Attempt eight exhausts retry and atomically becomes PERMANENT. Terminal rows are
retained with safe codes and unchanged event/dedupe/payload identity; U03 has no
automatic reset/delete/requeue path.

The controlled proof creates 100 committed rows, faults publication, records the
unchanged commercial/activity state, restores broker and registry, and starts the
120-second timer at observed dependency health. All 100 original rows must reach
publish-confirmed with unchanged event ID, record key, payload hash, and dedupe
key. A separate injected crash after acknowledgement proves duplicate delivery
does not create a second commercial or activity row.

## Health and readiness

- Liveness is process-local and never calls Identity, Reference Data, Kafka, or
  PostgreSQL.
- Readiness requires a valid Flyway catalog, reachable Charge datasource,
  transaction/outbox wiring, and valid required non-local credentials/profile
  posture. It does not perform protected Agreement queries.
- Broker/registry health is exposed separately from command readiness because a
  bounded outage may durably queue events. Relay backlog age/retry/permanent
  failure still produces explicit degraded evidence.
- Missing non-local secret, enabled bypass, drifted migration, or absent JDBC
  outbox wiring prevents readiness/startup; health 200 is never command proof.

The restart test stops and starts the Charge container twice without deleting
volumes, waits on readiness, performs one authorized vendor detail read, and
verifies canonical counts/hashes and Flyway history within 120 seconds. U06 owns
restore into a new isolated database and the integrated live acceptance proof.

## Observability and recovery evidence

One correlation joins ingress, authorization, reference/rate validation, lock,
transaction, activity, outbox, and relay outcome. Metrics include command/query
latency/outcome, authority conflicts, lock/pool saturation, enqueue result,
pending/retry age, publish result, and media dialect with bounded labels. Alerts
or cloud dashboards are not invented for this local-only topology.

Evidence retains exact pre/post counts and canonical hashes for W2 headers,
versions, links, activity, outbox payload/key, and Flyway history. It separately
records database-volume survival from host/volume destruction; no zero-loss claim
extends beyond the preserved isolated volume.

## Upstream trace

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. It implements their atomicity, conflict, restart,
relay, compatibility, readiness, and honest-evidence requirements.
