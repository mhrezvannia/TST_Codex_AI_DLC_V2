# Scalability Design - U03 Agreement Authority

## Scaling decision

U03 scales within the existing stateless Charge service, service-owned
PostgreSQL database, and shared platform outbox relay. The accepted local
capacity is 10,000 stable Agreements, 50,000 versions, 150,000 exact links, ten
concurrent administrative clients, and a burst of 20 independent approvals.
There is no production forecast and therefore no new instance count, shard,
replica, cache, broker, queue, or AWS resource.

Horizontal service instances remain safe because process memory carries no
agreement authority. Optimistic row versions, stable-header row locks,
transactional advisory locks, unique/foreign-key constraints, and committed
PostgreSQL state coordinate every instance.

## Read and data-growth strategy

- Keep vendor lists page-bounded at 100 stable rows and use a two-step identity
  then bulk-projection query. Never materialize every version, link, or activity
  for list results.
- Keep detail history ordered and set-loaded by one stable Agreement. Exact links
  are addressed by their `(agreement_version_id, rate_category)` key.
- Maintain equality-key-first indexes for W2 authority selection and approval;
  preserve stable deterministic ordering for repeatable pages.
- Capture large-fixture query plans and returned-row counts. A sequential scan is
  not automatically a failure, but a plan whose work grows with the full
  150,000-link fixture for one bounded result is.
- Tune query shape and indexes before considering a different storage topology.

No application cache is permitted: authorization, sole-Draft selection,
inclusive overlap, lifecycle, and exact rate links must be authoritative. A
stale or legacy fallback would be a correctness/security defect rather than
graceful degradation.

## Concurrency and isolation model

| Contention | Isolation mechanism | Required result |
| --- | --- | --- |
| same authority-key approval | canonical-key advisory transaction lock, post-lock reload and overlap query | one Approved winner; every loser exact 409 conflict |
| same-header successor | stable-header `FOR UPDATE`, then max version allocation and one-Draft check | one Draft/version number; losers `AGREEMENT_DRAFT_EXISTS` |
| suspend versus expire | optimistic update on exact version/row version | one terminal winner; loser `AGREEMENT_STALE_VERSION` |
| independent approvals | different advisory keys and pool capacity | all 20 commit without cross-key serialization/deadlock |

The key is length-prefixed over customer, lane, origin, destination, and
equipment stable IDs before hashing. Commodity and LEGACY records never enter
the W2 key. The repeated two-context test proves DB-backed rather than JVM-local
correctness.

## Outbox backlog and relay scaling

U03 does not change the shared relay implementation or any other producer. It
adds a Charge-local, opt-in relay coordinator behind the existing Charge
outbox/publisher ports. The current behavior remains selectable with
`charge.outbox.bounded-relay.enabled=false`; that is the rollback default for
non-U03 profiles, and every non-Charge relay retains its present code and
configuration. U01 owns the V3/V4 migrations; U03 uses the already available
`status`, `next_attempt_at`, `claimed_by`, and `claimed_at` columns and adds no
schema or migration.

U03-generated event IDs have the reserved `w2agr-<uuid>` form. One total row
classifier is shared by both coordinators:
`u03_owned = event_id LIKE 'w2agr-%' OR (event_type in the five Agreement
lifecycle types AND snapshot.authorityModel='W2_VERSIONED')`.
The existing relay claims only `NOT u03_owned`; the U03 coordinator claims
exactly `u03_owned`. Publication additionally requires the reserved prefix,
one of `charge-agreement.created`, `.updated`, `.approved`, `.suspended`, or
`.expired`, W2 authority, and supported 1.1.0 snapshot. An owned row missing any
publication condition is atomically marked PERMANENT with a safe integrity code
and is never published. Thus wrong-type reserved rows and W2 lifecycle rows
missing the prefix are quarantined rather than falling into a gap or the old
relay. Legacy five-type rows without W2 authority remain old-relay owned.
Classifier complement and quarantine fixtures are blocking.

The Charge row protocol is:

