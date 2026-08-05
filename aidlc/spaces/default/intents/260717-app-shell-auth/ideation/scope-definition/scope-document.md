# Scope Document - W2-01 App Shell and Auth

## Source Context

This scope document consumes:

- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/feasibility/feasibility-assessment.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/feasibility/constraint-register.md`

The delivery scope is the W2-01 vertical slice from the program backlog: one authenticated application shell and one mounted Booking module with real subject propagation.

## Scope Decision

Proceed with W2-01 as a narrow vertical slice. The AI-DLC workflow is currently recorded as `enterprise`, but the scope boundary remains the source statement's feature-sized W2-01 backlog. Enterprise depth means more complete artifacts and gates; it does not authorize a global redesign.

## In Scope

Must have:

- Shell host with top bar, left navigation, breadcrumbs, user menu, and protected route skeleton.
- Reuse of existing `apps/auth` sign-in, callback, session, request-access, access-denied, and sign-out behavior.
- Session-derived subject propagated from shell/BFF to Booking backend.
- Booking mounted inside the shell using preserved W1/W2 list, create, detail, and action surfaces.
- identity-service authorization/denied path integrated for the mounted Booking path.
- Local-dev bypass kept explicit, logged, and fail-closed outside local profiles.
- Live Compose proof through Nginx and Keycloak.
- `aidlc-audit` and `erp-fidelity-audit` detector 6d green for this slice.

Should have:

- Minimal role-aware nav affordance for Booking visibility and denied state.
- Correlation id and W3C Trace Context propagation from the browser edge onward.
- Evidence package under `artifacts/` that future W4-01 module migrations can reuse.

Could have:

- Shell placeholders or external links for non-mounted modules.
- Basic layout alignment with W2-02 primitives where already available.
- Additional route-level smoke tests for session expiry and refresh behavior.

Won't have in W2-01:

- Full migration of reference-data, charge agreements, and container movement apps into the shell.
- Full design-system foundation or token/primitives buildout owned by W2-02.
- Deep role-administration UX or full role-based nav policy editor.
- Booking domain/DCSA rewrite.
- W1-01 live-proof waiver rewritten as a pass.
- Cloud/AWS deployment design.

## Value Stream

1. User enters LinerCore through Nginx.
2. Protected route sends unauthenticated user to Keycloak/auth flow.
3. Authenticated session returns to shell.
4. User selects Booking from shell navigation.
5. Booking BFF forwards requests with session subject and correlation context.
6. Booking backend and identity-service authorize the action.
7. Booking audit/evidence records the real subject.
8. Denied user sees the access-denied surface.
9. Sign-out clears session; protected routes require login again.

## Acceptance Boundary

Completion requires observed live behavior, not screenshots or unit tests alone:

- login -> shell works through Keycloak and Nginx;
- Booking runs inside shell;
- at least one Booking action reaches backend audit/evidence with real subject id;
- denied path renders inside shell for a user lacking Booking access;
- sign-out ends the session;
- hardcoded `local-user` detector is clean for mounted surfaces;
- W1 waiver remains explicit and unchanged;
- audit gates pass.

## Dependency Boundary

Hard dependencies:

- Existing auth app and Keycloak local runtime.
- Existing identity-service authorization endpoint.
- Existing Booking BFF/backend and merged Booking UI surfaces on the reconciled base.

Soft dependency:

- Final Booking mount/proof depends on the W1-01 merged outputs, but not on a false W1 live PASS.

Deferred dependencies:

- W4-01 owns broad module shell migration.
- W2-02 owns design-system foundation.
