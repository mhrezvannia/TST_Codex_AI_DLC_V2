$ui-ux-pro-max

Act as a principal enterprise UX designer with identity-governance and
ocean-shipping ERP expertise. This is an AI-DLC inception design task for
LinerCore. Do not edit production code in this turn.

Inspect the current route `http://127.0.0.1/auth/access-denied`, its query
parameters for resource, action, reason code, and correlation ID, and the
request-access path. Redesign it as a calm, specific authorization decision with
clear recovery.

LinerCore users include booking agents, pricing analysts and approvers,
reference-data stewards, equipment controllers, supervisors, auditors, and
administrators. A denial must preserve trust and must never suggest that retrying
can bypass policy.

State in business language:

- Which action was blocked.
- Which module, record, or resource was protected.
- Why the user may not currently perform it.
- What the user can do next.

Use `Request access` as the primary action when supported. Provide `Go back` and
`Return to workspace` as secondary actions. If there is already an open request,
show its status rather than creating a duplicate.

Put reason code, correlation ID, timestamp, and copy affordance inside a
collapsed `Technical details` section. Never expose a stack trace, token, policy
internals, or sensitive claims.

Use a compact page state within the shared LinerCore system: light neutral
surface, near-black text, restrained maritime blue, semantic amber/red used
sparingly, an accessible Lucide icon, Source Sans 3 or Inter, 4-8px radii,
visible focus, and no giant red screen, gradient, illustration, decorative
card, or marketing copy.

Design no-permission, business-scope mismatch, expired session, feature
unavailable, request already open, request service unavailable, and invalid
context states. Meet WCAG 2.2 AA and specify 390, 768, 1024, and 1440px behavior.

Produce:

1. User/task assumptions.
2. Desktop and mobile wireframes.
3. Final UX copy for every denial type.
4. High-fidelity visual specification.
5. Recovery and navigation behavior.
6. `@erp/ui` component mapping.
7. Focus placement and screen-reader announcements.
8. Playwright acceptance checklist.

Do not implement until the design is approved.
