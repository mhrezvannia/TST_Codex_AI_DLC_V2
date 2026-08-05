# Refined Mockups Questions - W2-01 App Shell and Auth

## Source Context

This question file consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. The W2-01 Context Pack already resolves the main UX direction: one authenticated shell, Booking as first mounted module, explicit denied/sign-out states, and live evidence that rejects `local-user`.

## Questions

1. Which refined layout should W2-01 implement?
   - A. Work-focused app shell: fixed top bar, responsive side navigation, breadcrumbs, and unframed main content.
   - B. Marketing-style landing page before business navigation.
   - C. Standalone Booking workbench without global shell.
   - X. Other (please specify)
   - `[Answer]:` A - `wireframes.md`, `stories.md`, and `requirements.md` require an authenticated ERP shell, not a landing page or standalone workbench.

2. Which interaction patterns are needed?
   - A. Protected-route redirect, side navigation, breadcrumbs, user menu, inline denied/signed-out states, table/list actions, and evidence status panel.
   - B. Nested modal workflows for the shell and Booking actions.
   - C. Drag-and-drop navigation customization.
   - X. Other (please specify)
   - `[Answer]:` A - `user-flow.md` and `stories.md` define route/state transitions; modals and drag/drop are not needed for W2-01.

3. What responsive behavior should guide implementation?
   - A. Desktop uses expanded side navigation; tablet collapses navigation; mobile uses a drawer opened from the top bar.
   - B. Desktop-only shell.
   - C. Separate mobile app.
   - X. Other (please specify)
   - `[Answer]:` A - `requirements.md` NFR-09 requires common desktop and mobile widths without overlap.

4. What accessibility target applies?
   - A. WCAG 2.1 AA with keyboard access, focus management, landmarks, visible focus, text labels, and live regions for async state.
   - B. Automated scan only.
   - C. No explicit accessibility target for W2-01.
   - X. Other (please specify)
   - `[Answer]:` A - `wireframes.md`, `stories.md`, and design-agent guidance require concrete accessibility states.

5. How should W2-01 relate to W2-02 design-system work?
   - A. Consume existing `@erp/ui` or shared primitives where present, but do not create broad design-system foundation work.
   - B. Build a new design system inside W2-01.
   - C. Ignore shared UI conventions.
   - X. Other (please specify)
   - `[Answer]:` A - `requirements.md` preserves W2-02 and forbids scope expansion.
