# Environment Provisioning Questions - W1-01

## Questions And Answers

### Q1. Are all environments provisioned per infrastructure design?

A. Local Compose environment is defined and statically validated; full live startup is blocked on image/proxy access
B. AWS dev, staging, and production are fully provisioned
C. Production only is provisioned
D. No environment exists
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: The accepted `cd-config`, unit `deployment-architecture`, and unit `infrastructure-services` artifacts define W1 as local Compose delivery. `docker compose config --quiet` and `node scripts/w1-live-acceptance.mjs --preflight` pass, but full live startup remains blocked by external image access.

### Q2. Are VPCs, subnets, security groups, and NACLs correct?

A. Not applicable for W1 local Compose; isolated Docker network is the environment boundary
B. Fully validated in AWS
C. Partially validated in AWS
D. Missing and required before W1 acceptance
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: No AWS VPC or subnet resources are provisioned for W1. The relevant boundary is the `linercore-local` Docker network and nginx external entry point.

### Q3. Are secrets in Secrets Manager or Parameter Store correctly injected?

A. Not applicable for W1 local Compose; local-only environment variables and example secrets are used
B. Yes, Secrets Manager is configured
C. Yes, Parameter Store is configured
D. No, production secrets are hardcoded
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: W1 uses local profile credentials and service tokens from environment variables. Non-local profiles remain fail-closed until W2 identity and production secret management work.

### Q4. Is cross-account or cross-VPC connectivity validated?

A. Not applicable for W1 local Compose
B. Validated between AWS accounts
C. Validated between AWS VPCs
D. Required but missing
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: W1 services communicate through Docker DNS and the local bridge network, not AWS account or VPC peering.

## Open Follow-Ups

- Full live environment validation still requires Docker image/network access for the complete full-profile stack.
- AWS environment provisioning remains a future operation concern after the local W1 runtime proof passes.
