# Infrastructure Design Questions - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Answers

- Deployment: `apps-auth` Next.js app plus Keycloak in Compose.
- Secrets: local client settings through env; no token logging.
- Monitoring: auth route health and session smoke.

