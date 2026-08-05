# Quality Gates - W1-01 CI

## Upstream Inputs

Gate definitions are derived from `construction/*/code-generation/code-summary.md`, `construction/build-and-test/build-and-test-summary.md`, and `construction/build-and-test/build-test-results.md`. The CI pipeline mirrors the passing local evidence from Build and Test and adds Booking path awareness to the quality-gate aggregator.

## Required PR Gates

| Gate | Blocking criterion |
|---|---|
| Backend Maven suite | `mvn -f services/pom.xml -q test` exits `0` |
| Workspace script tests | Node test runner exits `0` for live-acceptance, replay/restart, readiness, quality-gates, and seed tooling tests |
| Booking frontend test | `@erp/app-booking test` exits `0` |
| Booking frontend typecheck | `@erp/app-booking typecheck` exits `0` |
| Booking frontend lint | `@erp/app-booking lint` exits `0` |
| Booking frontend build | `@erp/app-booking build` exits `0` and emits Booking/BFF routes |
| Compose static validation | `docker compose config --quiet` exits `0` |
| W1 live acceptance dry run | `node scripts/w1-live-acceptance.mjs --dry-run --run-id ci-dry-run` writes planned evidence |
| Quality gate aggregator | `node scripts/run-quality-gates.mjs --all` exits `0` |
| Local readiness evidence | command runs even on prior failure and uploads evidence |
| AI-DLC audit detector | detector script exits `0`; LEADS require review |
| ERP fidelity detector | detector script exits `0`; LEADS require review |

## Release Gate

The release gate remains stricter than PR CI:

```powershell
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

This must run on a Docker host with required images available and must drive the real quote-to-cash flow before W1-01 is considered release-complete. A dry run in CI proves the harness shape, not the runtime journey.

## Evidence Artifacts

| Artifact | Purpose |
|---|---|
| `artifacts/quality-gates/evidence.json` | Aggregated gate result matrix |
| `artifacts/readiness/local-readiness.json` | Local readiness status |
| `artifacts/contracts-live-verification.json` | Contract verification evidence when produced |
| `artifacts/seed-apply-attempt.json` | Seed attempt evidence when produced |
| `artifacts/w1-01-live/ci-dry-run/**` | CI live-acceptance dry-run manifest and index |
| `artifacts/quality-gates/aidlc-audit.txt` | AI-DLC detector LEADS |
| `artifacts/quality-gates/erp-fidelity-audit.txt` | ERP fidelity detector LEADS |

## Security And Compliance Gaps

These are not yet automated in the repository:

- SAST rules for Java and TypeScript.
- Dependency vulnerability scanning for Maven and Yarn.
- Secret scanning.
- Container image scanning.
- DAST against the running local stack.

The current CI pipeline should not be described as security-complete until those gates are implemented or explicitly accepted as out of scope.
