# Feasibility Assessment - W2-01 App Shell and Auth

## Source Context

This assessment consumes:

- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/market-research/competitive-analysis.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/market-research/market-trends.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/market-research/build-vs-buy.md`

It also reflects source-verified current seams: existing auth/session routes, identity-service authorization endpoint `/internal/identity/authorize`, Booking BFF static actor headers, Booking backend local identity filter, and the Compose/Nginx topology.

## Feasibility Decision

**Decision: Feasible with explicit constraints.**

W2-01 is feasible because the required building blocks already exist: `apps/auth`, Keycloak in Compose, identity-service authorization, Booking BFF/backend surfaces, Booking list/detail/create work, and Nginx as the local edge. The technical work is to connect those pieces into one shell path and replace static local actor propagation with session-derived subject propagation.

The slice should not require a new identity provider, full micro-frontend platform, new ERP portal product, or broad module migration.

## Technical Viability

Strong feasibility factors:

- Auth app already contains sign-in, callback, session, request-access, access-denied, and sign-out paths.
- identity-service already exposes `/internal/identity/authorize` and records deny decisions for unresolved subjects.
- Booking BFF already centralizes backend headers, making static actor removal a narrow but important seam.
- Booking backend already rejects unauthorized local service identity and requires correlation headers.
- Compose already contains Keycloak, identity-service, Booking service, Booking app, auth app, and Nginx.

Technical constraints:

- The current Booking BFF sends a static `x-linercore-actor-id: local-user`.
- Booking API falls back to `local-user` when actor subject is blank.
- The local identity filter currently allows a configured local actor set; W2-01 must keep this local-only and auditable.
- The shell must preserve W1/W2 merged Booking screens rather than replace them.
- The live proof depends on a usable local Compose stack; W1-01 already showed image-pull blockers can invalidate live evidence.

## Platform Perspective

The AWS-platform support perspective is a negative finding for AWS usage: the enterprise technical environment says LinerCore is on-premises, with no public cloud and Docker Compose/Nginx as the runtime baseline. There are no AWS services or accounts to assess for this slice.

Feasibility therefore depends on:

- Local Compose profile correctness.
- Nginx routing to the shell/auth/Booking surfaces.
- Keycloak reachability in the local network.
- Environment variables for service tokens and URLs.
- Repeatable evidence capture under `artifacts/`, not cloud deployment.

## Compliance Perspective

Compliance feasibility is acceptable if W2-01 implements these controls:

- Authentication via Keycloak/OIDC; no custom browser password flow.
- Tokens remain server-side or HttpOnly cookie backed; no browser JavaScript token storage.
- Authorization decisions go through identity-service or an explicitly approved local-only bypass.
- Denied decisions and Booking actions produce auditable evidence with the real subject.
- CSRF and CSP controls are addressed before claiming production readiness.
- Local bypass is unavailable or fail-closed outside local profiles.
- W1-01 waiver status remains honest and visible in release evidence.

## Feasibility Conditions

Proceed only under these conditions:

1. Keep scope to the W2-01 path: shell/auth plus Booking mount.
2. Reuse existing auth and identity surfaces before adding new ones.
3. Remove static `local-user` from mounted Booking browser/BFF/backend flows.
4. Preserve prior merged work, especially W0-01, W0-02, W1-01, and W2-02.
5. Treat W1 live proof as blocked/waived, not as a pass.
6. Prove acceptance on live Compose with Keycloak and Nginx.
7. Run `aidlc-audit` and `erp-fidelity-audit`, including detector 6d.

## Conclusion

W2-01 should proceed. The highest-risk item is not shell rendering; it is end-to-end identity integrity. The first construction units should therefore prove protected routing and real subject propagation before expanding shell chrome.
