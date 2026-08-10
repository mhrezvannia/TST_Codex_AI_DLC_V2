# CD Config - W1-01

## Upstream Inputs

This deployment pipeline consumes `construction/ci-pipeline/ci-config.md`, `construction/ci-pipeline/quality-gates.md`, each unit `infrastructure-design/deployment-architecture.md`, and each unit `infrastructure-design/cicd-pipeline.md`.

## Pipeline Type

W1-01 uses a continuous-delivery model, not continuous deployment. CI produces merge confidence and evidence artifacts, then a manually initiated release proof drives the local Compose stack.

## Promotion Flow

| Stage | Entry condition | Required command or action | Exit condition |
|---|---|---|---|
| PR CI | pull request to `main` or `integ/main-reconciled` | `.github/workflows/quality-gates.yml` | all required CI gates pass |
| Merge | approved short-lived W1 branch | squash merge to `integ/main-reconciled` | merge commit exists and CI remains green |
| Release proof | Docker host can pull or cache required images | `node scripts/w1-live-acceptance.mjs --run-id <new-id>` | manifest status `PASS` |
| Audit review | live run passed | review detector LEADS and evidence manifest | no blocking audit or ERP-fidelity finding remains |
| Release tag | evidence accepted | create release evidence commit/tag | tag references the accepted evidence |

## Required Environment

| Dependency | Requirement |
|---|---|
| Docker | Docker Desktop or compatible runtime with access to Confluent, PostgreSQL, and Elastic images |
| PostgreSQL host port | `55432`, not default `5432` |
| Kafka and Schema Registry | real adapters only; `MESSAGING_REQUIRE_REAL=true` |
| UI entry point | nginx on host port `8088` |
| Booking app | host port `3001` for direct local checks |
| Grafana | host port `3003` if observability profile is enabled |

## Release Command

```powershell
cd D:\TST_Codex_W1-01
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

The run writes an immutable evidence directory under:

```text
artifacts/w1-01-live/<new-id>/
```

## Blocked And Failed Runs

Blocked or failed runs are retained as evidence. Do not edit them into green status and do not reuse their run ID. Start a new run after the external blocker or defect is fixed.

## Artifact Handling

Release-safe artifacts:

- `manifest.json`
- `index.md`
- gate logs and redacted command outputs
- dry-run and live seed evidence
- replay/restart evidence
- audit detector outputs

Sensitive dumps, raw secrets, and unredacted traces must not be committed.

## Non-Goals

- No automatic production deployment.
- No Docker image publication from this stage.
- No cloud environment provisioning.
- No feature-flag platform setup.
