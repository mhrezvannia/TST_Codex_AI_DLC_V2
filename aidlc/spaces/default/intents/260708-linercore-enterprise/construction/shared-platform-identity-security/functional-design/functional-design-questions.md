# Functional Design Questions - shared-platform-identity-security

## Source Context

These questions consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

Graphify was queried through `python -m graphify` for identity/security context. It surfaced existing Identity domain/application classes such as roles, permissions, role assignments, authorization policy evaluation, subject resolution, authorization audit records, and Keycloak-related app/auth code.

## Q1 - Brownfield Reuse

How should existing MVP identity code be handled?

A. Reuse correct `identity-service`, auth package, role/capability, and authorization audit foundations, then harden them for enterprise Keycloak, service auth, denied paths, and module capability coverage. Recommended.
B. Rewrite identity from scratch.
C. Keep MVP identity unchanged and defer enterprise security.
D. Replace local identity with a remote IdP only.
E. Move authorization into each domain service without shared policy.
X. Other (please specify)

[Answer]: A

## Q2 - Authorization Model

What authorization model should be designed?

A. Role plus capability authorization with module/action permissions, effective-permission lookup, denied-path enforcement, and audit records. Recommended.
B. Role names only.
C. UI-only route hiding.
D. Database-level permissions only.
E. No shared authorization model.
X. Other (please specify)

[Answer]: A

## Q3 - Service-To-Service Security

How should service-to-service security be handled?

A. JWT/RS256 validation for protected HTTP calls, service subjects, capability checks where needed, and Kafka ACL design hooks for event-producing/consuming services. Recommended.
B. Shared static API keys.
C. No service auth in local mode.
D. Only network isolation.
E. Defer service auth to Operation.
X. Other (please specify)

[Answer]: A

## Q4 - Keycloak Local Runtime

What Keycloak behavior is required?

A. Deterministic local realm/client/role bootstrap, UI login support, service client setup, documented callback URLs, and explicit local-only bypass guardrails. Recommended.
B. Manual Keycloak setup only.
C. Keycloak only in production.
D. Replace Keycloak with custom password auth.
E. Defer realm/client design.
X. Other (please specify)

[Answer]: A

## Q5 - Frontend Permission Surface

What frontend support is in scope?

A. Authenticated shell/session integration, effective-permission consumption, route/action guards, denied-access states, and admin/read-only capability views where needed. Recommended.
B. No frontend support.
C. Frontend owns authorization decisions.
D. Every route is public locally.
E. UI permissions are manual documentation only.
X. Other (please specify)

[Answer]: A

## Q6 - Boundary

What must Identity not own?

A. It must not own pricing, booking, CMM, D&D, reference records, domain databases, or service-level business decisions; it provides subject, policy, capability, and audit infrastructure. Recommended.
B. Identity owns all enterprise records.
C. Identity decides pricing and booking workflows.
D. Identity directly queries all service databases.
E. Identity bypasses downstream service authorization.
X. Other (please specify)

[Answer]: A

## Recommended Answer Set

Recommended answers applied under explicit stage-level approval: Q1 A, Q2 A, Q3 A, Q4 A, Q5 A, Q6 A.

