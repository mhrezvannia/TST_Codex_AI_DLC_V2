# CI Config - W1-01

## Upstream Inputs

This CI configuration consumes `construction/*/code-generation/code-summary.md`, `construction/build-and-test/build-and-test-summary.md`, and `construction/build-and-test/build-test-results.md`. It codifies the green local gates from Build and Test while preserving the documented live-runtime blocker as a release gate.

## Workflow File

Updated workflow:

```text
.github/workflows/quality-gates.yml
```

The workflow now runs as `Quality Gates` with job name `W1 quality gates`.

## Triggers

| Event | Branches |
|---|---|
| `pull_request` | `main`, `integ/main-reconciled` |
| `push` | `main`, `integ/main-reconciled` |
| `workflow_dispatch` | manual run |

This matches the W1 short-lived intent branch flow while retaining the repository trunk trigger.

## Runner And Environment

| Setting | Value |
|---|---|
| Runner | `self-hosted`, `on-prem`, `linux` |
| Timeout | 60 minutes |
| Java | Temurin 21 |
| Package manager | Corepack Yarn |
| `POSTGRES_HOST_PORT` | `55432` |
| `GRAFANA_HOST_PORT` | `3003` |
| `MESSAGING_REQUIRE_REAL` | `true` |

## Pipeline Steps

| Step | Command or action |
|---|---|
| Checkout | `actions/checkout@v4` |
| Java setup | `actions/setup-java@v4`, Temurin 21, Maven cache |
| Yarn setup | `corepack enable`, `corepack yarn install --immutable` |
| Backend tests | `mvn -f services/pom.xml -q test` |
| Script tests | `node --test scripts/w1-live-acceptance.test.mjs scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs` |
| Booking frontend | test, typecheck, lint, build through `corepack yarn workspace @erp/app-booking ...` |
| Compose static validation | `docker compose config --quiet` |
| W1 dry-run evidence | `node scripts/w1-live-acceptance.mjs --dry-run --run-id ci-dry-run` |
| Gate aggregator | `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json` |
| Readiness evidence | `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` |
| Audit detectors | `bash .claude/skills/aidlc-audit/detectors.sh`, `bash .claude/skills/erp-fidelity-audit/detectors.sh` |
| Evidence upload | `actions/upload-artifact@v4` uploads quality, readiness, contract, seed, W1 dry-run, and detector artifacts |

## Aggregator Update

Updated files:

```text
scripts/run-quality-gates.mjs
scripts/run-quality-gates.test.mjs
```

The aggregator now classifies `apps/booking/**` changes and includes required Booking app gates:

| Gate | Command |
|---|---|
| `frontend-booking-test` | `corepack yarn workspace @erp/app-booking test` |
| `frontend-booking-typecheck` | `corepack yarn workspace @erp/app-booking typecheck` |
| `frontend-booking-lint` | `corepack yarn workspace @erp/app-booking lint` |
| `frontend-booking-build` | `corepack yarn workspace @erp/app-booking build` |

## Non-Goals

- This CI stage does not publish Docker images, Maven packages, npm packages, or production release artifacts.
- This CI stage does not claim full live acceptance. The retained live evidence remains blocked until Docker can pull or cache the full runtime image set.
- Deployment promotion, rollback, and production approval belong to Operation stages.
