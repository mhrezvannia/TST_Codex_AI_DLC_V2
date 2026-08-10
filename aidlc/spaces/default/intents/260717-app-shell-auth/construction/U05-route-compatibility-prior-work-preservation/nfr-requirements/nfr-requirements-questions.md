# NFR Requirements Questions - U05 Compatibility and Preservation

## Source Context

This questions file consumes U05 `business-logic-model.md`, U05 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U05 proves `/bookings*` compatibility and prior-work preservation.

## Questions and Answers

1. What performance target applies to compatibility routes?
   - A. `/bookings*` redirect/resolution to canonical `/booking*` completes within 1 second p95 locally, excluding auth redirect and cold start.
   - B. No target.
   - C. Production SLO.
   - X. Other (please specify)
   - `[Answer]:` A - compatibility should be lightweight and measurable.

2. What security target applies?
   - A. Compatibility routes preserve shell auth/session/actor guards and cannot bypass to standalone Booking with `local-user`.
   - B. Compatibility routes are public.
   - C. Compatibility can skip actor proof.
   - X. Other (please specify)
   - `[Answer]:` A - required by U05 design.

3. What preservation evidence is required?
   - A. Scoped diff review for W0-01, W0-02, W1-01, W2-02 plus targeted verification for any touched prior-work file.
   - B. Broad prior-intent reimplementation.
   - C. No evidence if tests pass.
   - X. Other (please specify)
   - `[Answer]:` A - required by NFR-06/NFR-10.

4. What stack constraints apply?
   - A. Existing Next.js/Nginx route mechanisms and no prohibited frontend libraries.
   - B. New router framework.
   - C. New design-system foundation.
   - X. Other (please specify)
   - `[Answer]:` A - U05 stays within W2-01.

## Ambiguity Analysis

No blocking ambiguity remains. Redirect versus internal resolution can be selected during implementation, but observable canonical shell route behavior is mandatory.
