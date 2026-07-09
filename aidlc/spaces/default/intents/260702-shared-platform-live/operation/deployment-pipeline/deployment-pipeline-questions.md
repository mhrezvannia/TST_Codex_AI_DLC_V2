# Deployment Pipeline Questions

## Questions

### Q1. What deployment strategy should Shared Platform use first?

A. Recreate local/on-prem deployment with readiness gate  
B. Blue/green local profile after images are stable  
C. Canary traffic shifting  
D. Manual file copy  
X. Other

[Answer]: A - Start with recreate local/on-prem deployment; keep blue/green as a later option once nginx/service health is stable.

### Q2. What environment promotion gates apply?

A. Local readiness passed, quality gates passed, live contracts passed, seed apply passed  
B. Frontend tests only  
C. Manual approval only  
D. No gates  
X. Other

[Answer]: A - `ci-config`, `quality-gates`, `deployment-architecture`, and `cicd-pipeline` artifacts require readiness and quality proof before promotion.

### Q3. What production approval workflow applies?

A. No production deployment in this intent; local/on-prem shared platform only  
B. Auto-promote to production  
C. Manual production approval  
D. External CAB approval  
X. Other

[Answer]: A - Production is outside this intent; current goal is locally functional Shared Platform.

### Q4. What rollback procedure applies?

A. Stop current Compose profile, restore previous image tags/config, re-run readiness  
B. Database restore only  
C. Revert frontend only  
D. No rollback required  
X. Other

[Answer]: A - Rollback must reverse app/service image/config changes and prove readiness again.

### Q5. What feature flag strategy applies?

A. Environment variables for local-only bypass/write controls  
B. CloudWatch Evidently  
C. AWS AppConfig  
D. No feature flags  
X. Other

[Answer]: A - Local/on-prem scope uses explicit environment flags such as `AUTH_BYPASS`, `APP_ENV`, and `REFERENCE_DATA_AUTH_BYPASS`; cloud feature flag services are out of scope.
