# Scalability Requirements - U01 Rate Authority

## Capacity boundary

U01 is an additive capability in the existing Charge service and PostgreSQL
database described by `technology-stack.md`; it is not a new scalable service.
These requirements refine U01 `business-logic-model.md`, `business-rules.md`,
and program `requirements.md` with local capacity/concurrency proof. They do not
claim production traffic forecasts or authorize Redis, sharding, replicas,
Kafka workflows, or cloud infrastructure.

The acceptance capacity is at least 10,000 stable Rates, 50,000 versions,
10 concurrent administrative clients, and a burst of 20 concurrent
non-conflicting approvals. Data distribution includes all categories,
applicability keys, lifecycle presentations, and mixed version histories.

## Load and growth requirements

| ID | Requirement | Pass condition |
| --- | --- | --- |
| SCALE-U01-001 | List/detail work remains page-bounded as Rate/version history grows to the fixture size. | No unbounded API result or process materialization; latency meets PERF-U01-001. |
| SCALE-U01-002 | Stable ordering and filters use indexed predicates for category, lifecycle/window, applicability, latest update, and overlap candidates. | Query-plan/integration evidence avoids an accidental per-row history query and retains deterministic results. |
| SCALE-U01-003 | Twenty independent approval keys proceed concurrently through two independently wired Spring contexts sharing PostgreSQL. | All 20 commit with exactly one activity each; no cross-key serialization, deadlock, or pool timeout. |
| SCALE-U01-004 | Run at least 20 barrier-synchronized fresh rounds each for same-key approval and successor contention through those two contexts. | Approval: exactly one success and one 409 `RATE_AUTHORITY_CONFLICT`; successor: exactly one Draft/version and every loser 409 `RATE_DRAFT_EXISTS`. |
| SCALE-U01-005 | Reference validation is bounded by the existing permit/timeout policy. | Burst cannot create unbounded threads, sockets, queues, or provider calls. |

Stable Rate IDs are never a log/metric label, cache key exposed to the browser,
or database shard decision. Approval locking is key-scoped using the canonical
authority key plus the authoritative overlap query. Hash collision can reduce
concurrency only; it cannot create an invalid authority.

## Scaling model and triggers

The Charge HTTP/application layer remains stateless between requests and may run
more than one instance under the existing deployment topology. PostgreSQL is the
single commercial authority; DB locks and constraints, not JVM-local mutexes,
provide multi-instance correctness. Session affinity is not required.

U01 does not introduce a cache because Draft/Approved correctness and
history-aware filters require authoritative current state, and the selected
local capacity does not demonstrate a cache need. Before adding a cache,
replica, partition, or shard, measured evidence must show the bottleneck and a
later design must preserve read-after-write, overlap, and immutable attribution.

The following are capacity-review triggers, not automatic implementation:

- accepted p95 thresholds fail on the fixed 10k/50k fixture after query/index
  tuning;
- connection acquisition timeouts or lock waits occur on independent keys;
- a bounded page causes excessive rows examined or heap growth;
- production observations establish materially larger volume/traffic or a
  distinct read-scaling requirement.

At a trigger, optimize query shape/indexes and eliminate N+1 work before scaling
infrastructure. Horizontal service scaling comes before data partitioning only
if PostgreSQL capacity remains healthy.

## Overload and degradation

There is no stale or hardcoded commercial fallback. When Identity or Reference
Data cannot complete within its bounded policy, mutations fail closed with the
typed 401/403/503 outcome and no state. When DB permits/pool capacity are
exhausted, the service returns the standard safe unavailable/error boundary and
does not partially persist Rate/activity.

Queries may reject an invalid/unbounded size; they do not silently fetch all
rows. Expensive free text and lifecycle filters remain bounded to the indexed
dataset/page contract. Retry behavior belongs to callers only for typed
transient failures and must not duplicate a mutation.

## Validation and trace

Capacity tests run against PostgreSQL, not an in-memory repository, and exercise
two independently wired Spring application contexts/process clients sharing one
PostgreSQL Testcontainer so JVM-local locking cannot pass falsely. This adds no
deployable or Compose topology. Reports include dataset cardinality, concurrency, query plans,
connections, lock waits, heap/RSS, errors, and latency.

These requirements implement the U01 parts of NFR-002, NFR-008-NFR-010,
FR-101-FR-108, and QC-01 while deferring integrated pricing scale to U04/U06.
