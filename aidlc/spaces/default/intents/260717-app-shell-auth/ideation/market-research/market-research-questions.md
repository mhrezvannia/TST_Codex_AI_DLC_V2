# Market Research Questions - W2-01 App Shell and Auth

## Source Context

This stage consumes `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`. Answers were inferred from the W2-01 statement, program backlog, enterprise technical environment, Graphify first-pass context, fresh codebase-memory MCP verification, and current external source checks.

## Questions and Extracted Answers

1. What competing products or solution categories exist?
   - A. Integrated ERP/TMS/logistics platforms with launchpad-style navigation and enterprise SSO.
   - B. Static documentation portals.
   - C. Backend-only services with no user shell.
   - D. Standalone workbench pages only.
   - E. Public marketing websites.
   - X. Other (please specify)
   - `[Answer]:` A

2. What are table-stakes customer expectations?
   - A. Single sign-on, one application entry point, role-aware navigation, protected routes, clear denied states, and real audit identity.
   - B. Separate login per module.
   - C. Hardcoded local users in business calls.
   - D. Direct browser-to-service tokens.
   - E. Unauthenticated business screens.
   - X. Other (please specify)
   - `[Answer]:` A

3. Which security trend is most relevant?
   - A. BFF/session-cookie patterns that keep OAuth/OIDC tokens out of browser JavaScript.
   - B. Storing tokens in localStorage for convenience.
   - C. Disabling role checks in local stacks.
   - D. Passing static actor ids from UI code.
   - E. Replacing OIDC with custom passwords.
   - X. Other (please specify)
   - `[Answer]:` A

4. What is the build-vs-buy decision for W2-01?
   - A. Build the shell integration because it must bind existing monorepo apps, Keycloak, identity-service, Booking BFF, and local Compose evidence; buy only the IdP pattern, already Keycloak.
   - B. Buy a full TMS/ERP platform now.
   - C. Buy a micro-frontend host before proving the simple shell.
   - D. Outsource the Booking mount.
   - E. Defer auth until all modules are migrated.
   - X. Other (please specify)
   - `[Answer]:` A

5. What differentiates the W2-01 slice?
   - A. It converts the current practice app from disconnected islands into a live, auditable internal carrier workflow with real subject propagation.
   - B. It adds a new market-facing module.
   - C. It creates a new visual design system.
   - D. It adds D&D pricing.
   - E. It rewrites contracts.
   - X. Other (please specify)
   - `[Answer]:` A

6. What market/audience sizing should be used?
   - A. Internal carrier-platform user audience only; do not invent SaaS market-size claims.
   - B. Global ERP TAM.
   - C. Ocean freight SaaS SAM.
   - D. Consumer web app market.
   - E. No audience statement.
   - X. Other (please specify)
   - `[Answer]:` A
