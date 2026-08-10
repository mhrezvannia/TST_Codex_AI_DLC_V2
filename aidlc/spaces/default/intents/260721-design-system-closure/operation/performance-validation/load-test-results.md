# Load Test Results — W2-02 Design-System Closure

## Upstream bindings and verdict boundary

Results are evaluated against `booking-design-system-closure/nfr-requirements/performance-requirements.md`, `scalability-requirements.md`, `booking-design-system-closure/nfr-design/performance-design.md`, `scalability-design.md`, and `observability-setup/dashboards.md`.

**Scoped verdict: PARTIAL.** The bounded timing, pagination, command-pressure, responsive, and evidence requirements pass, but PERF-004A remains pending because no dedicated Booking route error boundary or live fatal-boundary injection exists. No production load-capacity, throughput, percentile-SLO, autoscaling, soak, or stress verdict is claimed.

## Executions

| Execution | Result | Evidence |
|---|---|---|
| Formal acceptance attempt | PASS | Run `20260730074058-9adef85fd5de-32c59c26`, sequence 36, 98/98 expected |
| Playwright direct execution | PASS | 98 expected, 0 unexpected, 0 skipped, 0 flaky; 289,117.798 ms |
| Formal attempt lifecycle | PASS | 07:40:58.180Z–07:50:30.394Z; 572.214 s wall time including setup/cleanup/audits |
| Booking BFF focused tests | PASS | 3 files, 18/18 tests; includes exact 2,500 ms abort/safe-503 regression |
| Booking TypeScript check | PASS | `corepack yarn workspace @erp/app-booking typecheck` |
| Required UI assertions | PASS | 98 case records, 0 non-PASS assertion values |
| Mutation journey | PASS | 12 passthrough observations; create 201, lifecycle/detail/reference requests 200 |
| Dedicated fatal-boundary case | NOT RUN | No Booking `error.tsx` route boundary and no fatal injection in the formal 98-case registry |

## Observed browser durations

All 98 case records contain one navigation timing observation:

| Population | n | Min | Observed p50 | Observed p95 | Observed p99 | Max |
|---|---:|---:|---:|---:|---:|---:|
| All required cases | 98 | 60 ms | 180 ms | 5,051 ms | 5,109 ms | 5,109 ms |
| Excluding eight deliberate loading-state controls | 90 | 60 ms | 173 ms | 319 ms | 2,141 ms | 2,141 ms |

The eight loading-state cases intentionally remain pending for roughly five seconds so Skeleton behavior can be inspected. They dominate the all-case tail. These heterogeneous, serial observations are not service-latency percentiles, an SLO, a concurrency result, or a production baseline.

## Requirement observations

- The Booking proxy’s abort controller is set to 2,500 ms. The new fake-timer regression proves no abort at 2,499 ms, abort at 2,500 ms, and safe 503 mapping.
- Formal navigation completed within the 30-second case limit and 8-second expectation limit with no unexpected, skipped, or flaky outcomes among the 98 registered cases.
- All viewport/theme/state assertions passed, including overflow, overlap, clipping, primary-action visibility, semantics, focus, live region, reduced motion, theme, and axe checks.
- One mutation case exercised the real create → validate → price → confirm → detail path and retained sanitized trace evidence.
- The approved build/test evidence covers pagination, bounded rendering, and duplicate-command behavior; the formal case ledger preserves 98 distinct case identities without overwrite.
- `fatalError` action-state branches exist, but no Booking route `error.tsx`, focused boundary regression, or live injected fatal case was found. PERF-004A is therefore pending and cannot inherit the suite’s 98/98 PASS.

## Bottleneck and telemetry analysis

No demonstrated saturation point exists. The only observed browser tail cluster is the deliberate loading-state control. The shared optional observability stack is PARTIAL: Grafana/Prometheus are reachable, but all configured application targets are down, Elasticsearch is OOM-killed, and Kibana times out. Therefore CPU, memory, connection-pool, queue, and service-level latency correlations are unavailable and no bottleneck is inferred from empty panels.

## Capacity and autoscaling

- Current production traffic/data baseline: unavailable.
- Sustainable RPS/TPS/concurrency: not measured and not claimed.
- Breaking point and headroom: not measured and not claimed.
- Auto-scaling trigger/response: not applicable; no scaling mechanism was introduced.
- 6/12-month forecast and cost envelope: not available.

Future capacity work must first repair telemetry and define representative load plus measurable targets. It must run as a separately approved vertical intent.

The fatal-boundary gap is different: it belongs to W2-02’s approved requirement set and must be implemented and proven, or explicitly waived, before unconditional closure.
