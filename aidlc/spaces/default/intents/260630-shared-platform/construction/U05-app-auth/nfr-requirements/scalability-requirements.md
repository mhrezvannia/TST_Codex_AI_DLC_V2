# Scalability Requirements - U05 Auth Frontend App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines `apps/auth` routes, BFF session endpoints, Keycloak integration, identity-service calls, and shared package imports. `business-rules.md` fixes App Router, BFF-only backend calls, approved frontend stack, and no full permission-review UI. `requirements.md` fixes NFR-015, C-005, and deployment through Nginx/on-prem runtime.

## Scaling Model

U05 scales as a separate Next.js App Router application and BFF surface. It should remain lightweight because it is an entrypoint and session/support app, not a broad administration portal.

## Structural Scalability Requirements

| Area | Requirement |
|---|---|
| App boundary | `apps/auth` remains separate from `apps/reference-data`. |
| BFF boundary | Backend calls from browser-visible code go through route handlers/server utilities. |
| Session summary | Safe session payloads should be compact and cacheable within session validity constraints. |
| Shared packages | Use `@erp/auth`, `@erp/api-core`, `@erp/ui`, and `@erp/shared-types` instead of duplicated models. |
| State | Zustand may be used only for bounded UI state; no global auth policy duplication. |

## Capacity Planning Hooks

- Track concurrent sessions, callback rate, sign-in failures, current-session route rate, and request-access submissions.
- Track Keycloak and identity-service dependency latency separately.
- Keep request-access submission storage/routing configurable so later workflow changes do not require app redesign.
- Preserve Nginx route separation for auth app traffic.

## Growth Assumptions

- MVP U05 handles internal carrier staff only.
- Permission-review administration remains out of scope unless a later workflow adds it.
- Additional apps may link to `apps/auth`, but U05 should not absorb their domain workflows.

## Non-Goals

- No customer identity scale model.
- No enterprise IAM admin portal.
- No direct backend service fan-out from browser code.

