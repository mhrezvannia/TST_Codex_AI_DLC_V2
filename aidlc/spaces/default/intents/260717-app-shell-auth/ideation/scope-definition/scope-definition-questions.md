# Scope Definition Questions - W2-01 App Shell and Auth

## Source Context

This stage consumes `intent-statement.md`, `feasibility-assessment.md`, and `constraint-register.md`. Answers are extracted from those artifacts and the source W2-01 statement.

## Questions and Extracted Answers

1. What is the minimum viable scope that delivers value?
   - A. One authenticated shell path with existing auth, Booking mounted inside it, real subject propagation, denied path, and sign-out.
   - B. Migrate every module into the shell.
   - C. Build W2-02 design-system foundation.
   - D. Rebuild Booking domain.
   - E. Replace Keycloak.
   - X. Other (please specify)
   - `[Answer]:` A

2. What capabilities are Must Have?
   - A. Shell/protected route skeleton, session-to-BFF-to-backend subject propagation, nav/breadcrumb/user menu/denied path, Booking mount and live proof.
   - B. Design-system tokens only.
   - C. Charge and CMM migrations.
   - D. Micro-frontend host.
   - E. Public customer portal.
   - X. Other (please specify)
   - `[Answer]:` A

3. What sequencing preference applies?
   - A. Risk-first: protected shell and real subject propagation before broader shell chrome.
   - B. Visual polish first.
   - C. Migrate all modules first.
   - D. Observability profile first.
   - E. Branch cleanup first.
   - X. Other (please specify)
   - `[Answer]:` A

4. What should stay out of scope?
   - A. W4-01 module migration, W2-02 design-system foundation, deep role administration, Booking domain rewrite, and W1 waiver rewrite.
   - B. Access-denied path.
   - C. Sign-out.
   - D. Booking mount.
   - E. Real subject propagation.
   - X. Other (please specify)
   - `[Answer]:` A

5. What is the hard completion gate?
   - A. Live Compose with Keycloak/Nginx proves login -> shell -> Booking -> real subject audit -> denied path -> sign-out, plus `aidlc-audit` and `erp-fidelity-audit` detector 6d green.
   - B. Unit tests only.
   - C. Static screenshot only.
   - D. Containers start.
   - E. Documentation approval only.
   - X. Other (please specify)
   - `[Answer]:` A

6. How should the enterprise-vs-feature mismatch be handled?
   - A. Keep engine-recorded enterprise scope for now but constrain execution to W2-01's four-unit vertical backlog.
   - B. Expand the scope into a full application redesign.
   - C. Stop the intent.
   - D. Ignore the W2-01 source statement.
   - E. Remove all later stages.
   - X. Other (please specify)
   - `[Answer]:` A
