# Intent Capture Questions - W2-01 App Shell and Auth

## Source Context

Answers are extracted from `docs/intents/W2-01-app-shell-and-auth.md`, its Context Pack, the program backlog, the slicing playbook, Graphify first-pass context, and fresh codebase-memory MCP verification.

## Questions and Extracted Answers

1. What business problem is this intent solving?
   - A. Users cannot work across modules in one authenticated shell because auth and business apps are disconnected islands.
   - B. The Booking aggregate needs deeper DCSA modeling.
   - C. The design system needs primitive components only.
   - D. Kafka delivery must be rebuilt.
   - E. The reference-data seed set is incomplete.
   - X. Other (please specify)
   - `[Answer]:` A

2. Who is the target customer or beneficiary?
   - A. Any authenticated LinerCore business user who needs cross-module ERP navigation.
   - B. Anonymous public website visitors.
   - C. Backend-only service operators.
   - D. External finance systems only.
   - E. Kafka administrators only.
   - X. Other (please specify)
   - `[Answer]:` A

3. What is the thinnest viable vertical journey?
   - A. Open the shell, authenticate through Keycloak/auth app, land in the shell, navigate to Booking, use Booking with the real session subject, then sign out.
   - B. Migrate every module into the shell immediately.
   - C. Replace the full design system first.
   - D. Rebuild all backend services before shell work.
   - E. Create a documentation-only navigation model.
   - X. Other (please specify)
   - `[Answer]:` A

4. What must success prove beyond "tests pass"?
   - A. On live Compose with Keycloak, the user logs in, uses Booking inside the shell, API/backend audit evidence shows the real subject, access-denied works for missing roles, sign-out ends the session, and hardcoded auth detector 6d is clean for mounted surfaces.
   - B. The shell renders static navigation.
   - C. Containers start.
   - D. Unit tests for auth helpers pass.
   - E. Documentation is updated.
   - X. Other (please specify)
   - `[Answer]:` A

5. Which existing work must be preserved?
   - A. W0-01, W0-02, W1-01, W2-02, existing auth app routes/session code, and Booking list/detail/create surfaces.
   - B. Only the original disconnected workbench pages.
   - C. Only backend services.
   - D. Only the design-system package.
   - E. No prior work; rebuild from scratch.
   - X. Other (please specify)
   - `[Answer]:` A

6. How should W1-01 live proof be represented?
   - A. Preserve it as an explicit test-acceptance waiver/blocker caused by Elastic image pull failure, not as a real live PASS.
   - B. Rewrite it as passed because W1 merged.
   - C. Ignore it because W2 is independent.
   - D. Delete waiver evidence.
   - E. Treat it as a design-system dependency.
   - X. Other (please specify)
   - `[Answer]:` A

7. Which architecture direction is already answered?
   - A. One Next.js shell app, with module surfaces becoming routed areas inside it over time.
   - B. Module federation micro-frontend host.
   - C. Nginx-stitched multi-app with shared session cookie only.
   - D. Native desktop shell.
   - E. Backend-only shell.
   - X. Other (please specify)
   - `[Answer]:` A

8. Which cross-module seam must become real?
   - A. Browser session to shell/BFF to Booking backend and identity-service authorization using the real token subject, not static `local-user`.
   - B. Booking to CMM Kafka only.
   - C. Charge agreement pricing only.
   - D. Reference-data seeding only.
   - E. No cross-module seam.
   - X. Other (please specify)
   - `[Answer]:` A

9. What is explicitly out of scope?
   - A. Migrating reference-data, charge, and CMM surfaces into the shell, deep role-based nav filtering, and W2-02 design-system foundation work.
   - B. Booking mounted as the first module.
   - C. Sign-out.
   - D. Access-denied path.
   - E. Removing hardcoded local user from mounted surfaces.
   - X. Other (please specify)
   - `[Answer]:` A

10. What branch and base should this intent use?
   - A. Base `integ/main-reconciled` at `5dd6481`; work on `intent/W2-01-app-shell-and-auth`.
   - B. Base `main`; work directly on trunk.
   - C. Base W1 worktree branch.
   - D. Base W2-02 branch.
   - E. Create no branch.
   - X. Other (please specify)
   - `[Answer]:` A
