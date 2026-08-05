# Intent Statement - W2-01 App Shell and Auth

## Context Pack (read before starting)

1. `docs/intents/W2-01-app-shell-and-auth.md` - source statement and answered shell architecture question.
2. `docs/intents/00-INTENT-BACKLOG.md` - program DAG, ownership model, W2-01 dependency note, and W1-01 waiver record.
3. `docs/aidlc-v2-slicing-playbook.md` - vertical slicing rules, observed-live DoD standard, and binding template convention.
4. `docs/erp-business-ui-gap-analysis.md` Part 3 - UI/UX findings: disconnected app islands, auth not wired into business apps, missing shell, and hardcoded local subject.
5. `docs/erp-workflow-map.md` Diagram 2 and Diagram 3 - target authenticated app tour and current five-islands architecture.
6. `apps/auth/` - existing sign-in, callback, session, request-access, access-denied, and sign-out surfaces to reuse.
7. `docs/enterprise-technical-environment.md` - Keycloak/OIDC, identity-service authorization, BFF, HttpOnly-cookie, Nginx edge, and W3C Trace Context mandates.
8. `compose.yaml` - local runtime topology with Keycloak, identity-service, Booking service, app containers, and Nginx edge.
9. Fresh codebase-memory MCP verification - current Booking BFF still sends a static actor subject, while auth/session routes exist and Booking list/detail/create surfaces are present.
10. Graphify first-pass context - existing graph is stale (`86e21054`), so it is useful for navigation only and must be source-verified.

## Intent

A signed-in LinerCore user works across the product from one authenticated application shell instead of separate module islands. The shell owns the top-level ERP navigation, session-aware user controls, breadcrumbs, protected routes, and sign-out flow, then mounts Booking as the first real module surface so Booking calls carry the session's real subject rather than a static local actor.

## Vertical Slice Definition

The slice is one end-to-end user path: unauthenticated browser request -> existing Keycloak/auth flow -> authenticated shell landing -> Booking navigation inside the shell -> Booking BFF/API calls with the real subject -> backend authorization/audit evidence -> sign-out.

- **Layers cut through:** browser session/OIDC, shell app, Booking routed surface, BFF routes, backend authorization and audit, Nginx/Compose edge, trace/correlation propagation.
- **Thinnest viable form:** shell plus login plus one mounted module, Booking; other modules may appear in navigation as links or disabled placeholders until their migration intents.
- **Explicitly deferred to later intents:** reference-data/charge/CMM shell migration (`W4-01`), full role-based navigation filtering depth, W2-02 design-system primitives beyond what the shell consumes, and any rewrite of Booking domain depth unrelated to authenticated shell flow.

## In Scope / Out of Scope

In scope:

- One authenticated app shell host with top bar, left navigation, breadcrumbs, user menu, protected routes, and sign-out.
- Reuse of the existing `apps/auth` sign-in/session/request-access/access-denied surfaces and session helpers.
- Booking mounted as the first in-shell module while preserving W1/W2 merged list, create, and detail work.
- Removal of hardcoded `local-user` from mounted Booking browser/BFF/backend paths; backend calls carry the authenticated subject.
- Identity-service authorization seam for the real subject, with local-dev bypass explicit, logged, and limited to local profiles.
- W3C Trace Context and correlation-id propagation from browser edge onward.
- Live Compose proof with Keycloak and the Nginx edge.

Out of scope:

- Migrating reference-data, charge agreement, and container movement module surfaces into the shell; defer to `W4-01`.
- Building the full design-system foundation; defer to `W2-02`, while consuming existing primitives safely.
- Deep role-administration UX or exhaustive role-based navigation policy authoring beyond the denied-path proof.
- Rewriting Booking domain model, DCSA routing/equipment depth, or W1 business journey semantics.
- Reclassifying W1-01's blocked live-proof waiver as a real pass.

## Actors & Journey

Primary actor: any authenticated LinerCore business user with Booking access.

Journey:

