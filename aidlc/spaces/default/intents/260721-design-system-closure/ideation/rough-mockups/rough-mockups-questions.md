# Rough Mockups Questions

The guided answers reconcile intent-statement.md, scope-document.md, and intent-backlog.md with MASTER.md and SESSION-PROMPT.md.

## Answered Decisions

1. **Entry points and screens:** Booking list, create, and detail under the shared authenticated shell.
2. **Core flow:** Enter Booking; filter and open an existing record or create one; inspect identity, status, lifecycle evidence, and available actions.
3. **Information hierarchy:** Compact header/commands/filters/table for list; grouped labelled fields and explicit save/cancel for create; identity/status/actions/sections/audit for detail.
4. **Design authority:** Existing LinerCore shell, tokens, @erp/ui primitives, MASTER.md, SESSION-PROMPT.md, and current operational visual references.
5. **Form factors:** 375px, 768px, 1024px, and 1440px, with intentional table handling and toolbar reflow.
6. **Accessibility:** Keyboard-only operation, visible focus, logical headings/landmarks, persistent labels/errors, dialog focus management, live feedback, reduced motion, and light/dark contrast.

## Contradiction Review

- ui-ux-pro-max suggested an enterprise marketing gateway, Fira remote fonts, alternate blue/amber colors, and marketing sections. These conflict with the active closure and are rejected.
- Data density, filtering, visible focus, responsive checks, reduced motion, and non-decorative interaction feedback align with the binding contract and are retained.
- No new Booking page override is needed at rough fidelity; all decisions are already shared-contract rules.
