# W2-03 Cost and Efficiency Analysis

## Reporting status and source evidence

Status: **NO MEASURED COST DATA; NO CLOUD COST ANALYSIS**.

This analysis consumes `dashboards`, `alarms`, `slo-config`,
`deployment-log`, `load-test-results`, and `incident-plan`. No candidate,
production environment, AWS account/resource, billing export, runtime
utilization series, or incident-toil record exists. AWS Cost Explorer,
Compute Optimizer, Cost Anomaly Detection, and Trusted Advisor were not called.

## Current cost ledger

| Cost dimension | Actual | Confidence |
|---|---:|---|
| AWS/cloud spend | N/A - no approved cloud resources | high |
| local host compute allocation | unknown | none |
| local database/storage allocation | unknown | none |
| CI runner time/cost | unknown | none |
| acceptance run duration | not run | high |
| observability storage/query cost | not installed | high |
| cost per pricing/Booking transaction | not computable | high |
| incident/on-call toil | no activated incident process | high |

“No approved cloud resources” is not the same as zero total engineering or
host cost.

## Measurement model for the next run

Capture per immutable candidate/run:

- wall-clock setup, warm-up, measured load, teardown, and blocked retry time;
- host/container CPU-seconds and memory GiB-seconds by service;
- database runtime, storage bytes, backup/restore bytes, and I/O where
  available;
- evidence/log/trace/screenshot bytes retained and discarded;
- CI runner minutes and artifact transfer/storage;
- successful terminal pricing/Booking operations and valid measured samples;
- manual intervention minutes and incident/toil minutes.

Derived metrics:

```text
cost_per_acceptance_run =
  compute + database + storage + CI + observability + operator_time

cost_per_valid_terminal =
  cost_per_acceptance_run / valid_pricing_and_booking_terminals

blocked_cost_ratio =
  cost_spent_before_BLOCKED / total_run_cost
```

These formulas remain inactive until local/accounting rates and measured usage
are supplied.

## Evidence-first efficiency opportunities

Priority is reducing failed/blocked execution toil, not infrastructure
right-sizing:

1. make frontend process execution deterministic for Vitest/build;
2. make approved Booking dependencies immutably available to offline/CI Maven;
3. restore Docker/wrapper and manager-guard capability;
4. restore the locked native evidence writer;
5. fail preflight before fixture/deployment work when any prerequisite is
   absent;
6. install bounded metrics/traces only after a candidate exists;
7. retain streaming evidence within declared caps and avoid stale-run reuse.

Expected savings are not quantified because no frequency, duration, labor
rate, or resource usage was measured.

## AWS platform admission

If a later approved intent chooses AWS, cost analysis must first define:

- workload topology, region, environments, traffic, data growth, availability,
  and retention;
- service/IAM/network/database/observability architecture as code;
- cost allocation tags, budgets, billing export, owners, and forecast method;
- on-demand baseline before commitments, right-sizing, Graviton, Savings
  Plans, Spot, or storage lifecycle recommendations;
- reliability/security implications of every optimization.

No AWS service, instance size, region, discount, monthly amount, or savings
percentage is recommended for W2-03 now.

## Toil register

| Toil candidate | Evidence today | Proposed next measurement |
|---|---|---|
| repeated blocked preflights | blockers recorded, frequency unknown | count attempts and minutes to terminal preflight |
| manual evidence reconciliation | writer blocked, no run | count artifacts, recovery actions, and operator minutes |
| dependency cache repair | Booking dependency unavailable | count failed builds and restore time |
| manual dashboard/result assembly | dashboards not installed | compare automated versus manual report time after first run |
| incident coordination | plan unactivated | measure acknowledgement/update/recovery time during exercise |

Automation priority follows measured frequency x duration x risk after the
first valid run.

## Conclusion

Current cost and optimization savings are **UNKNOWN/UNMEASURED**. The only
evidence-backed recommendation is to remove release-evidence blockers before
right-sizing or cloud commitments.

