# NFR Requirements Questions - U04 Sign-Out Guard

## Source Context

This questions file consumes U04 `business-logic-model.md`, U04 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U04 proves sign-out, session clearing, protected-route reauth, and stale Booking call fail-closed behavior.

## Questions and Answers

1. What performance target applies?
   - A. Sign-out response/redirect and protected-route reauth proof complete within 3 seconds p95 in local proof, excluding cold start.
   - B. No target.
   - C. Production SLO.
   - X. Other (please specify)
   - `[Answer]:` A - local Construction target.

2. What security target closes U04?
   - A. `POST /api/auth/sign-out` clears `lc_session`; stale Booking calls return `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` before backend fetch.
   - B. Client-only state clear.
   - C. Backend may fall back to `local-user`.
   - X. Other (please specify)
   - `[Answer]:` A - required by U04 functional design remediation.

3. What reliability evidence is required?
   - A. Keycloak logout redirect, cookie clear, `/` and `/booking` require login, stale call blocked with correlation and no backend `local-user`.
   - B. Screenshot of a signed-out page only.
   - C. Unit tests only.
   - X. Other (please specify)
   - `[Answer]:` A - required by U04 DoD.

4. What stack constraints apply?
   - A. Existing auth routes and Next.js/React/TypeScript; no prohibited libraries or new auth service.
   - B. New client session store.
   - C. New auth provider.
   - X. Other (please specify)
   - `[Answer]:` A - W2-01 reuses existing auth.

## Ambiguity Analysis

No blocking ambiguity remains. U04 does not own allow/deny role decisions except stale/missing-subject fail-closed behavior.
