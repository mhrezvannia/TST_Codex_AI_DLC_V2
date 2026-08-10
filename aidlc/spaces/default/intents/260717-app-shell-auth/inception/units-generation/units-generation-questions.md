# Units Generation Questions - W2-01 App Shell and Auth

## Source Context

This decomposition plan consumes `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. The approved application design resolves the unit boundaries for this stage.

## Questions

1. What unit boundary strategy should W2-01 use?
   - A. Vertical seam units that each preserve the shell/auth/Booking integration contract.
   - B. Horizontal service-layer units only.
   - C. Broad module-migration units across all ERP apps.
   - X. Other (please specify)
   - `[Answer]:` A - `component-dependency.md`, `team-practices.md`, and `stories.md` require vertical risk-focused boundaries.

2. What unit granularity should be used?
   - A. Medium units that are independently testable and small enough to become Construction Bolts or Bolt parts.
   - B. One coarse unit for the whole W2-01 intent.
   - C. Very fine units for every component method.
   - X. Other (please specify)
   - `[Answer]:` A - Delivery Planning needs a usable DAG, and Construction should not hide auth, actor, identity, and evidence risk inside one unit.

3. How should dependency topology be represented?
   - A. A cycle-free DAG with explicit direct dependencies and parallel opportunities; no economic build order in this stage.
   - B. A recommended build sequence and critical path.
   - C. No dependencies; leave sequencing entirely informal.
   - X. Other (please specify)
   - `[Answer]:` A - `units-generation.md` requires topology only; Stage 2.8 chooses the economic path.

4. Which integration contracts are mandatory in units?
   - A. `apps/shell` route ownership, session-derived Booking actor, identity authorization, blank-actor fail-closed behavior, `/bookings*` compatibility, live evidence, and prior-work preservation.
   - B. Shell visual layout only.
   - C. Identity catalog only.
   - X. Other (please specify)
   - `[Answer]:` A - These are the approved application-design contracts and reviewer blockers from application design.