| State | Atomic transition | Fence/mark rule |
| --- | --- | --- |
| PENDING/RETRYABLE, eligible | one transaction selects at most 50 with `FOR UPDATE SKIP LOCKED`, then sets PROCESSING, random `claimed_by`, and `claimed_at=database_now` | only the selected worker owns the row |
| PROCESSING, lease live | ineligible to every other worker | no JVM lock is authoritative |
| PROCESSING, lease expired | the same claim statement may replace `claimed_by` and `claimed_at` | old worker is fenced by both values |
| PROCESSING, owned | mark PUBLISHED or RETRYABLE/PERMANENT in a short transaction | `WHERE status='PROCESSING' AND claimed_by=? AND claimed_at=?`; zero rows means stale worker |
| PUBLISHED/PERMANENT | terminal | repeated mark is a no-op and never republishes |

Publication occurs outside the database transaction with at most ten in-flight
sends and a two-second acknowledgement deadline per send. Stable event ID,
record key, payload hash, and dedupe key never change. Configuration is explicit:
`charge.outbox.bounded-relay.batch-size=50`,
`charge.outbox.bounded-relay.publish-concurrency=10`,
`charge.outbox.bounded-relay.poll-delay=5s`,
`charge.outbox.bounded-relay.claim-lease=30s`,
`charge.outbox.bounded-relay.ack-timeout=2s`,
`charge.outbox.bounded-relay.retry-delays=5s,15s,30s,60s`, and
`charge.outbox.bounded-relay.retry-jitter-max=1s`, with
`charge.outbox.bounded-relay.max-attempts=8`.

After failures 1/2/3/4/5/6/7, the base delays are respectively
5/15/30/60/60/60/60 seconds plus 0-1 second jitter. Failure 8 becomes
PERMANENT atomically.

Typed Kafka retriable/timeout/network failures, registry transport, HTTP 429,
and registry/broker 5xx become RETRYABLE. Serialization, incompatible schema,
unsupported snapshot/event, authentication/authorization, invalid topic or
configuration, and payload-too-large become PERMANENT. Classification uses
exception/status types, never message text. The eighth failed retriable publish
atomically becomes PERMANENT with a safe error code and unchanged event bytes;
it is never deleted, auto-reset, or silently retried. Recovery beyond exhaustion
requires a separately approved audited repair/replay action and is outside U03.

The closed normal-recovery worst case is:

`61s max next-at delay + 5s poll detection + 6s for two claim operations
(each <=2s pool acquisition + <=1s transaction) + 20s for two batches
(5 acknowledgement waves x 2s x 2) + 6s for two mark operations + 5s
scheduler/GC margin = 103s <= 120s`.

The lease-expiry route is not additive with `next_attempt_at`, because a row is
either claimed PROCESSING or scheduled RETRYABLE. Its bound is:

`30s lease + 5s poll + 6s claims + 20s acknowledgements + 6s marks + 5s margin
= 72s <= 120s`.

The pool-saturation proof starts ten one-second-bounded command transactions and
the relay together against the max-10 pool. Relay acquisition must complete
within two seconds and all commands must meet their operation budgets. Claim/
mark timing records acquisition separately from <=1-second transaction work.

A crash after broker acknowledgement but before the mark releases through lease
expiry and may republish only the identical event/dedupe identity. At-least-once
delivery is explicit; no broker exactly-once claim is made.

## Overload behavior and triggers

Invalid/unbounded pages fail before repository work. Pool saturation returns a
typed unavailable result and writes nothing. Identity/Reference failure returns
the defined 503/422 and never serves cached authority. Broker failure leaves
already committed outbox rows pending/retryable; it does not block or reverse a
commercial commit.

A later capacity design is triggered only by measured evidence: repeated fixed-
query p95 breach after tuning, independent-key connection acquisition failures,
page/query memory beyond the resource gate, lock contention on distinct keys,
or relay recovery missing 120 seconds. Any replica/cache/partition proposal must
then define consistency, authorization, ordering, dedupe, recovery, and operating
ownership in a separate approved intent.

## Validation

Use the deterministic large fixture, exact plans/row counts, two Spring contexts,
20 fresh barrier rounds per contested case, 20 independent approvals, and the
three-cycle heap/RSS gate. Relay validation injects 100 retryable failures,
restores the healthy broker, and proves all original rows publish-confirmed with
unchanged identities and no commercial/activity duplicates.

## Upstream trace

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. It implements their bounded paging, DB-backed
multi-instance correctness, no-cache stance, relay recovery, and topology limits.
