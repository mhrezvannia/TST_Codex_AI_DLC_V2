# Deployment Execution Questions - W2-01

## Questions And Answers

### Q1. Are all pre-deployment checks passing?

A. No; code gates pass, but live runtime and Bash audit pre-checks are blocked
B. Yes; deploy now
C. No; code gates fail
D. Unknown
E. Skip checks
X. Other

[Answer]: A

Rationale: `build-test-results` shows automated code gates passing, while `environment-inventory` and `cd-config` keep full Compose startup and Bash audit execution as blockers.

### Q2. Are database migrations required and tested?

A. No schema migration is required for W2-01
B. Yes, migration has run
C. Yes, migration is untested
D. Unknown
E. Skip migration validation
X. Other

[Answer]: A

Rationale: W2-01 modifies shell/auth/Booking actor flow, identity catalog/seed fixtures, and service authorization behavior; no database schema migration artifact is declared in `deployment-strategy`.

### Q3. Are dependent services available and healthy?

A. Not fully; full Compose startup is blocked by Docker image pull/proxy
B. Yes, all dependencies are healthy
C. Only Nginx is healthy
D. Unknown
E. Skip dependency checks
X. Other

[Answer]: A

Rationale: `environment-inventory` lists the required full-profile services, but the runtime was not started because the Elastic image pull is blocked.

### Q4. What is the deployment window?

A. No deployment window opens until Docker proxy/cache and Bash detector prerequisites are fixed
B. Immediate deployment
C. Weekend maintenance window
D. Production business-hours window
E. Unknown
X. Other

[Answer]: A

Rationale: `cd-config` and `deployment-strategy` require PASS live evidence before merge or promotion.

## Open Follow-Ups

- Reopen deployment execution after a Linux proof runner can pull required images and execute Bash detectors.
- Keep W1-01 live-proof waiver explicit as BLOCKED at compose-start; do not convert it into W2-01 acceptance.
