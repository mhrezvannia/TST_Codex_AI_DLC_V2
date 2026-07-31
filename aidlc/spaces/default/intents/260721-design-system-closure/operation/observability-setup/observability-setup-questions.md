# Observability Setup Questions — W2-02 Design-System Closure

## Resolved observability choices

Answers are constrained by `booking-design-system-closure/nfr-design/performance-design.md`, `security-design.md`, `reliability-design.md`, `booking-design-system-closure/infrastructure-design/monitoring-design.md`, and `infrastructure-services.md`.

### Q1. Which golden signals are tracked?

For W2-02, track run-scoped route/action duration, request status/count, browser errors/timeouts, service readiness, manager safety, terminal UI outcome, accessibility/layout results, trace-sanitizer outcome, audit exits, and deployment cleanup. These signals are bound to the immutable acceptance run.

The shared optional Prometheus profile declares request latency, error rate, authorization decisions, outbox lag, event freshness, publication attempts, and health status, but current live scrape health is degraded and is not W2-02 closure evidence.

### Q2. Which SLIs/SLOs are defined?

No production SLO or error budget is defined. The closure has exact per-run acceptance gates—98/98 cases, zero unexpected browser failures, and all lifecycle/audit gates PASS—but those are release criteria, not a time-windowed availability SLO.

### Q3. Which dashboard layout is required?

The existing local Shared Platform overview contains seven panels for reference and Booking latency, outbox depth, event freshness, CMM relay pending work, and charge-pricing failures. W2-02 adds no dashboard. Reviewers use its manifest/case ledger as the run dashboard.

### Q4. Which log aggregation and retention rules apply?

No production aggregation or retention policy exists. Docker logs and run artifacts support local diagnosis; durable W2-02 evidence is sanitized and hash-bound. Elasticsearch/Kibana are optional shared services and are currently degraded.

### Q5. Which tracing instrumentation is required?

W2-02 requires a sanitized Playwright mutation trace plus correlation-safe request observations. Jaeger and the OTel collector are locally reachable, but no claim is made that every W2-02 hop emits a complete distributed trace.

## Deferred decisions

Production telemetry retention, SLOs, paging routes, on-call ownership, distributed trace sampling, log indexing capacity, anomaly models, and shared observability remediation require program-level ownership outside W2-02.
