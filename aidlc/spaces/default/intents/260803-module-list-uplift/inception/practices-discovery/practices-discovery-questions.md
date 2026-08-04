# Practices Discovery Questions — W4-01

Evidence from the reverse-engineering CodeKB, repository history, CI/configuration, and the Pipeline, Quality, Developer, and DevSecOps scans pre-fills the established practices. These questions cover only choices that the repository cannot prove.

## Q1. Way of Working

The active branch is `intent/W4-01-module-list-detail-uplift`; its merge base predates the current `integ/main-reconciled`. Which branch and contribution practice should W4-01 affirm?

A. Keep the short-lived W4 intent branch, resynchronize it with the current integration baseline before Construction, retain UI as Driver, require each module owner to review its domain changes, and preserve dual sign-off for shared contracts. **(Recommended)**
B. Keep the current branch base through implementation and integrate the newer baseline only at the final merge gate.
C. Move W4-01 work directly onto `main` and use ordinary trunk commits without the program intent-branch protocol.
X. Other (please specify)

[Answer]: A — Resync intent branch (Recommended)

## Q2. Walking Skeleton

What should the gated first Construction slice prove?

A. Deliver the Reference Data list-to-detail route end to end through the canonical shell, real session/authorization, BFF/service, `@erp/ui`, responsive states, live Compose, and audits; then apply the proven pattern to Charge and Container Journeys in the approved order. **(Recommended)**
B. Touch one minimal list/detail path in all three modules before deepening any single module.
C. Skip a dedicated walking skeleton because the repository is brownfield.
X. Other (please specify)

[Answer]: A — Reference first (Recommended)

## Q3. Testing Method

History proves tests are co-developed with features but cannot prove strict TDD. Which method should W4-01 use?

A. Write tests alongside code, using test-first for defects, contracts, and risky state transitions; require unit/component/route/Playwright/live evidence according to risk. **(Recommended)**
B. Require strict red-green-refactor TDD for every production change.
C. Implement first and add tests after each module slice is otherwise complete.
X. Other (please specify)

[Answer]: A — Risk-based alongside (Recommended)

## Q4. Coverage and Quality Enforcement

No repository-wide executable coverage floor exists, while the organization default for feature work is 80% and W4 lacks a Container Movement frontend gate. What should become binding?

A. Add executable changed-code coverage for W4-owned frontend code at 80%, plus blocking Reference, Charge, Container Journey, shell, responsive/accessibility, live Compose, `aidlc-audit`, and `erp-fidelity-audit` verdicts. **(Recommended)**
B. Require the same risk-based blocking suites but make no numeric coverage claim until a later instrumentation intent; record the organization-default conflict for escalation.
C. Reuse the existing W2-oriented gates unchanged and add no W4-specific enforcement.
X. Other (please specify)

[Answer]: A — Executable W4 gates (Recommended)

## Q5. Security Gate Scope

The required `u02-security` aggregator entry is currently fail-closed but non-operational because its pinned toolchain is absent. How should W4-01 handle it?

A. Make the existing required security gate operational, or replace it with a bounded executable equivalent, before merge; keep exceptions explicit and expiring without expanding W4 into repository-wide security modernization. **(Recommended)**
B. Carry an explicit, time-bound approval waiver for this gate and keep the remaining W4 quality and audit gates blocking.
C. Expand W4-01 to add a complete scanner baseline: secret scanning, TS/Java SAST, npm/Maven dependency scanning, container/IaC scanning, SBOM, signing, and provenance.
X. Other (please specify)

[Answer]: A — Repair bounded gate (Recommended)
