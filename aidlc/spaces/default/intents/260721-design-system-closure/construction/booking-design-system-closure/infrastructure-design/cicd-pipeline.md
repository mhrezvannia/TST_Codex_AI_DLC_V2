# CI/CD Pipeline Design — booking-design-system-closure

## Design Inputs

This handoff derives from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`. The later CI Pipeline stage owns any workflow mutation.

## Blocking Gate Sequence

1. Dependency/install integrity and manifest/import checks.
2. Shared UI focused tests and application anti-drift positive/negative gates.
3. Canonical Booking component/route/BFF/redirect/security regression tests.
4. Workspace lint and typecheck.
5. Relevant workspace tests and production build.
6. Pre-demo guard.
7. Wave A config/project assertion and isolated stack readiness.
8. Real canonical Playwright happy path.
9. Difficult-state/theme/viewport/keyboard/accessibility matrix.
10. Trace sanitization/rescan/replay validation and evidence manifest verification.
11. Isolated cleanup and final demo guard.
12. `aidlc-audit` and `erp-fidelity-audit` with direct exits.

Any failure blocks later closure steps as defined by the acceptance orchestrator; partial green results are retained but never promoted as PASS.

The closure handoff must also assert that historical W1 live proof remains
**BLOCKED/waived**. No W2-02 test, audit, backlog change, or later observed run may
rewrite that historical record as a real PASS.

## Artifact Handling

Static/test/build outputs and browser evidence link to commit and command. Raw traces remain staged and uncommitted. Only sanitized, rescanned, replay-valid traces are durable. Original failures remain immutable and reruns link to them.

No artifact is deployed to a runtime. The repository evidence package is the review handoff.

## Secrets and Permissions

Use existing local/CI credentials only; do not add secrets to files or logs. Browser auth material is never persisted in durable artifacts. Commands must not require access to the manager-demo project beyond read-only `demo:guard`.

## Pipeline Mutation Boundary

This stage does not edit `.github/workflows/quality-gates.yml`, add a deployment workflow, or claim CI will operate Docker/browser tooling until the later CI Pipeline stage inspects actual runner capabilities. Local acceptance remains mandatory even if CI cannot host the live stack.

## Deployment and Rollback

There is no staging/production deployment, blue-green/canary/rolling strategy, feature flag, cloud promotion, or production rollback. Local recovery is limited to wrapper-scoped Wave A stop/clean/restart and source rollback through ordinary version control; the protected manager demo is never modified.

## CI Handoff Criteria

The later stage must decide which deterministic static/focused checks safely enter the current workflow and document which live/manual gates remain release evidence outside CI. It may not invent scanners, coverage percentages, branch protection, deployment environments, manager-demo authority, or a W1 PASS.
