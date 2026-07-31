# Build and Test Summary

## Inventory and executed status

Generated and executed build, unit, integration, performance, and security
instructions from all U01/U02/U03 `code-generation-plan.md` and
`code-summary.md` artifacts under the Standard strategy.

| Area | Result | Evidence |
|---|---|---|
| Container Movement build/tests | PASS | 34/34 tests, including Spring `REQUIRES_NEW` rollback-survival evidence |
| Wider 38-module services reactor | PASS | Maven `BUILD SUCCESS`; 182 tests, 0 failures/errors, 3 live skips |
| Booking lint | PASS | 1 Turbo task |
| Booking typecheck | PASS | 3 Turbo tasks |
| Booking actual-component render smoke | PASS | 3 in-process server-render cases |
| Booking actual-component interaction smoke | PASS | 4 in-process JSDOM/Testing Library cases |
| Booking production bundle | BLOCKED | Next.js child-process `spawn EPERM` |
| Booking Vitest | BLOCKED | Vite/esbuild child-process `spawn EPERM` before discovery |
| Contract catalog | PASS | 13 contracts, green health |
| Provider/shape verification | PASS | 194 checks, 0 failures; live provider check skipped |
| Dependency advisory scan | BLOCKED | Yarn registry request timed out |
| Live Compose/Playwright/performance | BLOCKED | `demo:guard` cannot spawn Docker in sandbox |

## Readiness assessment

- **Build-ready:** backend, frontend typecheck, and bounded actual-component
  render/interaction checks are ready; the production frontend bundle remains
  unproven in this sandbox.
- **Test-ready:** unit, Spring transaction, and static contract boundaries are
  green. Live broker-to-database-to-Booking, Playwright, and runtime performance
  remain unproven.
- **Deployment-ready:** no. The isolated live proof, post-guard, visual
  evidence, dependency advisory result, and exit audits are still required.

No Compose, port 8088, source-scope, or dependency changes were made to bypass
environment restrictions. W1 remains explicitly BLOCKED/waived.

## Known limitations

No line-coverage report was generated. Three existing live Maven tests were
skipped. The full services shell wrapper timed out after Maven had already
printed its complete `BUILD SUCCESS` summary. See `build-test-results.md` for
the exact command outcomes. Direct Docker inspection also failed with engine
pipe permission denied, confirming that the live blocker is not limited to the
Node guard wrapper.
