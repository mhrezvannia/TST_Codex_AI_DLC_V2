$ui-ux-pro-max

Act as a principal enterprise UX designer with secure sign-out and operational
ERP experience. This is an AI-DLC inception design task for LinerCore. Do not
edit production code in this turn.

Inspect the Auth application route `http://127.0.0.1/auth/signed-out`, the
Keycloak sign-out behavior, and the current login entry. Redesign the page as a
clear, compact confirmation that the LinerCore application session was removed.

LinerCore is an enterprise ERP for an ocean shipping company. The page must
preserve brand trust while showing no protected business records, navigation,
or stale user details.

Show:

- LinerCore identity.
- Clear heading such as `You are signed out`.
- One concise sentence confirming the application session was cleared.
- Primary `Sign in again` action.
- Secondary close or approved public destination only if one exists.
- A warning only when the identity-provider SSO session may still be active.

Do not show protected module navigation, session payloads, correlation IDs in
primary content, marketing content, decorative hero, stock imagery, gradients,
glass effects, or oversized success illustrations.

Use light neutral surfaces, near-black text, restrained maritime blue, a
semantic success indicator, Source Sans 3 or Inter, a small Lucide icon, 4-8px
radii, subtle borders, and visible focus.

Design normal sign-out, identity-provider sign-out incomplete, sign-out failed,
already signed out, and automatic redirect states. Define whether retry is safe
and how to prevent redirect loops. Meet WCAG 2.2 AA and specify layouts for 390,
768, 1024, and 1440px.

Produce:

1. User/task assumptions.
2. Desktop and mobile wireframes.
3. High-fidelity visual and content specification.
4. Sign-out state and recovery behavior.
5. Relationship to Keycloak logout.
6. `@erp/ui` component mapping.
7. Accessibility acceptance criteria.
8. Playwright acceptance checklist.

Do not implement until the design is approved.
