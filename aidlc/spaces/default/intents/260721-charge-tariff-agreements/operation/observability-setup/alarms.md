# W2-03 Alarm and Gate Definitions

## Status and upstream basis

Status: **DEFINED; NOT PROVISIONED; NO EXTERNAL DELIVERY CONFIGURED**.

These definitions consolidate `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services`.
They are local acceptance gates for the existing Prometheus/Grafana posture,
not CloudWatch alarms or proof of a live alerting service. Deployment
Execution produced no candidate, so every runtime alarm is currently
`UNOBSERVED`.

## Severity and routing policy

| Severity | Meaning in this intent | Current route | Response target |
|---|---|---|---|
| P1 | integrity, security, or protected-environment failure; acceptance must stop | evidence ledger plus console/report | immediate stop and preserve diagnostics |
| P2 | required journey, readiness, or latency gate breached | evidence ledger plus console/report | investigate before promotion |
| P3 | early warning below a final gate or capacity trend | dashboard annotation/report | review during the same acceptance run |

Owner is the W2-03 release-review role until real service/on-call ownership is
assigned. SNS, email, chat, paging, tickets, and automated remediation are
disabled. The next `incident-response` stage owns concrete diagnostic and
escalation runbooks; a missing runbook link prevents external enablement.

## P1 stop conditions

| ID | Condition | Evaluation | Action |
|---|---|---|---|
| `W203-P1-MANAGER-DRIFT` | manager port 8088 fingerprint differs before/after | any mismatch | abort Wave A work; preserve both fingerprints |
| `W203-P1-TELEMETRY-DISCLOSURE` | secret, token, credential, prohibited commercial payload, or unsafe trace content retained | any detection | block retention/promotion; discard unsafe trace; rotate exposed secret if applicable |
| `W203-P1-AUTH-BYPASS` | protected route forwards while configuration or authorization is DOWN | any event | stop acceptance; fail closed |
| `W203-P1-INTEGRITY` | receipt, snapshot, activity, manual-case, version, or replay invariant fails | any event | stop mutation; preserve database/evidence hashes |
| `W203-P1-SEMANTIC-GATE` | required U06 terminal assertion reports FAIL | any required gate | stop promotion; retain exact failing cell |

## P2 acceptance failures

| ID | Condition | Required window/sample | Final gate |
|---|---|---|---|
| `W203-P2-READINESS` | required service not ready plus authenticated semantic probe | 120 seconds per startup/restart | FAIL |
| `W203-P2-AGGREGATE-START` | guarded isolated stack not ready | ten minutes | FAIL |
| `W203-P2-RATE-READ` | Rate list/detail percentile | fixed post-warm-up population | p95 > 500 ms |
| `W203-P2-RATE-MUTATION` | Rate mutation percentile | fixed post-warm-up population | p95 > 750 ms |
| `W203-P2-AGREEMENT-READ` | Agreement list/detail percentile | fixed post-warm-up population | p95 > 750 ms |
| `W203-P2-AGREEMENT-COMMAND` | Agreement command percentile | fixed post-warm-up population | p95 > 1,000 ms |
| `W203-P2-PRICING` | pricing percentile by scenario/basis | 100 calls at 10 clients per required scenario | p99 > 800 ms |
| `W203-P2-MANUAL-READ` | manual-case list/detail | fixed post-warm-up population | p95 > 750 ms |
| `W203-P2-BFF` | signed BFF overhead | 100 samples per required route | p95 > 100 ms or p99 > 200 ms |
| `W203-P2-BOOKING-CAPTURE` | Booking capture/claim | approved healthy population | p95 > 500 ms |
| `W203-P2-BOOKING-COMPLETE` | Booking completion/detail/history | approved healthy population | p95 > 750 ms |
| `W203-P2-BOOKING-E2E` | each fresh pricing/repricing subtype | direct monotonic samples | p99 > 1,500 ms |
| `W203-P2-DB-CONTENTION` | pool acquisition >2 s, deadlock, leak, or unbounded pending work | any accepted workload | FAIL |
| `W203-P2-EVIDENCE-WRITER` | required record cannot be durably committed or verified | any required record | BLOCKED |

Expected typed 4xx outcomes remain latency samples but are not availability
errors. Dependency-fault ceiling checks are evaluated separately from healthy
percentiles. `NO_RATE` is a valid provider outcome only when it produces the
required persisted `MANUAL_PRICING_REQUIRED` evidence.

## P3 early warnings

Warnings are below final breach thresholds to allow diagnosis during the run:

| ID | Warning |
|---|---|
| `W203-P3-PRICING-LATENCY` | rolling p99 >720 ms after at least 50% of the required scenario population |
| `W203-P3-RATE-READ` | rolling p95 >450 ms after at least 50% of the required population |
| `W203-P3-RATE-MUTATION` | rolling p95 >675 ms after at least 50% of the required population |
| `W203-P3-AGREEMENT-READ` | rolling p95 >675 ms after at least 50% of the required population |
| `W203-P3-AGREEMENT-COMMAND` | rolling p95 >900 ms after at least 50% of the required population |
| `W203-P3-BFF` | rolling p95 >90 ms or p99 >180 ms after at least 50 samples |
| `W203-P3-BOOKING-E2E` | rolling p99 >1,350 ms after at least 50% of a subtype population |
| `W203-P3-POOL` | pending connections >0 for 30 seconds or active connections >=8 of 10 |

Warnings annotate evidence but do not replace final nearest-rank computation
from raw samples.

## Prometheus rule shape

Illustrative rule; provisioning must bind to verified metric names:

```yaml
groups:
  - name: w203-acceptance
    rules:
      - alert: W203PricingLatencyWarning
        expr: |
          histogram_quantile(
            0.99,
            sum by (le, basis) (
              rate(linercore_request_duration_seconds_bucket{
                journey="pricing"
              }[5m])
            )
          ) > 0.720
        for: 30s
        labels:
          severity: P3
          scope: acceptance
        annotations:
          summary: W2-03 pricing latency is approaching the 800 ms gate
```

No Alertmanager receiver is configured by this document.

## Verification and enablement gate

Before any external route is enabled:

1. Deploy a candidate and prove each metric and label contract.
2. Link every P1/P2 rule to an approved incident runbook.
3. Assign a real owner, notification channel, acknowledgement target, quiet
   hours, and escalation path.
4. Inject each condition in the isolated environment and prove one
   notification without duplicate storms.
5. Confirm no alarm annotation contains identifiers, values, payloads, or
   secrets.

Current result: **NOT RUN - NO DEPLOYED CANDIDATE**.

