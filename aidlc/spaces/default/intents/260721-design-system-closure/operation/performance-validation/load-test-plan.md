# Load Test Plan — W2-02 Design-System Closure

## Upstream bindings and scope

This plan implements only the measurable boundaries in `booking-design-system-closure/nfr-requirements/performance-requirements.md`, `scalability-requirements.md`, `booking-design-system-closure/nfr-design/performance-design.md`, `scalability-design.md`, and `observability-setup/dashboards.md`.

The upstream artifacts explicitly exclude production traffic, concurrent-user, RPS/TPS, percentile SLO, stress, soak, autoscaling, and capacity-forecast targets. Accordingly, this is a bounded performance-validation plan, not a conventional multi-user load test.

## Environment and evidence

| Item | Binding |
|---|---|
| Runtime | Isolated local Docker Compose project `linercore-wave-a` |
| Formal run | `20260730074058-9adef85fd5de-32c59c26`, terminal sequence 36 |
| Application commit | `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f` |
| Browser execution | Chromium, serial Playwright execution, retries 0 |
| Test limits | 30,000 ms per test; 8,000 ms per expectation |
| Result source | Immutable evidence payload SHA-256 `7103d3695b030c797ab8f52bedcf2cc15a68cd648271df92776f0d0074e47b76` |
| Observability | Run/case records and sanitized trace; shared Grafana data source is PARTIAL |

## Test workloads

### PV-01 — BFF deadline

- Verify source uses an abort controller at exactly 2,500 ms.
- Execute a focused fake-timer test that remains un-aborted at 2,499 ms, aborts at 2,500 ms, and maps the failure to safe HTTP 503 `BOOKING_UNAVAILABLE`.
- Pass condition: exact boundary and safe response both hold; no timeout increase.

### PV-02 — Serial route/state matrix

- Reuse the completed 98-case formal browser run.
- Validate all cases have terminal PASS results, navigation timing, required assertions, and zero unexpected/skipped/flaky Playwright outcomes.
- Separate the intentionally delayed loading-state controls from other navigation observations before describing the distribution.

### PV-03 — Bounded presentation and command pressure

- Validate four viewports (375/768/1024/1440), both themes, required states, table-scroller containment, and visible/unclipped primary controls.
- Validate the 25-record page/DOM boundary and one-pending-command behavior through the approved component/browser suite.

### PV-04 — Lifecycle and evidence overhead

- Record overall formal-run wall time and Playwright execution time.
- Verify the mutation journey’s create/validate/price/confirm/detail requests complete with expected 2xx statuses.
- Retain prior failures and terminal lineage; do not overwrite or average across different workspace identities.

### PV-05 — Fatal-boundary coverage

- Verify a Booking route boundary exists and renders a named fatal state.
- Inject exactly one expected fatal error in a dedicated live case.
- Fail if the boundary is absent, the expected error is not captured, or any additional page error/rejection/timeout occurs.
- Current discovery result: boundary and case are absent, so this workload is PENDING.

## Measurements

- case count and outcome;
- observed navigation duration min/p50/p95/p99/max, clearly labeled non-SLO;
- controlled-loading versus other navigation distribution;
- unexpected, skipped, and flaky test counts;
- failed UI assertion count;
- focused BFF deadline test and typecheck result;
- lifecycle response statuses;
- absence/presence of valid resource telemetry.

## Excluded tests and rationale

| Test | Status | Reason |
|---|---|---|
| Concurrent load/ramp | NOT RUN | No concurrency or RPS target |
| Stress/breaking point | NOT RUN | No approved capacity boundary or destructive-risk authorization |
| Soak | NOT RUN | No duration, leak threshold, or production-like environment |
| Spike | NOT RUN | No burst model or autoscaling mechanism |
| Autoscaling | NOT APPLICABLE | Runtime scaling is explicitly unchanged |
| CloudWatch/X-Ray analysis | NOT APPLICABLE | Local Compose target; no AWS telemetry |
| Prometheus resource correlation | PENDING program work | All configured application targets are currently down |

These exclusions are not converted to PASS.

## Stop conditions

Stop and fail scoped validation on any BFF deadline increase, missing terminal state, unexpected browser error/timeout, duplicate command, row-bound violation, page overflow/overlap/clipping, incomplete evidence, manager-guard failure, or non-zero audit result.
