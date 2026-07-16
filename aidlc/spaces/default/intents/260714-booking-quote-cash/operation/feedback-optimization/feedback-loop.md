# Feedback Loop - W1-01

## Operational Feedback

| Finding | Evidence | Feed-forward action |
|---|---|---|
| W1 source and test gates are substantially ready, but live proof remains blocked | `deployment-log.md`, `load-test-results.md` | Treat Docker image access as the next operational prerequisite before merge/release claim. |
| Observability source coverage exists for Booking, CMM, and Charge | `dashboards.md`, `alarms.md`, `slo-config.md` | Verify runtime metrics after full Compose starts. |
| Performance evidence is planned but not measured | `load-test-results.md` | Run the full workloads after image access is fixed and update the matrix with actual values. |
| Incident response now prevents accidental downgrade of release gates | `incident-plan.md` | Use direct probes only for diagnostics; keep nginx/full-harness gates authoritative. |
| Production baselines are deferred | `slo-config.md` | After any production-like environment exists, collect 2 to 4 weeks of data before setting production SLOs. |

## Next Iteration Inputs

1. Make Docker image availability deterministic for the full observability profile.
2. Rerun `node scripts/w1-live-acceptance.mjs --run-id <new-id>`.
3. Confirm the manifest is PASS and detector outputs are reviewed.
4. Add measured performance values to `nfr-validation-matrix.md` and this feedback pack.
5. Revisit whether Kibana is required for W1 live proof or can be optional if Grafana/Prometheus/OTel evidence is sufficient and the contract is updated.

## Toil Reduction

Automate a pre-pull/cache check for heavyweight observability images before the expensive full acceptance run. Add a clear preflight failure if Docker cannot reach `docker.elastic.co`, so future runs fail before partially starting the stack.

## Source Coverage

This feedback loop consumes `dashboards.md`, `alarms.md`, `slo-config.md`, `deployment-log.md`, `load-test-results.md`, and `incident-plan.md`.
