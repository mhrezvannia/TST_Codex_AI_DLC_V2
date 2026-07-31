# CI Configuration — W2-02 Design-System Closure

## Inputs and implementation

This configuration consumes `booking-design-system-closure/code-generation/code-summary.md`, `build-and-test/build-and-test-summary.md`, and `build-and-test/build-test-results.md`. The implementation is the existing `.github/workflows/quality-gates.yml`, extended in place rather than replaced.

The workflow uses GitHub Actions with `pull_request`, `push`, and manual dispatch triggers. Branch filters remain `main` and `integ/main-reconciled`. The job targets `[self-hosted, on-prem, linux]`, has read-only repository contents permission plus check reporting, and retains a 60-minute timeout.

## Runner contract

The pipeline pins Temurin Java 21 and Node 24 through official setup actions, enables Corepack, and installs Yarn dependencies immutably. The self-hosted image must already provide Docker Compose, Bun, GNU Bash, and ripgrep. A dedicated prerequisite step prints their versions and fails before build/test work when one is missing.

This explicit contract is required because `build-and-test/build-test-results.md` proved that invoking Windows WSL Bash was not portable and that the audit detectors require ripgrep for their intended glob semantics and bounded traversal. CI runs on Linux and therefore uses host Bash only after proving both Bash and ripgrep exist.

## Pipeline sequence

1. Checkout and provision Java 21 plus Node 24.
2. Verify Docker Compose, Bun, Bash, and ripgrep.
3. Run immutable Yarn installation.
4. Run backend and workspace script tests.
5. Run shared auth, shared types, and shared UI test/typecheck/lint gates; build shared UI.
6. Run W2-02 presentation anti-drift, 57-case helper suite, auth-state tests, and TypeScript compilation of the Playwright configuration/specification.
7. Run frontend test/typecheck/lint gates and Booking/Shell production builds.
8. Validate Compose statically and execute existing W1/W2-01 evidence tooling without changing historical W1 status.
9. Run the existing quality/readiness aggregators.
10. Execute `aidlc-audit` and `erp-fidelity-audit` as always-run mechanical lead collectors.
11. Upload retained quality evidence for 14 days.

Steps are deliberately serial in the single job because they share the immutable workspace and because this repository has already observed constrained Docker/build behavior. Optimization may split jobs later only when artifact transfer and evidence lineage are defined.

## Live acceptance boundary

The CI workflow does not invoke `w2-02:live-acceptance`, create local auth state for a shared environment, operate `linercore-wave-a`, or query/mutate `linercore-shared-platform`. Those actions require exclusive local lifecycle ownership and manager guards that the generic runner cannot safely assume.

Before W2-02 integration, reviewers must verify a current canonical manifest produced by the Build and Test run. The accepted run is `20260730074058-9adef85fd5de-32c59c26`: 98/98 browser cases, cleanup PASS, manager post-guard PASS, both audits PASS, and terminal `COMPLETED`.

## Artifact and security handling

CI uploads quality/readiness/audit text outputs only. It does not upload browser storage state, cookies, secrets, raw traces, Docker volumes, or local identity material. Repository and check permissions remain least-privilege for the current job. No scanner, vulnerability threshold, coverage percentage, registry publication, deployment, branch-protection enforcement, or cloud permission is invented.

## Local validation

The newly added executable gates were run from the repository root on 2026-07-30:

- `corepack yarn workspace @erp/ui build` — PASS;
- `corepack yarn w2-02:test:auth-state` — 2 passed, 0 failed;
- Playwright configuration/specification TypeScript compilation — PASS;
- `git diff --check` — no whitespace errors (Windows line-ending conversion warnings only).

The three CI documentation outputs each contain at least two H2 sections and explicitly reference `code-summary`, `build-and-test-summary`, and `build-test-results`. Framework sensor publication remains separate from these direct checks.
