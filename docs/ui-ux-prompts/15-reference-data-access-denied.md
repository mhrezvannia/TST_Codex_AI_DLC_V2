$ui-ux-pro-max

Act as a principal enterprise UX designer with identity governance,
master-data stewardship, and ocean-shipping ERP experience. This is an AI-DLC
inception design task for LinerCore. Do not edit production code in this turn.

Inspect `http://127.0.0.1/reference-data/access-denied`, the module permission
check, global Auth request-access workflow, and running demo. Redesign this
module-specific denial as a coherent LinerCore authorization state.

Reference Data is a governed module whose records affect Booking, pricing,
voyages, equipment, and movement processing. Explain clearly whether the user
lacks module access, lacks write permission, or is outside the required business
scope.

Show:

- Protected module: Reference Data.
- Blocked capability such as View, Create, Edit, Deactivate, or Publish.
- Business-language reason.
- Current read-only capability when applicable.
- Primary `Request access` action when supported.
- Secondary `Return to workspace` and `Go back` actions.

If the user can view but not mutate, prefer keeping the workbench visible in
read-only mode with a permission banner instead of replacing the whole module
with a denial page. Use the full denial page only when the module itself cannot
be viewed.

Put reason code, permission key, correlation ID, timestamp, and copy action in a
collapsed technical-details section. Never expose tokens, policy internals, or
stack traces.

Use the shared LinerCore ERP visual language: safe shell context, compact page
state, light neutral surfaces, near-black text, restrained maritime blue,
semantic amber/red used sparingly, Source Sans 3 or Inter, Lucide icon, 4-8px
radii, visible focus, and no giant red screen, gradients, illustration, nested
cards, or marketing copy.

Design module denied, read-only, sensitive-set denied, business-scope mismatch,
session expired, request already open, and permission-service unavailable
states. Meet WCAG 2.2 AA and define 390, 768, 1024, and 1440px behavior.

Produce:

1. Permission-state taxonomy and page-vs-banner decision.
2. Final business and technical-detail copy.
3. Desktop and mobile wireframes.
4. High-fidelity specification.
5. Request-access and safe-return behavior.
6. `@erp/ui` component mapping.
7. Accessibility acceptance criteria.
8. Playwright acceptance checklist.

Do not implement until the design is approved.