1. User opens the LinerCore application URL through the local Nginx edge.
2. Unauthenticated request is redirected to Keycloak through the existing auth app flow.
3. Successful login lands the user in the shell, showing session-aware top bar, left navigation, breadcrumbs, and user menu.
4. User navigates to Booking inside the shell.
5. Booking list/detail/action surfaces execute under the shell and send the real subject through BFF and backend authorization paths.
6. User without the required Booking role sees the access-denied surface inside the shell.
7. User signs out; the session ends and protected routes require login again.

## Cross-Module Seams (must be real)

- **Auth app / Keycloak -> shell:** existing auth routes and session cookie are reused; tokens remain server-side/HttpOnly per the enterprise frontend security baseline.
- **Shell/BFF -> Booking backend:** BFF calls include the authenticated subject and correlation context; no mounted Booking browser/BFF path may use a static `local-user` subject.
- **Booking backend -> identity-service:** authorization for Booking actions uses the real subject from the session/token rather than a development default.
- **Nginx edge -> apps/services:** local Compose must exercise the same gateway topology named in `compose.yaml`, not direct service-only shortcuts for acceptance evidence.

## Standards Alignment

- OIDC/SSO via Keycloak 24; services validate JWTs and authorization decisions flow through `identity-service`.
- Browser traffic follows the mandated BFF pattern; tokens stay in HttpOnly cookies and are not exposed to browser JavaScript or local/session storage.
- Protected route behavior follows the Next.js App Router standard and the project baseline for `proxy.ts` route protection.
- REST/BFF calls propagate correlation id and W3C Trace Context from the browser edge onward.
- Audit evidence must identify the real authenticated subject for Booking actions.
- Local authentication bypass remains development-only, explicit, logged, and unsafe outside local profiles.

## Definition of Done (observed, not "tests pass")

On the live local Compose stack with Keycloak and Nginx:

1. An unauthenticated hit redirects to login and returns to the authenticated shell.
2. The user navigates to Booking inside the shell.
3. A Booking action, including create plus confirm when available from preserved W1 work, reaches backend audit evidence with the real subject id, not `local-user`.
4. A user without the Booking role receives the access-denied surface inside the shell.
5. Sign-out clears the session and protected routes require login again.
6. `erp-fidelity-audit` detector 6d reports zero hardcoded-auth hits in mounted shell/Booking surfaces.
7. `aidlc-audit` is green for this intent.

W1-01 evidence remains explicit: the merge used test-project authority and the live manifest stayed `BLOCKED` at `compose-start` because Docker could not pull Elastic images. This W2-01 intent must not rewrite that waiver as a real PASS.

## Dependencies

- Hard start dependency: none; shell plus login can start independently.
- Soft unit-level dependency: the final Booking mount/proof consumes W1-01 list/detail/action outputs from the reconciled base, but W1-01's live-proof waiver remains explicit and must be observed honestly during W2-01 acceptance.
- Preserve closed or merged prior work: W0-01 platform/eventing foundation, W0-02 reference-data completeness, W1-01 booking quote-to-cash work as merged under waiver, and W2-02 design-system foundation artifacts.
- Use `integ/main-reconciled` at `5dd6481` as base and `intent/W2-01-app-shell-and-auth` as the working branch.

## Suggested Scope & Sizing

The source W2-01 statement recommends `feature` scope with roughly four vertical units:

1. Shell, login, and protected route skeleton.
2. Session -> BFF -> backend subject propagation proven on one Booking call.
3. Navigation, breadcrumbs, user menu, and denied path.
4. Booking module mount and live proof after preserving W1 outputs.

This AI-DLC run is currently recorded with `enterprise` scope after the confirmed second-intent birth. The artifacts intentionally constrain the delivery surface to the W2-01 vertical slice so comprehensive stage coverage does not expand into an umbrella redesign.

## Open Questions

1. Confirm workflow scope before later stages.
   - A. Keep the engine-recorded enterprise scope for comprehensive stage coverage, but constrain all artifacts to W2-01 only.
   - B. Change the AI-DLC scope to feature to match the source statement's sizing.
   - C. Other
   - `[Answer]:`

2. Confirm the architecture direction.
   - A. One Next.js shell app; module surfaces become routed areas inside it, migrated one by one.
   - B. Micro-frontend host with module federation.
   - C. Nginx-stitched multi-app with shared session cookie only.
   - X. Other
   - `[Answer]:` A - already answered in the source W2-01 statement.
