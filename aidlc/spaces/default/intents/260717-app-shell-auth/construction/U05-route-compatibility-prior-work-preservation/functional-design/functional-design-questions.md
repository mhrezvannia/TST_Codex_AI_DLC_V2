# Functional Design Questions - U05 Compatibility and Preservation

## Source Context

This questions file consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U05 covers `/bookings*` compatibility, canonical `/booking*` shell routes, preserved W1 Booking behavior, and W0-01/W0-02/W1-01/W2-02 preservation evidence.

## Questions and Answers

1. What is the canonical user-facing route namespace?
   - A. `/`, `/booking`, `/booking/new`, and `/booking/[id]`, with `/bookings*` compatibility.
   - B. Keep `/bookings*` as canonical.
   - C. Use `/app/booking*`.
   - X. Other (please specify)
   - `[Answer]:` A - fixed by ADR-001A and `unit-of-work.md`.

2. How should prior-work preservation be proven?
   - A. Scoped diff review plus targeted live/build checks for W0-01, W0-02, W1-01, and W2-02.
   - B. Rewrite prior work into the shell.
   - C. Claim preservation from passing screenshots only.
   - X. Other (please specify)
   - `[Answer]:` A - required by NFR-06, NFR-10, and U05 DoD.

3. Which Booking behavior must remain live in U05?
   - A. Existing list/detail/create behavior inside shell and compatibility paths.
   - B. All future Booking workflows and W4-01 migrations.
   - C. Only redirect status codes.
   - X. Other (please specify)
   - `[Answer]:` A - U05 depends on U02 so create/detail can be checked.

4. What must happen to W1's live-proof waiver?
   - A. Keep it explicit as BLOCKED at `compose-start`.
   - B. Rewrite it as PASS after W2-01 succeeds.
   - C. Remove it from evidence.
   - X. Other (please specify)
   - `[Answer]:` A - required by the user, requirements, and unit design.

## Ambiguity Analysis

No blocking ambiguity remains. U05 can choose redirects or internal route resolution during implementation, but the observable behavior must land users in canonical shell `/booking*` routes.
