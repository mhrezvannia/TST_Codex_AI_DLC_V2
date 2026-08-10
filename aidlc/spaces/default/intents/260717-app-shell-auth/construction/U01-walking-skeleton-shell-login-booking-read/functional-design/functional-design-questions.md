# Functional Design Questions - U01 Walking Skeleton

## Source Context

This questions file consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It captures only decisions still relevant to U01: shell login, session handoff, one Booking read, real actor propagation, and fail-closed behavior.

## Questions and Answers

1. What is the U01 business workflow?
   - A. Protected Nginx entry -> existing auth/Keycloak -> shell landing -> `/booking` read -> booking-service evidence with real actor.
   - B. Shell login only with no Booking call.
   - C. Booking create path inside the walking skeleton.
   - X. Other (please specify)
   - `[Answer]:` A - already decided by `team-practices.md` and `unit-of-work.md`.

2. What subject is acceptable for U01 live proof?
   - A. Any authenticated deterministic local subject except `local-user`, with correlation evidence.
   - B. `local-user` through the current bypass.
   - C. No actor evidence until later Bolts.
   - X. Other (please specify)
   - `[Answer]:` A - U01 must prove the mounted read path cannot fall back to `local-user`.

3. What should happen when the shell cannot resolve a subject?
   - A. Redirect or fail closed before Booking BFF calls booking-service.
   - B. Retry with `local-user`.
   - C. Render Booking with empty data.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-05, NFR-02, and NFR-03 in `requirements.md`.

4. What frontend library constraints apply?
   - A. Use existing Next.js/React/TypeScript patterns only; no Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
   - B. Introduce Redux Toolkit for shell state.
   - C. Add a separate styling stack.
   - X. Other (please specify)
   - `[Answer]:` A - required by NFR-07 and `unit-of-work-story-map.md`.

## Ambiguity Analysis

No ambiguous answers remain for U01. Route namespace, shell ownership, auth reuse, and Booking read actor behavior are already settled by `components.md`, `component-methods.md`, `services.md`, and `unit-of-work.md`.
