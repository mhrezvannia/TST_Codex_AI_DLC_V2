# W2-03 Performance and Scalability NFR Validation Matrix

## Status and evidence boundary

Overall status: **BLOCKED - LIVE VALIDATION NOT RUN**.

This matrix traces the six Units' `performance-requirements`,
`scalability-requirements`, `performance-design`, and `scalability-design` to
the planned workload and approved `dashboards`. `Actual` is deliberately
`NOT MEASURED` because no candidate or telemetry plane was deployed. Source
unit/integration results may support implementability but cannot change these
live NFR rows to PASS.

Status rules:

- `PASS`: required live population and evidence meet the target;
- `FAIL`: an available candidate was measured and breached a target or
  invariant;
- `BLOCKED`: required environment/capability/evidence is unavailable;
- `NOT APPLICABLE`: the requirement truly does not apply, never used for a
  missing capability.

## U01 Rate authority

| NFR | Target | Planned evidence | Actual | Status |
|---|---|---|---|---|
| PERF-U01-001 | 50 list +50 detail, 10 clients; each/aggregate p95 <=500 ms | edge raw samples, query/JVM/DB metrics | NOT MEASURED | BLOCKED |
| PERF-U01-002 | 25 each create/edit/approve/successor; each/aggregate p95 <=750 ms | edge raw samples, dependency/transaction metrics | NOT MEASURED | BLOCKED |
| PERF-U01-003 | page-bounded work at 10k Rates/50k versions | plans, rows, query count, heap delta | NOT MEASURED | BLOCKED |
| PERF-U01-004 | healthy provider stays inside command target; two-second fault returns typed 503/no write | provider timing and DB assertion | NOT MEASURED | BLOCKED |
| PERF-U01-005-007 | independent and same-key approval/successor contention across two contexts for >=20 rounds | winner/loser/activity, pool/lock/deadlock evidence | NOT MEASURED | BLOCKED |
| SCALE-U01-001 | list/detail stays bounded at fixture size | bounded pages plus PERF-U01-001 | NOT MEASURED | BLOCKED |
| SCALE-U01-002 | indexed deterministic filter/order/candidate predicates; no N+1 | query plans and exact results | NOT MEASURED | BLOCKED |
| SCALE-U01-003 | 20 independent approvals all commit without cross-key serialization | two-context barrier test | NOT MEASURED | BLOCKED |
| SCALE-U01-004 | >=20 same-key approval/successor rounds have exact one winner and typed loser | two-context barrier test | NOT MEASURED | BLOCKED |
| SCALE-U01-005 | reference burst remains permit/timeout bounded | permit/socket/thread/resource telemetry | NOT MEASURED | BLOCKED |

## U02 Charge routing and BFF

| NFR | Target | Planned evidence | Actual | Status |
|---|---|---|---|---|
| PERF-U02-001 | fixed 100-read mix; each/aggregate overhead p95 <=100 ms, p99 <=200 ms | edge/child monotonic timing and trace linkage | NOT MEASURED | BLOCKED |
| PERF-U02-002 | ten calls for each of ten mutation policies; same overhead targets | edge/child timing and route outcomes | NOT MEASURED | BLOCKED |
| PERF-U02-003 | >=100 each root/deep-link/asset/health; zero route/schema failure | nginx/Next probe matrix | NOT MEASURED | BLOCKED |
| SCALE-U02-001 | fixed route mix at 10 clients; no OOM/restart/socket/retained growth | load and resource telemetry | NOT MEASURED | BLOCKED |
| SCALE-U02-002 | 32 KiB request/512 KiB response and page/query bounds | limit, limit+1, slow-stream evidence | NOT MEASURED | BLOCKED |
| SCALE-U02-003 | compile-time route enumeration; no generic proxy | route preservation matrix under load | NOT MEASURED | BLOCKED |
| SCALE-U02-004 | two processes need no affinity/shared BFF state | alternating-process blocking test | NOT MEASURED | BLOCKED |
| SCALE-U02-005 | backend unavailability bounded by 2,500 ms and permits | slow dependency plus resource release | NOT MEASURED | BLOCKED |

## U03 Agreement authority

