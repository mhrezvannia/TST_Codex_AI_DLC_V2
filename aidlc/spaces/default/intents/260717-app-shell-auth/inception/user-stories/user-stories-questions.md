# User Stories Questions - W2-01 App Shell and Auth

## Source Context

This story plan consumes `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. The approved requirements and prior scope artifacts resolve the story split, personas, and MVP boundary for this stage.

## Questions

1. Which story split best fits W2-01?
   - A. Split by vertical journey steps: protected entry, subject propagation, navigation/denied/sign-out, mounted Booking proof.
   - B. Split by technical layers: auth app, shell frontend, Booking BFF, backend services.
   - C. Split by broad ERP modules.
   - X. Other (please specify)
   - `[Answer]:` A - The slicing playbook and `team-practices.md` require vertical slices, with the first slice proving protected shell entry and real subject handoff.

2. Which personas should drive the stories?
   - A. Authenticated Booking user, unauthorized authenticated user, Platform/UI implementer, QA evidence owner.
   - B. All ERP module personas across Booking, reference data, charge agreements, and container movement.
   - C. Developer-only personas.
   - X. Other (please specify)
   - `[Answer]:` A - `requirements.md` and `business-overview.md` focus on authenticated shell/Booking behavior and live evidence.

3. What belongs above the MVP line?
   - A. Login to shell, Booking mount, session-derived actor propagation, denied path, sign-out, live evidence, and prior-work preservation checks.
   - B. Full role-admin UX and all module migrations.
   - C. Visual shell polish before subject propagation.
   - X. Other (please specify)
   - `[Answer]:` A - `requirements.md` marks these as must-have live behavior and defers broad module migration and design-system foundation.

4. How should UX acceptance be expressed?
   - A. Observable shell states, keyboard/focus behavior, route/breadcrumb state, and actionable denied/sign-out recovery.
   - B. Visual screenshots only.
   - C. Implementation component names only.
   - X. Other (please specify)
   - `[Answer]:` A - The design-agent support perspective and rough mockups require concrete interaction and accessibility states.
