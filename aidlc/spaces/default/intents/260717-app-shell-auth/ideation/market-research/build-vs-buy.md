# Build vs Buy Assessment - W2-01 App Shell and Auth

## Source Context

This assessment consumes `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`. The decision is scoped to the shell/auth integration slice, not a replacement decision for the whole LinerCore platform.

## Options

| Option | Fit | Rationale |
|---|---|---|
| Build the shell/auth integration in-repo | Strong | The value is wiring existing auth, Keycloak, identity-service, Booking BFF/backend, Nginx, and audit evidence into one live path. |
| Buy a full ERP/TMS/logistics platform | Weak for this intent | It would replace rather than integrate the practice codebase and would not preserve W0/W1/W2 evidence. |
| Buy a generic portal/launchpad | Weak now | It may add shell chrome but still leaves session-subject propagation, Booking mount, local Compose proof, and identity-service authorization to build. |
| Adopt micro-frontend framework first | Weak now | The W2-01 source statement already answers "one Next.js shell app"; module federation adds complexity before the thin path is proven. |
| Partner/custom SSO integration only | Partial | Keycloak/OIDC already exists; partner work is unnecessary for proving the in-repo path. |

## Recommendation

Build W2-01 in the monorepo using the existing auth app and enterprise standards. Do not buy or introduce a generic shell product for this slice.

The build is justified because W2-01 is not a commodity login page. It is the system integration point that must prove:

- Keycloak/auth flow enters the LinerCore shell.
- Booking runs inside that shell.
- BFF/backend calls carry the real authenticated subject.
- identity-service authorization and denied states are visible.
- live Compose evidence and audits are green.

## Buy or Adopt Guardrails

Adopt:

- Keycloak/OIDC as the identity provider pattern already mandated by the enterprise technical environment.
- Next.js App Router and `proxy.ts` route-protection convention already present in the standards.
- The BFF/session-cookie security posture described by current OAuth browser-app guidance.

Do not adopt in W2-01:

- A full ERP/TMS suite as a replacement.
- A micro-frontend host before the one-shell monorepo pattern is proven.
- A generic portal product that bypasses source-level proof of real subject propagation.

## Decision Conditions

Revisit buy/partner only if one of these becomes true:

- The existing auth app cannot satisfy the Keycloak/OIDC session requirements after source verification.
- Enterprise policy mandates a central portal product as a non-negotiable platform standard.
- Later W4-01 module migration proves the monorepo shell cannot scale to additional modules without unacceptable deployment coupling.

## Sources

- IETF draft, OAuth 2.0 for Browser-Based Apps: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps
- Keycloak OIDC securing apps: https://www.keycloak.org/securing-apps/oidc-layers
- Next.js proxy file convention: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- Oracle Transportation Management SSO: https://docs.oracle.com/en/cloud/saas/transportation/26b/otmcg/single-sign-on-sso.html
- W2-01 intent statement: `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`
