# Security Requirements - U09 Local Seed Compose

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines local-only Keycloak/test users, service/API seed paths, audit/outbox metadata, local dev secrets, and no public-cloud dependencies. `business-rules.md` requires fictional users, no production credentials, Confidential/Restricted treatment for sensitive data, Keycloak provider use, and Vault references for non-local stages. `requirements.md` fixes NFR-006 through NFR-010, C-002 through C-006, and customer identity exclusion.

## Data Safety Requirements

- Local seed users must be fictional and clearly marked local-only.
- Seed packs must not contain real customer, employee, production, or credential data.
- Party/Customer and authorization-related records must be treated as Confidential or Restricted when sensitivity applies.
- Local secrets may use development-only values; staging/production descriptors must reference Vault or approved paths.

## Access and Authorization Requirements

- Keycloak remains authentication provider; U09 must not create a custom password store.
- Default authenticated local user receives no administrative permission unless explicitly assigned a test role.
- Local admin users exist only for development and smoke checks.
- Seed writes should use approved service/admin paths where available, preserving validation, audit, and authorization behavior.

## Runtime Security Requirements

- Docker Compose must use local/on-prem services only.
- AWS/public-cloud services, Kubernetes, and cloud-managed dependencies are prohibited for U09.
- Browser-facing routes go through BFF route handlers and Nginx.
- Smoke checks must not query service databases directly.

## Non-Goals

- No production seed data.
- No real identity data.
- No final role-to-permission matrix approval.

