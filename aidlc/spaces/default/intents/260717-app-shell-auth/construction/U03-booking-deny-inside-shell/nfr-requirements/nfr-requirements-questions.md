# NFR Requirements Questions - U03 Booking Deny

## Source Context

This questions file consumes U03 `business-logic-model.md`, U03 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U03 proves `local.reference.admin` denied Booking access inside the shell.

## Questions and Answers

1. What performance target applies to the deny path?
   - A. Authenticated `/booking` denial renders within 3 seconds p95 in local proof, excluding cold start.
   - B. No target.
   - C. Production SLO.
   - X. Other (please specify)
   - `[Answer]:` A - local live proof is enough for U03.

2. What security target closes U03?
   - A. identity-service denies real subject; no Booking data or mutation is disclosed; no `local-user` fallback.
   - B. Empty list for unauthorized users.
   - C. Shell-only hide.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-07 and U03 design.

3. What UX reliability target applies?
   - A. Denied state remains in-shell, keyboard reachable, and includes correlation/decision reference.
   - B. Standalone error page.
   - C. Browser alert only.
   - X. Other (please specify)
   - `[Answer]:` A - required by mockups and NFR-09.

4. What stack constraints apply?
   - A. Existing Next.js/React/TypeScript and identity-service; no prohibited frontend libraries.
   - B. New policy UI framework.
   - C. New auth provider.
   - X. Other (please specify)
   - `[Answer]:` A - U03 is W2-01 only.

## Ambiguity Analysis

No blocking ambiguity remains. U03 tests authenticated unauthorized behavior, not anonymous redirect.
