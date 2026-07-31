# W2-04 SLI and Objective Configuration

## Position and Upstream Trace

The indicators below are derived from `performance-design`,
`security-design`, `reliability-design`, `monitoring-design`, and
`infrastructure-services`.

W2-04 defines **acceptance objectives, not production SLOs or an SLA**. The
approved design explicitly forbids inferring production availability,
throughput, capacity, rate-limit, backup, or recovery commitments from local
Compose evidence.

## Acceptance SLIs

| Journey | SLI | Measurement |
|---|---|---|
| Accepted capture | proportion acknowledged within threshold | nearest-rank p95 and max over the approved 20-sample population |
| Event propagation | proportion CMM PUBLISHED, Booking APPLIED, and UI-visible within 30 seconds | one controller monotonic start; independent 500 ms DB/UI polls |
| Conflict correctness | duplicate/wrong-next requests returning the typed 409 with no accepted-state mutation | deterministic fixture assertions |
| Projection correctness | final Booking latest-per-container state matching authoritative CMM history | DB and UI evidence |
| Authorization correctness | exact matrix outcomes with repository-before-ALLOW and write-set assertions | ten-request matrix |
| Degraded recovery | fresh Retry API and UI convergence within 30 seconds | observed readiness then independent 500 ms polling |
| Manager isolation | pre/post guard success and exact isolated project identity | guard output plus Compose labels |
| Evidence integrity | valid hash manifest bound to current SHA/images/config/contracts/migrations | manifest validator |

## Acceptance Objectives

| Objective | Target |
|---|---|
| Accepted capture latency | p95 <= 2 seconds and max <= 5 seconds |
| CMM-to-Booking/UI propagation | every approved sample <= 30 seconds |
| Typed conflict correctness | 100% for the deterministic duplicate/wrong-next set |
| Authorization/degradation matrix | 100% exact outcomes and permitted write sets |
| Ten-delivery consumer fixture | 9 immutable receipts; separate duplicate evidence; APPLIED=2, STALE=5, REJECTED=2 |
| Manager protection | pre/post guard PASS |
| Evidence identity | 100% complete and hash-valid |

These are blocking release-verification thresholds. They are not measured over
a rolling production window and therefore have no production error budget.

## Production SLO Activation Prerequisites

Before proposing a production SLO:

1. provision and approve a real production target and ownership model;
2. deploy immutable candidates through the full gate;
3. collect 2-4 weeks of trustworthy user-journey telemetry;
4. exclude health/synthetic traffic and distinguish successful from failed
   latency;
5. agree measurement windows, planned-maintenance treatment, on-call policy,
   and business expectations;
6. validate dependency objectives do not make the journey target impossible.

Only then may the team set availability, latency, freshness, correctness, and
burn-rate targets. No 99.x percentage is invented here.

## Current Measurement Readiness

Measurement is **BLOCKED**: observability containers were stopped, Prometheus
was unreachable, Booking/CMM metric endpoints were 404, sampled Booking/CMM
logs were not structured JSON, application OTLP export was not found, and the
required live 20-sample populations have not run.

