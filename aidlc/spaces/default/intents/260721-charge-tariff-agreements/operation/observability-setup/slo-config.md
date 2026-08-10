# W2-03 SLI and Objective Configuration

## Status and scope

Status: **ACCEPTANCE OBJECTIVES DEFINED; PRODUCTION SLOS UNAPPROVED**.

This configuration is derived from every Unit's `performance-design`,
`security-design`, `reliability-design`, `monitoring-design`, and
`infrastructure-services`. It quantifies local verification contracts without
converting them into an availability SLA or a production reliability claim.
Deployment Execution produced no running candidate or representative baseline.

## Measurement rules

- Window: one guarded, isolated `linercore-wave-a` acceptance run after the
  declared warm-up, with raw monotonic samples retained.
- Scope: only the exact required scenario and route populations; health checks,
  setup calls, and unrelated manager traffic are excluded.
- Percentile: nearest-rank over raw samples, recomputed independently from the
  metrics backend.
- Errors: expected typed 4xx outcomes stay in latency populations but are not
  counted as service-unavailable. Timeout, 503, circuit exhaustion, integrity
  failure, and wrong terminal meaning are counted according to their explicit
  scenario oracle.
- Correctness gates may require 100% conformance because they are finite test
  assertions; they are not 100% production availability SLOs.
- A missing metric, incomplete population, unavailable required capability, or
  unsafe retained artifact yields `BLOCKED`, never PASS.

## Acceptance objective registry

| ID | SLI | Objective | Window |
|---|---|---|---|
| `AO-RATE-READ` | Rate list/detail requests within 500 ms | >=95% | each fixed post-warm-up run |
| `AO-RATE-MUTATION` | Rate create/edit/approve/successor within 750 ms | >=95% | each fixed post-warm-up run |
| `AO-AGREEMENT-READ` | Agreement list/detail within 750 ms | >=95% | each fixed post-warm-up run |
| `AO-AGREEMENT-COMMAND` | Agreement commands within 1,000 ms | >=95% | each fixed post-warm-up run |
| `AO-PRICING` | each Agreement, Tariff, no-rate, and ambiguity pricing scenario within 800 ms | >=99% | 100 calls at 10 clients per required scenario |
| `AO-MANUAL-READ` | manual-case list/detail within 750 ms | >=95% | each fixed post-warm-up run |
| `AO-BFF-95` | signed BFF overhead within 100 ms | >=95% | 100 samples per required route |
| `AO-BFF-99` | signed BFF overhead within 200 ms | >=99% | 100 samples per required route |
| `AO-BOOKING-CAPTURE` | capture/claim within 500 ms | >=95% | approved healthy population |
| `AO-BOOKING-COMPLETE` | completion and detail/history within 750 ms | >=95% | approved healthy population |
| `AO-BOOKING-E2E` | each fresh Agreement, Tariff, successor-Agreement Reprice, and changed-Tariff Reprice within 1,500 ms | >=99% | direct samples for each subtype |
| `AO-READINESS` | required startup/restart reaches readiness plus one semantic probe within 120 s | 100% of required cycles | each isolated acceptance run |
| `AO-STACK-START` | guarded wrapper reaches aggregate readiness within ten minutes | 100% | each isolated acceptance run |
| `AO-CORRECTNESS` | required terminal, itemisation, receipt, replay, manual-case, authorization, manager-preservation, and redaction assertions pass | 100% | each isolated acceptance run |

For U05, the healthy population contains 50 first Agreement, 50 first Tariff,
50 successor-Agreement Reprice, and 50 changed-Tariff Reprice operations.
Exact U06 manifest counts remain authoritative if a later approved artifact
narrows a scenario further.

## SLI expressions

Latency compliance for an objective threshold `T`:

```text
good = count(required samples where elapsed_monotonic_ms <= T)
valid = count(all required samples with valid scenario and correlation linkage)
compliance_percent = 100 * good / valid
```

Terminal correctness:

```text
good = count(required cells with state PASS and a valid evidence hash)
valid = count(all required cells)
compliance_percent = 100 * good / valid
```

Readiness:

```text
good = count(required cycles where readiness and semantic probe complete
             before the declared monotonic deadline)
valid = count(all required startup/restart cycles)
compliance_percent = 100 * good / valid
```

## Error budgets

No production error budget is active. Run-scoped acceptance allowance follows
the percentile math only:

- p95 objective: up to 5% of valid samples may exceed the threshold, but no
  explicit correctness or integrity failure is excused.
- p99 objective with exactly 100 valid samples: at most one sample may exceed
  the threshold under nearest-rank evaluation; the exact evaluator remains
  authoritative.
- readiness and correctness gates: zero failed required cycles/cells.

These allowances do not authorize a release while any mandatory live,
security, coverage, audit, or environment prerequisite remains BLOCKED.

## Production SLO admission gate

Production SLOs remain `TBD` until all of the following are approved:

1. production-like topology and traffic model;
2. at least two to four weeks of representative, trustworthy telemetry;
3. service owner, business owner, measurement edge, exclusions, and dependency
   policy;
4. 30-day rolling availability and latency targets below observed baseline;
5. error-budget and multi-window burn-rate policy;
6. paging channel, escalation path, retention/privacy policy, and runbooks.

No 99.9%, RTO, RPO beyond the approved local-volume proof, or contractual SLA
is asserted here.

## Validation state

Metric availability: **UNOBSERVED**.  
Objective evaluation: **NOT RUN**.  
Reason: **NO DEPLOYED CANDIDATE**.

