# Deployment Log - W2-01 App Shell and Auth

## Upstream Inputs

This deployment log consumes `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Execution Summary

| Item | Status | Detail |
| --- | --- | --- |
| Deployment target | Local/on-prem Compose/Nginx proof stack | Defined by `deployment-strategy` and `environment-inventory` |
| Pre-deployment code gates | PASS | `build-test-results` records frontend/shared/backend targeted suites passing |
| Compose static validation | PASS | `docker compose config --quiet` passes |
| W2 application runtime | PASS | Isolated `linercore-w2-01` app profile is running through Nginx on `127.0.0.1:8088` |
| Observability base runtime | PASS with telemetry gap | Official Elastic 8.16.1 images plus Prometheus, Grafana, Jaeger, and OTel Collector are running; application scrape targets remain down |
| Database migrations | NOT REQUIRED | No W2-01 schema migration declared |
| Evidence package | PASS | Runtime, all four browser scenarios, detector 6d, and both required audits PASS |
| Audit detectors | PASS | Git Bash was selected explicitly on Windows; both detector scripts exited `0` |

## Commands

| Command | Status | Notes |
| --- | --- | --- |
| `corepack yarn install --immutable` | NOT RUN in this stage | Previously satisfied for local test work |
| `mvn -f services/pom.xml -q test` | NOT RERUN in this stage | Targeted Maven tests passed in Build and Test; full Maven workflow is CI-owned |
| `docker compose config --quiet` | PASS | Revalidated during CI/environment stages |
| `docker compose --profile app up -d --no-build` | PASS | Existing app images restored after Docker Desktop restart; no volume reset |
| `docker compose --profile observability up -d --no-build ...` | PASS | Uses alternate local host ports for Windows-reserved OTLP/Kibana ports; container ports remain canonical |
| `node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth` | PASS | Runtime, browser scenarios, detector 6d, `erp-fidelity-audit`, and `aidlc-audit` all PASS |
| `node scripts/w2-01-live-acceptance.mjs --validate --require-pass --output-root artifacts/w2-01-live/app-shell-auth` | PASS | Evidence package is internally consistent and contains no stale blocker rows |

## Observed Runtime

Elasticsearch reports a green one-node cluster on `9200`; Kibana reports available on alternate host port `15601`. Prometheus, Grafana, Jaeger, and OTel Collector are running. W2 browser evidence proves login, Booking create/validate/price/confirm, denied access, compatibility redirects, and sign-out with the real subject.

The W1 runner was rerun after images became available. Its preflight and Compose config passed, but the hard-coded `--build` command timed out after five minutes transferring large local contexts. The W1 waiver remains BLOCKED and is not rewritten as PASS.

## Decision

Local deployment execution and W2-01 release acceptance succeeded. Production deployment remains out of scope, and application telemetry ingestion remains an observability follow-up.
