# Build and Test Summary — W2-02 Design-System Closure

## Outcome

Build and Test is complete and ready for its approval gate. Formal attempt 36, run `20260730074058-9adef85fd5de-32c59c26`, reached immutable terminal status `COMPLETED` on 2026-07-30. Its evidence manifest independently validates, all 98 required Playwright cases passed, all 98 case records and screenshots exist, the isolated Wave A stack was cleaned, and the protected manager guard passed after the run.

The stage consumes `booking-design-system-closure/code-generation/code-generation-plan.md` and `booking-design-system-closure/code-generation/code-summary.md`. The protected baseline remains `c2f13dd`; acceptance targeted only `linercore-wave-a` at `http://127.0.0.1:18088`. The manager project `linercore-shared-platform` at port 8088 was guard-only and was never the acceptance target.

## Executed evidence

| Area | Status | Evidence |
|---|---|---|
| Formal lineage | PASS | Sequence 36 is an immutable rerun of failed sequence 35 and published terminal `COMPLETED` with payload SHA-256 `7103d3695b030c797ab8f52bedcf2cc15a68cd648271df92776f0d0074e47b76` |
| Browser acceptance | PASS | Playwright expected 98, unexpected 0, skipped 0, flaky 0; duration 289,117.798 ms |
| Exact artifacts | PASS | 98 case records and 98 screenshots; successful mutation trace sanitized and promoted by the terminal-last transaction |
| Lifecycle safety | PASS | Empty pre-existing Wave A ownership, exact config, startup/readiness/status, wrapper-owned cleanup, and post-cleanup absence all validated |
| Protected manager | PASS | Post-run `npm run demo:guard`: 21 containers, 21 services, routes 200/308/301/301 |
| `aidlc-audit` | PASS | Direct exit 0; read-only Docker/Bash/ripgrep execution; output retained as advisory leads |
| `erp-fidelity-audit` | PASS | Direct exit 0; read-only Docker/Bash/ripgrep execution; output retained as advisory leads |
| Evidence envelope | PASS | `node scripts/w2-02-evidence.mjs <run>/manifest.json` validated the canonical terminal-last manifest |
| Harness regression | PASS | `corepack yarn w2-02:test:scripts`: 57/57 |
| Presentation anti-drift | PASS | Full `apps/**` scan passed with reviewed baseline fingerprints |
| Diff hygiene | PASS | `git diff --check` found no whitespace errors; Windows emitted line-ending conversion warnings only |

## Corrections proven by the final run

The constrained Docker runtime now uses single-worker Next builds, a hash-verified offline Linux dependency image, serialized image creation, and an explicit verified-prebuilt startup mode. The stale post-browser guard defect was corrected so an already fresh, permit-bound pre-browser guard is not invalidated merely because the complete 98-case suite runs longer than five minutes.

Windows no longer depends on the broken WSL `bash.exe` shim for the two required audits. The runner executes the unchanged detectors against a read-only workspace bind using `linercore/w2-02-audit-tools:1`, built from `infrastructure/docker/w2-02-audit-tools.Dockerfile` with GNU Bash and ripgrep. Generated dependency/evidence directories are excluded from detector traversal; source, contracts, docs, and application code remain in scope.

## Scope and non-claims

The 98 cases prove the W2-02 route/theme/viewport/state matrix, authenticated shell journeys, accessibility assertions, responsive layout, keyboard behavior, causal SSR control, error states, and successful mutation evidence required by this intent. The audit outputs are mechanical leads, not standalone defect verdicts; their zero exits prove execution, not the absence of future program work.

No load, soak, stress, production-capacity, SAST-product, dependency-CVE, SBOM, DAST, image-scanner, TLS/cipher, regulatory, or certification result is claimed. The historical W1 live-proof state remains **BLOCKED/WAIVED**, never PASS, and is not used as W2-02 evidence.

## Approval readiness

No Build and Test execution item remains pending. The next workflow action is the stage approval gate; after approval, the engine may advance to CI Pipeline.
