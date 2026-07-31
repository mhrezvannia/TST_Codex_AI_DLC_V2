# Performance Design - U01 Rate Authority

## Design basis and boundaries

This design implements `performance-requirements.md` while preserving the
controls in `security-requirements.md`, `scalability-requirements.md`, and
`reliability-requirements.md`. It follows `tech-stack-decisions.md` and the
command/query flows in `business-logic-model.md`. PostgreSQL remains the source
of truth; U01 introduces no cache, replica, broker, asynchronous command path,
new deployable, or production SLA.

The latency budget is measured at the authenticated HTTP boundary. Query and
mutation families retain separate samples, thresholds, warm-up namespaces, and
percentiles so a fast read cannot hide a slow command or vice versa.

| Path | End-to-end target | Internal budget and enforcement |
| --- | ---: | --- |
| Rate list/detail | p95 <= 500 ms | <= 50 ms BFF/session and serialization allowance; <= 400 ms service/JDBC work; >= 50 ms measurement/network allowance |
| create/edit/approve/successor | p95 <= 750 ms | healthy composition: 100 ms boundary/serialization + 100 ms Identity + 300 ms Reference fan-out + 250 ms transaction/JDBC; dependency failure ceiling remains 2 s |
| pricing | separate p99 <= 800 ms | not combined with U01 administrative samples and proven later by U04/U06 |

For healthy mutation samples, the implementable composition is <= 100 ms
combined BFF/controller/serialization, <= 100 ms for the one Identity decision,
<= 300 ms for the complete Reference fan-out, and <= 250 ms for transaction/JDBC
work: `100 + 100 + 300 + 250 = 750 ms`. A Reference call completes within
250 ms in the healthy fixture; the remaining 50 ms covers aggregation and
cancellation bookkeeping. These are diagnostic budgets, not independent SLAs.
The end-to-end requirement is authoritative, and a dependency timeout is an
expected typed failure rather than a successful latency sample.

## Query and index architecture

The list repository executes a page-bounded two-step query: first select the
stable Rate IDs and the exact summary-version keys for the requested filters,
then load the bounded row/detail projection for those IDs. Both steps use one
database round trip where practical, or at most a constant number of batched
queries; per-row history queries are prohibited.

Indexes support the deterministic order and the real predicates:

- stable Rate category, charge-code identity, and latest-update ordering;
- version `rate_id`, `version_no`, stored lifecycle, and validity window;
- applicability origin/destination/equipment fields;
- the Approved overlap candidate predicate and the one-Draft partial unique
  constraint;
- activity lookup by stable Rate and exact version.

The repository applies a bounded page size before materializing projections.
Free-text matching stays inside the selected database query and is measured on
selective, unselective, and empty-result cases. The acceptance driver retains
query plans, returned/examined row counts where available, query count, and heap
delta. A sequential scan is not automatically a failure on a small fixture, but
an unbounded history scan, N+1 pattern, or plan that breaks the 10k/50k target
is blocking.

## Connection and contention design

The local Charge datasource uses the proven Hikari posture: minimum idle 2,
maximum pool 10, and a 2-second acquisition timeout. Framework-managed idle and
maximum-lifetime defaults remain unless the existing parent configuration pins
them. Pool settings are environment parameters, not hard-coded domain values.

Every mutation uses one service-owned transaction. Approval takes a
transaction-scoped advisory lock for the length-prefixed authority key, reloads
the Draft with a row lock, runs the inclusive overlap query, and appends activity
before commit. Successor creation locks the stable Rate before allocating the
next version. No JVM mutex and no transparent whole-command retry is allowed.

Two independently wired Spring contexts share one PostgreSQL Testcontainer for
the contention proof. The 20 non-conflicting approvals start behind one barrier,
with exactly 10 assigned to each context and its independent 10-connection
pool. All must acquire a connection within the configured two-second bound and
complete; same-key approval and successor races must produce the exact
winner/loser outcomes. Pool pending/active counts, per-sample acquisition waits,
PostgreSQL lock wait/deadlock counters, and transaction time are captured for
every run.

## Dependency containment and resource bounds

Identity and Reference Data use distinct bounded synchronous HTTP adapters. A
command makes exactly one service-side Identity decision at the command
boundary before any reference or database work; U02's BFF session/capability
gate is separate and does not create a second Identity call.

The Identity adapter has 10 concurrent permits and a 16 KiB response-body
ceiling. The Reference adapter has 50 concurrent HTTP permits, accepts at most
five checks per Rate command, and caps each response body at 64 KiB (320 KiB
aggregate before typed projection). Reference checks may run concurrently, but
the whole `RateReferenceValidationRequest` shares one two-second deadline from
adapter entry. Each command may hold at most five Reference permits. At the
healthy acceptance load, `10 commands x 5 checks = 50 permits`, so no call waits
or fails for permit capacity; all provider responses complete within 250 ms and
the full fan-out stage completes within 300 ms. Both adapters cap permit
acquisition for higher bursts at 100 ms (or the smaller
remaining deadline), cap TCP connection establishment at 250 ms, reject
redirects/unexpected content types, and apply the remaining shared deadline to
request completion plus bounded body consumption. Timeout, cancellation,
permit exhaustion, oversize body, or incomplete result fails typed-unavailable;
no work waits or reads beyond the shared two-second deadline.

There is no automatic mutation retry, cached decision/reference fallback, or
new circuit-breaker dependency. This avoids multiplying calls, replaying a
non-idempotent command, or serving stale commercial authority. A later breaker
or retry requires measured recurring dependency failure plus an idempotency and
fallback design.

## Measurement and acceptance implementation

One checked-in driver creates the deterministic 10,000 Rate/50,000 version
fixture, performs the required discarded warm-ups, and records exactly the
operation distributions defined in `performance-requirements.md`. Mutation IDs
and namespaces are unique outside deliberate races. Raw JSONL or CSV preserves
monotonic timestamps, expected/actual outcome, correlation ID, and database
evidence that a command was not a replay.

Micrometer histograms bracket 500 and 750 ms. Metrics use only operation,
outcome, category, and derived lifecycle; IDs, subjects, amounts, correlation,
and error text are forbidden labels. Reports include p50/p95/p99/max,
throughput, failures, JVM heap/GC, RSS/CPU, pool state, locks, and environment
metadata. Unexpected outcomes remain in the sample set and fail the gate.

## Verification trace

| Requirement | Design mechanism | Proof |
| --- | --- | --- |
| PERF-U01-001/003 | bounded projection queries and supporting indexes | HTTP samples, query counts/plans, heap delta |
| PERF-U01-002/004 | one transaction, bounded adapters, Hikari 2/10/2s | mutation samples, adapter fault tests, pool telemetry |
| PERF-U01-005/006/007 | PostgreSQL advisory/row locks and constraints | two-context barrier tests over 20+ fresh rounds |

Every section above consumes the full upstream set:
`performance-requirements.md`, `security-requirements.md`,
`scalability-requirements.md`, `reliability-requirements.md`,
`tech-stack-decisions.md`, and `business-logic-model.md`.

## Gate revision

The request-changes gate confirms the lead correction after the reviewer limit:
50 global permits with five per command exactly cover the ten-client healthy
fan-out. The 300 ms fan-out, 100 ms Identity, 250 ms JDBC/transaction, and
100 ms boundary/serialization budgets close at 750 ms. The historical
iteration-two NOT-READY verdict remains immutable, but its sole High finding is
implemented here and in `logical-components.md`.
