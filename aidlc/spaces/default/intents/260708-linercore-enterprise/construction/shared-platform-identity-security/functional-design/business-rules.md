# Business Rules - shared-platform-identity-security

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The accepted answers require brownfield reuse, role plus capability authorization, JWT/RS256 service security, deterministic local Keycloak bootstrap, frontend permission consumption, and strict non-ownership of business domains.

## Authentication Rules

| Rule | Statement |
|---|---|
| IDS-001 | Enterprise users authenticate through Keycloak-backed flows. |
| IDS-002 | Local auth bypass is explicit, development-only, and impossible to enable accidentally outside local mode. |
| IDS-003 | Token validation must check issuer, audience, signature, expiry, and required claims. |
| IDS-004 | Unknown or ambiguous subject resolution fails closed. |

## Authorization Rules

- Authorization uses roles plus capabilities, not route hiding alone.
- Every protected module/action has a capability identifier.
- Denied-path behavior is tested and audited.
- Effective permissions are exposed for UI convenience, but backend services remain enforcement authorities.
- Capability catalog changes require tests and traceability to module ownership.

## Service Security Rules

- Protected service-to-service HTTP calls validate JWT/RS256.
- Service subjects are distinct from user subjects.
- Kafka ACL hooks are designed for protected producer/consumer identities.
- No service may rely only on network location for authorization.

## Audit Rules

- Authorization decisions include subject, action, resource context, decision, reason code, correlation id, and timestamp.
- Denied decisions are always auditable.
- Allow decisions for sensitive actions are auditable.
- Audit records must not expose secrets or full tokens.

## Boundary Rules

- Identity does not own booking lifecycle, pricing, D&D, CMM movement status, reference records, or domain databases.
- Identity does not query service domain databases.
- Identity does not calculate business rules.
- Identity provides subject, permission, and audit infrastructure.

## Traceability

| Source | Business-rule coverage |
|---|---|
| `unit-of-work.md` | Defines U03 security responsibilities and boundaries. |
| `unit-of-work-story-map.md` | Maps US-SP-001, US-SP-002, and US-SP-005 to auth, authorization, and tracing hooks. |
| `requirements.md` | Supplies FR-SP and NFR-SEC security requirements. |
| `components.md` | Defines Identity Service ownership and boundaries. |
| `component-methods.md` | Provides authorization method expectations. |
| `services.md` | Defines service, storage, contract, and Keycloak integration expectations. |

