# Performance Requirements - U04 Pricing Provider and Manual Cases

## Scope and acceptance environment

These requirements refine `business-logic-model.md`, `business-rules.md`,
program `requirements.md`, and brownfield `technology-stack.md`. They implement
the existing provisional local NFR-001 p99 <=800 ms gate; they do not create a
production SLO or include U02 proxy/U05 Booking latency.

Evidence runs on the isolated `linercore-wave-a` stack and records commit, host
CPU/RAM/OS, Java/PostgreSQL versions, exact U01/U03 dataset cardinalities,
concurrency, seed, warm-up, raw timings, errors, and nearest-rank percentiles.

## Fresh pricing workload and targets

At 10 concurrent clients, each scenario below has 20 discarded warm-up calls in
a separate namespace and at least 100 measured calls. Every measured call uses a
unique valid `bookingRef:amendmentSeq`, canonical request hash, pricingRequestId,
and idempotency key; its database receipt must be distinct and report
`replayed=false`. A duplicate/replayed or missing terminal receipt invalidates
the complete sample set.

| ID | Scenario and fixed distribution | Target |
| --- | --- | --- |
| PERF-U04-001 | agreement success: exactly 25 shallow-history mid-window, 25 deep-history selected-version, 25 `valid_from` inclusive-boundary, and 25 `valid_to` inclusive-boundary unique requests | each subtype and aggregate p99 <=800 ms, exactly 3 lines and one COMPLETED receipt each |
| PERF-U04-002 | tariff success: 100 unique requests with no Agreement and exact OFR/BAF/POL-THC candidates | p99 <=800 ms, exactly 3 lines and one COMPLETED receipt each |
| PERF-U04-003 | `NO_RATE`: 25 each BASE missing, SURCHARGE missing, LOCAL missing, and multiple categories missing | each subtype and aggregate p99 <=800 ms; one MANUAL receipt and canonical OPEN case, no money |
| PERF-U04-004 | ambiguity: 25 each Agreement, BASE, SURCHARGE, and LOCAL ambiguity | each reason and aggregate p99 <=800 ms; exact 422 reason, one MANUAL receipt/case, no tariff after Agreement ambiguity |

Unexpected outcomes remain in the sample and fail the gate. Setup, receipt
seeding, and fixture mutation are outside measured intervals. The interval
begins at authenticated controller acceptance and ends after fenced terminal
receipt/case commit plus response serialization; it includes authorization,
candidate reads, calculation/classification, and database transaction.

## Replay and administration measurements

PERF-U04-005 separately replays 25 stored terminals for each 200 agreement,
200 tariff, 404 no-rate, and 422 ambiguity outcome (100 total). Every replay
must return byte-identical stored body, status, derived content type,
correlation/time/case identity, execute zero candidate/calculation/case writes,
and mark `replayed=true`. Replay percentiles are reported but cannot satisfy
PERF-U04-001-004.

PERF-U04-006 measures manual list/detail over at least 10,000 OPEN cases: exactly
50 list and 50 detail calls at 10 clients, after 20 warm-ups each. Each operation
must meet p95 <=750 ms, remain page-bounded at size <=100, preserve NULL-last
stable order, and perform authorization before count/lookup.

## Contention and bounded resources

At least 20 fresh barrier-synchronized rounds run through two independently
wired Spring contexts sharing one PostgreSQL Testcontainer:

- same key/hash: pause the first owner after claim; the contender returns exact
  409 `PRICING_IN_PROGRESS` with positive `Retry-After`, executes no candidate
  read, then byte-replays after the owner completes;
- expired lease: a new fenced owner takes over; the old owner's repository
  completion returns exact `CompletionResult.FENCE_REJECTED`, affects zero rows,
  and rolls back any case/terminal snapshot attempted in that transaction. If
  the new owner remains IN_PROGRESS, service mapping is exact 409
  `PRICING_IN_PROGRESS` with its positive `Retry-After`; after the winner is
  terminal, the stale request returns the winner's byte-stable stored response;
- same key/different hash: exact 409 `IDEMPOTENCY_CONFLICT`, no candidate/case or
  receipt mutation;
- concurrent `createOrGetOpen` for one canonical pricing-request/reason key:
  exactly one OPEN case row is returned to all contenders, with no overwrite.

No same-key live-lease round permits a second resolver execution. An expired-
lease takeover may repeat deterministic resolution after the old owner stalls,
but only the current fence can commit; the old owner affects zero terminal/case
rows. No round permits two terminal rows/cases, deadlock, pool timeout, or
partial terminal state.

The fixed mixed workload runs three identical cycles after warm-up, followed by
60 seconds zero-input quiescence. Heap is the minimum and RSS the median over the
last 30 seconds. Cycle-three heap/RSS must each be <= max(120% of cycle one,
cycle one +32 MiB), and neither may rise >5% in both cycle transitions. OOM,
restart, pool timeout, deadlock, unbounded result/history, N+1 candidate/case
query, or bound breach fails. CPU/GC are retained diagnostically; no production
capacity inference is made.

## Evidence and upstream coverage

Checked-in JSONL/CSV retains sample/scenario/subtype, monotonic timing,
status/code/reason/basis, pricingRequestId, correlation, replay flag, and expected
classification, but no customer/request/money payload. Database checks join each
fresh sample to exact receipt/case counts and source-version evidence.

Every 200 sample also runs a complete itemisation oracle: lines are ordered
BASE/OFR, SURCHARGE/BAF, LOCAL/THC; currency is USD and basis is PER_CONTAINER;
each quantity equals the request; numeric `unitRate` equals its exact selected
RateVersion; amount equals `unitRate * quantity` independently rounded scale two
HALF_UP; total equals the sum of rounded amounts; pricing basis/reference and
optional AgreementVersion follow the selected path; and every source version ID
matches the authority evidence. Retained performance evidence stores pass/fail
booleans and canonical input/result hashes rather than raw commercial money.

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`. U06 owns live integrated proof;
U05 owns Booking end-to-end latency and persistence.
