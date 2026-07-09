# Build and Test Memory

## Interpretations

- 2026-07-03T16:16:00Z - Treated Build and Test as an aggregate over all code-generation-plan and code-summary artifacts; the stage follows Code Generation across all eleven units.

## Deviations

- 2026-07-03T16:17:00Z - Used direct `node_modules/.bin` commands where Yarn workspace test scripts could not resolve `vitest`; Corepack Yarn typecheck works, but `corepack yarn workspace ... test` fails in this shell with command-not-found.
- 2026-07-03T16:18:00Z - Backend Java tests are recorded as blocked instead of failed; `mvn` is unavailable in the local shell.

## Tradeoffs

- 2026-07-03T16:19:00Z - Used `readiness:local` as the integrated smoke/readiness signal; it separates blocked runtime prerequisites from actual code failures and writes replayable evidence.

## Open questions

- 2026-07-03T16:20:00Z - Re-run backend tests, live contracts, seed apply, and local smoke after Java, Maven, Docker Desktop, and service ports are available.
