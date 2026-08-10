# Requirements Analysis Questions - W2-01 App Shell and Auth

## Source-Resolved Decisions

The W2-01 Context Pack and the user's launch instruction resolve the blocking requirements questions for this stage. No additional user input is required before generating `requirements.md`.

## Questions

1. What shell architecture should W2-01 use?
   - A. One Next.js shell app; module surfaces become routed areas inside it, migrated one by one.
   - B. Micro-frontend host with module federation.
   - C. Nginx-stitched multi-app with shared session cookie only.
   - X. Other (please specify)
   - `[Answer]:` A - Source W2-01 statement says the answered direction is one Next.js shell app.

2. How should the engine-recorded enterprise scope affect delivery breadth?
   - A. Keep enterprise-depth lifecycle coverage but constrain implementation to the W2-01 vertical slice.
   - B. Expand into a full ERP shell migration for all module apps.
   - C. Stop and change the recorded workflow scope before requirements.
   - X. Other (please specify)
   - `[Answer]:` A - User instruction says this is a vertical program intent, not an umbrella redesign.

3. What is the acceptance authority for W2-01?
   - A. Observed live Compose proof through Nginx, Keycloak, shell, Booking, backend authorization/audit, `erp-fidelity-audit`, and `aidlc-audit`.
   - B. Unit and integration tests only.
   - C. Screenshots and static review only.
   - X. Other (please specify)
   - `[Answer]:` A - `intent-statement.md`, `scope-document.md`, `team-practices.md`, and the slicing playbook require observed live behavior.

4. How should W1-01 live-proof status be represented?
   - A. Preserve the explicit waiver/BLOCKED live manifest and do not rewrite it as PASS.
   - B. Treat the merged W1 work as fully live-passed because it is on the base branch.
   - C. Remove W1 evidence from W2-01 acceptance.
   - X. Other (please specify)
   - `[Answer]:` A - User instruction and backlog both require the W1 waiver to remain explicit.

5. Should W2-01 introduce Redux Toolkit or another new frontend state stack?
   - A. No; use current Next.js/React server and route patterns unless existing code requires otherwise.
   - B. Add Redux Toolkit for shell/session state.
   - C. Add SWR or another fetch/cache layer.
   - X. Other (please specify)
   - `[Answer]:` A - `technology-stack.md` lists Redux Toolkit and SWR as prohibited/constrained choices for this repo.
