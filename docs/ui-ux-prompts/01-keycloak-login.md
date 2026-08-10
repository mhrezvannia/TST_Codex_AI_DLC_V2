$ui-ux-pro-max

Act as a principal enterprise UX designer specializing in secure identity
experiences and ocean-shipping ERP systems. This is an AI-DLC inception design
task for LinerCore. Do not edit production code in this turn.

Inspect the current Keycloak login reached through the LinerCore authentication
flow, the realm configuration, and the running demo. Design a production-quality
Keycloak theme for the login page used by internal shipping-company users.

LinerCore is an operational ERP used by booking agents, pricing analysts,
reference-data stewards, equipment controllers, supervisors, auditors, and
administrators. The interface must be quiet, trustworthy, compact, accessible,
and consistent with the authenticated ERP.

The login page must contain:

- LinerCore wordmark as the first visual signal.
- Username and password fields with persistent labels.
- Familiar show/hide password icon with tooltip and accessible name.
- Primary `Sign in` action.
- Forgot-password link only if the realm actually supports it.
- Language selector only if multiple languages are configured.
- Compact environment indicator such as `Local demo`, `UAT`, or `Production`.
- Optional security/support link in a low-priority location.

Do not create a marketing landing page, decorative hero, split-screen stock
photo, gradient background, glass panel, or oversized welcome message. Do not
show operational data before authentication. Do not expose OIDC, PKCE, client
IDs, callback URLs, realm internals, or technical diagnostic values.

Use a light neutral background, high-contrast near-black text, restrained
maritime blue for the primary action, and semantic red only for authentication
errors. Use Source Sans 3 or the existing Inter stack, 4-8px radii, Lucide-style
icons, visible focus, and no layout-changing hover animation.

Design these states:

- Default login.
- Submitting with duplicate submission prevented.
- Invalid credentials.
- Account locked or disabled.
- Required action or password update.
- Session expired.
- Identity provider unavailable.
- Keyboard Caps Lock warning where technically feasible.
- Password-manager/autofill behavior.
- Small mobile viewport and software keyboard.

Meet WCAG 2.2 AA. Define focus order, error announcement, autocomplete
attributes, accessible password visibility control, and 390/768/1024/1440px
behavior.

Produce:

1. User/task assumptions.
2. Desktop and mobile low-fidelity wireframes.
3. High-fidelity visual specification and exact token usage.
4. Every interaction and error state.
5. Keycloak theme file/component map for login and error templates.
6. Shared-token mapping back to `@erp/ui` without coupling Keycloak to React.
7. Accessibility acceptance criteria.
8. Screenshot and Playwright acceptance checklist for the complete sign-in flow.

End with any Keycloak capabilities that must be confirmed. Do not implement the
theme until the design is approved.
