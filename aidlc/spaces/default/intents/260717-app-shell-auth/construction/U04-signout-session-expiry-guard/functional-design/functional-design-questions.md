# Functional Design Questions - U04 Sign-Out Guard

## Source Context

This questions file consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U04 covers sign-out, session clearing, protected route reauth, and stale Booking BFF fail-closed behavior.

## Questions and Answers

1. Which sign-out mechanism should U04 use?
   - A. Existing auth sign-out behavior from `apps/auth`/`packages/auth`.
   - B. Client-only local state reset.
   - C. New parallel auth service.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-03, FR-08, and ADR-002.

2. What closes the stale-session risk?
   - A. Protected shell and Booking BFF calls re-check session/subject after sign-out and fail closed without `local-user`.
   - B. Hide the UI but let existing backend fallback continue.
   - C. Delay this to final audit only.
   - X. Other (please specify)
   - `[Answer]:` A - required by U04 DoD and NFR-05.

3. Which routes must require login again after sign-out?
   - A. `/` and `/booking` protected shell routes.
   - B. Only `/booking`.
   - C. No route until browser refresh.
   - X. Other (please specify)
   - `[Answer]:` A - required by U04 DoD.

4. What frontend constraints apply?
   - A. Existing Next.js/React/TypeScript patterns; no Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
   - B. New client session store.
   - C. New styling library.
   - X. Other (please specify)
   - `[Answer]:` A - required by NFR-07.

## Ambiguity Analysis

No blocking ambiguity remains. U04 does not own allow/deny authorization decisions except ensuring missing/stale subject fails closed.
