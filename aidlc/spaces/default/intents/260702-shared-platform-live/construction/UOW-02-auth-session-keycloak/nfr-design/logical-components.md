# Logical Components - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Components

| Component | Responsibility | Failure domain |
| --- | --- | --- |
| OidcTransactionManager | Creates and validates state/nonce/verifier. | Auth BFF cookie logic. |
| SessionSummaryBuilder | Produces safe session summary. | Auth BFF. |
| KeycloakRedirectAdapter | Builds authorize/logout URLs. | Keycloak availability/config. |
| IdentityPermissionLookup | Loads effective permissions. | identity-service. |

## Shared Resources

- Session cookie.
- Keycloak endpoint.
- identity-service endpoint.

