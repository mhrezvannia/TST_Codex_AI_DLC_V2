$ui-ux-pro-max

Act as a principal enterprise UX designer specializing in authentication
boundaries and ocean-shipping ERP workflows. This is an AI-DLC inception design
task for LinerCore. Do not edit production code in this turn.

Inspect the Shell application route `http://127.0.0.1/signed-out`, how protected
shell routes redirect when a session is missing, and the Auth signed-out page.
Redesign this Shell route so it is visually and behaviorally consistent with
the Auth sign-out experience while remaining appropriate for a protected ERP.

LinerCore users include booking agents, pricing analysts, reference-data
stewards, equipment controllers, supervisors, auditors, and administrators.

Show:

- LinerCore identity.
- Clear statement that the workspace session ended.
- Primary `Sign in again` action routed through the canonical Auth flow.
- Safe destination context when the user was signed out because the session
  expired while opening a protected page.
- Secondary `Back to sign-in help` only if such help exists.

Do not render the authenticated shell navigation, stale business data, session
details, raw return URL, technical authentication values, or a different visual
identity from `/auth/signed-out`.

Use the shared LinerCore design system: light neutral surfaces, near-black text,
restrained maritime blue, semantic status color, Source Sans 3 or Inter, small
Lucide icon, 4-8px radii, visible focus, and no gradients, marketing hero,
decorative illustrations, glass, or nested cards.

Design explicit sign-out, expired session, invalid session, protected deep-link
return, and authentication-service unavailable states. Prevent unsafe return
destinations and redirect loops. Meet WCAG 2.2 AA. Define behavior at 390, 768,
1024, and 1440px.

Produce:

1. User/task assumptions and relationship to the Auth signed-out page.
2. Desktop and mobile wireframes.
3. High-fidelity specification and final UX copy.
4. Safe return and redirect behavior.
5. `@erp/ui` component mapping.
6. Accessibility acceptance criteria.
7. Playwright acceptance checklist for expired and explicit sign-out flows.

Do not implement until the design is approved.
