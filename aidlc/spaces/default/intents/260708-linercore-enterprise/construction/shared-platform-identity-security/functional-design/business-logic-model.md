# Business Logic Model - shared-platform-identity-security

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The unit is U03 `shared-platform-identity-security`: brownfield hardening of `identity-service`, Keycloak config, authorization, capabilities, audit, service-to-service JWT/RS256, and Kafka ACL design hooks. It supports US-SP-001, US-SP-002, US-SP-005, FR-SP-002, FR-SP-003, NFR-SEC-001 through NFR-SEC-004, and local runtime security expectations.

## Functional Scope

This unit owns authenticated subject resolution, role/capability policy, effective permissions, authorization decisions, authorization audit, Keycloak local integration, service client security, and service identity hooks.

It does not own domain records for pricing, booking, CMM, D&D, or reference data. It does not bypass service-level authorization decisions and does not expose cross-service database access.

## Core Workflows

### Workflow 1 - Authenticate user subject

1. UI redirects to Keycloak or local dev auth entry point.
2. Callback validates issuer, audience, signature, expiry, and local-only bypass guard.
3. Subject resolver maps token claims to `AuthenticatedSubject`.
4. Identity loads effective roles and capabilities.
5. Session/API response exposes safe identity and permission summary to Enterprise Web.

### Workflow 2 - Authorize action

1. Caller submits subject, module, action, resource context, and correlation id.
2. Identity resolves role assignments and capability grants.
3. Policy evaluator checks allow/deny rules.
4. Decision is returned as allow, deny, or indeterminate with reason code.
5. Authorization audit record is written for allow and deny decisions where configured.

### Workflow 3 - Manage capability catalog

1. Register enterprise modules and actions from approved services and UI routes.
2. Map capabilities to roles.
3. Publish effective-permission lookup for UI route/action guards.
4. Preserve denied-path tests for unauthorized actions.

### Workflow 4 - Validate service-to-service request

1. Receiving service validates JWT/RS256 signature, issuer, audience, expiry, and service subject.
2. Service checks required capability for protected action.
3. Service logs authorization decision with correlation id.
4. Kafka producers/consumers use configured service identity and ACL policy hooks where applicable.

## Decision Model

```text
Subject + Action + Resource
        |
        v
Resolve roles and capabilities
        |
        v
Evaluate policy
   |         |
 allow      deny
   |         |
   v         v
Audit decision and return result
```

Text fallback: authorization resolves a subject's roles and capabilities, evaluates the requested action and resource, audits the decision, and returns allow or deny.

## Error Handling

- Invalid token returns unauthenticated with no domain action attempted.
- Expired token returns re-authentication state.
- Missing capability returns denied with reason code.
- Ambiguous subject mapping returns denied and audits reason.
- Local bypass outside local mode fails closed.
- Service token validation failure fails closed and is logged.

## Traceability

| Source | Functional design coverage |
|---|---|
| `unit-of-work.md` | U03 responsibilities become auth, authorization, audit, service-token, and Keycloak workflows. |
| `unit-of-work-story-map.md` | US-SP-001, US-SP-002, and US-SP-005 map to authentication, permission enforcement, and tracing hooks. |
| `requirements.md` | FR-SP-002, FR-SP-003, NFR-SEC-001 through NFR-SEC-004 drive security behavior. |
| `components.md` | Identity Service owns users, subjects, roles, capabilities, and authorization audit. |
| `component-methods.md` | Identity operation/method expectations constrain authorization request and response shape. |
| `services.md` | `identity-service`, Keycloak, local databases, and service-to-service validation define runtime integration. |

