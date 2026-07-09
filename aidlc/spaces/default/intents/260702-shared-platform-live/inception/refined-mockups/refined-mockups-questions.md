# Refined Mockups Questions - Shared Platform Local Functionality

## Context

This design plan consumes `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. Answers are inferred from approved artifacts because the user has asked to keep progressing without optional questions until Shared Platform is locally functional.

## Questions and Answers

### Q1. Which module should anchor the refined UX?

A. Auth only.
B. Reference Data workbench as the primary module, with auth/session, seed/status, event publication, contracts, and readiness as supporting Shared Platform surfaces.
C. Customer Booking.
D. Charge and Customer Agreement.
E. Container Movement Management.
X. Other (please specify)

[Answer]: B - `stories` US-006 through US-012 and `requirements` FR-015 through FR-027 make Reference Data the core user-facing module for this intent.

### Q2. How should write actions be represented?

A. Keep all actions disabled.
B. Enable actions only when identity-derived permission state allows them, and show denial reason plus correlation id when blocked.
C. Hide actions for all users.
D. Call backend services directly from browser components.
E. Replace UI actions with command-line only flows.
X. Other (please specify)

[Answer]: B - `team-practices` and `requirements` require BFF-mediated authorization and explicit read-only state rather than static defaults.

### Q3. What interaction pattern should create/edit/deactivate use?

A. Full page navigation for every mutation.
B. Drawer for create/edit and confirmation dialog for deactivate, with backend validation errors mapped to fields.
C. Inline table cells only.
D. Toast-only mutation feedback.
E. Batch upload only.
X. Other (please specify)

[Answer]: B - This matches `wireframes` and keeps mutation forms inspectable while preserving the workbench context.

### Q4. Which states must every screen handle?

A. Happy path only.
B. Loading, empty, unauthorized, validation error, backend unavailable, success, partial failure, publication pending, publication failed, stale version.
C. Visual hover state only.
D. Desktop-only state.
E. Production deployment state only.
X. Other (please specify)

[Answer]: B - The `user-flow` alternate flows and `requirements` NFR-003/NFR-006 require explicit failure and observability states.

### Q5. What accessibility baseline applies?

A. No accessibility requirement.
B. WCAG 2.1 AA baseline with keyboard navigation, landmarks, focus handling, labelled controls, table semantics, and non-color status.
C. Color contrast only.
D. Screen-reader labels only.
E. Mobile layout only.
X. Other (please specify)

[Answer]: B - This follows `requirements` NFR-005 and the design-agent practice for inclusive internal tools.

### Q6. What responsive posture is appropriate?

A. Mobile-first consumer app.
B. Desktop-first operations UI with tablet stacking and mobile inspection support.
C. Desktop only with no responsive behavior.
D. Marketing landing page.
E. Native mobile app.
X. Other (please specify)

[Answer]: B - Reference Data administration is operational and table-heavy, while mobile should still support inspection and status review.

## Plan Summary

- Primary module: Reference Data workbench in Shared Platform.
- Supporting surfaces: Auth/session, seed runs, event publication, contract readiness, local readiness.
- Interaction model: permission-aware actions, drawer forms, confirmation dialogs, persistent detail/status panels.
- Screen states: explicit loading, empty, error, unauthorized, success, partial, retry, stale-version, and backend-down states.
- Accessibility target: WCAG 2.1 AA baseline.

