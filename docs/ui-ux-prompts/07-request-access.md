$ui-ux-pro-max

Act as a principal enterprise UX designer specializing in identity governance,
approval workflows, auditability, and ocean-shipping ERP systems. This is an
AI-DLC inception design task for LinerCore. Do not edit production code in this
turn.

Inspect `http://127.0.0.1/auth/request-access`, its form submission behavior,
denial context, and current data contract. Redesign it as an auditable access
request workflow suitable for an enterprise shipping company.

Users include booking agents, pricing analysts and approvers, reference-data
stewards, equipment controllers, supervisors, auditors, and administrators.
Access requests must be clear, policy-governed, and traceable.

Show:

- Requested module or resource.
- Requested action or capability.
- Current user.
- Business or organizational scope.
- Approver or responsible team when known.
- Required business justification.
- Requested duration when supported.
- A concise policy acknowledgment.

Prepopulate and visually protect immutable context received from the denial
event. Make business justification required and provide useful length guidance.
Use `Submit request` as the primary action and `Cancel` as the secondary action.
Never promise that a request will be approved.

After success, show a request ID, submission time, current status, and expected
next step. Offer `Return to workspace` and `View request` only if a request
tracking route exists.

Use the shared LinerCore ERP style: compact page header, light neutral surfaces,
near-black text, restrained maritime blue, semantic status colors, Source Sans
3 or Inter, Lucide icons, 4-8px radii, visible focus, and no marketing hero,
gradients, glass, decorative illustration, nested cards, or oversized form.

Design validation, duplicate request, submitting, success, policy rejection,
expired denial context, approver unavailable, and service-unavailable states.
Meet WCAG 2.2 AA. Include a linked error summary, field-level errors, async
announcements, unsaved-change behavior, and 390/768/1024/1440px layouts.

Produce:

1. User/task assumptions and information hierarchy.
2. Desktop and mobile wireframes.
3. High-fidelity form and confirmation specification.
4. Final labels, help text, validation, and success copy.
5. State and recovery matrix.
6. `@erp/ui` component mapping.
7. Accessibility acceptance criteria.
8. Playwright acceptance checklist.

Do not implement until the design is approved.
