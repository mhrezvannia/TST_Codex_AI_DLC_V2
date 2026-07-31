# Performance Requirements - U01 Rate Authority

## Scope and upstream basis

These requirements quantify the Rate administration workflows in U01's
`business-logic-model.md` and `business-rules.md`. They consume the program
`requirements.md` and the brownfield `technology-stack.md`. They do not replace
NFR-001's separate pricing p99 <= 800 ms proof, create a production SLO, or
extend U01 into agreement selection or Booking pricing.

All targets below are provisional isolated-local acceptance targets on the
`linercore-wave-a` stack. Evidence records commit, host CPU/RAM/OS, Java and
PostgreSQL versions, dataset cardinality, concurrency, warm-up, raw timings,
errors, and percentile algorithm.

## Latency and load targets

The fixture contains at least 10,000 stable Rates and 50,000 RateVersions with
a deterministic mix of BASE/OFR, SURCHARGE/BAF, LOCAL/THC, Draft, Scheduled,
Effective, and Expired histories. Queries use selective and unselective filters,
first/middle/last pages, mixed histories, and long safe labels. Mutations use
unique namespaces except the deliberate race tests.

| ID | Operation family | Load | Target |
| --- | --- | --- | --- |
| PERF-U01-001 | list and detail queries | 10 concurrent clients; exactly 100 measured calls after per-operation warm-up: 50 list and 50 detail | each operation p95 <= 500 ms and aggregate p95 <= 500 ms; zero unexpected HTTP/error outcomes |
| PERF-U01-002 | create, edit, approve, successor | 10 concurrent clients; exactly 100 measured calls after per-operation warm-up: 25 each create/edit/approve/successor | each operation p95 <= 750 ms and aggregate p95 <= 750 ms; zero unexpected failures |
| PERF-U01-003 | pagination/filter query | full 10k/50k fixture; bounded requested page | response work is bounded by page size; no full-history materialization in the API/BFF process |
| PERF-U01-004 | reference validation | valid warm provider and the existing two-second overall adapter deadline | Rate command remains within PERF-U01-002 when provider responds normally; dependency timeout returns typed 503 and no write |

Each operation has 20 discarded warm-up calls in a warm-up namespace distinct
from measurement. The list mix is fixed: 10 default first-page, 10 middle/last
page, 10 category/lifecycle, 10 applicability/`asOf`, and 10 free-text/empty
result calls. Detail uses 25 single-version and 25 mixed-history Rates spread
across categories. Mutation distribution is exactly 25 each. The checked-in
driver fixes page size and fixture IDs for every case.

Each family has its own discarded warm-up namespace and measured namespace.
Mutation samples use unique Rate/version identities so receipt, row, or HTTP
cache replay cannot masquerade as command performance. Any unexpected result
remains in the sample set and fails the gate; it is never dropped from the
percentile.

Nearest-rank percentiles are calculated by one checked-in function from
monotonic client timestamps. Reports retain per-operation and aggregate p50,
p95, p99, maximum, throughput, and error count. Every operation independently
meets its threshold; a fast operation cannot hide a slow one through aggregation.
A single average or family-only percentile cannot satisfy these requirements.
NFR-001 pricing retains its separate >=100-call p99 <=800 ms sample set and is
never combined with Rate administration samples.

## Concurrency and database-resource targets

PERF-U01-005 runs at least 20 fresh barrier-synchronized rounds with two
overlapping same-key approvals.
Each round completes with exactly one success and one typed 409 loser; it has no
deadlock, timeout, or duplicate Approved authority. Every valid round has
exactly one success and one 409 `RATE_AUTHORITY_CONFLICT`. PERF-U01-006 runs 20
concurrent non-conflicting approvals and requires all 20 to complete without
advisory-lock cross-key serialization, pool exhaustion, or missing activity.

PERF-U01-007 runs at least 20 fresh barrier-synchronized successor races for one
stable Approved Rate. Each round commits exactly one Draft/version number and
every loser returns 409 `RATE_DRAFT_EXISTS`, not an alternative conflict or SQL
leakage. Approval and successor contention execute through two independently
wired Spring application contexts/process clients sharing one PostgreSQL
Testcontainer; no new deployable or Compose topology is introduced.

The acceptance report records Hikari active/pending connections, acquisition
wait, PostgreSQL lock wait/deadlock counters, query count, rows examined where
available, JVM heap/GC, process RSS, and CPU. The blocking resource condition is
any pool acquisition timeout, deadlock, OOM/restart, unbounded result set, or
monotonic resource growth across the bounded run. Numeric production capacity
limits are not inferred from the local host.

## Benchmark reproducibility

The checked-in driver fixes seed, dataset shape, operation distribution,
concurrency, warm-up, and measured count. Raw JSONL/CSV includes sample ID,
operation, start/end monotonic time, elapsed milliseconds, HTTP/code,
correlation ID, and expected-result classification. Database evidence verifies
that measured mutations were executed rather than replayed.

Baseline comparison reports regressions against the last accepted W2-03 run.
An improvement or regression is descriptive unless it crosses a target; no
prior-wave artifact is overwritten. U06 owns integrated pricing performance and
the final evidence manifest.

## Validation matrix

| Requirement | Primary validation | Supporting telemetry |
| --- | --- | --- |
| PERF-U01-001/002 | isolated HTTP load driver with raw samples | HTTP timers, JVM/DB metrics, correlation logs |
| PERF-U01-003 | large-fixture integration/query-plan test | rows/results/page size, heap delta |
| PERF-U01-004 | real/reference Testcontainer plus timeout fault | provider timer/outcome, zero-write DB assertion |
| PERF-U01-005-007 | two-context barrier-synchronized PostgreSQL application integration tests, 20+ rounds | lock waits, deadlocks, exact winner/loser/activity counts |

These tests contribute to NFR-001, NFR-002, NFR-008, and NFR-009 while keeping
the pricing-specific 800 ms p99 gate in U04/U06.
