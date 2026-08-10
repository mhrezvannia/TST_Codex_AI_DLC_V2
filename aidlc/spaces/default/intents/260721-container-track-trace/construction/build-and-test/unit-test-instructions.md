# Unit Test Instructions

## Requirement-driven scope

Tests derive from every U01/U02/U03 `code-generation-plan.md` and
`code-summary.md`. Under the Standard strategy, protect:

- canonical `PLN LOAD@POL` / `PLN DISC@POD` planning;
- `GTOT -> LOAD -> DISC -> GTIN` and lifecycle sequences;
- zero-skew future-time validation;
- duplicate-key, duplicate-occurrence, wrong-next, and typed HTTP 409 evidence;
- status sequence/classifier/lifecycle and `LADEN` / `EMPTY` mapping;
- JDBC legacy-snapshot upcast and canonical round-trip;
- JDBC `REQUIRES_NEW` rejection commit surviving outer rollback;
- authorization-first reads, single capability evaluation, degraded metadata,
  and zero business writes;
- Booking consumer/DTO and `JourneyStatusPanel` states.

The expectation is 5-8 meaningful behavior cases per component where the
component is large enough, including a happy path and at least two edge/error
paths. No numeric coverage claim is permitted without a generated report.

## Commands and evidence

Run:

1. `mvn -f services/container-movement-service/pom.xml clean test -DskipITs`
2. `mvn -f services/pom.xml test -DskipITs`
3. `npm run test -- --filter=@erp/app-booking --cache-dir .turbo-cache`
4. If Vitest cannot spawn, run the bounded actual-component render smoke:
   `node aidlc/spaces/default/intents/260721-container-track-trace/construction/build-and-test/frontend-render-smoke.cjs`
5. Run the in-process JSDOM/Testing Library interaction smoke:
   `node aidlc/spaces/default/intents/260721-container-track-trace/construction/build-and-test/frontend-interaction-smoke.cjs`

Record totals, failures, errors, skips, and runner-startup blockers in
`build-test-results.md`. A test command blocked before discovery is BLOCKED,
not zero tests and not PASS. The two smoke harnesses execute the real component
without worker subprocesses; they remain supplementary and do not replace
Next bundling or real-browser Playwright.

## Test data

Use fixed clocks, run-scoped IDs, representative POL/POD codes, stable
correlation IDs, and existing Avro/Pact fixtures. Keep tests independent; do
not require shared mutable state or an already-running manager demo.
