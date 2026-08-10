# Feasibility Questions - W2-01 App Shell and Auth

## Source Context

This stage consumes `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` from the W2-01 record. Answers were inferred from those artifacts, `compose.yaml`, `docs/enterprise-technical-environment.md`, and source-verified codebase-memory MCP snippets.

## Questions and Extracted Answers

1. What existing systems must this integrate with?
   - A. Existing `apps/auth`, Keycloak, identity-service `/internal/identity/authorize`, Booking BFF/backend, Nginx, and local Compose.
   - B. A new third-party portal only.
   - C. External finance only.
   - D. Kafka only.
   - E. No integrations.
   - X. Other (please specify)
   - `[Answer]:` A

2. What compliance/security requirements apply?
   - A. OIDC/Keycloak, BFF, HttpOnly cookies, CSRF/CSP controls, real subject auditability, least privilege, and local-only bypass containment.
   - B. No compliance controls because local.
   - C. PCI only.
   - D. HIPAA only.
   - E. Passwords in each app.
   - X. Other (please specify)
   - `[Answer]:` A

3. What is the current platform/runtime baseline?
   - A. On-prem Docker Compose local runtime with Nginx edge, Keycloak, identity-service, Booking service, and Next.js apps.
   - B. AWS production accounts.
   - C. Kubernetes-only deployment.
   - D. Static hosting only.
   - E. No runtime baseline.
   - X. Other (please specify)
   - `[Answer]:` A

4. What is the main technical uncertainty?
   - A. How to propagate a real authenticated subject through shell -> BFF -> Booking -> identity-service while preserving local-dev bypass safely.
   - B. Whether a shell UI can render.
   - C. Whether Keycloak exists.
   - D. Whether Booking has any screens.
   - E. Whether Docker Compose has services.
   - X. Other (please specify)
   - `[Answer]:` A

5. What organizational blocker is most likely?
   - A. Scope overlap with W2-02 and W4-01 unless the W2-01 slice stays narrow.
   - B. No branch exists.
   - C. No source statement exists.
   - D. No prior Booking work exists.
   - E. No program backlog exists.
   - X. Other (please specify)
   - `[Answer]:` A

6. What AWS services/accounts are in use?
   - A. None for this intent; the enterprise baseline is on-prem Docker Compose, Nginx, Keycloak, PostgreSQL, Kafka, and observability services.
   - B. AWS Cognito, ECS, and RDS are required now.
   - C. Bedrock runtime is part of the product.
   - D. Lambda handles auth callbacks.
   - E. CloudFront is the shell edge.
   - X. Other (please specify)
   - `[Answer]:` A
