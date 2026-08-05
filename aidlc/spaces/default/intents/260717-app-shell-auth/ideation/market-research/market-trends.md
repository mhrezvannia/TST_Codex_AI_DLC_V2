# Market Trends - W2-01 App Shell and Auth

## Source Context

This report consumes `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`. The relevant market question is not whether to enter a broad ERP SaaS market; it is whether a carrier ERP can be credible without one authenticated shell, SSO, role-aware navigation, and real audit identity.

## Relevant Trends

1. **Unified launchpad/platform entry is table stakes.** SAP positions Fiori launchpad as the place where role-based transportation apps are launched, and SAP learning material recommends SSO so users can start Fiori apps with their existing credentials. Oracle Transportation Management similarly documents SSO/federated sign-in and user-role configuration for Transportation and Global Trade Management users.

2. **Logistics platforms sell operational consolidation, not disconnected modules.** CargoWise markets itself as a deeply integrated logistics platform, and Oracle Transportation Management describes management of transportation activity across the supply chain. For W2-01, the competitive implication is simple: a five-island UI with independent module workbenches reads as prototype maturity, not ERP maturity.

3. **Browser security guidance favors BFF/session isolation.** The IETF browser-based apps draft describes BFF managing OAuth tokens in the context of a cookie-based session so tokens are not directly exposed to browser JavaScript. This aligns with the enterprise technical environment's BFF and HttpOnly-cookie mandate.

4. **Framework conventions are moving route protection to explicit request-boundary code.** Next.js documentation now identifies `proxy.js|ts` as the request-boundary convention and notes the middleware convention was renamed/deprecated. W2-01 should preserve the project's standards around protected routes rather than inventing module-local guards.

## Table Stakes vs Differentiators

Table stakes:

- One sign-in and one application entry point.
- Protected routes and access-denied states.
- Role-aware navigation that is at least enforceable even if full nav filtering depth is deferred.
- Real subject propagation into BFF/backend calls.
- Sign-out that actually terminates protected access.
- Audit evidence that identifies the authenticated user.

Differentiators for LinerCore:

- A shell that is tied to shipping operations rather than generic CRUD navigation.
- Live local Compose proof with Keycloak, Nginx, Booking, and identity-service in the same acceptance path.
- Honest evidence discipline: W1-01's blocked live-proof waiver remains visible, and W2-01 must prove its own live behavior rather than inheriting a false pass.

## Sources

- SAP Help Portal, Fiori launchpad transportation roles: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/58d9db9751554bbeac5cb7943f789b2d.html
- SAP Learning, enabling SSO for SAP Fiori apps: https://learning.sap.com/courses/technical-implementation-and-operation-i-of-sap-s-4hana-and-sap-business-suite/enabling-single-sign-on
- Oracle Help Center, Oracle Transportation Management SSO: https://docs.oracle.com/en/cloud/saas/transportation/26b/otmcg/single-sign-on-sso.html
- Oracle Help Center, user roles/user access: https://docs.oracle.com/en/cloud/saas/transportation/25c/otmse/user-roles0.html
- CargoWise product site: https://www.cargowise.com/
- IETF draft, OAuth 2.0 for Browser-Based Apps: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps
- Keycloak OIDC securing apps: https://www.keycloak.org/securing-apps/oidc-layers
- Next.js proxy file convention: https://nextjs.org/docs/app/api-reference/file-conventions/proxy

## Implications for W2-01

- The market bar supports building the shell/auth slice now; disconnected module islands are not a defensible ERP experience.
- The strongest acceptance signal is live user-path proof, not visual polish.
- Build should prefer the existing auth app and Keycloak/identity-service standards over a new auth product or custom identity model.
- Future W4-01 module migrations should copy the shell pattern, but W2-01 should not expand to migrate every module.
