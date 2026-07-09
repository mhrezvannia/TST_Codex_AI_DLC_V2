# Environment Provisioning Questions - Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `deployment-architecture`, `infrastructure-services`, and `cd-config`.

## Questions and Answers

### Q1. Are all environments provisioned per Infrastructure Design?

A. Local environment is defined but not currently running
B. AWS dev/staging/prod are provisioned
C. Production only is provisioned
D. No environment definition exists
X. Other (please specify)

[Answer]: A

### Q2. Are VPCs, subnets, security groups, and NACLs correct?

A. Not applicable for B01/U01 local host-runtime
B. Fully validated in AWS
C. Partially validated
D. Unknown
X. Other (please specify)

[Answer]: A

### Q3. Are secrets in Secrets Manager or Parameter Store injected?

A. Not applicable; U01 uses no secrets
B. Secrets Manager configured
C. Parameter Store configured
D. Local `.env` secrets configured
X. Other (please specify)

[Answer]: A

### Q4. Is cross-account or cross-VPC connectivity validated?

A. Not applicable for local-only walking skeleton
B. Fully validated
C. Partially validated
D. Required but missing
X. Other (please specify)

[Answer]: A

## Decisions

Environment provisioning for B01/U01 is a local inventory and validation activity. No AWS resources are provisioned because `deployment-architecture` and `infrastructure-services` define only local Java, Node/Next.js, and reverse-proxy runtime components.

