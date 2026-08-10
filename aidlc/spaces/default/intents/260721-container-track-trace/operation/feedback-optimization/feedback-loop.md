# W2-04 Operational Feedback Loop

## Cycle Outcome

The feature lifecycle is structurally at its final stage, but operational
acceptance remains **HOLD**. The next cycle is remediation and evidence
completion, not feature expansion.

This feedback loop is grounded in `dashboards`, `alarms`, `slo-config`,
`deployment-log`, `load-test-results`, and `incident-plan`. There is no
production usage dataset from which to infer user behavior, demand, new
features, or prioritization. No such claim is made.

## Observed Signals

| Signal | Observation | Implication |
|---|---|---|
| Release execution | No immutable candidate deployed | Promotion cannot proceed |
| Performance | Approved live populations not run | All live NFRs remain unvalidated |
| Observability | Metrics/traces unavailable; logs incomplete | SLO and bottleneck analysis blocked |
| Drift | Candidate absent; mutable tags and dirty source | Release identity must be fixed first |
| Cost | No target/utilization/billing baseline | Optimization would be speculative |
| Incident readiness | Procedures exist; staffing/routes/recovery do not | Production operation not ready |
| Manager isolation | Current guard passes | Preserve this control in every live run |

## Prioritized Improvement Backlog

### P0 - establish a releasable evidence identity

1. synchronize with the approved integration baseline and confirm the exact
   W2-02 merge state;
2. commit the W2-04 implementation and bind source, images, effective config,
   contracts, migrations, and evidence paths in a hash-valid manifest;
3. use one explicitly owned, serialized `linercore-wave-a` controller;
4. retain pre/post manager guard and always-run cleanup evidence.

### P0 - complete the live acceptance gate

1. orchestrate a priced Booking fixture and the full
   broker-to-CMM-DB/outbox-to-Kafka-to-Booking-projection path;
2. run the deterministic lifecycle, duplicate/wrong-next, ten-delivery,
   authorization, degradation, isolation, and write-set fixtures;
3. invoke current-image Playwright UI/a11y evidence;
4. run `aidlc-audit` and `erp-fidelity-audit`;
5. preserve failure artifacts and permit only the approved environmental retry.

### P0 - activate trustworthy telemetry

1. expose application metrics for CMM and Booking;
2. emit structured, redacted logs with correlation continuity;
3. configure application OTLP export and verify traces;
4. activate Prometheus/Grafana/collector/trace-store services for the owned
   acceptance target;
5. prove that `dashboards` and `alarms` return data during exercised fixtures.

### P0 - execute performance validation

Run the warm-ups, separate 20-sample populations, ten-contender proofs,
ten-delivery ordering fixture, independent 500 ms DB/UI propagation polling,
and recovery populations in `load-test-results`. Emit per-class p50/p95/max,
resource, lag, error, and convergence evidence without mixing accepted and
rejected requests.

### P1 - close delivery and operational readiness gaps

- make coverage generation enforce the approved backend/frontend threshold or
  record an explicit revised policy;
- complete the current-image advisory/security and CI orchestration gaps;
- name production target, primary/secondary on-call, escalation routes, and
  approval owners;
- define backup, restore, RTO/RPO, and run a safe recovery exercise;
- establish telemetry retention and cost baselines before right-sizing.

## Toil Automation

Automate the serialized live controller, ownership lock, fixture seeding,
manifest generation/validation, telemetry readiness checks, approved population
runner, Playwright invocation, audit invocation, evidence hashing, manager
guard, and cleanup in one fail-closed CI job. Keep approval and deterministic
product/security failures human-visible; do not hide them behind automatic
retry.

## Feedback Routing

| Finding | Next owner |
|---|---|
| Immutable candidate and CI orchestration | Pipeline/Release |
| Metrics, logs, traces, dashboards, alarms | Operations + service owners |
| Performance populations and evidence assertions | Quality |
| Compose isolation and target readiness | Platform |
| On-call, recovery, and production policy | Operations + product ownership |
| Release identity and architecture deviations | Architect |

When the P0 evidence is green, rerun Deployment Execution through Performance
Validation and regenerate this report. If business stakeholders want broader
features, create a separate Ideation intent; do not fold them into this HOLD
remediation cycle. W1 remains `BLOCKED_WAIVED`.
