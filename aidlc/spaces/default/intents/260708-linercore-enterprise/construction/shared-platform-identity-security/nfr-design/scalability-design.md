# Scalability Design - shared-platform-identity-security

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The identity/security foundation must cover all first-release enterprise modules, service identities, capabilities, and audit evidence without redesign.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Protected modules or route groups | At least 10. |
| Capability identifiers | At least 100 stable module-scoped identifiers. |
| Roles and service identities | At least 25 combined. |
| Authorization audit records | At least 10,000 in seeded local validation. |
| Concurrent permission lookups | At least 50 local UI/session lookups. |

## Catalog And Query Model

Capabilities are named by module, action, and resource scope. Role mappings and service identity grants reference capability identifiers, not route labels or UI text. Effective-permission responses are shaped for Enterprise Web route/action guards but omit backend-only secrets and raw token material.

Audit queries are indexed by subject, action, resource, decision, reason, correlation ID, and timestamp. This supports incident review and release validation without requiring cross-domain database reads.

## Growth Controls

| Trigger | Design response |
|---|---|
| New module added | Allocate module-scoped capability prefix and denied-path tests. |
| Capability count exceeds 100 | Review naming conventions and effective-permission payload size. |
| Role/service identities exceed 25 | Validate least-privilege mapping and query performance. |
| Audit records exceed local baseline | Add pagination and retention policy, preserving durable denied/sensitive decisions. |
| UI permission payload grows | Return grouped permission summary and capability digest rather than full policy internals. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements module, capability, role/service identity, audit, and concurrent lookup capacity. |
| `performance-requirements.md` | Uses indexed lookup, effective-permission cache, and compact audit records to meet latency/throughput targets. |
| `security-requirements.md` | Keeps capability identifiers stable and least-privilege while supporting Enterprise Web route/action hints. |
| `reliability-requirements.md` | Ensures capability mismatches, cache invalidation, and audit persistence are testable. |
| `tech-stack-decisions.md` | Uses the existing Identity Service, PostgreSQL, Keycloak, JWT/RS256, and shared auth packages. |
| `business-logic-model.md` | Implements subject, role/capability, authorization, audit, and service identity workflows. |
