# Design System Mapping - W2-01 App Shell and Auth

## Source Context

This mapping consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It maps W2-01 screens to existing shared UI usage while preserving W2-02 ownership of broad design-system foundation.

## Principles

- Consume existing `@erp/ui`, `packages/auth`, and app-level patterns where practical.
- Do not create a new design-system foundation in W2-01.
- Do not introduce prohibited frontend choices: Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Keep operational shell UI quiet, dense, and scannable.
- Use stable dimensions for nav, toolbar controls, table/card rows, and user-menu controls so text and dynamic status do not shift the layout.

## Component Mapping

| UX need | Preferred primitive/pattern | Notes |
| --- | --- | --- |
| Shell frame | Layout primitives or app-level shell component | New shell host is W2-01-specific; reusable foundation decisions stay with W2-02. |
| Top bar | Header layout, Button, user menu trigger | User menu must expose display name and sign-out. |
| Side navigation | Nav list, active item, Drawer on mobile | Non-mounted modules are disabled placeholders or external links per FR-09. |
| Breadcrumbs | Breadcrumb/link pattern | Current item is text, previous items links. |
| Booking list | Table on desktop, card list on mobile | Preserve existing Booking list data and actions. |
| Status badges | Badge | Use text plus badge; never color alone. |
| Create/action controls | Button, form controls already used by Booking | Preserve W1 behavior. |
| Access denied | EmptyState or feedback panel | Must render inside shell. |
| Evidence panel | Description list or compact status panel | Shows subject, authorization, and correlation id without raw tokens. |
| Loading | Skeleton | Content-shaped skeletons for shell and Booking data. |
| Error/success | Toast or inline status message | Include correlation id for failures. |

## Token and Styling Commitments

| Area | Commitment |
| --- | --- |
| Color | Use existing tokens/classes; no hardcoded hex palette in W2-01 UI code. |
| Typography | Use existing scale; compact dashboard headings, no hero-scale type inside shell. |
| Spacing | Use existing spacing tokens or shared classes; avoid ad hoc pixel-heavy layout. |
| Radius | Follow existing system; do not create decorative card-heavy shell sections. |
| Icons | Use the existing icon library if already present; otherwise use text labels until application design chooses an icon source. |
| Motion | Keep transitions under 300ms and respect `prefers-reduced-motion`. |

## Screen-to-Primitive Matrix

| Screen | Primitives |
| --- | --- |
| Protected entry | Status text, redirect feedback, auth app components |
| Shell landing | Shell frame, nav, breadcrumb, primary Booking link/tile, user menu |
| Booking list | Shell frame, breadcrumb, button, search input, filters, table/card list, skeleton, error feedback |
| Booking detail/action | Shell frame, summary panels, action buttons, evidence panel, toast/inline status |
| Access denied | Shell frame, feedback panel, request-access button/link, back link |
| Signed out | Auth/signed-out page pattern, sign-in action |

## W2-02 Preservation

W2-01 may consume existing W2-02 primitives and tokens, but any broader foundation work is a dependency or follow-up, not part of this slice. If W2-01 needs a small shell primitive, the implementation must document why it is necessary for the vertical slice and avoid broad theming or component-library rewrites.

## W0/W1 Preservation

| Prior work | UX mapping guard |
| --- | --- |
| W0-01 platform/eventing | Display correlation/evidence state only through existing observability/service contracts; do not redesign eventing, outbox, messaging, or platform telemetry. |
| W0-02 reference-data completeness | Use existing Booking reference-data lookup behavior through stable interfaces; do not alter reference-data seed/completeness surfaces or migrate the reference-data app. |
| W1-01 Booking | Preserve list/detail/create/action behavior and the explicit live-proof waiver; W2-01 changes shell/session context and actor propagation only. |
| W2-02 design-system foundation | Consume existing primitives and record gaps; no broad component-library or token rewrite. |

## Verification

- Diff review confirms no broad `packages/ui` foundation rewrite unless explicitly justified by W2-01.
- Diff review confirms W0-01 platform/eventing and W0-02 reference-data seed/completeness files are unchanged or touched only with W2-01-specific justification and targeted verification.
- Responsive checks confirm nav, breadcrumbs, buttons, status badges, and evidence text do not overlap.
- Detector 6d remains focused on hardcoded-auth behavior in mounted shell/Booking surfaces.
