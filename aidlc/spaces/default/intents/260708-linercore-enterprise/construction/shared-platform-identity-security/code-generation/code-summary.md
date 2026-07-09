# Code Generation Summary - shared-platform-identity-security

## Files Created Or Modified

| File | Change |
|---|---|
| `packages/auth/src/index.ts` | Added explicit user/service subject types, capabilities, authorization request/decision helpers, denied-context creation, permission summaries, recursive token-like redaction, and fail-closed production/staging bypass checks. |
| `packages/auth/src/index.test.ts` | Added coverage for service/user capability decisions, denied service context behavior, recursive redaction, permission summaries, and unsafe bypass profiles. |
| `apps/auth/lib/auth-server.ts` | Aligned local Keycloak defaults with `linercore-local`, exposed issuer/client/service identity config, added subject type on local sessions, and included safe permission summaries for anonymous and authenticated session responses. |
| `apps/auth/lib/auth-server.test.ts` | Added assertions for permission summaries, subject type, and local Keycloak/service identity config defaults. |
| `services/identity-service/domain-core/src/main/java/com/linercore/platform/identity/domain/model/AuthenticatedSubject.java` | Added user/service factory helpers and an explicit service-subject marker derived from claim version. |
| `services/identity-service/domain-core/src/main/java/com/linercore/platform/identity/domain/model/AuthorizationDecision.java` | Made deny decisions null-request tolerant while preserving correlation fields where present. |
| `services/identity-service/domain-core/src/main/java/com/linercore/platform/identity/domain/catalog/AuthorizationPolicyEvaluator.java` | Added fail-closed invalid request handling, null assignment safety, and subject-bound assignment filtering. |
| `services/identity-service/domain-core/src/test/java/com/linercore/platform/identity/domain/catalog/AuthorizationPolicyEvaluatorTest.java` | Added coverage for mismatched assignments, invalid requests, and service subject behavior. |
| `services/identity-service/application-service/src/test/java/com/linercore/platform/identity/applicationservice/IdentityApplicationServiceTest.java` | Added audit-field assertions for denied decisions and service-subject authorization coverage. |
| `infrastructure/env/local.env.example` | Added local Keycloak client, audience, and service identity IDs. |
| `infrastructure/runtime/profiles.json` | Added local service identity descriptors with issuer, audience, and capabilities for identity and reference-data services. |
| `scripts/local-runtime.mjs` | Added runtime metadata validation for service identities and included service identity descriptors in runtime plans. |
| `scripts/local-readiness.test.mjs` | Added validation coverage for runtime profiles, service identities, local env requirements, and runtime plan exposure. |

## Key Implementation Decisions

- Kept application code in the existing workspace surfaces: `packages/auth/`, `apps/auth/`, `services/identity-service/`, `infrastructure/`, and `scripts/`.
- Preserved backend authorization as the enforcement boundary. Frontend/session helpers expose safe summaries and local metadata, but authorization hardening remains in `services/identity-service`.
- Represented Java service subjects without changing the existing `AuthenticatedSubject` record shape, avoiding broad constructor churn across service modules.
- Treated local runtime identity data as deterministic metadata: no live Keycloak dependency is required during code generation tests.
- Kept changes outside pricing, booking, CMM, D&D, and reference-data domain behavior.

## Test Coverage Summary

| Command | Result |
|---|---|
| `yarn vitest run packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts --config vitest.config.ts` | Passed: 2 files, 14 tests. |
| `node --test scripts/local-readiness.test.mjs` | Passed: 9 tests. |
| `yarn exec tsc --noEmit -p packages/auth/tsconfig.json` | Passed. |
| `yarn exec tsc --noEmit -p apps/auth/tsconfig.json` | Passed. |
| `yarn exec eslint packages/auth/src/index.ts packages/auth/src/index.test.ts apps/auth/lib/auth-server.ts apps/auth/lib/auth-server.test.ts scripts/local-runtime.mjs scripts/local-readiness.test.mjs` | Passed. |
| `node scripts/local-runtime.mjs plan --profile app --dry-run` | Passed and emitted app profile with service identity descriptors. |
| `.local-tools/apache-maven/bin/mvn.cmd -f services/identity-service/pom.xml test` with `.local-tools/jdk-21` as `JAVA_HOME` | Passed: reactor build success, 14 Java tests. |

## Deviations From Plan

- The configured `aidlc-developer-agent` subagent path was not used because the current harness has no agent selector on `codex exec`, and the prior unit recorded a fixed-model mismatch for that role. Implementation was completed inline by the orchestrator session.
- The first direct `mvn` invocation failed because Maven and Java are not on `PATH`; verification then succeeded using the repo-local JDK and Maven under `.local-tools/`.
- `yarn workspace @erp/auth typecheck` could not find `tsc` through the workspace script on this Windows shell; explicit `yarn exec tsc -p ...` checks passed for the touched TypeScript projects.

## Traceability

| Story or requirement | Implemented evidence |
|---|---|
| US-SP-001 - Authenticate through shared platform | Local Keycloak realm/client defaults, auth app issuer/callback config, safe local session summaries. |
| US-SP-002 - Enforce permissions | Shared capability evaluation helpers and Identity Service subject-bound policy evaluation. |
| US-SP-005 - Trace requests and events | Denied authorization audit assertions and correlation-aware decision preservation. |
| NFR-SEC-001 through NFR-SEC-004 | Fail-closed bypass checks, token-like redaction, no live Keycloak dependency, deterministic service identity metadata. |
