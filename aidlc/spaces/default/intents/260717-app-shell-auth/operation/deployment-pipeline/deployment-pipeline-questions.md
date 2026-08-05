# Deployment Pipeline Questions - W2-01

## Questions And Answers

### Q1. What deployment strategy should W2-01 use?

A. Manual continuous delivery to the existing local/on-prem Compose stack
B. Blue/green production deployment
C. Canary production release
D. Rolling production update
E. Continuous deployment on every merge
X. Other

[Answer]: A

Rationale: `ci-config`, `quality-gates`, per-unit `deployment-architecture`, and per-unit `cicd-pipeline` artifacts all point to the existing Compose/Nginx shell/auth/Booking runtime. W2-01 final acceptance is still BLOCKED, so production deployment patterns would overstate readiness.

### Q2. What environment promotion gates are required?

A. Intent branch -> CI -> live local/on-prem proof -> merge to `integ/main-reconciled`; no production promotion in W2-01
B. Dev -> staging -> production with automated promotion
C. Direct production after CI
D. Manual production approval only
E. No promotion gates
X. Other

[Answer]: A

Rationale: `quality-gates` makes W2-01 `--require-pass` a required gate. Promotion stops until live Compose/Nginx/Keycloak scenarios, detector 6d, `erp-fidelity-audit`, and `aidlc-audit` are green.

### Q3. What production approval workflow applies?

A. No production approval in this intent; require explicit human review before any later production release
B. Product owner approval only
C. Tech lead approval only
D. Fully automated approval
E. CAB approval now
X. Other

[Answer]: A

Rationale: W2-01 is a vertical app-shell/auth slice. Operation artifacts define release readiness and rollback, but they do not authorize production deployment.

### Q4. What rollback procedure is required?

A. Revert the W2-01 merge or redeploy the previous known-good Compose/Nginx/auth/Booking artifacts, then rerun smoke and evidence gates
B. Delete runtime data volumes
C. Disable Keycloak
D. Remove Booking authorization checks
E. No rollback needed
X. Other

[Answer]: A

Rationale: Rollback must preserve W0-01, W0-02, W1-01, and W2-02 work and must not bypass security controls. Data-destructive rollback is not acceptable for this intent.

### Q5. What feature flag strategy applies?

A. No new feature flag service; hold promotion behind CI/live gates and keep any future shell cutover flag server-side only
B. CloudWatch Evidently
C. AWS AppConfig
D. Client-side browser flag
E. No gating
X. Other

[Answer]: A

Rationale: The current runtime has no AppConfig/Evidently infrastructure. Any future shell cutover flag must not expose secrets or create client-side authorization bypasses.

## Open Follow-Ups

- Decide whether to add a server-side shell cutover flag in a later intent after live proof is green.
- Assign ownership for Docker proxy/image-cache readiness and Bash detector availability on the self-hosted runner.
