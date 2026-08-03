$ui-ux-pro-max

Act as a principal enterprise UX designer with identity, access-management, and
ocean-shipping ERP experience. This is an AI-DLC inception design task. Do not
edit production code in this turn.

Inspect the current LinerCore Auth application and the running page at
`http://127.0.0.1/auth/`. Redesign this route as a compact product entry screen,
not a marketing hero or a developer diagnostics page.

LinerCore is an enterprise shipping ERP for booking agents, pricing analysts,
reference-data stewards, equipment controllers, supervisors, auditors, and
administrators. The Auth Gateway must feel like the same product as the
authenticated shell.

The page has two jobs:

1. Route a signed-out user safely to sign in.
2. Route a user with a valid session back to the ERP workspace.

Show the LinerCore identity, a concise sentence explaining secure company
authentication, a primary `Sign in` action when signed out, and a primary
`Continue to workspace` action when a valid session exists. If the original
destination is known, state it in business language such as `Continue to
Bookings`.

Remove provider, BFF mode, fail-closed policy, correlation requirements, and
other implementation details from primary content. In local demo or admin mode,
put safe runtime diagnostics behind a collapsed `Technical details` disclosure.
Never expose secrets or raw tokens.

Use the shared ERP visual language: light neutral surfaces, near-black text,
restrained maritime blue, semantic status colors, Source Sans 3 or Inter, 4-8px
radii, subtle borders, Lucide icons, visible focus, and no gradients,
glassmorphism, giant hero typography, decorative illustration, or nested cards.

Design signed-out, session-detected, session-expired, identity-service
unavailable, redirect-in-progress, and invalid-return-destination states. Meet
WCAG 2.2 AA and define behavior at 390, 768, 1024, and 1440px.

Produce:

1. User/task assumptions and information hierarchy.
2. Desktop and mobile low-fidelity wireframes.
3. High-fidelity visual specification.
4. Interaction, loading, failure, and recovery behavior.
5. Content design with final button labels and messages.
6. Shared `@erp/ui` component mapping.
7. Accessibility and keyboard acceptance criteria.
8. Playwright and visual-regression checklist.

Do not implement until the design has been reviewed and approved.
