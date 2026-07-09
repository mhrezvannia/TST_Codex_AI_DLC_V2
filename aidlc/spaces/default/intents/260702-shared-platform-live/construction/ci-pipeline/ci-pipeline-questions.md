# CI Pipeline Questions

## Questions

### Q1. What CI tool is in use?

A. GitHub Actions on self-hosted on-prem runners  
B. Jenkins  
C. AWS CodeBuild/CodePipeline  
D. Manual local-only checks  
X. Other

[Answer]: A - Existing `.github/workflows/quality-gates.yml` uses GitHub Actions on self-hosted on-prem Linux runners.

### Q2. What branch strategy should CI protect?

A. Pull requests into `main`  
B. Pushes to every branch  
C. Release tags only  
D. Manual dispatch only  
X. Other

[Answer]: A - Existing workflow triggers on pull requests to `main`, with manual dispatch retained.

### Q3. Which gates are required before merge?

A. Quality gate aggregator, frontend typecheck/tests, contracts, seed dry-run, backend Maven tests when Maven is available  
B. Frontend checks only  
C. Backend checks only  
D. No blocking gates  
X. Other

[Answer]: A - Build and Test results show frontend/script checks passing and backend Maven currently blocked locally but required for CI runners.

### Q4. Which artifacts should CI publish?

A. Quality/readiness evidence only for now  
B. Container images  
C. Maven packages  
D. Frontend bundles  
X. Other

[Answer]: A - Construction CI publishes quality evidence; deployment-pipeline stages will own registry and promotion artifacts.
