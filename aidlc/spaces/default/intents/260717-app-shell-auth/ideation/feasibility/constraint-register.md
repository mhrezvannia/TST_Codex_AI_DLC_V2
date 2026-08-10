# Constraint Register - W2-01 App Shell and Auth

## Source Context

This register consumes `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` from this W2-01 intent. It applies the enterprise technical environment, program backlog, and source-verified auth/Booking/identity seams.

## Technical Constraints

| Constraint | Type | Impact | Response |
|---|---|---|---|
| Existing auth app must be reused. | Technical | Prevents duplicate login/session implementation. | Integrate sign-in/session/sign-out/access-denied into the shell flow. |
| Booking BFF currently emits static actor headers. | Technical | Blocks real subject DoD. | Replace with session-derived subject and tests/evidence. |
| Booking backend falls back to `local-user` on blank actor subject. | Technical | Could hide failed propagation. | Fail closed or make fallback strictly local/test-only. |
| identity-service authorization exists and must be used. | Technical | Avoids a second authorization model. | Integrate `/internal/identity/authorize` for protected Booking actions. |
| Compose/Nginx is the acceptance topology. | Technical | Direct app/service tests are insufficient. | Prove through Nginx and live Compose. |

## Organizational Constraints

| Constraint | Type | Impact | Response |
|---|---|---|---|
| W2-01 overlaps Platform and UI. | Ownership | Risk of duplicated shell/design-system decisions. | Platform drives auth/session; UI contributes shell ergonomics; W2-02 owns design-system foundation. |
| W4-01 owns broad module migration. | Scope | W2-01 must not migrate every module. | Mount Booking only; leave reference-data/charge/CMM migration to W4-01. |
| W1-01 live proof is waived/blocked. | Evidence | Booking mount consumes merged W1 outputs but cannot inherit a false PASS. | Preserve waiver language and require W2 evidence independently. |
| AI-DLC scope is recorded as enterprise. | Governance | Risk of umbrella redesign. | Keep artifacts constrained or explicitly change scope to feature before later stages. |

## Compliance and Security Constraints

| Constraint | Type | Impact | Response |
|---|---|---|---|
| OIDC/Keycloak is mandated. | Security | Custom auth is prohibited. | Reuse Keycloak via existing auth app. |
| Browser tokens must not be exposed. | Security | SPA token storage would violate baseline. | Use BFF/HttpOnly-cookie pattern. |
| Real subject audit is required. | Compliance | Static `local-user` is unacceptable for mounted surfaces. | Capture audit/log evidence showing the session subject. |
| Local bypass must be constrained. | Security | Unsafe bypass could leak beyond dev. | Make bypass explicit, logged, and fail-closed outside local profiles. |
| Data residency and environment are on-prem. | Compliance/platform | No cloud deployment evidence for this intent. | Use local/on-prem Compose evidence. |

## External Constraints

| Constraint | Type | Impact | Response |
|---|---|---|---|
| Keycloak availability in local Compose. | Dependency | Login proof blocks if Keycloak is down. | Include health/readiness check before live proof. |
| Elastic image pull issue affected W1 live proof. | Dependency | Observability profile may block live runs. | Keep W1 waiver explicit and isolate W2 proof requirements to required services. |
| No AWS services in baseline. | Platform | AWS design work is not applicable now. | Record no-AWS stance; revisit only if enterprise environment changes. |
