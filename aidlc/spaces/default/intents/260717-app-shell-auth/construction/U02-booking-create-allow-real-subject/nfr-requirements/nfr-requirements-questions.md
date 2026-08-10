# NFR Requirements Questions - U02 Booking Create Allow

## Source Context

This questions file consumes U02 `business-logic-model.md`, U02 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U02 proves `local.booking.user` create/detail allow through identity-service with real subject evidence.

## Questions and Answers

1. What performance target applies to create/detail?
   - A. Local Compose proof: create authorization plus persistence response within 5 seconds p95, and detail retrieval within 3 seconds p95, excluding cold start.
   - B. No target.
   - C. Production traffic SLO.
   - X. Other (please specify)
   - `[Answer]:` A - U02 is local live proof with a write path.

2. What security controls close U02?
   - A. identity-service authorizes `local.booking.user`, idempotency is preserved, actor/correlation are recorded, no `local-user` fallback.
   - B. Shell-only role check.
   - C. Static allow in Booking BFF.
   - X. Other (please specify)
   - `[Answer]:` A - required by U02 design and FR-06/FR-12.

3. What reliability behavior applies?
   - A. Deny/error/timeout from identity-service prevents create and records evidence; created Booking must be retrievable.
   - B. Create anyway on authorization timeout.
   - C. Skip detail retrieval.
   - X. Other (please specify)
   - `[Answer]:` A - required by U02 DoD.

4. What tech-stack constraints apply?
   - A. Existing Next.js/React/TypeScript, Java/Spring, identity-service, local Compose/Nginx; no prohibited frontend libraries or cloud additions.
   - B. Add a new authorization service.
   - C. Add Redux Toolkit for create state.
   - X. Other (please specify)
   - `[Answer]:` A - required by `technology-stack.md` and NFR-07.

## Ambiguity Analysis

No blocking ambiguity remains. The exact seed file path can be selected during implementation, but `local.booking.user` and Booking permissions must exist before U02 closes.
