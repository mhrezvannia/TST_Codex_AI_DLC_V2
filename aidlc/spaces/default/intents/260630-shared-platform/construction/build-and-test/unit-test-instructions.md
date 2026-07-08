# Unit Test Instructions - Shared Platform MVP

## Scope and Inputs

The active test strategy is Standard. Unit tests should cover 5 to 8 key behaviors per component, emphasizing fast deterministic feedback over full environment startup.

This plan traces to the `code-generation-plan.md` and `code-summary.md` files for `U01` through `U10`, especially:

| Unit | Unit-test focus |
| --- | --- |
| U01 platform skeleton | Package utilities, API-core envelopes, app shell rendering, backend domain dependency purity. |
| U02 identity authz service | Authorization policy evaluator, assignment workflow, fail-closed behavior, audit append intent. |
| U03 reference domain API | Reference validation, duplicate prevention, validate-only behavior, authorization denial. |
| U04 event outbox | Enqueue, claim exclusivity, successful publish metadata, retryable and permanent failures. |
| U05 auth app | Safe return URLs, token redaction, session cookie helpers, sign-in/access-denied/request-access pages. |
| U06 reference-data app | Set descriptors, filtering, permission defaults, mutation schema validation, workspace rendering. |
| U07 contracts DX | Catalog validation, required event coverage, UI-safe contract summary labels. |
| U08 quality gates | Path classification, gate selection, aggregate failure behavior, local policy checks. |
| U09 local seed compose | Required set validation, duplicate immutable keys, idempotent rerun summaries. |
| U10 observability deployment | Safe correlation ids, structured logs, sensitive field masking, smoke validator behavior. |

## Commands

Run Node built-in tests for scripts:

```powershell
node --test scripts/seed-local.test.mjs scripts/validate-contract-catalog.test.mjs scripts/run-quality-gates.test.mjs scripts/smoke-observability.test.mjs
```

Run Vitest suites for frontend and shared packages:

```powershell
node node_modules/vitest/vitest.mjs run apps/auth/app/page.test.tsx apps/auth/app/sign-in/page.test.tsx apps/auth/app/access-denied/page.test.tsx apps/auth/app/request-access/page.test.tsx apps/auth/lib/auth-server.test.ts packages/auth/src/index.test.ts apps/reference-data/app/page.test.tsx apps/reference-data/lib/reference-data.test.ts apps/reference-data/lib/contract-catalog.test.ts packages/utils/src/index.test.ts --config vitest.config.ts
```

Run backend unit tests on a Java/Maven host:

```powershell
mvn -f services/pom.xml test
```

## Coverage Expectations

Standard strategy expectations:

| Component | Coverage expectation |
| --- | --- |
| Browser-safe auth/session helpers | Happy path, unsafe input rejection, sensitive value redaction, cookie parsing. |
| Reference-data UI helpers | Descriptor completeness for all nine sets, filters, permission state, validation. |
| Contract and seed validators | Valid committed artifacts plus negative cases for missing/invalid inputs. |
| Observability utilities | Valid id preservation, malformed id rejection, masking, structured log shape. |
| Java domain/application services | Core business rules, fail-closed authorization, outbox transitions, port-level tests. |

Test data should come from committed fixtures, local seed packs, or in-memory fakes. Do not use production data or environment secrets in unit tests.
