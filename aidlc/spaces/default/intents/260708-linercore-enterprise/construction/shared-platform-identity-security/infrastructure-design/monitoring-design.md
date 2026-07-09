# Monitoring Design - shared-platform-identity-security

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And KPIs

| Metric | Target or signal |
|---|---|
| Effective permission lookup | p95 <= 100 ms for cached/read-optimized checks. |
| Authorization policy evaluation | p95 <= 250 ms for uncached checks. |
| Token validation | p95 <= 100 ms excluding Keycloak network/startup delay. |
| Authorization audit write | p95 <= 250 ms. |
| Shell context load | p95 <= 500 ms. |
| Audit write failure | Blocking for configured sensitive actions. |
| Denied-path regression | Blocking test and readiness failure. |
| Local bypass visible | Must appear in local health output when enabled. |

## Logs And Audit Evidence

Authorization audit records include subject, module, action, resource context, decision, reason, correlation id, service identity where applicable, and timestamp. Logs and audit records never store full tokens, secrets, or production personal data.

## Alert Definitions

| Alert | Severity | Trigger |
|---|---|---|
| Invalid Keycloak import | P1 local blocker | Realm/client/user/role import fails. |
| JWT config mismatch | P1 security blocker | Issuer, audience, JWKS, signature, expiry, or required claims fail. |
| Denied-path audit missing | P1 readiness blocker | Denied protected action lacks required audit evidence. |
| Audit persistence degraded | P1/P2 by action criticality | Sensitive action cannot write required audit record. |
| Permission cache stale | P1 readiness blocker | Capability or role version mismatch detected. |
| Unsafe local bypass | P1 security blocker | Bypass enabled outside explicit local profile mode. |

## Dashboard Specification

Read-only operations views show authentication health, authorization decision counts, denied-path outcomes, service JWT checks, audit-write status, Keycloak import status, and recent security blockers. They cannot modify permissions, roles, or audit decisions.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors the latency and throughput budgets for identity operations. |
| `security-design.md` | Monitors Keycloak, JWT validation, backend enforcement, denied paths, audit, and local bypass. |
| `scalability-design.md` | Supports audit filtering and capability lookup visibility at first-release scale. |
| `reliability-design.md` | Alerts on fail-closed states, cache invalidation, audit failures, and deterministic local auth issues. |
| `logical-components.md` | Monitoring maps to JwtValidationAdapter, EffectivePermissionService, AuthorizationPolicyEvaluator, AuthorizationAuditWriter, ServiceIdentityValidator, and LocalBypassGuard. |
| `components.md` | Supports Identity Service and Observability Platform evidence. |
| `services.md` | Monitors identity-service, Keycloak, PostgreSQL, JWT/RS256, and Kafka identity hooks. |
| `business-logic-model.md` | Observes authenticate, authorize, capability, audit, and service-validation workflows. |
