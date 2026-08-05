# Unit Test Instructions — W2-02 Design-System Closure

## Scope and upstream coverage

These tests implement the Standard strategy against `booking-design-system-closure/code-generation/code-generation-plan.md` and `booking-design-system-closure/code-generation/code-summary.md`. They cover shared primitives/tokens, shell Booking presentation and actions, standalone redirect boundaries, auth/BFF error semantics, anti-drift, fixture contracts, trace sanitization, workspace identity, evidence validation, and terminal-last attempt lineage.

## Commands and pass criteria

```powershell
corepack yarn workspace @erp/ui test
corepack yarn workspace @erp/app-shell test
corepack yarn workspace @erp/app-booking test
corepack yarn w2-02:test:scripts
```

Package tests must have zero failures. The direct W2-02 suite must report all registered tests passing (57/57 in the final Build and Test run), including negative target, forged evidence, secret leakage, alias/hardlink, chronology, cleanup ownership, rerun lineage, terminal-last fault cases, constrained-build controls, and cross-platform audit invocation. A managed-host Vitest `spawn EPERM` is recorded as BLOCKED, not PASS; the isolation-none Node suite remains a direct executable result rather than a substitute for blocked Vitest.

## Test data and cleanup

Tests use temporary synthetic data and must delete raw trace inputs/promoted outputs on sanitizer failure. No test may access the manager demo, start Compose, or persist real credentials. Empty directories left by managed Windows deletion policy are untracked and do not count as evidence.
