# CI Config - W2-01 App Shell and Auth

## Upstream Inputs

This CI configuration consumes all W2-01 unit code summaries under `construction/*/code-generation/code-summary.md`, plus `construction/build-and-test/build-and-test-summary.md` and `construction/build-and-test/build-test-results.md`.

The configuration preserves prior merged work from W0-01, W0-02, W1-01, and W2-02. It extends the established program workflow rather than replacing it.

## Workflow File

Updated workflow:

```text
.github/workflows/quality-gates.yml
```

The workflow remains named `Quality Gates`; the job is now `Program quality gates` because it covers W1 and W2 surfaces.

## Triggers

| Event | Branches |
| --- | --- |
| `pull_request` | `main`, `integ/main-reconciled` |
| `push` | `main`, `integ/main-reconciled` |
| `workflow_dispatch` | manual run |

## Runner And Environment

| Setting | Value |
| --- | --- |
| Runner | `self-hosted`, `on-prem`, `linux` |
| Timeout | 60 minutes |
| Java | Temurin 21 |
| Package manager | Corepack Yarn |
| `POSTGRES_HOST_PORT` | `55432` |
| `GRAFANA_HOST_PORT` | `3003` |
| `MESSAGING_REQUIRE_REAL` | `true` |

## Pipeline Steps

| Step | Command or action |
| --- | --- |
| Checkout | `actions/checkout@v4` |
| Java setup | `actions/setup-java@v4`, Temurin 21, Maven cache |
| Yarn setup | `corepack enable`, `corepack yarn install --immutable` |
| Backend tests | `mvn -f services/pom.xml -q test` |
| Workspace script tests | `node --test scripts/w1-live-acceptance.test.mjs scripts/w2-01-live-acceptance.test.mjs scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs` |
| Shared auth package | `@erp/auth` test, typecheck, lint |
| Shared types package | `@erp/shared-types` test, typecheck, lint |
| Auth frontend | `@erp/app-auth` test, typecheck, lint |
| Booking frontend | `@erp/app-booking` test, typecheck, lint, build |
| Shell frontend | `@erp/app-shell` test, typecheck, lint, build |
| Compose static validation | `docker compose config --quiet` |
| W1 dry-run evidence | `node scripts/w1-live-acceptance.mjs --dry-run --run-id ci-dry-run` |
| W2-01 live evidence package | `node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth` then schema validation without `--require-pass` |
| Gate aggregator | `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json`; this enforces W2-01 `--require-pass` |
| Readiness evidence | `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` runs with `if: always()` |
| Audit detectors | `mkdir -p artifacts/quality-gates && bash .claude/skills/.../detectors.sh | tee artifacts/quality-gates/*.txt`; both run with `if: always()` so blocked-live evidence still includes detector output |
| Evidence upload | `actions/upload-artifact@v4` uploads quality, readiness, W1 dry-run, W2-01 evidence package, and detector artifacts |

## Aggregator Update

Updated files:

```text
scripts/run-quality-gates.mjs
scripts/run-quality-gates.test.mjs
docs/quality-gates.md
```

The aggregator now classifies and gates:

| Scope | Required gates |
| --- | --- |
| `packages/auth` | test, typecheck, lint |
| `packages/shared-types` | test, typecheck, lint |
| `apps/auth` | test, typecheck, lint, build |
| `apps/booking` | test, typecheck, lint, build |
| `apps/shell` | test, typecheck, lint, build |
| `w2-01-live` | W2-01 evidence generation plus `--validate --require-pass` |

## Blocking Runtime Requirements

The code gates are green locally, but W2-01 final acceptance remains blocked until:

- Docker can pull or use cached `docker.elastic.co/elasticsearch/elasticsearch:8.16.1` and start the full Compose profile.
- Live Nginx/Keycloak browser scenarios populate `artifacts/w2-01-live/app-shell-auth/` with PASS scenarios.
- `erp-fidelity-audit` and `aidlc-audit` run under Bash and exit `0`.

W1-01 live-proof waiver remains BLOCKED at compose-start; it is not rewritten as a W2-01 PASS.

## Non-Goals

- No deployment promotion, rollback, production release, Docker image publish, Maven publish, or npm publish is introduced here.
- No umbrella redesign is introduced; this is a vertical app-shell/auth intent over the existing program workflow.
