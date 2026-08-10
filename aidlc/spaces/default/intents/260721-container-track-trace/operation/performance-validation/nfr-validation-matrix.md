# W2-04 NFR Validation Matrix

## Scope and Upstream Trace

This matrix compares targets in `performance-requirements` and
`scalability-requirements` with the measurement mechanics in
`performance-design` and `scalability-design`, using `dashboards` as the
required telemetry surface.

`PASS` is reserved for observed target behavior on the eligible live candidate.
Harness mechanics may pass without the NFR itself passing.

## Target-versus-Actual Matrix

| NFR | Target | Actual | Status |
|---|---|---|---|
| U01 list/detail/booking GET | each N=20, p95 <=2 s, max <=5 s | Not run | BLOCKED |
| U01 accepted GTOT | N=20 unique fixtures, p95 <=2 s, max <=5 s | Not run | BLOCKED |
| U01 Booking DB/UI propagation | each sample <=30 s, 500 ms independent polls | Driver has cadence/timeout but no required population/durations | BLOCKED |
| U01 intake contention | 1 winner + 9 replay-only outcomes, no exhaustion/deadlock | Not run | BLOCKED |
| U01 capture contention | 1 accepted + 9 rejection-only losers, immutable winner | Not run | BLOCKED |
| U02 duplicate API | N=20, p95 <=2 s, max <=5 s | One mock-regression request mixed with other classes | BLOCKED |
| U02 wrong-next API | N=20, p95 <=2 s, max <=5 s | One mock-regression request mixed with other classes | BLOCKED |
| U02 duplicate UI | N=20, p95 <=2 s, max <=5 s, focused result | Not run | BLOCKED |
| U02 wrong-next UI | N=20, p95 <=2 s, max <=5 s, focused result | Not run | BLOCKED |
| U02 publisher recovery | due predicate then CMM/Booking/UI <=30 s | Not run | BLOCKED |
| U02 consumer recovery | fenced claim/complete, health/projection/UI <=30 s | Not run | BLOCKED |
| U02 ten-delivery ordering | 9 receipts, separate duplicate, 2/5/2, strongest P4 | Not run | BLOCKED |
| U03 authorized fresh API/UI | separate N=20 populations, p95 <=2 s, max <=5 s | Not run | BLOCKED |
| U03 read DENY API/UI | separate N=20 populations, safe response/write set | Not run | BLOCKED |
| U03 Identity unavailable API/UI | separate N=20 populations, fail closed | Not run | BLOCKED |
| U03 last-known API/UI | separate N=20 populations, truthful freshness | Not run | BLOCKED |
| U03 Retry recovery | fresh API and UI independently <=30 s | Not run | BLOCKED |
| U03 ten-request isolation | exact HTTP/lookup/audit/write-set outcomes | Not run | BLOCKED |
| Manager isolation | pre/post guard PASS | Current preflight PASS; no completed load run/post-cleanup | PARTIAL |
| Metrics/logs/traces | current-image telemetry sufficient for analysis | Prometheus/Jaeger unavailable; critical metrics/log shape absent | BLOCKED |
| Autoscaling | No target defined | Not applicable | N/A |
| Production throughput/capacity | No target defined | Not claimed | N/A |

## Harness Validation

| Mechanism | Evidence | Status |
|---|---|---|
| Nearest-rank summary implementation | Driver code uses `ceil(N*0.95)-1` | PASS mechanism only |
| API threshold constants | 2,000 ms p95 and 5,000 ms max | PASS mechanism only |
| Polling cadence | 500 ms | PASS mechanism only |
| Recovery timeout default | 30,000 ms | PASS mechanism only |
| Lifecycle-driver regression | 1 mock-provider test passed | PASS mechanism only |
| Browser-driver syntax | Node syntax check passed | PASS mechanism only |
| Population separation/counts | Missing | FAIL |
| Immutable live candidate | Missing | FAIL |
| Live telemetry | Missing | FAIL |

## Overall NFR Result

**0 required live performance/scalability NFRs are validated by this stage.**
The overall result remains **HOLD** until every required population and
correctness/resource observation is executed on the isolated current-image
candidate.

