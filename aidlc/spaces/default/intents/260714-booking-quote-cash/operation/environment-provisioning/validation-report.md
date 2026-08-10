# Environment Validation Report - W1-01

## Upstream Inputs

Validation consumed unit `deployment-architecture`, unit `infrastructure-services`, and `operation/deployment-pipeline/cd-config.md`. The target environment is the local Compose stack, not AWS.

## Commands Run

| Command | Result | Evidence |
|---|---|---|
| `node --test scripts/local-readiness.test.mjs` | PASS | 9 tests |
| `node scripts/local-runtime.mjs plan --profile full --dry-run` | PASS | full runtime plan includes W1 services and corrected ports |
| `node scripts/w1-live-acceptance.mjs --preflight` | PASS | `status: PASS`, no failures |
| `docker compose config --quiet` | PASS | static Compose descriptor valid |

## Validation Findings

| Finding | Status | Resolution |
|---|---|---|
| Runtime metadata omitted W1 services | FIXED | Added Booking, Charge, CMM, W1 apps, and service identities to `infrastructure/runtime/profiles.json` |
| Runtime metadata reported PostgreSQL host port `5432` | FIXED | Updated metadata to `55432`, matching Compose and W1 preflight |
| Runtime metadata reported Grafana host port `3001` | FIXED | Updated metadata to `3003`, avoiding Booking app port `3001` |
| Full live startup | BLOCKED | Latest retained run is blocked by Docker image/proxy access to Elastic images |

## Security And Compliance Validation

| Control | Status |
|---|---|
| Non-default PostgreSQL host port | PASS |
| Real messaging requirement for live proof | PASS in preflight |
| Local-only service credentials | PASS for W1 local profile; not production secrets |
| AWS Secrets Manager / Parameter Store | NOT APPLICABLE for W1 local Compose |
| VPC / subnet / security group validation | NOT APPLICABLE for W1 local Compose |
| Evidence retention for blocked/failed runs | PASS by acceptance harness design |

## Environment Health

This stage did not start or mutate the full runtime. It validated descriptors and preflight only. Full environment health remains unproven until:

```powershell
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

passes on a Docker host that can pull or already cache the required images.

## Decision

The W1 environment definition is provision-ready for local Compose and metadata-consistent after correction. It is not release-proven until the full live acceptance run passes.
