# Business Overview - TST_Codex_integ

## Purpose

`TST_Codex_integ` is the reconciled LinerCore practice ERP codebase. It supports carrier-side commercial and equipment lifecycle flows across shared platform services, charge agreements, booking, and container movement. For W2-01, the relevant business gap is that authenticated ERP work must happen inside one shell, while the current app structure still has separate auth and business surfaces.

## Business Domains

| Domain | Repo area | Purpose |
|---|---|---|
| Identity and access | `services/identity-service`, `apps/auth`, `packages/auth` | Keycloak/OIDC-facing auth app, session helpers, role/permission authorization. |
| Reference data | `services/reference-data-service`, `apps/reference-data` | Canonical reference sets and records used by business services. |
| Charge agreements/pricing | `services/charge-agreement-service`, `apps/charge-agreements` | Customer agreements, lifecycle, active lookup, pricing request handling. |
| Booking | `services/booking-service`, `apps/booking` | Booking draft/list/detail/actions, pricing integration, event/outbox behavior. |
| Container movement | `services/container-movement-service` | Journey creation and movement status handling from booking events. |
| Shared frontend packages | `packages/*` | UI, auth, API core, shared types, transformers, config, and utilities. |

## W2-01 Business Relevance

W2-01 must connect a real user session to Booking work. Fresh MCP verification found:

- existing auth sign-in/session/sign-out/access-denied routes in `apps/auth`;
- Booking list/detail/create/action surfaces in `apps/booking`;
- identity-service authorization at `/internal/identity/authorize`;
- static `local-user` actor propagation in Booking BFF/backend local seams.

The business outcome is not new booking functionality. It is identity integrity and one authenticated operating shell for the first mounted module.

## Current Evidence Notes

- Fresh codebase-memory project: `TST_Codex_integ`, indexed in fast mode during W2-01.
- Graphify report exists but was built from commit `86e21054`; current branch base is `5dd6481c0a6092ff3b2a3faa79dc54db788d3ad7`.
- W1-01 live proof remains explicitly waived/blocked, not passed.
