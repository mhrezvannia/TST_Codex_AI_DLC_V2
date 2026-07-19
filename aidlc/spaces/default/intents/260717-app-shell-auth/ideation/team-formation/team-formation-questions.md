# Team Formation Questions - W2-01 App Shell and Auth

## Source Context

This stage consumes `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`. Answers are role-based because no named team roster, time zones, or capacity data were provided.

## Questions and Extracted Answers

1. What team topology should be used?
   - A. One stream-aligned Platform+UI driver mob with Booking contributor/reviewer and security/quality review hats.
   - B. Separate horizontal auth, shell, and Booking teams.
   - C. UI-only team.
   - D. Backend-only team.
   - E. External partner team.
   - X. Other (please specify)
   - `[Answer]:` A

2. What skills are required?
   - A. Next.js shell/BFF, Keycloak/OIDC, identity-service authorization, Booking BFF/backend, local Compose/Nginx, security controls, Playwright/live evidence, audit tooling.
   - B. AWS CDK only.
   - C. Database administration only.
   - D. Kafka-only operations.
   - E. Mobile development only.
   - X. Other (please specify)
   - `[Answer]:` A

3. Are external partners or AWS Professional Services needed?
   - A. No; W2-01 is on-prem/in-repo and should use existing Keycloak/identity-service/auth app.
   - B. Yes, AWS Professional Services is required.
   - C. Yes, buy a portal vendor.
   - D. Yes, buy a full ERP.
   - E. Unknown blocker.
   - X. Other (please specify)
   - `[Answer]:` A

4. Who are decision makers?
   - A. Platform+UI driver for scope/build choices, product/program owner for acceptance, security/platform reviewer for auth, quality/release reviewer for evidence.
   - B. Booking team alone.
   - C. Vendor alone.
   - D. Operations alone.
   - E. No decision maker.
   - X. Other (please specify)
   - `[Answer]:` A

5. What capacity constraints are known?
   - A. No named capacity supplied; plan must avoid fabricated velocity and use role-based responsibilities.
   - B. Full dedicated team for fixed dates.
   - C. No contributors available.
   - D. One developer only.
   - E. Contractor-only team.
   - X. Other (please specify)
   - `[Answer]:` A

6. What competing initiatives matter?
   - A. W2-02 design-system ownership and W4-01 broader module migration must not be consumed by W2-01.
   - B. None.
   - C. W2-01 should absorb W4-01.
   - D. W2-01 should absorb W2-02.
   - E. W2-01 should reopen W1.
   - X. Other (please specify)
   - `[Answer]:` A
