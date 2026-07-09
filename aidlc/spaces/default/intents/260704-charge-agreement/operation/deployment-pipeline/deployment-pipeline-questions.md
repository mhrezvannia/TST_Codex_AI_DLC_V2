# Deployment Pipeline Questions - Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `ci-config`, `quality-gates`, `deployment-architecture`, and `cicd-pipeline`.

## Questions and Answers

### Q1. What deployment strategy should the walking skeleton use?

A. Local-first recreate deployment for host-runtime validation
B. Blue/green production deployment
C. Canary production deployment
D. Manual file copy
X. Other (please specify)

[Answer]: A

### Q2. What environment promotion gates are required?

A. Build only
B. CI quality gates, local health smoke, then manual promotion decision
C. Production approval only
D. No gates
X. Other (please specify)

[Answer]: B

### Q3. What approval workflow applies to production?

A. No production deployment in this walking-skeleton stage
B. Automatic production deployment after CI
C. Developer self-approval
D. Emergency-only deployment
X. Other (please specify)

[Answer]: A

### Q4. What rollback procedure applies?

A. Stop the local runtime processes and revert Charge Agreement service, app, and proxy wiring
B. Database restore
C. Traffic rollback only
D. No rollback
X. Other (please specify)

[Answer]: A

### Q5. What feature flag strategy applies?

A. Route-level dark launch through `/charge-agreements/`, no external flag provider yet
B. AWS AppConfig
C. CloudWatch Evidently
D. Hard launch to all users
X. Other (please specify)

[Answer]: A

## Decisions

The deployment-pipeline stage remains local-first because B01/U01 is a walking skeleton. It defines promotion and rollback rules for the host-runtime path described by `deployment-architecture` and `cicd-pipeline`, while production deployment waits for functional domain/API/UI units.

