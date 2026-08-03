$ui-ux-pro-max

Act as a principal enterprise UX designer specializing in secure authentication
handoffs and operational ERP systems. This is an AI-DLC inception design task.
Do not edit production code in this turn.

Inspect the existing route `http://127.0.0.1/auth/sign-in`, its return URL
behavior, and the current Keycloak redirect. Redesign the page as a brief,
trustworthy transition between LinerCore and the company identity provider.

LinerCore is an enterprise ERP for an ocean shipping company. Users include
booking agents, customer-service operators, pricing analysts, reference-data
stewards, equipment controllers, supervisors, auditors, and administrators.

The normal path should require no technical decisions. Explain in one or two
sentences that the user will continue to the company identity service and return
to the requested LinerCore workspace. Use `Continue to sign in` as the primary
action and `Cancel` as the secondary action. Prevent repeated submissions and
show visible redirect progress.

Do not expose raw return URLs, client identifiers, callback paths, OIDC, PKCE,
cookies, or BFF implementation details. Express a safe destination in business
language, for example `You will return to Booking details`. Reject or neutralize
unsafe destinations.

Use the shared ERP visual system: light neutral background, near-black text,
restrained maritime blue, semantic status colors, Source Sans 3 or Inter,
Lucide icons, subtle borders, 4-8px radii, visible focus, and no hero layout,
gradient, stock imagery, decorative cards, or glass effects.

Design default, redirect-in-progress, invalid destination, expired transaction,
identity-provider unavailable, and user-cancelled states. Define keyboard focus,
live announcements, reduced motion, and behavior at 390, 768, 1024, and 1440px.

Produce:

1. User/task assumptions and concise information hierarchy.
2. Desktop and mobile wireframes.
3. High-fidelity visual specification.
4. Final UX copy for every state.
5. Redirect, cancellation, retry, and duplicate-click behavior.
6. `@erp/ui` component mapping.
7. Accessibility acceptance criteria.
8. Playwright acceptance checklist covering safe return behavior.

Do not implement until the design is approved.
