$ui-ux-pro-max

Act as a principal enterprise UX designer specializing in identity, access
management, privacy, and operational ERP systems. This is an AI-DLC inception
design task for LinerCore. Do not edit production code in this turn.

Inspect the current route `http://127.0.0.1/auth/session`, its safe session API,
the global user menu, and the running demo. Redesign the page as a useful
enterprise account and session view rather than a developer payload viewer.

LinerCore is an ocean-shipping ERP used by booking agents, pricing analysts and
approvers, reference-data stewards, equipment controllers, supervisors,
auditors, and administrators.

Show:

- Display name and username.
- Subject identifier as a secondary technical value.
- Assigned roles.
- Business or organizational scope.
- Modules and important capabilities currently granted.
- Last authentication time.
- Session expiry and an expiring-soon warning.
- Primary `Return to workspace` action.
- Clearly separated `Sign out` action.

Do not make raw JSON the primary action. If safe session JSON remains useful for
the local demo, place it in an admin-only `Technical details` disclosure with a
copy button, privacy warning, and no secrets or raw tokens.

Use the shared LinerCore ERP visual language: persistent product identity,
compact page header, light neutral surfaces, near-black text, restrained
maritime blue, semantic status colors, Source Sans 3 or Inter, Lucide icons,
4-8px radii, subtle borders, visible focus, and no hero, gradients, glass,
illustration-first layout, nested cards, or oversized account avatar.

Design normal, expiring soon, expired, reduced permission, identity-service
unavailable, signing-out, and sign-out-failed states. Define whether sign out
requires confirmation based on business risk, and provide deterministic
completion behavior.

Meet WCAG 2.2 AA. Specify focus order, copy feedback, async announcements,
privacy behavior, and layouts for 390, 768, 1024, and 1440px.

Produce:

1. User/task assumptions and information hierarchy.
2. Desktop and mobile wireframes.
3. High-fidelity visual and content specification.
4. Session and sign-out interaction matrix.
5. User-menu relationship to this page.
6. `@erp/ui` component mapping.
7. Accessibility acceptance criteria.
8. Playwright acceptance checklist.

Do not implement until the design is approved.
