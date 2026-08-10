# Rough Mockups Questions - W2-01 App Shell and Auth

## Source Context

This stage consumes `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`. Answers are extracted from the approved W2-01 scope and proto-unit backlog.

## Questions and Extracted Answers

1. What are the primary screens?
   - A. Login redirect, authenticated shell landing, Booking list/detail mounted in shell, access denied, signed out.
   - B. All module detail pages.
   - C. Design-system gallery.
   - D. Admin role editor.
   - E. Public marketing page.
   - X. Other (please specify)
   - `[Answer]:` A

2. What is the happy path?
   - A. Browser -> protected shell -> Keycloak/auth -> shell -> Booking -> action with real subject -> sign out.
   - B. Direct Booking app without login.
   - C. Auth app only.
   - D. Charge agreement only.
   - E. Static shell only.
   - X. Other (please specify)
   - `[Answer]:` A

3. What information hierarchy matters most?
   - A. Top bar/session, left nav, breadcrumbs, main Booking work area, status/audit feedback.
   - B. Marketing hero.
   - C. Dashboard widgets first.
   - D. Global reporting first.
   - E. Admin forms first.
   - X. Other (please specify)
   - `[Answer]:` A

4. What design system should be followed?
   - A. Consume existing W2-02/@erp/ui primitives where available, but do not build the design-system foundation in W2-01.
   - B. Build all primitives now.
   - C. Use ad-hoc module styles.
   - D. Import an external UI kit.
   - E. No UI standards.
   - X. Other (please specify)
   - `[Answer]:` A

5. What form factors and accessibility baseline apply?
   - A. Desktop-first ERP layout with responsive collapse, keyboard navigation, landmarks, visible focus, non-color-only states, WCAG AA intent.
   - B. Desktop only with no keyboard path.
   - C. Mobile-only.
   - D. No accessibility requirement.
   - E. Kiosk only.
   - X. Other (please specify)
   - `[Answer]:` A

6. What is deferred?
   - A. Full role nav filtering, full module migrations, design-system foundation, and visual polish beyond rough concept.
   - B. Booking mount.
   - C. Access denied.
   - D. Sign out.
   - E. Real subject status.
   - X. Other (please specify)
   - `[Answer]:` A
