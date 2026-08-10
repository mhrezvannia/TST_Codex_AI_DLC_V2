# Build and Test Results

This report executes and evaluates every U01/U02/U03
`code-generation-plan.md` and `code-summary.md`.

## Build results

| Command | Result | Observed evidence |
|---|---|---|
| `mvn -f services/container-movement-service/pom.xml test -DskipITs` | PASS | Six modules; 34 tests including transaction propagation; Maven `BUILD SUCCESS` |
| `mvn -f services/pom.xml test -DskipITs` | PASS with wrapper note | All 38 modules reported SUCCESS and Maven printed `BUILD SUCCESS` after 6:37; the shell wrapper returned timeout after the complete summary |
| Booking lint with `.turbo-cache` | PASS | 1/1 task, no ESLint warnings/errors |
| Booking typecheck with `.turbo-cache` | PASS | 3/3 tasks |
| In-process `JourneyStatusPanel` render smoke | PASS | 3/3 actual-component cases: inactive, pending, projected |
| In-process `JourneyStatusPanel` interaction smoke | PASS | 4/4 cases: initial projection, pending, one-poll convergence, bounded cutoff/Retry |
| Booking production build | BLOCKED | Next.js began optimized build, then child-process `spawn EPERM` |
| `npm run contracts:validate` | PASS | 13 contracts; overall health green; 0 blocking failures |
| `npm run contracts:verify` | PASS (static) | 194 checks; 0 failures; live provider verification skipped |

The initial lint attempt used Turbo's machine default
`D:\TST_Codex\.turbo\cache` and was denied. Re-running unchanged source with
`--cache-dir .turbo-cache` passed.

## Test results

| Suite | Total | Passed | Failed | Errors | Skipped | Result |
|---|---:|---:|---:|---:|---:|---|
| Container Movement focused reactor | 34 | 34 | 0 | 0 | 0 | PASS |
| Wider services reactor | 182 | 179 | 0 | 0 | 3 | PASS with live skips |
| Booking server-render smoke | 3 | 3 | 0 | 0 | 0 | PASS; effects/interactions excluded |
| Booking JSDOM interaction smoke | 4 | 4 | 0 | 0 | 0 | PASS; real browser excluded |
| Booking Vitest | Not discovered | 0 | 0 | 0 | 0 | BLOCKED: Vite/esbuild `spawn EPERM` |
| Live Compose/broker/database/Playwright | Not run | 0 | 0 | 0 | 0 | BLOCKED: Docker `spawnSync EPERM` |
| Performance populations | Not run | 0 | 0 | 0 | 0 | BLOCKED by live-stack prerequisite |

The wider reactor includes Booking controller, authorization, HTTP adapter,
message mapper, and Container Movement tests. Three Booking live migration
tests were skipped. The focused data-access test proves that the Spring-managed
JDBC audit repository uses two physical transaction scopes: the inner
rejection update commits once and the outer business transaction rolls back.
The real `JourneyStatusPanel.tsx` also transpiled and server-rendered three
bounded states in-process. A second harness used JSDOM and Testing Library to
exercise initial projection, pending state, one-poll fetch convergence,
30-attempt cutoff, and Retry reset without Vite workers. Real-browser layout,
keyboard traversal, and Next bundling remain assigned to blocked
Playwright/build suites. Static contracts passed, but no live
Kafka/PostgreSQL journey was observed.

## Security results

- Authorization, degraded metadata, typed conflict, input/time validation,
  serializer, and controller regressions passed in the backend reactors.
- Booking lint and typecheck passed.
- `npm audit` was inapplicable because this Yarn repository has no npm
  lockfile; no lockfile was created.
- `yarn npm audit --all --severity high` was attempted twice and blocked by
  registry `ETIMEDOUT` / pre-TLS `ECONNRESET`. No clean
  dependency-vulnerability claim is made.
- Live negative/DAST requests were not run because `demo:guard` could not spawn
  Docker.

## Coverage, failures, and outstanding evidence

No JaCoCo or frontend line-coverage report was produced, so no percentage is
claimed. No product assertion failed in an executed backend/static-contract
suite. Environment blockers remain:

1. frontend test and production-build child-process spawning;
2. Docker/live-stack spawning;
3. dependency advisory network access;
4. live broker-to-database-to-Booking, Playwright, performance, `aidlc-audit`,
   and `erp-fidelity-audit` evidence.

These blockers make the stage partially test-ready but not deployment-ready.
