# Infrastructure Services - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Services

| Service | Use |
| --- | --- |
| Keycloak | OIDC authorize/callback/logout. |
| identity-service | Effective permissions. |
| Nginx | Local route entry. |

## Configuration

`KEYCLOAK_AUTHORIZE_URL`, `KEYCLOAK_LOGOUT_URL`, `AUTH_CLIENT_ID`, and `AUTH_REDIRECT_URI` are environment-driven.

