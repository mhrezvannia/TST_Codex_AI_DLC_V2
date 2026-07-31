# W2-03 Observability Dashboards

## Status and upstream basis

Status: **DESIGN COMPLETE; NOT INSTALLED; TELEMETRY UNOBSERVED**.

Deployment Execution stopped before mutation, so these dashboards are
version-controlled specifications for the isolated `linercore-wave-a` stack.
They do not prove that metrics are emitted, scraped, retained, or displayed.
Installation and screenshots remain blocked until a candidate is deployed.

The panel contracts consolidate all six Units' `performance-design`,
`security-design`, `reliability-design`, `monitoring-design`, and
`infrastructure-services`. The selected platform is the existing local
Prometheus/Grafana stack, with OpenTelemetry/Jaeger links where safe traces are
available. No CloudWatch dashboard, AWS account, or production monitoring
service is claimed.

## Metric contract

The following names are canonical W2-03 adapter targets. Existing
Spring/Micrometer, Node, PostgreSQL, and container metrics may be mapped to
these names at dashboard provisioning time; a missing source leaves its panel
`NO DATA` and blocks observability acceptance.

| Signal | Proposed metric | Allowed labels |
|---|---|---|
| Request latency | `linercore_request_duration_seconds` histogram | `service`, `journey`, `operation`, `outcome`, `basis` |
| Request traffic | `linercore_requests_total` counter | `service`, `journey`, `operation`, `outcome` |
| Readiness | `linercore_readiness` gauge | `service`, `state`, `reason_class` |
| Dependency latency | `linercore_dependency_duration_seconds` histogram | `service`, `dependency`, `operation`, `outcome` |
| Dependency failures | `linercore_dependency_failures_total` counter | `service`, `dependency`, `reason_class` |
| Pricing terminal result | `linercore_pricing_terminal_total` counter | `outcome`, `basis`, `category` |
| Manual case result | `linercore_manual_case_total` counter | `outcome`, `reason_class` |
| Booking receipt/reprice | `linercore_booking_pricing_total` counter | `operation`, `outcome`, `basis`, `replay` |
| BFF overhead | `linercore_bff_overhead_seconds` histogram | `route_id`, `operation`, `outcome` |
| Evidence gate | `linercore_acceptance_gate` gauge | `gate_id`, `state` |

Stable IDs, subjects, booking/customer/reference identifiers, request hashes,
correlation IDs, amounts, currencies, URLs, free-form errors, SQL, and secrets
are forbidden labels. Correlation belongs in redacted logs and traces only.

## Dashboard 1 - W2-03 release and journey

Primary audience: release-review role and incident commander.

| Row | Panels | Decision supported |
|---|---|---|
| Release state | deployment state, candidate identity, gate counts by PASS/FAIL/BLOCKED/SKIPPED | Is there an observable candidate eligible for acceptance? |
| Critical journeys | Agreement pricing, Tariff pricing, no-rate manual fallback, Booking consumption, Reprice | Which user-visible journey is failing? |
| Golden signals | p50/p95/p99, traffic, typed errors, saturation | Is failure latency-, correctness-, dependency-, or capacity-driven? |
| Preservation | manager 8088 fingerprint, sibling regression, evidence-writer status | Did isolated acceptance disturb protected resources? |
| Readiness | service readiness and authenticated semantic probes | Are healthy processes actually ready for work? |

Top-level Grafana variables are restricted to `run_id`, `service`, `journey`,
and bounded `outcome`. Record identifiers are investigated through safe
correlation search, not dashboard variables.

## Dashboard 2 - Charge rate and agreement authority

Panels:

1. Rate list/detail p50/p95/p99/max and sample count against p95 500 ms.
2. Rate mutations p50/p95/p99/max against p95 750 ms.
3. Agreement list/detail against p95 750 ms and commands against p95 1,000 ms.
4. Authorization, Reference Data, and rate-link dependency latency/outcomes.
5. Hikari active, idle, pending, acquisition duration, and two-second ceiling.
6. PostgreSQL query duration, lock wait, deadlocks, and transaction outcomes.
7. Flyway/catalog/readiness state and safe reason class.
8. Outbox pending/retry age, publish result, and bounded relay recovery.

Example percentile expression:

```promql
histogram_quantile(
  0.95,
  sum by (le, operation) (
    rate(linercore_request_duration_seconds_bucket{
      service="charge-agreement-service"
    }[5m])
  )
)
```

## Dashboard 3 - Pricing and manual fallback

Panels:

1. Pricing p99 by `basis` and terminal `outcome`, target 800 ms.
2. Agreement-first selection versus Tariff fallback counts.
3. No-rate and ambiguity manual-case creation/reuse by bounded reason class.
4. Claim/owner/fence outcomes and terminal receipt state.
5. Candidate-query duration, datasource pressure, heap/RSS, and container CPU.
6. Manual list/detail p95, target 750 ms.

The panel must distinguish `NO_RATE` from validation, authorization,
dependency timeout/503, and circuit outcomes. No-rate must never be displayed
as a successful zero price.

## Dashboard 4 - Booking consumption and repricing

Panels:

1. Capture/claim p95 against 500 ms.
2. Completion and detail/history p95 against 750 ms.
3. Fresh Agreement, Tariff, successor-Agreement Reprice, and changed-Tariff
   Reprice p99 against 1,500 ms.
4. Receipt/fence/replay/conflict outcomes and maximum raw provider attempts.
5. Retry and circuit states, showing only exhausted timeout/503 as failures.
6. Snapshot/history integrity, pool/client permits, JVM/container resources,
   and readiness.

## Dashboard 5 - Edge, BFF, security, and tracing

Panels:

1. BFF overhead p50/p95/p99/max by closed route; targets p95 100 ms and p99
   200 ms.
2. Protected and selector permit occupancy, wait, exhaustion, and egress
   timeout.
3. Direct-versus-nginx health schema/status and protected-route fail-closed
   state.
4. Safe 4xx/5xx distribution, authorization failures, and redaction-gate state.
5. Parent/child span completeness and signed BFF overhead validity.
6. Links to Jaeger searches by a manually entered safe correlation value.

## Dashboard 6 - Acceptance evidence and resources

Panels:

1. Ordered U06 gate state and closed observability-ID coverage.
2. Startup/restart/restore duration against 120-second per-service and
   ten-minute aggregate bounds.
3. Exact sample populations and nearest-rank p95/p99 recomputation state.
4. Three-cycle heap/RSS/CPU, pool/lock/query-plan, artifact-size, and trace-cap
   evidence.
5. Manager-before/after equality and protected sibling checks.
6. Redaction scan state for logs, metrics, traces, screenshots, and reports.

`NO DATA` is not green. An unavailable required capability is `BLOCKED`;
available-but-slow or incorrect evidence is `FAIL`.

## Provisioning and verification

Provisioning sequence after Deployment Execution becomes eligible:

1. Verify every proposed metric exists with only the allowed label set.
2. Load dashboards into the existing local Grafana instance through its
   version-controlled provisioning path.
3. Run the isolated acceptance population and retain dashboard JSON plus
   bounded screenshots in the U06 evidence record.
4. Recompute every displayed percentile from raw monotonic samples.
5. Confirm dashboard links expose no token, payload, commercial value, or
   unsafe identifier.

Current verification result: **NOT RUN - NO DEPLOYED CANDIDATE**.

