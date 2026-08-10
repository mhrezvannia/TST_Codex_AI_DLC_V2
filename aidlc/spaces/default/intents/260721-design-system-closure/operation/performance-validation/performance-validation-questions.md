# Performance Validation Questions — W2-02 Design-System Closure

## Upstream bindings

Answers are constrained by `booking-design-system-closure/nfr-requirements/performance-requirements.md`, `scalability-requirements.md`, `booking-design-system-closure/nfr-design/performance-design.md`, `scalability-design.md`, and `observability-setup/dashboards.md`.

## Resolved performance choices

### Q1. What traffic pattern is expected?

No production steady-state, peak, burst, concurrency, or growth model was approved. W2-02 validates one serial, isolated operator journey and a deterministic state/theme/viewport matrix against `linercore-wave-a`. Load, stress, spike, and soak traffic are explicit non-requirements.

### Q2. What p50, p95, and p99 latency targets apply?

No percentile target applies. The sole hard request boundary is the existing 2,500 ms Booking BFF abort deadline. Browser navigation durations are retained as observed run data only; they are not an SLO or production latency baseline.

### Q3. What throughput must be sustained?

No requests-per-second, transactions-per-second, concurrent-user, or message-throughput target exists. The accepted bounds are at most 25 records per list response/DOM page and at most one lifecycle command in flight per UI instance.

### Q4. Where are likely bottlenecks?

The approved design identifies the existing BFF dependency deadline, backend/service readiness, server-rendered route work, and container resource limits as boundaries. The observed tail in the formal browser run is dominated by eight deliberately controlled loading-state cases near five seconds, not demonstrated production saturation. Optional shared Prometheus targets are down, so no resource or service-level bottleneck inference is made from Grafana.

### Q5. Is every approved performance-health case represented?

No. PERF-004A requires a dedicated deliberately injected fatal-error-boundary case. No Booking route `error.tsx`, focused boundary regression, or fatal case in the formal 98-case registry was found. This requirement remains pending rather than inheriting the suite’s 98/98 result.

## Deferred decisions

A future capacity intent must establish representative traffic, data volume, production-like topology, latency/throughput targets, resource telemetry, test duration, growth assumptions, and scaling criteria before any load-capacity or autoscaling PASS can be claimed. PERF-004A is not deferred capacity work; it requires implementation/proof or an explicit waiver within W2-02.
