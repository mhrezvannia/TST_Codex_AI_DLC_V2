# Frontend Components - U09 Local Seed Compose

## Source Trace

This U09 frontend impact design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U09 has no product UI component ownership. Its frontend responsibility is developer-facing local environment support for `apps/auth` and `apps/reference-data`, preserving the approved Next.js App Router/BFF structure and the `services.md` rule that browser clients do not call backend services directly.

## Frontend Impact Summary

| Surface | U09 responsibility |
|---|---|
| `apps/auth` | Provide local Keycloak issuer/client URLs, seeded user credentials for development only, and callback/sign-out endpoint configuration. |
| `apps/reference-data` | Provide local BFF API base URLs and seeded reference records for smoke navigation, list, detail, and admin-path checks. |
| `@erp/api-core` | Consume local BFF routes, not direct service endpoints. |
| `@erp/auth` | Consume local session/auth configuration and seeded role expectations. |
| Smoke tests | Use deterministic local data identifiers and local users. |

## Local Configuration Contract

U09 should provide environment variables or configuration files consumed by frontend apps:

| Key shape | Purpose |
|---|---|
| `AUTH_APP_BASE_URL` | Local `apps/auth` URL behind Nginx or dev server. |
| `REFERENCE_DATA_APP_BASE_URL` | Local `apps/reference-data` URL behind Nginx or dev server. |
| `BFF_AUTH_BASE_URL` | BFF route root for auth/session operations. |
| `BFF_REFERENCE_DATA_BASE_URL` | BFF route root for reference-data operations. |
| `OIDC_ISSUER_URL` | Keycloak local realm issuer URL. |
| `OIDC_CLIENT_ID` | Local app client id. |
| `LOCAL_SMOKE_USER_*` | Fictional local-only users for smoke scenarios. |

Secrets must not be hard-coded into frontend source. Local development values may live in ignored local env files or Compose-provided development-only configuration, while staging/production must point to Vault or approved secret paths.

## Smoke Scenario Components

No new visible components are introduced by U09. The expected frontend smoke scenarios reuse U05 and U06 surfaces:

```text
Seed local environment
  -> open apps/auth sign-in path
  -> authenticate local seed user through Keycloak
  -> establish BFF session
  -> open apps/reference-data
  -> list seeded reference records
  -> inspect one seeded record
  -> verify read-only or admin action behavior based on seeded role
```

The frontend smoke data contract should include stable record identifiers for:

- One active Currency record, including USD.
- One active Region pair and TradeLane default.
- One Location/Port hierarchy.
- One reference admin user.
- One read-only or insufficient-permission user.

## Interaction Rules

FBR-U09-001: Frontend apps must interact with backend services through BFF route handlers only.

FBR-U09-002: Seeded users and reference records must be labeled as local/test data in documentation and smoke fixtures.

FBR-U09-003: `apps/auth` must treat local Keycloak as an OIDC issuer, not as an application-owned password store.

FBR-U09-004: `apps/reference-data` smoke paths must read canonical data through provider/admin APIs exposed by the BFF.

FBR-U09-005: Role-based smoke paths must verify both allowed and denied behavior where seeded roles make that practical.

FBR-U09-006: Local frontend configuration must not require public-cloud endpoints.

## Validation and Error States

| Scenario | Expected frontend behavior |
|---|---|
| Keycloak local realm missing | `apps/auth` sign-in fails with local setup diagnostics, not a broken blank screen. |
| Seeded user lacks permission | `apps/reference-data` shows read-only or access-denied behavior per U05/U06 design. |
| Seeded reference record missing | Smoke check fails with the expected seed identifier and reference set name. |
| BFF API unavailable | Frontend smoke reports service unavailable through the shared error envelope. |

## Non-Goals

- No local environment management screen.
- No frontend-only seeding logic.
- No direct database or direct backend access from browser clients.
- No production credentials or real users in local fixtures.
