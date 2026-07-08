# Performance Requirements - U08 Quality Gates

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines pull-request gate, backend, frontend, contract/schema, walking skeleton, and failure evidence workflows. `business-rules.md` fixes self-hosted runners, Java/Maven, Yarn/Turborepo, affected-path gates, coverage, contract/schema checks, and evidence. `requirements.md` fixes NFR-003, NFR-004, NFR-005, and contract/schema/frontend/backend checks.

## Target Requirements

| Requirement | U08 obligation |
|---|---|
| CI feedback | Gate groups should be path-scoped so unaffected checks are skipped deterministically. |
| Backend checks | Compile, unit, adapter integration, static checks, and coverage must be runnable per affected service. |
| Frontend checks | TypeScript, lint, tests, and accessibility-relevant checks run per affected app/package. |
| Contract/schema checks | OpenAPI, Pact/message-pact, Avro, and Schema Registry checks are bounded enough for PR feedback. |
| Evidence | Gate evidence is emitted without requiring manual log hunting. |

## Measurement Requirements

- Track duration by gate id, scope, command, runner, and status.
- Track queue time and execution time on self-hosted runners.
- Track skip reasons for unaffected-path decisions.
- Track flaky/retry indicators separately from actual test failures.

## Non-Goals

- No weakening required gates for speed.
- No production deployment approval timing.
- No feature-runtime performance validation.

