# Integration Test Instructions — W2-03

## Integration contract

These checks consume all six `code-generation-plan` and `code-summary`
artifacts and their
reliability, security, performance, and scalability requirements. They cover
OpenAPI/provider parity, Charge and Booking cross-boundary pricing,
Identity/Reference authorization, PostgreSQL migrations and concurrency,
isolated Wave A routing, and preservation of the manager demo.

## Offline and deterministic checks

1. Validate the 15-contract catalog and execute all provider verification
   checks; retain the explicit live-provider skip.
2. Execute U02 route/U01 migration preservation, U03 relay/preservation, U04
   pricing/preservation/rollback, and U05 Booking
   preservation/performance/rollback evaluator tests.
3. Execute U06 registry, migration/restore validator, recovery-lane, browser
   scenario-controller, ledger/manifest, redaction, and writer-receipt tests.
4. Treat Charge Maven Docker-dependent skips and Booking Testcontainers checks
   as unobserved live integration cells.

## Live capability gates

Live Compose, PostgreSQL, restart/restore, bilateral pricing, Pact provider,
Playwright/axe, and audit checks require a passing `npm run demo:guard`, the
exact `linercore-wave-a` wrapper topology, Docker, the locked native evidence
writer, signed-session fixtures, and safe teardown/post-guard execution. If a
prerequisite is unavailable, record the dependent cells as `BLOCKED` or linked
`SKIPPED`; never use direct service ports, another Compose project, a path
fallback, or manager port 8088.

## Pass criteria

Contract/static integration passes require zero mismatches. Live passes require
the exact observed database, correlation, receipt, manual-case, Booking
snapshot, UI, teardown, and manager-fingerprint facts defined by U06's closed
120-member registry and terminal-gate catalog.
