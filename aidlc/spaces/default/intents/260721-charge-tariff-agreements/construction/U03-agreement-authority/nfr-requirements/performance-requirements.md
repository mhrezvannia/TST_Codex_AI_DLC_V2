# Performance Requirements - U03 Agreement Authority

## Scope and evidence boundary

These requirements quantify U03 Agreement administration and authority on the
isolated `linercore-wave-a` stack. They refine `business-logic-model.md`,
`business-rules.md`, program `requirements.md`, and brownfield
`technology-stack.md`. They do not replace NFR-001 pricing p99 <=800 ms, create
a production SLO, or measure U04 pricing/U05 Booking work.

Evidence records commit, host CPU/RAM/OS, Java/PostgreSQL/Kafka versions, fixture
cardinality, concurrency, warm-up, raw timings, errors, and nearest-rank
percentiles. Vendor-media W2 calls and default-media legacy compatibility calls
are never combined into one percentile.

## Dataset and latency targets

The deterministic fixture contains at least 10,000 stable Agreements, 50,000
AgreementVersions, and exactly 150,000 version-rate links. It includes all W2
lifecycles, one-Draft and deep-history aggregates, selective/unselective filters,
inclusive boundaries, and a fixed LEGACY subset. Every W2 version has three
valid category-distinct links; deliberate invalid fixtures live outside the
measured namespace.

| ID | Operation and measured mix | Load | Target |
| --- | --- | --- | --- |
| PERF-U03-001 | vendor list/detail: exactly 50 list and 50 detail calls after per-operation warm-up | 10 concurrent clients | list and detail each p95 <=750 ms; aggregate p95 <=750 ms; zero unexpected outcomes |
| PERF-U03-002 | W2 mutations: exactly 20 each create, edit, approve, successor, suspend, and expire (120 total) after per-operation warm-up | 10 concurrent clients | every operation p95 <=1,000 ms; aggregate p95 <=1,000 ms; zero unexpected outcomes |
| PERF-U03-003 | legacy default-media search/detail/active lookup over the fixed legacy fixture | 10 concurrent clients; 100-call fixed mix | record per-operation p50/p95/p99/max and zero contract drift; no new legacy latency SLO is inferred |
| PERF-U03-004 | reference and rate-link validation with healthy warm adapters | same mutation load | included in PERF-U03-002; a dependency deadline/fault is a reliability sample, not silently excluded |

Each operation has 20 discarded warm-up calls in a separate namespace. List
mix is fixed: 10 default first-page, 10 middle/last, 10 customer/lane, 10
lifecycle/validOn, and 10 empty/multi-version results. Detail includes 25 shallow
and 25 deep-history aggregates with W2 and explicit LEGACY vendor views.

Mutation samples use unique Agreement/version identities and valid rate links.
Approve/suspend/expire setup time is excluded but the measured command includes
authorization, revalidation, transaction, activity, and outbox enqueue. Any
unexpected status stays in the sample and fails the gate. Per-operation results
are blocking; a fast operation cannot hide a slow one through aggregation.

## Concurrency and resource targets

At least 20 fresh barrier-synchronized rounds run through two independently
wired Spring application contexts sharing one PostgreSQL Testcontainer:

- overlapping same-authority-key approval yields exactly one success and one
  409 `AGREEMENT_AUTHORITY_CONFLICT` per two-contender round;
- same-header successor creation yields exactly one new Draft/version number and
  every loser 409 `AGREEMENT_DRAFT_EXISTS`;
- simultaneous suspend-versus-expire of one Approved version yields exactly one
  terminal transition and one 409 `AGREEMENT_STALE_VERSION` loser in every
  round, with frozen commercial snapshot and links unchanged;
- 20 independent-key approvals all commit concurrently.

Every successful mutation has exactly one activity and pending outbox row; losers
have neither. No deadlock, pool acquisition timeout, duplicate version number,
partial link set, or cross-key serialization may occur.

Reports retain Hikari active/pending/acquisition wait, PostgreSQL lock/deadlock
counters and query plans, JVM heap/GC/RSS/CPU, Kafka/outbox backlog where active,
and API errors. Page/query work is bounded by size <=100; API code cannot
materialize all history or produce an N+1 query per link/activity.

The fixed mixed workload runs in three identical measured cycles after warm-up,
with 60 seconds of zero-input quiescence after each. `heapUsed` is the minimum
observed across the last 30 seconds of each quiescent window (so a normal GC can
be observed without forcing one); RSS is the median over that window. Cycle
three heap and RSS must each be no more than the greater of 120% of cycle one's
value or cycle one plus 32 MiB, and neither measure may increase by more than 5%
in both cycle-to-cycle comparisons. Any OOM/process restart, pool acquisition
timeout, deadlock, unbounded rows/history, N+1 query, or breach of these local
bounds fails the run. CPU and GC pause are retained diagnostically; no
production capacity limit is inferred from the local host.

## Reproducibility and validation

The checked-in driver fixes seed, fixture distribution, media dialect, page
cases, concurrency, warm-up, identities, and expected outcomes. Raw JSONL/CSV
contains sample/operation, monotonic start/end, elapsed ms, status/code,
correlation, media dialect, and expected classification; it excludes commercial
payloads and secrets. Database evidence proves measured mutations executed and
were not setup or replay artifacts.

U06 owns integrated live pricing and acceptance evidence. U03 validation uses
HTTP load tests, PostgreSQL application integration tests, exact-count/hash
queries, legacy fixture contract tests, and correlated telemetry.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, refining their Agreement query,
command, contention, compatibility, and evidence requirements.
