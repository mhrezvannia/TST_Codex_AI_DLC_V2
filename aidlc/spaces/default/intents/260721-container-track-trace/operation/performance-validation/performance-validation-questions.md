# W2-04 Performance Validation Decisions

## Upstream Context

These answers preserve `performance-requirements`,
`scalability-requirements`, `performance-design`, `scalability-design`, and
the inactive telemetry status in `dashboards`.

## Decisions

### 1. What traffic patterns are expected?

**Answer:** Only bounded local acceptance populations: warm-up plus 20 requests
per specified API/UI outcome, two ten-contender correctness probes, one
serialized ten-delivery window, and 500 ms recovery polling. No steady-state
RPS, peak, burst, stress, soak, or production traffic model is approved.

### 2. What latency percentiles are targeted?

**Answer:** Record p50, p95, and max. The target is p95 <=2 seconds and max <=5
seconds for each separate population. No p50 or p99 target is defined.
Propagation and fresh Retry endpoints must each complete within 30 seconds.

### 3. What throughput must the system sustain?

**Answer — none defined:** The intent proves workflow correctness and bounded
contention, not messages per second, requests per second, users, fleet size, or
annual growth.

### 4. Where are likely bottlenecks?

**Answer — candidates, not findings:** Fresh Identity/Reference Data calls,
indexed and row-locked database operations, connection pools, outbox relay,
Kafka, Booking receipt fencing/projection, and frontend polling/rendering.
Without live telemetry no bottleneck is measured.

### 5. Can the live tests run now?

**Answer — no:** No immutable candidate or complete CI controller exists;
Prometheus/Jaeger are unavailable; and a partial Wave A project appeared under
another session. The single-controller rule prohibits this session from
co-opting it.

### 6. Does the current lifecycle driver satisfy the NFR plan?

**Answer — no:** Its mock regression passes, but it summarizes six mixed calls
and omits the required separate 20-sample, contention, degradation, ordering,
resource, and propagation-duration evidence.

### 7. What is the validation verdict?

**Answer — NOT RUN / NOT VALIDATED / HOLD:** No required live
performance/scalability NFR is validated.

### 8. What does approval mean?

**Answer:** Approval accepts the load plan, honest blocked results, harness gap
analysis, and target-versus-actual matrix. It does not waive performance gates
or authorize deployment.

## Re-entry Conditions

Re-run after one committed immutable candidate, a serialized isolated target,
complete fixture/orchestration/cleanup wiring, live telemetry, and all
pre-release gates are ready. W1 remains `BLOCKED_WAIVED`.

