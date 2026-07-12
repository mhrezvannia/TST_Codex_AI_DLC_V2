# Intent Statement — W2-01 App Shell & Auth

## Intent

A user signs in once and works across every module inside **one authenticated application shell** — top bar, left nav, user menu, breadcrumbs — with their real session flowing to every business screen. Kills the five-islands architecture and the hardcoded `actorSubjectId: "local-user"`. **Driver: Platform + UI (one Driver — suggest Platform; UI contributes).**

## Context Pack (read before starting)

1. `docs/erp-business-ui-gap-analysis.md` Part 3 (UI/UX findings — the spec of what's broken)
2. `docs/erp-workflow-map.md` Diagram 2 (target user tour) + Diagram 3 (current islands)
3. `apps/auth/` (existing sign-in/session/request-access — reuse, don't rebuild)
4. `docs/enterprise-technical-environment.md` (Keycloak/OIDC mandates, Nginx edge)
5. `compose.yaml` (gateway topology)

## Vertical Slice Definition

One user path end-to-end: open the app → redirected to login (Keycloak via existing auth app) → land in the shell → navigate to Booking → the booking screens run **inside the shell** with the session's real subject on every API call → sign out.

- **Layers cut through:** browser session/OIDC → shell app → module surface → BFF routes → backend authorization (identity-service) with the real subject.
- **Thinnest viable form:** shell + login + **one** module (Booking) mounted inside; other modules linked but still standalone until W4-01.
- **Deferred:** migrating reference-data/charge/CMM surfaces into the shell (W4-01); role-based nav filtering depth.

## In Scope / Out of Scope

- **In:** shell app (host), OIDC session propagation, protected routes, nav + breadcrumbs + user menu, Booking mounted, removal of every hardcoded `local-user` in mounted surfaces, backend calls carry the authenticated subject; local-dev bypass stays but is explicit and logged.
- **Out:** design-system visuals (W2-02 supplies primitives; shell may start plain), other modules' migration (W4-01).

## Actors & Journey

Any authenticated user: login → shell → Booking list → detail → action → sign-out. Access-denied path renders the existing `access-denied` surface inside the shell.

## Cross-Module Seams (must be real)

Session → identity-service authorization (`/internal/identity/authorize`) with the **real subject** from the token — no static subjects. Booking BFF forwards the session subject.

## Standards Alignment

OIDC (Conformist to Keycloak per context map); W3C Trace Context / correlation-id from the browser edge onward.

## Definition of Done (observed, not "tests pass")

On live Compose with Keycloak: (1) unauthenticated hit → login → shell; (2) navigate to Booking inside the shell, create+confirm a booking — backend audit rows show the **real subject id**, not `local-user`; (3) a user lacking the booking role gets the denied surface; (4) sign-out ends the session; (5) `erp-fidelity-audit` detector 6d (hardcoded auth) reports zero hits in mounted surfaces.

## Dependencies

Hard: none to start (shell + login are self-contained). **Soft:** final "mount Booking" unit consumes W1-01's list/detail pages — sequence that unit after W1-01 closes (this is a unit-level dependency, not an intent-level block; earlier units run parallel with W1-01).

## Suggested Scope & Sizing

`feature`. ~4 vertical units: (U01) shell + login + protected route skeleton; (U02) session→BFF→backend subject propagation proven on one call; (U03) nav/breadcrumb/user-menu + denied path; (U04) mount Booking module (post-W1-01).

## Open Questions

1. Shell architecture?
   - A. One Next.js shell app; module surfaces become routed areas inside it, migrated one by one (recommended — simplest, matches monorepo)
   - B. Micro-frontend host (module federation), apps stay separate deployables
   - C. Nginx-stitched multi-app with shared session cookie only
   - X. Other
   - `[Answer]:` A — one Next.js shell app; module surfaces become routed areas migrated in one by one.
