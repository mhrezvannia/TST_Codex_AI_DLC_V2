# Quality Gates - W2-01 App Shell and Auth

## Upstream Inputs

Gate definitions are derived from W2-01 unit code summaries, `build-and-test-summary.md`, `build-test-results.md`, `.github/workflows/quality-gates.yml`, and `docs/quality-gates.md`.

## Required PR Gates

| Gate | Blocking criterion |
| --- | --- |
| Backend Maven suite | `mvn -f services/pom.xml -q test` exits `0` on the CI runner |
| Workspace script tests | Node test runner exits `0` for W1, W2-01, replay/restart, readiness, quality-gates, and seed tooling tests |
| Shared auth package | `@erp/auth` test, typecheck, and lint exit `0` |
| Shared types package | `@erp/shared-types` test, typecheck, and lint exit `0` |
| Auth frontend | `@erp/app-auth` test, typecheck, and lint exit `0` |
| Booking frontend | `@erp/app-booking` test, typecheck, lint, and build exit `0` |
| Shell frontend | `@erp/app-shell` test, typecheck, lint, and build exit `0` |
| Compose static validation | `docker compose config --quiet` exits `0` |
| W1 live acceptance dry run | W1 dry-run writes evidence only; it remains a W1 waiver artifact, not W2-01 acceptance |
| W2-01 evidence package schema | Direct workflow step runs `node scripts/w2-01-live-acceptance.mjs --validate` to accept honest PASS or BLOCKED package shape |
| W2-01 final live acceptance | Aggregator gate `w2-01-live-acceptance` runs `node scripts/w2-01-live-acceptance.mjs --validate --require-pass` and exits `0` only when manifest `finalDecision=PASS` and `runtimeStatus=PASS` |
| Quality gate aggregator | `node scripts/run-quality-gates.mjs --all` exits `0` |
| Local readiness evidence | command runs with `if: always()` and uploads evidence for diagnosis |
| AI-DLC audit detector | `bash .claude/skills/aidlc-audit/detectors.sh` exits `0` |
| ERP fidelity detector | `bash .claude/skills/erp-fidelity-audit/detectors.sh` exits `0`, including detector 6d zero hardcoded-auth hits in mounted shell/Booking surfaces |

## Evidence Artifacts

| Artifact | Purpose |
| --- | --- |
| `artifacts/quality-gates/evidence.json` | Aggregated gate result matrix |
| `artifacts/readiness/local-readiness.json` | Local readiness status |
| `artifacts/contracts-live-verification.json` | Contract verification evidence when produced |
| `artifacts/seed-apply-attempt.json` | Seed attempt evidence when produced |
| `artifacts/w1-01-live/ci-dry-run/**` | W1 dry-run package; retained as W1 evidence only |
| `artifacts/w2-01-live/app-shell-auth/**` | W2-01 live acceptance package |
| `artifacts/quality-gates/aidlc-audit.txt` | AI-DLC detector output |
| `artifacts/quality-gates/erp-fidelity-audit.txt` | ERP fidelity detector output |

## Current Local Result

| Check | Status | Evidence |
| --- | --- | --- |
| `node --test scripts/w2-01-live-acceptance.test.mjs scripts/run-quality-gates.test.mjs` | PASS | 10 tests passed |
| `docker compose config --quiet` | PASS | Compose syntax is valid |
| `node scripts/w2-01-live-acceptance.mjs --dry-run ...` | PASS command, BLOCKED decision | Package generated for diagnosis |
| `node scripts/w2-01-live-acceptance.mjs --validate --require-pass ...` | FAIL as expected | Reports `manifest finalDecision must be PASS` and `manifest runtimeStatus must be PASS` |

## Runtime Blockers

- Full live Compose startup is blocked in this environment by Docker image pull/proxy access to `docker.elastic.co/elasticsearch/elasticsearch:8.16.1`.
- Bash-based `erp-fidelity-audit` and `aidlc-audit` were blocked locally because `/bin/bash` is unavailable through the current Windows/WSL relay.
- These blockers are W2-01 blockers. They are separate from W1-01's explicit `compose-start` waiver, which remains BLOCKED and is not a W2-01 PASS.

## Security And Compliance Gaps

- SAST, dependency vulnerability scanning, secret scanning, container scanning, and DAST are still not represented as first-class gates.
- W2-01 security acceptance is limited to session/actor fail-closed tests, detector 6d, audit detectors, leak scanning, and live browser evidence once runtime blockers clear.
