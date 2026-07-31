# Build and Test Results — W2-03 Charge Tariffs and Agreements

## Result summary

Execution date: 2026-07-30  
Strategy: Standard, extended with performance and security checks because the
approved NFRs require them.

| Area | Result | Observed evidence |
| --- | --- | --- |
| U06 evidence harness | PASS | 60/60 Node tests |
| U02–U05 deterministic evaluators | PASS | 20/20 tests |
| Contract catalog | PASS | 15 contracts |
| Provider verification | PASS (offline) | 199 checks, 0 failures; live provider explicitly skipped |
| Charge Java reactor | PASS | 169 discovered, 141 executed, 28 Docker/Testcontainers skips, 0 failures/errors |
| U05 focused pricing remediation | PASS (focused static seam) | 6/6 tests |
| Charge TypeScript | PASS | type-check and lint; 0 lint warnings/errors |
| Booking TypeScript | PASS | type-check and lint; 0 lint warnings/errors |
| U06 syntax | PASS | 29 JavaScript entry/module/test files |
| Diff hygiene | PASS | `git diff --check`; line-ending conversion notices only |
| Charge Vitest | BLOCKED | esbuild `spawn EPERM` before discovery |
| Booking Vitest | BLOCKED | esbuild `spawn EPERM` before discovery |
| Charge/Booking Next builds | BLOCKED | `next build` reached optimized-build startup, then `spawn EPERM` |
| Booking Maven reactor | BLOCKED | zero approved Resilience4j 2.2.0 JARs in the local cache; prior repositories timed out |
| Live PostgreSQL/Compose/browser | BLOCKED | Docker/default-manager probe and native writer capabilities unavailable |
| Measured performance | BLOCKED | no live isolated stack/raw sample population |
| Pinned SAST/dependency/SBOM/DAST | BLOCKED | authoritative pinned scan toolchain/trusted runtime absent |
| Changed-line coverage >=80% | UNMEASURED | frontend suite cannot start and no approved aggregate Java coverage gate exists |

No executed assertion failed. The technical U06 live status is not `PASSED`;
release-grade acceptance remains blocked by the live capabilities above.

## Commands and remediation attempts

- `node --test --test-isolation=none tests/u06/*.test.mjs` — PASS 60/60.
- U02–U05 evaluator aggregate — PASS 20/20.
- `npm run contracts:validate` — PASS, 15 contracts.
- `npm run contracts:verify` — PASS, 199/199; live-provider check skipped.
- Charge and Booking workspace `typecheck` and `lint` — PASS.
- Initial online Charge Maven execution reached green domain/application/data
  access tests but failed when Maven attempted to write metadata outside the
  workspace. Attempt 2 used the same cached dependencies with `mvn -o`; the
  complete eight-module reactor passed.
- The first U05 static-runner invocation lacked its compiled domain/JUnit
  classpath. After correcting only the evidence command classpath, the six
  focused production-wiring/transaction tests passed.
- Frontend Vitest and production builds were each attempted once. Both products
  reproduced the known child-process restriction; no retry or weaker substitute
  was presented as a pass.
- Booking Maven was not retried because the read-only cache probe confirmed
  that the approved Resilience4j artifacts are absent.

## Upstream coverage and residual risk

This result consumes every unit's `code-generation-plan` and `code-summary`
artifacts and NFR requirements for:

- `U01-rate-authority`
- `U02-charge-domain-routing-bff`
- `U03-agreement-authority`
- `U04-pricing-provider-manual-cases`
- `U05-booking-consumption-repricing`
- `U06-isolated-acceptance-preservation`

Deterministic evidence covers authority invariants, BFF/security boundaries,
contract parity, pricing outcomes, Booking typed preservation, recovery-lane
behavior, browser scenario-controller closure, redaction, migration/restore
validators, and writer/ledger/manifest integrity. It does not observe real
PostgreSQL concurrency/migration/restore, bilateral service traffic,
signed-browser accessibility, runtime SLOs, supply-chain scans, coverage, or
the final preservation audits.
