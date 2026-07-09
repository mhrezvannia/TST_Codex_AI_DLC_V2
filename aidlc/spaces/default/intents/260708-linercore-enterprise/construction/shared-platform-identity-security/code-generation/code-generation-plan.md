# Code Generation Plan - shared-platform-identity-security

## Plan Context

Unit: `shared-platform-identity-security`

Scope: Brownfield hardening of the existing Identity Service, `@erp/auth` package, auth app server helpers, local Keycloak/runtime metadata, denied-path behavior, and service identity hooks. The implementation must preserve backend authorization as the enforcement boundary and avoid ownership of pricing, booking, CMM, D&D, or reference-data domain records.

Test strategy: Comprehensive. This plan includes TypeScript unit tests for auth/session/security helpers, Java unit tests for authorization policy behavior and denied paths, script/config checks for local Keycloak/service identity metadata, and targeted package/service verification commands.

Workspace target: changes stay in existing identity/security surfaces: `packages/auth/`, `apps/auth/`, `services/identity-service/`, `infrastructure/`, `scripts/`, and tests. No cross-domain business logic is added.

## Story-To-Step Traceability

| Story or requirement | Plan steps |
|---|---|
| US-SP-001 - Authenticate through shared platform | Step 1, Step 2, Step 3, Step 6 |
| US-SP-002 - Enforce permissions | Step 2, Step 4, Step 5, Step 7 |
| US-SP-005 - Trace requests and events | Step 4, Step 5, Step 6 |
| FR-SP-002 and FR-SP-003 | Step 1 through Step 8 |
| NFR-SEC-001 through NFR-SEC-004 | Step 2 through Step 8 |

## Sequential Implementation Steps

- [x] Step 1: Inventory current identity/auth surfaces.
  - Confirm existing TypeScript auth helpers, auth app routes/tests, Java Identity domain/application/container modules, Keycloak local settings, and authorization tests.
  - Preserve existing brownfield APIs and package boundaries.
  - Traceability: US-SP-001, FR-SP-002.

- [x] Step 2: Harden shared auth package security primitives.
  - Add explicit subject type, service subject, capability, authorization request/decision, and audit-safe redaction helpers where missing.
  - Strengthen local bypass checks so production/staging environments always fail closed.
  - Add tests for user subject, service subject, denied reason, unsafe bypass, and token-like redaction behavior.
  - Traceability: US-SP-001, US-SP-002, NFR-SEC-001 through NFR-SEC-004.

- [x] Step 3: Harden auth app session and local dev behavior.
  - Ensure local sessions expose safe permission summaries and correlation ids without leaking token-like values.
  - Add denied-path/session tests where existing UI/server helpers can cover behavior without a live Keycloak server.
  - Traceability: US-SP-001, US-SP-002.

- [x] Step 4: Harden Identity Service authorization evaluation.
  - Add or adjust Java domain tests for null/unknown subjects, inactive assignments, missing permissions, service subject support, and correlation-aware denied decisions.
  - Implement minimal domain changes only if tests expose gaps.
  - Traceability: US-SP-002, US-SP-005, FR-SP-003.

- [x] Step 5: Add authorization audit/service identity evidence hooks.
  - Ensure audit records and service identity descriptors carry subject, action, resource, decision, reason code, correlation id, and timestamp without secrets.
  - Add tests at the lowest existing layer that can verify this deterministically.
  - Traceability: US-SP-005, NFR-SEC-003.

- [x] Step 6: Add local Keycloak/service identity metadata.
  - Add deterministic local-only Keycloak realm/client/role/capability metadata if missing.
  - Add script/config validation so local runtime can find auth URLs, callback URLs, issuer, audience, and service identities.
  - Traceability: US-SP-001, NFR-SEC-001 through NFR-SEC-004.

- [x] Step 7: Add Comprehensive verification coverage.
  - Run targeted TypeScript auth tests, Java identity tests, and any new config validation tests.
  - Use no live Keycloak dependency during code generation.
  - Traceability: all unit stories.

- [x] Step 8: Run verification commands and fix failures.
  - Run `yarn test packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts --config vitest.config.ts` or equivalent targeted Vitest command.
  - Run `mvn -f services/identity-service/pom.xml test` or narrower module tests if the full module is already slow/dirty.
  - Run any new script/config tests.
  - Traceability: FR-SP-002, FR-SP-003.

- [x] Step 9: Write the code summary and mark this plan complete.
  - Produce `code-summary.md` under this unit's `code-generation` record directory.
  - Summarize files changed, implementation decisions, test coverage, command results, and deviations from this plan.
  - Traceability: all unit stories.

## Implementation Guardrails

- Do not add pricing, booking, CMM, D&D, or reference-data business behavior.
- Do not rely on route hiding as backend authorization.
- Do not permit auth bypass outside local/development/test profiles.
- Do not log or expose full tokens, secrets, nonce, or PKCE values.
- Do not require a live Keycloak server for code-generation tests.
