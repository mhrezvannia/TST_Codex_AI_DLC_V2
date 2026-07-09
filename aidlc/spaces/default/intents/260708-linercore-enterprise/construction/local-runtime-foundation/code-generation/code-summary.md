# Code Summary - local-runtime-foundation

## Implementation Summary

The `local-runtime-foundation` unit was implemented inline because the configured `aidlc-developer-agent` model mapping is unavailable in this Codex ChatGPT account.

The implementation makes the existing local runtime profile-aware and evidence-oriented without starting Docker or implementing domain behavior. It adds explicit Compose profiles, runtime metadata, a testable local runtime command surface, profile-aware readiness evidence, safer local environment validation, and broader local runtime tests.

## Files Created

| File | Purpose |
|---|---|
| `infrastructure/runtime/profiles.json` | Machine-readable runtime profile, port, service, and independent IDE mode metadata. |
| `scripts/local-runtime.mjs` | Profile-aware local runtime command planner/executor with dry-run support and local env validation. |

## Files Modified

| File | Change |
|---|---|
| `compose.yaml` | Added explicit `core`, `app`, `observability`, `devtools`, and `full` profiles; added `contract-devtools`; added deterministic shared network name. |
| `infrastructure/env/local.env.example` | Added local-only runtime mode, profile, auth bypass, host runtime, port, service URL, callback, and JWT defaults. |
| `scripts/check-local-prereqs.mjs` | Removed Node shell deprecation warning while preserving Windows `.cmd` fallback support. |
| `scripts/local-readiness.mjs` | Added profile selection, runtime plan metadata, readiness state, and per-service evidence statuses. |
| `scripts/local-readiness.test.mjs` | Added profile metadata, command generation, env safety, and profile evidence tests. |
| `scripts/smoke-local.mjs` | Updated profile checks for `app`, `core`, `devtools`, `observability`, and `full`. |
| `package.json` | Added `local:runtime` script for the runtime command surface. |

## Key Decisions

- Kept Docker startup out of code-generation verification; dry-run command generation and script tests verify deterministic behavior without requiring Docker Desktop.
- Represented `full` as all currently implemented local runtime services plus explicit evidence states, not as a false claim that future units are implemented.
- Added `devtools` as an optional profile with contract tooling support, not a readiness prerequisite.
- Preserved honest blocking behavior for unavailable Docker daemon and non-running service ports.

## Test Coverage Summary

Comprehensive local runtime tests now cover:

- blocked versus failed readiness classification;
- profile metadata for all required profiles;
- full profile service composition;
- start and health command generation;
- secret-safe local `.env.example` validation;
- selected-profile readiness evidence and service status output.

## Verification

| Command | Result |
|---|---|
| `node --test scripts/local-readiness.test.mjs` | Passed: 8 tests. |
| `node scripts/smoke-local.mjs` | Passed: Compose services, nginx routes, and required profiles present. |
| `node scripts/local-runtime.mjs plan --profile full --dry-run` | Passed: emitted full profile runtime plan. |
| `node scripts/local-runtime.mjs start --profile core --dry-run` | Passed: emitted `docker compose --profile core up -d --build`. |
| `node scripts/local-runtime.mjs reset --profile devtools --dry-run` | Passed: emitted scoped `docker compose --profile devtools down --volumes --remove-orphans`. |
| `node scripts/check-local-prereqs.mjs --json` | Expected blocked: Docker Desktop engine pipe is unavailable; Keycloak, identity, reference-data, nginx, Schema Registry, Kafka, and Grafana ports are not listening. |

## Deviations From Plan

- `yarn local:check:json` was replaced with the underlying `node scripts/check-local-prereqs.mjs --json` for useful output capture after Yarn returned only an exit code in this shell.
- Real `docker compose --profile full up -d --build` was not run because Docker Desktop is not reachable in the current environment.

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured architecture/developer subagent model mappings are not supported by the current Codex ChatGPT account.

Findings:

- The implementation stays inside local runtime foundation ownership and does not add domain behavior, migrations, or production cloud provisioning.
- Profiles now explicitly cover the approved `core`, `app`, `observability`, `devtools`, and `full` topology.
- Readiness evidence distinguishes blocked local prerequisites from failed tests and includes profile service status.
- Local env defaults are deterministic and visibly local-only.

Residual risks:

- A real Windows Docker startup pass remains for Build and Test once Docker Desktop is available.
- Later domain units must add their service containers, migrations, and readiness hooks without weakening the fail-closed readiness behavior.
