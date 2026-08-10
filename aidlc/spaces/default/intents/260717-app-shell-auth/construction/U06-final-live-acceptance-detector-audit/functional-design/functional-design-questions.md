# Functional Design Questions - U06 Final Acceptance

## Source Context

This questions file consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U06 covers the final live evidence package, detector 6d, `erp-fidelity-audit`, `aidlc-audit`, and explicit blocker/waiver handling.

## Questions and Answers

1. What is the acceptance evidence location?
   - A. `artifacts/w2-01-live/app-shell-auth/`.
   - B. Only screenshots in the intent record.
   - C. Reuse W1 evidence folder.
   - X. Other (please specify)
   - `[Answer]:` A - required by requirements, services, and units.

2. What live journey must U06 drive?
   - A. Login -> shell -> Booking allow -> Booking deny -> sign-out through Compose/Nginx/Keycloak.
   - B. Unit tests only.
   - C. Static screenshots only.
   - X. Other (please specify)
   - `[Answer]:` A - required by U06 DoD.

3. How are blockers recorded?
   - A. W2-01 blockers are recorded honestly, while W1 waiver remains separate BLOCKED at `compose-start`.
   - B. Convert blockers to PASS if enough unit tests pass.
   - C. Hide inherited W1 waiver.
   - X. Other (please specify)
   - `[Answer]:` A - required by user instruction and acceptance criteria.

4. What audits close U06?
   - A. Detector 6d, `erp-fidelity-audit`, and `aidlc-audit` are green or W2-01 is honestly BLOCKED.
   - B. `aidlc-audit` only.
   - C. Manual review only.
   - X. Other (please specify)
   - `[Answer]:` A - required by U06 DoD and delivery plan.

## Ambiguity Analysis

No blocking ambiguity remains. U06 packages evidence and audits; it does not implement new behavior that belongs to U01-U05.
