# CI Quality Gates — W2-02 Design-System Closure

## Gate inventory

This gate set derives from `booking-design-system-closure/code-generation/code-summary.md`, `build-and-test/build-and-test-summary.md`, and `build-and-test/build-test-results.md`.

| Gate | CI enforcement | Pass criterion |
|---|---|---|
| Toolchain | Blocking | Java 21, Node 24, Docker Compose, Bun, Bash, and ripgrep commands all exit zero |
| Dependency integrity | Blocking | `corepack yarn install --immutable` exits zero |
| Backend | Blocking | Maven service tests exit zero |
| Shared packages | Blocking | Auth, shared-types, and UI tests/typecheck/lint exit zero; UI build exits zero |
| W2-02 presentation | Blocking | Anti-drift scan exits zero |
| W2-02 harness | Blocking | All registered helper tests pass (57/57 at Build and Test completion) |
| Local auth-state safety | Blocking | Bun auth-state tests pass; non-local and protected targets remain rejected |
| Browser source shape | Blocking | Playwright config/spec TypeScript compilation exits zero |
| Booking and Shell | Blocking | Test/typecheck/lint and production builds exit zero |
| Compose descriptor | Blocking | Static Compose configuration validates |
| Existing evidence tooling | Blocking | W1 dry-run, W2-01 package validation, quality aggregation, and readiness commands retain their truthful statuses |
| Mechanical audits | Blocking step execution | Both detector scripts execute with Bash/ripgrep and their direct pipelines exit zero; output remains advisory leads |
| Evidence retention | Always-run | Expected non-secret artifacts upload with 14-day retention |

## Manual release-evidence gate

CI green is necessary but insufficient for W2-02 closure. Reviewers must also inspect the canonical live manifest recorded by `build-and-test/build-test-results.md` and confirm:

- exact `linercore-wave-a` ownership and cleanup;
- manager guards before and after acceptance;
- 98/98 Playwright cases with 98 records and screenshots;
- accessibility, keyboard, responsive, theme, error, and authenticated journey evidence;
- sanitized successful mutation trace;
- `aidlc-audit` and `erp-fidelity-audit` direct PASS records;
- immutable terminal status `COMPLETED` and manifest validation.

The accepted formal run is `20260730074058-9adef85fd5de-32c59c26`. A later source change invalidating its workspace identity requires a new Build and Test proof rather than relabelling this run.

## Failure semantics

No CI failure is waived into PASS. Tool unavailability, runner permission errors, missing artifacts, and Compose limitations are BLOCKED or FAILED according to the producing command. The audit scripts report mechanical leads; a zero exit proves execution, not that every lead is a defect or that the repository is security-complete.

The historical W1 live-proof state remains **BLOCKED/WAIVED**. W2-02 deterministic or live evidence cannot rewrite it as a real PASS.

## Explicit non-gates

No CI claim is made for a coverage percentage, SAST, dependency vulnerability scan, secret scanner, SBOM, DAST, image scanner, staging deployment, production deployment, external registry, rollback automation, branch-protection configuration, SLA, capacity, load, soak, or stress result. These require executable evidence or later Operation-stage decisions.
