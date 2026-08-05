# W2-04 Cost Analysis

## Verdict

**Status: NO DEPLOYED COST BASELINE / OPTIMIZATION DEFERRED.**

The approved topology is portable local Compose and adds no AWS resource.
There is no provisioned staging or production target, AWS account/resource
inventory, billing window, workload volume, or utilization series attributable
to this intent. AWS Cost Explorer and Trusted Advisor findings are therefore
**not applicable**, not zero-cost results.

## Evidence Basis

This analysis uses `dashboards`, `alarms`, `slo-config`, `deployment-log`,
`load-test-results`, and `incident-plan`.

- `deployment-log` confirms that nothing was deployed or promoted.
- `load-test-results` contains no CPU, memory, database-pool, Kafka-lag,
  throughput, or saturation measurements.
- `dashboards` and `alarms` describe the measurements needed but are not
  activated.
- `slo-config` prohibits deriving production capacity or cost commitments from
  local acceptance evidence.
- `incident-plan` has no production ownership, backup, recovery, or response
  cost model.

## Read-Only Local Observation

The final snapshot found only the protected 15-service
`linercore-shared-platform` project running. The isolated
`linercore-wave-a` project was absent. Newly built mutable `wave-a` images
existed, with backend image listings around 0.5 GB and frontend image listings
around 2.3 GB each, but Docker reported no unique-size accounting. These are
virtual local image sizes with shared layers; they are neither additive storage
cost nor runtime-resource cost.

No manager, Wave A, image, volume, network, database, or cloud resource was
changed during this analysis.

## Optimization Opportunities

| Opportunity | Evidence needed first | Decision |
|---|---|---|
| Frontend image-size reduction | Digest-bound unique/compressed sizes and build reproducibility | Measure after release manifest exists |
| JVM image right-sizing | `docker stats` or target CPU/RSS during approved populations | Do not tune from idle image metadata |
| Kafka/PostgreSQL sizing | Lag, I/O, pool, storage-growth, and recovery telemetry | Defer |
| Telemetry retention tuning | Actual metric/log/trace volume and retention policy | Defer |
| Idle environment scheduling | Approved non-production availability requirements | Defer |
| AWS reservations/Savings Plans | Stable AWS workload and billing history | Not applicable |

Premature resource reduction could invalidate the already-unrun performance and
recovery gates. Correctness, isolation, and evidence integrity take priority
over speculative savings.

## Required Cost Baseline

After an immutable candidate can run in an owned isolated target, capture:

1. candidate digests and compressed/unique image sizes;
2. CPU, RSS, storage, network, database-pool, and Kafka-lag series for every
   approved population;
3. telemetry volume and retention assumptions;
4. environment hours and workload units;
5. if AWS is later approved, tagged Cost Explorer data and applicable Trusted
   Advisor recommendations.

Only then should the team set a cost-per-acceptance-run or cost-per-business-
journey baseline and evaluate optimizations.
