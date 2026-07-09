# Domain Entities - UOW-02 Auth Session and Keycloak

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Entities

| Entity | Attributes | Lifecycle |
| --- | --- | --- |
| AuthSession | sessionId, subjectId, displayName, email, roles, permissions, issuedAt, expiresAt, policyVersion | created -> summarized -> expired/cleared |
| OidcTransaction | state, nonce, pkceVerifier, returnUrl, createdAt | created -> callback validated -> discarded |
| SessionSummary | isAuthenticated, subject, displayName, roles, permissions, correlationId, authMode | derived -> returned |
| AccessRequest | subject, requestedArea, reason, correlationId | created -> submitted -> tracked |

## Relationships

- `AuthSession` produces `SessionSummary`.
- `OidcTransaction` protects callback.
- `AccessRequest` is created when permission is denied.

