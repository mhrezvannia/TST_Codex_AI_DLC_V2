# NFR Design Questions - U01 Walking Skeleton

## Source Context

This questions file consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U01 proves Nginx -> shell -> existing auth/Keycloak -> session summary -> Booking BFF read -> booking-service read with a non-`local-user` actor and correlation id.

## Questions and Answers

1. Which performance pattern should U01 use?
   - A. Keep existing request path and 2500 ms Booking BFF backend timeout; record local route timings; add no cache/CDN/runtime service.
   - B. Add a cache layer before proving actor propagation.
   - C. Add cloud CDN/autoscaling.
   - X. Other (please specify)
   - `[Answer]:` A - selected by U01 `performance-requirements.md` and `tech-stack-decisions.md`.

2. Which security pattern should U01 use?
   - A. Server-side session guard, safe session summary, request-scoped actor resolver, fail-closed BFF/backend actor checks.
   - B. Client-side actor header construction.
   - C. Keep implicit `local-user` for local proof.
   - X. Other (please specify)
   - `[Answer]:` A - required by `security-requirements.md` and `business-logic-model.md`.

3. Which scaling pattern applies?
   - A. Stateless shell/BFF request handling; no in-memory session authority or new shared state.
   - B. In-memory user session cache.
   - C. Queue-based decoupling for one read.
   - X. Other (please specify)
   - `[Answer]:` A - required by `scalability-requirements.md`.

4. Which reliability pattern applies?
   - A. Fail closed on session/actor absence, bounded backend timeout, recoverable error state with correlation id, honest blocker evidence.
   - B. Fake empty list on backend failure.
   - C. Retry as `local-user`.
   - X. Other (please specify)
   - `[Answer]:` A - required by `reliability-requirements.md`.

## Ambiguity Analysis

No blocking ambiguity remains for U01 NFR Design. Production load, autoscaling, and cloud deployment remain out of scope for this unit.
