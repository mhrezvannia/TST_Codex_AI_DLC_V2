# Build Test Results - W1-01

## Run Context

| Field | Value |
|---|---|
| Date | 2026-07-16 |
| Worktree | `D:\TST_Codex_W1-01` |
| Branch | `intent/W1-01-booking-quote-to-cash` |
| AI-DLC stage | `build-and-test` |
| Upstream artifacts | `construction/*/code-generation/code-generation-plan.md`, `construction/*/code-generation/code-summary.md` |

## Command Results

| Command | Result | Notes |
|---|---|---|
| `mvn -o -q test` from `services/` | PASS | 38 Surefire XML reports, 156 tests, 0 failures, 0 errors, 0 skipped |
| `node --test scripts/w1-live-acceptance.test.mjs scripts/replay-restart-proof.test.mjs scripts/local-readiness.test.mjs scripts/run-quality-gates.test.mjs scripts/seed-local.test.mjs` | PASS | 27 tests |
| `yarn workspace @erp/app-booking test` | PASS | 5 files, 15 tests |
| `yarn workspace @erp/app-booking typecheck` | PASS | no TypeScript errors |
| `yarn workspace @erp/app-booking lint` | PASS | no ESLint warnings or errors; Next lint deprecation warning only |
| `yarn workspace @erp/app-booking build` | PASS | routes emitted for Booking pages and BFF APIs |
| `docker compose config --quiet` | PASS | static Compose descriptor valid |
| `git diff --check` | PASS | CRLF conversion warnings only |
| `C:\Program Files\Git\bin\bash.exe .claude/skills/aidlc-audit/detectors.sh` | PASS | exit 0; LEADS output requires manual review |
| `C:\Program Files\Git\bin\bash.exe .claude/skills/erp-fidelity-audit/detectors.sh` | PASS | exit 0; LEADS output requires manual review |

## Failure Details

No deterministic build or test command failed in the final run.

Earlier detector attempts through plain `bash` failed because the Windows PATH resolved `C:\WINDOWS\system32\bash.exe`, which relayed to a WSL install without `/bin/bash`. Re-running through Git Bash succeeded.

## Live Runtime Status

The retained full live acceptance evidence from code-generation remains:

| Evidence | Status |
|---|---|
| `artifacts/w1-01-live/codegen-dry-run/manifest.json` | PASS dry-run evidence |
| `artifacts/w1-01-live/codegen-live-blocked-image-pull/manifest.json` | BLOCKED at `compose-start` |

The current build-and-test stage did not relabel the blocked live run as passed. A successful release gate still requires rerunning:

```powershell
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

on a Docker host that can pull or already has the required Confluent/PostgreSQL/Elastic images.

## Coverage Summary

| Layer | Evidence |
|---|---|
| Unit | Java Surefire, Vitest, Node script unit tests |
| Integration | Maven service tests, Avro serde tests, Compose static validation, local readiness/script tests |
| Contract | Avro serde/mapper tests and contract fixtures exercised by Maven/script gates |
| Security | lint/typecheck, real/noop guard tests, audit/fidelity detector LEADS |
| E2E | Harness exists and records evidence; latest full live run is blocked, not passed |
