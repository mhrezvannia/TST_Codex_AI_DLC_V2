$ui-ux-pro-max

Act as a principal enterprise UX designer specializing in resilient
ocean-shipping ERP workflows and error recovery. This is an AI-DLC inception
design task for LinerCore. Do not edit production code in this turn.

Inspect the existing Booking not-found component, Booking unavailable state,
list-context behavior, API failure responses, and running demo. Redesign the
missing-record and page-level failure experience for Booking.

LinerCore users include booking agents, customer-service operators, pricing
users, equipment controllers, supervisors, and auditors. A failure must explain
the business situation, preserve context, and offer the safest recovery.

Design distinct states for:

- Booking ID does not exist.
- Booking was deleted, archived, or is no longer visible.
- User lacks permission to view the booking.
- Invalid or malformed deep link.
- Booking service temporarily unavailable.
- Partial booking data returned.
- Stale revision or record changed.
- Requested record is outside the user's business scope.

For each state, provide the most useful recovery from:

- Back to the previously filtered Booking list.
- Retry.
- Request access.
- Return to workspace.
- Open the latest revision.

Do not expose stack traces or make every failure a full-screen red panel.
Technical details may contain correlation ID, timestamp, service name, and copy
action inside a collapsed support section. Never expose secrets.

Use the shared LinerCore ERP style: retain safe shell context when appropriate,
light neutral surfaces, near-black text, restrained maritime blue, semantic
amber/red used sparingly, Source Sans 3 or Inter, a small Lucide icon, 4-8px
radii, visible focus, and no gradients, giant illustration, marketing copy,
decorative card stack, or dead-end page.

Meet WCAG 2.2 AA. Define focus placement after navigation or retry, live
announcement behavior, and layouts for 390, 768, 1024, and 1440px.

Produce:

1. State taxonomy and when each state applies.
2. Final heading, body, action, and technical-detail copy for every state.
3. Desktop and mobile wireframes.
4. High-fidelity visual specification.
5. Recovery and navigation behavior.
6. `@erp/ui` component mapping.
7. Accessibility acceptance criteria.
8. Playwright acceptance checklist for all failure categories.

Do not implement until the design is approved.
