# CI Configuration - Shared Platform MVP

## Upstream Trace

This CI configuration consumes:

| Upstream artifact | CI usage |
| --- | --- |
| Per-unit `code-summary` files from `construction/U01-*` through `construction/U10-*` | Defines the buildable apps, packages, backend services, contracts, seeds, Compose descriptors, and observability descriptors that CI must validate. |
| `construction/build-and-test/build-and-test-summary.md` | Defines the passed local checks and the remaining backend Maven environment limitation. |
| `construction/build-and-test/build-test-results.md` | Defines exact commands, pass/fail evidence, and the `backend-test` Maven blocker that CI must resolve on a Java/Maven runner. |

## Pipeline Platform

The MVP CI platform is GitHub Actions with the existing workflow:

```text
.github/workflows/quality-gates.yml
```

The workflow is intentionally constrained to self-hosted on-prem Linux runners:

```yaml
runs-on: [self-hosted, on-prem, linux]
```

Triggers:

| Trigger | Purpose |
| --- | --- |
| `pull_request` to `main` | Merge-blocking CI for trunk-based development. |
| `workflow_dispatch` | Manual rerun for release, audit, or recovery checks. |

The branch model is trunk-based development on `main` with short-lived feature or Bolt branches and squash merge, as recorded in team memory.

## Pipeline Steps

| Step | Purpose |
| --- | --- |
| Checkout | Fetch source for validation. |
| Setup Java 21 | Provides backend Maven runtime required by `backend-test`. |
| Enable Corepack | Activates the committed Yarn 4 package manager. |
| Install frontend dependencies | Runs `corepack yarn install --immutable`. |
| Run quality gate aggregator | Runs `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json`. |
| Upload quality evidence | Uploads `artifacts/quality-gates/evidence.json` even when gates fail. |

## Environment Contract

The self-hosted runner must provide:

| Tool | Required for |
| --- | --- |
| Node.js | Gate runner, validators, Vitest, Next.js, TypeScript, ESLint. |
| Corepack/Yarn 4.5.3 | Workspace dependency install and app typechecks. |
| Java 21 | Backend service tests. |
| Maven 3.9+ | `mvn -f services/pom.xml test`. |
| Docker Compose v2 | Descriptor validation and future local integration expansion. |

## Evidence and Retention

CI produces one canonical evidence file:

```text
artifacts/quality-gates/evidence.json
```

The file contains gate id, scope, command, required status, result status, summary, and per-gate log path. It should be retained as a GitHub Actions artifact for every run, including failed runs.

## Current Readiness

The pipeline config is ready for PR gating once the self-hosted runner has Java 21 and Maven. Local build-and-test evidence shows all non-Maven gates passing, while `backend-test` fails locally only because `mvn` is unavailable.
