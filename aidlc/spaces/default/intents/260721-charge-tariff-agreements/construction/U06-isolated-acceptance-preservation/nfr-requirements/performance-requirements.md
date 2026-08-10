# Performance Requirements - U06 Isolated Acceptance and Preservation

## Scope and truth boundary

U06 measures the assembled W2-03 vertical slice on the isolated
`linercore-wave-a` stack. It consumes `business-logic-model.md`,
`business-rules.md`, program `requirements.md`, and brownfield
`technology-stack.md`. These are provisional local acceptance targets, not
production SLOs, and cannot be satisfied by mocks, replays, direct service ports,
or the manager stack on 8088.

## Readiness and bounded execution

| ID | Target | Pass/failure semantics |
| --- | --- | --- |
| PERF-U06-001 | each started/restarted service becomes ready and completes its authenticated functional probe within 120 seconds | available environment exceeding the bound is FAIL; unavailable Docker/required capability is BLOCKED |
| PERF-U06-002 | all required isolated-stack readiness probes complete within 10 minutes of wrapper `up` acceptance | same FAIL/BLOCKED distinction; no alternate port/project/topology |
| PERF-U06-003 | readiness polling uses bounded interval/attempts and records every terminal probe | no busy loop, indefinite wait, or health-only substitution for authenticated work |

The 120-second restart target begins at wrapper restart-command acceptance and
ends only after service readiness plus its authenticated read/replay probe. The
10-minute bound includes image/container startup and migrations but excludes
intentional backup generation and the later browser/performance suites.

## Fresh pricing performance gate

After readiness, a disposable warm-up namespace is used and never reused. At
the fixed recorded concurrency of 10, run at least 100 measured known-rate and
100 measured no-rate calls. The known-rate set is exactly 50 Agreement and 50
Tariff results. The no-rate set is exactly 25 each BASE, SURCHARGE, LOCAL, and
multiple-category missing fixtures.

Every measured request has a unique valid Booking number,
`pricingAmendmentSeq`, provider key, request hash, pricingRequestId, Charge
terminal receipt, and Booking command receipt/evidence. Every sample records
`replayed=false`; no measured identity appears in warm-up or another sample.
Each no-rate sample has exactly one canonical OPEN case. Duplicate/missing/
replayed identities or unexpected outcomes fail the entire set and remain in
percentile calculation.

| ID | Set | Target |
| --- | --- | --- |
| PERF-U06-004 | Agreement known-rate fresh path | subtype and known aggregate nearest-rank p99 <=800 ms |
| PERF-U06-005 | Tariff known-rate fresh path | subtype and known aggregate nearest-rank p99 <=800 ms |
| PERF-U06-006 | four no-rate subtypes | every subtype and no-rate aggregate nearest-rank p99 <=800 ms |

The timer begins at authenticated Charge provider acceptance for the canonical
provider gate and ends after terminal receipt/case commit plus response
serialization. Booking end-to-end timing is retained separately under U05; it
cannot replace this provider measurement. A separate 100-call terminal replay
test proves byte/idempotency behavior but is excluded from all fresh latency
sets.

## Raw evidence and resource gates

Raw JSONL/CSV retains scenario/subtype, hashed request identity, pricingRequestId,
correlation, monotonic start/end/elapsed, HTTP/code/reason/basis, receipt/case
proof, replay flag, and itemisation-oracle result. Summary recomputes min/median/
p95/p99/max/error count from raw rows and records commit, host CPU/RAM/OS,
Java/Node/PostgreSQL, stack/project, seed, warm-up, concurrency, and counts.

The performance driver retains connections/pool waits, DB locks/deadlocks,
heap/RSS/GC/CPU, and query rows. OOM/restart, pool acquisition timeout, deadlock,
unbounded history/result, N+1 authority/snapshot query, or monotonically growing
retained request state across three identical post-warm-up cycles fails. Cycle-
three heap/RSS must each be <= max(120% cycle one, cycle one +32 MiB), measured
after 60-second quiescence as the minimum heap/median RSS over the last 30
seconds. No production capacity is inferred.

## Itemisation and upstream coverage

Every 200 result is independently checked against seeded decimal sources:
BASE/OFR, SURCHARGE/BAF, LOCAL/THC order; USD/PER_CONTAINER; quantity; numeric
unit rate; independently rounded HALF_UP amount; total sum; basis/reference;
exact source RateVersion IDs and AgreementVersion when applicable. Booking API,
DB snapshot and UI must match field-for-field while retained public evidence may
use canonical hashes to avoid unnecessary commercial disclosure.

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`; it does not claim manager, live,
browser, or audit success before observation.

