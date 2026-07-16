# Deployment Log - W1-01

## Upstream Inputs

Deployment execution consumed `operation/deployment-pipeline/cd-config.md`, `operation/deployment-pipeline/deployment-strategy.md`, `operation/environment-provisioning/environment-inventory.md`, and `construction/build-and-test/build-test-results.md`.

## Deployment Attempt

| Field | Value |
|---|---|
| Run ID | `operation-deployment-execution` |
| Command | `node scripts/w1-live-acceptance.mjs --run-id operation-deployment-execution` |
| Evidence directory | `artifacts/w1-01-live/operation-deployment-execution/` |
| Result | BLOCKED |

## Gate Results

| Gate | Status | Evidence |
|---|---|---|
| preflight | PASS | `artifacts/w1-01-live/operation-deployment-execution/preflight/preflight.txt` |
| compose-config | PASS | `artifacts/w1-01-live/operation-deployment-execution/compose/compose-config.txt` |
| compose-start | BLOCKED | `artifacts/w1-01-live/operation-deployment-execution/compose/compose-start.txt` |
| contracts | SKIPPED | skipped after blocking gate |
| seed-dry-run | SKIPPED | skipped after blocking gate |
| seed-live | SKIPPED | skipped after blocking gate |
| booking-ui-health | SKIPPED | skipped after blocking gate |
| replay-restart | SKIPPED | skipped after blocking gate |
| quality-gates | SKIPPED | skipped after blocking gate |
| aidlc-audit | SKIPPED | skipped after blocking gate |
| erp-fidelity-audit | SKIPPED | skipped after blocking gate |

## Blocker

Docker failed to resolve:

```text
docker.elastic.co/kibana/kibana:8.16.1
```

The retained output says Docker Desktop had no HTTPS proxy path and the direct connection to `docker.elastic.co:443` timed out. Elasticsearch, OTel Collector, Grafana, Jaeger, and Prometheus pulls were interrupted after the Kibana failure.

## Deployment Decision

Deployment execution is not passed. The stage produced a retained `BLOCKED` evidence run and no release tag or release-complete claim.

## Cleanup Status

The blocked pull did not prove the full stack. A prior partial local app stack is still running from earlier work, but it is not treated as the deployment output for this run.