| NFR | Target | Planned evidence | Actual | Status |
|---|---|---|---|---|
| PERF-U03-001 | 50 list +50 detail, 10 clients; each/aggregate p95 <=750 ms | edge samples and query/resource telemetry | NOT MEASURED | BLOCKED |
| PERF-U03-002 | 20 each six W2 mutations; each/aggregate p95 <=1,000 ms | edge samples, lock/transaction/dependency telemetry | NOT MEASURED | BLOCKED |
| PERF-U03-003 | fixed 100-call legacy mix; zero contract drift | per-operation timings and contract oracle | NOT MEASURED | BLOCKED |
| PERF-U03-004 | healthy reference/rate-link validation inside PERF-U03-002; faults remain reliability samples | dependency and mutation linkage | NOT MEASURED | BLOCKED |
| SCALE-U03-001 | vendor list/detail page <=100; no full history/N+1 at 10k/50k/150k | plans, counts, heap, latency | NOT MEASURED | BLOCKED |
| SCALE-U03-002 | indexed exact authority/customer/lane/lifecycle/window predicates | large-fixture plans and exact result oracle | NOT MEASURED | BLOCKED |
| SCALE-U03-003 | 20 independent approvals commit without cross-key/pool failure | two-context barrier evidence | NOT MEASURED | BLOCKED |
| SCALE-U03-004 | >=20 approval/successor/terminal races have exact typed winner/loser and one activity/outbox | race matrix and DB hashes | NOT MEASURED | BLOCKED |
| SCALE-U03-005 | controlled 100-event backlog publish-confirms <=120 s after recovery | outbox age/attempt/result and identity evidence | NOT MEASURED | BLOCKED |

## U04 Pricing provider and manual cases

| NFR | Target | Planned evidence | Actual | Status |
|---|---|---|---|---|
| PERF-U04-001 | 100 Agreement requests in four subtypes; each/aggregate p99 <=800 ms; exact 3 lines/receipt | raw timing and provider/itemisation oracle | NOT MEASURED | BLOCKED |
| PERF-U04-002 | 100 Tariff requests; p99 <=800 ms; exact 3 lines/receipt | raw timing and provider/itemisation oracle | NOT MEASURED | BLOCKED |
| PERF-U04-003 | 25 each four no-rate subtypes; each/aggregate p99 <=800 ms; one manual receipt/OPEN case | raw timing, terminal/case/hash evidence | NOT MEASURED | BLOCKED |
| PERF-U04-004 | 25 each four ambiguity reasons; each/aggregate p99 <=800 ms; exact 422/manual semantics | raw timing, typed outcome, no-fallthrough evidence | NOT MEASURED | BLOCKED |
| SCALE-U04-001 | Agreement selection indexed/bounded with three-link reload; no legacy/full-history/N+1 | plans, query counts, latency | NOT MEASURED | BLOCKED |
| SCALE-U04-002 | three indexed Tariff category sets; stop on missing/ambiguity | plans, counts, terminal oracle | NOT MEASURED | BLOCKED |
| SCALE-U04-003 | receipt claim/replay bounded at 100k terminals; >=20 race rounds; no stale write | plans, fence/replay/race evidence | NOT MEASURED | BLOCKED |
| SCALE-U04-004 | manual list/detail at 10k OPEN cases, page <=100, p95 <=750 ms | timings, plans, auth-before-query | NOT MEASURED | BLOCKED |
| SCALE-U04-005 | >=20 same-key case races return one unchanged OPEN row | contention and canonical hash evidence | NOT MEASURED | BLOCKED |

## U05 Booking consumption and repricing

