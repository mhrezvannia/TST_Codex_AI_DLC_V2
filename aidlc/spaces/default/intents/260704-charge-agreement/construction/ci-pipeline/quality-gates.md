# Quality Gates - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `code-summary.md`, `build-and-test-summary.md`, and `build-test-results.md`.

## Required Gates

| Gate | Applies When | Blocking Condition |
| --- | --- | --- |
| `policy-package-manager` | All changes | Non-Yarn package manager lockfiles or missing Yarn packageManager |
| `backend-domain-purity` | Workspace and service checks | Disallowed framework/data/messaging dependencies in domain-core modules |
| `frontend-charge-agreements-test` | `apps/charge-agreements/**` or full CI | Charge Agreement Vitest suite fails |
| `frontend-charge-agreements-typecheck` | `apps/charge-agreements/**` or full CI | Charge Agreement TypeScript check fails |
| `backend-test` | `services/**` or full CI | Maven service tests fail |

Existing reference-data, auth, contract, seed, and skeleton gates remain unchanged.

## Selection Rules

Changed paths under `apps/charge-agreements/` now classify into these scopes:

```json
{
  "scopes": [
    "apps/charge-agreements",
    "workspace"
  ],
  "chargeGates": [
    "frontend-charge-agreements-test",
    "frontend-charge-agreements-typecheck"
  ]
}
```

This means a UI-only Charge Agreement change runs the workspace policy gate plus the two Charge Agreement frontend gates. Service changes continue to include service/backend gates through the existing `services/` scope.

## Verification Results

| Check | Result |
| --- | --- |
| `node --test scripts/run-quality-gates.test.mjs` | Pass: 4 tests |
| Charge Agreement path classification smoke | Pass: selects test and typecheck gates |
| B01 backend targeted test from `build-test-results.md` | Pass |
| B01 frontend typecheck from `build-test-results.md` | Pass |
| B01 frontend unit test from `build-test-results.md` | Pass |
| B01 frontend build from `build-test-results.md` | Pass |

## Remaining CI Work

Later units should add gate coverage for:

- Charge Agreement backend domain/application/dataaccess test slices once those modules contain behavior.
- REST/API contract verification when OpenAPI or provider contracts are added.
- Live local smoke gates after the local runtime is intentionally started again.
- Security/dependency scanning once the package and Maven dependency graph stabilizes.

