# Cost Analysis - W1-01

## Local Cost Signals

W1 has no AWS Cost Explorer or Trusted Advisor data because the deployment target is local Compose. The cost analysis therefore focuses on developer-machine time, disk, image pulls, and repeated evidence runs.

| Area | Cost driver | Recommendation |
|---|---|---|
| Observability images | Elasticsearch/Kibana/Grafana/Prometheus/Jaeger/OTel pulls are large and block if registry access fails | Pre-pull/cache required images before live proof; consider making Kibana optional only if the contract is updated. |
| Docker storage | Full stack plus evidence artifacts consume local disk | Keep failed evidence, but prune unrelated old images/volumes outside the W1 evidence path. |
| Repeated live runs | Each failed run takes time and creates artifacts | Run preflight and dry-run first; rerun full acceptance only after the root blocker is fixed. |
| Partial stack diagnostics | Direct probes can consume time while not closing gates | Use direct probes for triage, then return to the full acceptance harness. |

## Optimization Guardrails

Do not reduce cost by weakening `alarms.md`, deleting failed `deployment-log.md` evidence, bypassing `slo-config.md`, or replacing real Kafka with noop messaging. Cost improvements must preserve the full live-proof contract and the evidence integrity expected by `incident-plan.md`.

## Source Coverage

This cost analysis consumes `dashboards.md`, `alarms.md`, `slo-config.md`, `deployment-log.md`, `load-test-results.md`, and `incident-plan.md`.
