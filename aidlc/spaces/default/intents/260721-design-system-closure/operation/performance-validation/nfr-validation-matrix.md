# NFR Validation Matrix — W2-02 Design-System Closure

## Upstream bindings

This matrix maps `booking-design-system-closure/nfr-requirements/performance-requirements.md`, `scalability-requirements.md`, `booking-design-system-closure/nfr-design/performance-design.md`, `scalability-design.md`, and `observability-setup/dashboards.md` to observed evidence.

## Performance requirements

| ID | Target | Actual evidence | Status |
|---|---|---|---|
| PERF-001 | Preserve 2,500 ms BFF abort | Source boundary plus focused 2,499/2,500 ms abort and safe-503 test; Booking tests 18/18 | PASS |
| PERF-002 | Named route outcome before documented timeout | 98/98 terminal case records; 30 s test/8 s expectation limits; no unexpected timeout | PASS |
| PERF-002A | Named command outcome; no endless pending/false success | State matrix plus real create/validate/price/confirm mutation journey | PASS |
| PERF-003 | Stable shared Skeleton replaced by named state | Eight controlled loading cases across themes/viewports plus terminal-state cases | PASS |
| PERF-004 | Zero unhandled failures/timeouts in non-fatal cases | 0 unexpected, 0 skipped, 0 flaky; all required assertions PASS | PASS |
| PERF-004A | Exact expected fatal boundary only | No Booking route `error.tsx`, focused boundary regression, or live fatal injection found | PENDING |
| PERF-005 | At most one command in flight | Approved component/network assertions and pending-state cases | PASS |
| PERF-006 | At most 25 list records; contained table overflow | Approved pagination/DOM assertions and responsive matrix | PASS |
| PERF-007 | No unapproved runtime dependency | Approved production build/dependency gate; performance test adds no runtime dependency | PASS |
| PERF-008 | Record observed route/command baseline | 98 timing-bearing case records bound to run, commit, theme, viewport, and result | PASS |

## Scalability requirements

| ID | Target | Actual evidence | Status |
|---|---|---|---|
| SCALE-001 | One server page, size ≤25 | Existing page-size contract and approved list assertions | PASS |
| SCALE-002 | Operable at 375/768/1024/1440 without page overflow | Both themes and required states passed responsive assertions | PASS |
| SCALE-003 | No route/shell/token duplication across states/themes | Approved architecture/source gates and one evidence matrix | PASS |
| SCALE-004 | Shared UI/package ownership boundaries preserved | Approved dependency/source/build gates | PASS |
| SCALE-005 | Isolated case data and no order dependency | Fully serial suite with 98 distinct case records and explicit controls | PASS |
| SCALE-006 | Stable run/case evidence; failures retained | Terminal sequence 36 links failed predecessor sequence 35; immutable payload hash retained | PASS |
| SCALE-007 | One lifecycle command in flight | Pending/command tests and mutation trace show bounded command execution | PASS |

## Conventional load and scale validation

| Capability | Target | Actual | Status |
|---|---|---|---|
| Concurrent users / RPS / TPS | Not defined | Not executed | NOT APPLICABLE |
| p50/p95/p99 service SLO | Not defined | Browser observations only; not an SLO | NOT APPLICABLE |
| Stress or breaking point | Not defined | Not executed | NOT APPLICABLE |
| Soak or leak threshold | Not defined | Not executed | NOT APPLICABLE |
| Autoscaling | No mechanism in scope | Not executed | NOT APPLICABLE |
| Resource saturation telemetry | Program observability prerequisite | Application scrape targets down | PENDING PROGRAM WORK |
| Production capacity forecast | Traffic/growth/cost inputs absent | Not produced | PENDING FUTURE INTENT |

## Release interpretation

W2-02 passes every measured bounded performance/scalability row except PERF-004A. That requirement remains pending and blocks an unconditional closure claim unless it is implemented and proven or explicitly waived. The conventional load/capacity rows remain NOT APPLICABLE or future program work and must not be presented as production-capacity proof. Historical W1 live proof remains BLOCKED/waived, not PASS.