| NFR | Target | Planned evidence | Actual | Status |
|---|---|---|---|---|
| PERF-U05-001 | 20 warm-ups +100 fresh capture/claims, 10 clients; p95 <=500 ms | edge/raw timings and receipt-lock telemetry | NOT MEASURED | BLOCKED |
| PERF-U05-002 | 20 warm-ups +100 unique completions; p95 <=750 ms | timings, transaction/snapshot/audit evidence | NOT MEASURED | BLOCKED |
| PERF-U05-003 | 100 shallow/deep/legacy detail/history reads; each/aggregate p95 <=750 ms | timings, plans, bounded rows | NOT MEASURED | BLOCKED |
| PERF-U05-004 | 100 cursor-page reads; p95 <=750 ms; zero gaps/duplicates | timings and cursor oracle | NOT MEASURED | BLOCKED |
| fresh Price/Reprice | 50 each Agreement, Tariff, successor-Agreement Reprice, changed-Tariff Reprice; each p99 <=1,500 ms | direct end-to-end samples and provider/receipt oracle | NOT MEASURED | BLOCKED |
| SCALE-U05-001 | current/history default 20 max100; no full history/N+1/gap/duplicate | plans, rows, cursor and resource evidence | NOT MEASURED | BLOCKED |
| SCALE-U05-002 | indexed capture/claim CAS; >=20 live/takeover rounds; no cross-key serialization | two-context race evidence | NOT MEASURED | BLOCKED |
| SCALE-U05-003 | completion locks one Booking/receipt and appends atomically; no remote call in transaction | transaction/span/race evidence | NOT MEASURED | BLOCKED |
| SCALE-U05-004 | independent Price/Reprice at 10 clients; each subtype p99 <=1,500 ms; no duplicate receipt | live load, cross-process and DB evidence | NOT MEASURED | BLOCKED |
| SCALE-U05-005 | <=2 two-second calls; five-operation circuit; one half-open probe; bounded resources | deterministic fault clock and resource telemetry | NOT MEASURED | BLOCKED |

## U06 integrated acceptance and preservation

| NFR | Target | Planned evidence | Actual | Status |
|---|---|---|---|---|
| PERF-U06-001 | each service readiness + semantic probe <=120 s | monotonic readiness ledger | NOT MEASURED | BLOCKED |
| PERF-U06-002 | aggregate wrapper readiness <=10 min | wrapper/readiness ledger | NOT MEASURED | BLOCKED |
| PERF-U06-003 | bounded readiness polling; every terminal probe recorded | driver/ledger evidence | NOT MEASURED | BLOCKED |
| PERF-U06-004 | exactly 50 fresh Agreement calls; subtype/known aggregate p99 <=800 ms | raw samples and terminal/itemisation oracle | NOT MEASURED | BLOCKED |
| PERF-U06-005 | exactly 50 fresh Tariff calls; subtype/known aggregate p99 <=800 ms | raw samples and terminal/itemisation oracle | NOT MEASURED | BLOCKED |
| PERF-U06-006 | exactly 25 each four no-rate subtypes; each/aggregate p99 <=800 ms | raw samples and manual-case oracle | NOT MEASURED | BLOCKED |
| SCALE-U06-001 | bounded 120-second service/10-minute stack polling | monotonic driver evidence | NOT MEASURED | BLOCKED |
| SCALE-U06-002 | exactly 10 clients and unique fresh namespaces; bounded resources | raw identity/concurrency/resource evidence | NOT MEASURED | BLOCKED |
| SCALE-U06-003 | finite browser page/state/width/theme matrix, every cell once | manifest and browser evidence | NOT MEASURED | BLOCKED |
| SCALE-U06-004 | incremental streaming evidence under one bounded run root | writer queue, sizes, hashes, memory evidence | NOT MEASURED | BLOCKED |
| SCALE-U06-005 | owner-local paged/indexed redacted queries; no cross-DB/N+1 | query/plan/redaction evidence | NOT MEASURED | BLOCKED |
| SCALE-U06-006 | closed preservation/security/observability sets; unavailable retained as BLOCKED | manifest completeness and derivation | NOT MEASURED | BLOCKED |

## Cross-cutting resource and recovery gates

| Gate | Target | Actual | Status |
|---|---|---|---|
| three-cycle heap/RSS | cycle 3 <= max(120% cycle 1, cycle 1 +32 MiB); no >5% rise in both transitions | NOT MEASURED | BLOCKED |
| pool/locks | no acquisition timeout, deadlock, leak, or unbounded pending work | NOT MEASURED | BLOCKED |
| process/resources | no OOM/restart, socket/thread/body/request retention, or CPU-limit violation | NOT MEASURED | BLOCKED |
| query boundedness | no N+1, full-history load, cursor gap/duplicate, or cross-database evidence query | NOT MEASURED | BLOCKED |
| evidence | locked streaming writer, valid hashes/ledger, redaction, bounded caps | NOT MEASURED | BLOCKED |
| preservation | manager 8088 and siblings unchanged before/after | NOT MEASURED | BLOCKED |

## Release conclusion

Live performance readiness is **BLOCKED**. No NFR row in this matrix is PASS.
The next valid action is a fresh full execution of `load-test-plan.md` after
the deployment, writer, browser, database, and observability entry criteria
pass.

