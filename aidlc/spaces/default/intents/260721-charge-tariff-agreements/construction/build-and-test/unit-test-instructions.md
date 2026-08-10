# Unit Test Instructions — W2-03

## Scope and upstream coverage

The Standard strategy targets the non-trivial domain, application, adapter,
schema, and evidence-harness behavior described in all six
`code-generation-plan` and `code-summary` artifacts and their NFR
requirements. Priority is given to immutable
Rate/Agreement authority, pricing resolution and replay, Booking capture and
fenced publication, fail-closed authorization, bounded BFF behavior, and U06
status/evidence derivation.

## Executable suites

- Run the U06 Node suite with
  `node --test --test-isolation=none tests/u06/*.test.mjs`; require all 60
  tests to pass.
- Run U02–U05 deterministic preservation, performance-evaluator, and rollback
  tests. Evaluator tests prove the evaluator logic only, never a measured SLO.
- Use the Charge Maven reactor for Java domain/application/container unit
  tests. Report Testcontainers skips explicitly.
- Run Booking focused/static evidence already provided by U05 when the full
  reactor cannot resolve the approved dependency; label it `PASS (focused
  static seam)` and keep the full reactor `BLOCKED`.
- Frontend Vitest is authoritative only if it reaches discovery and completes.
  `spawn EPERM` before discovery is `BLOCKED`, not a test pass or failure.

## Pass criteria

Executed tests require zero failures and zero errors. Required happy paths and
at least two failure/edge cases must remain represented. Coverage at or above
80% is accepted only from an actual coverage report; absent tooling or a suite
that cannot start leaves coverage `UNMEASURED`.
