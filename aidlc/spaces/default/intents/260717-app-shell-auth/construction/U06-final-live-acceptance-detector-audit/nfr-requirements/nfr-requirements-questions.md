# NFR Requirements Questions - U06 Final Acceptance

## Source Context

This questions file consumes U06 `business-logic-model.md`, U06 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U06 closes final live evidence, detector 6d, `erp-fidelity-audit`, and `aidlc-audit`.

## Questions and Answers

1. What performance target applies to final evidence?
   - A. Each live scenario records timings and command exit codes; no aggregate production SLO is invented.
   - B. No timings.
   - C. Production SLO.
   - X. Other (please specify)
   - `[Answer]:` A - U06 is acceptance packaging, not production load testing.

2. What security evidence closes U06?
   - A. Real-subject allow, deny, and pre-sign-out subject/correlation evidence with detector 6d zero hardcoded-auth hits.
   - B. Screenshots only.
   - C. `local-user` accepted for local proof.
   - X. Other (please specify)
   - `[Answer]:` A - required by U06 functional design.

3. What reliability/blocker rule applies?
   - A. Green audits produce PASS; runtime/audit blockers produce explicit W2-01 BLOCKED records with required fields.
   - B. Convert blockers to PASS if enough tests pass.
   - C. Hide blockers.
   - X. Other (please specify)
   - `[Answer]:` A - required by user instruction and W2-01 requirements.

4. What tech-stack constraints apply?
   - A. Existing local Compose/Nginx stack and existing audit tooling; no cloud or prohibited frontend libraries.
   - B. New cloud acceptance path.
   - C. New evidence UI framework.
   - X. Other (please specify)
   - `[Answer]:` A - U06 stays in W2-01.

## Ambiguity Analysis

No blocking ambiguity remains. U06 does not implement behavior; it verifies and packages behavior from U01-U05.
