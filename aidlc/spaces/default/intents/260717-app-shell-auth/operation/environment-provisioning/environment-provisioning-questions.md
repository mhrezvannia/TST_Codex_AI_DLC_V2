# Environment Provisioning Questions - W2-01

## Questions And Answers

### Q1. Are all environments provisioned per Infra Design?

A. Local/on-prem Compose proof environment exists in `compose.yaml`; full runtime startup is blocked by Docker image pull/proxy
B. AWS dev/staging/prod are provisioned
C. Production is provisioned only
D. No environment exists
E. Unknown
X. Other

[Answer]: A

Rationale: Per-unit `deployment-architecture` and `infrastructure-services` artifacts define the W2-01 target as the existing Compose/Nginx runtime. `cd-config` blocks promotion until the full profile can start and W2-01 evidence reaches PASS.

### Q2. Are VPCs, subnets, security groups, and NACLs correct?

A. Not applicable to W2-01; no AWS network resources are declared
B. Validated through AWS Config
C. Invalid and require remediation
D. Not reviewed
E. Deferred to production release
X. Other

[Answer]: A

Rationale: W2-01 does not provision AWS VPC or network controls. The active network boundary is local Docker networking plus Nginx route configuration.

### Q3. Are secrets in Secrets Manager or Parameter Store correctly injected?

A. Not applicable to W2-01; local Compose/server-side env remains the configuration path
B. Yes, Secrets Manager is validated
C. Yes, SSM Parameter Store is validated
D. Invalid and require remediation
E. Unknown
X. Other

[Answer]: A

Rationale: No Secrets Manager or Parameter Store resources exist for this intent. The environment requirement is that `BOOKING_SERVICE_TOKEN`, session cookie settings, and Keycloak/auth configuration remain server-side and are not exposed in browser or evidence output.

### Q4. Is cross-account or cross-VPC connectivity validated?

A. Not applicable to W2-01
B. Validated
C. Failing
D. Deferred
E. Unknown
X. Other

[Answer]: A

Rationale: The W2-01 proof path is same-Compose-network service discovery: Nginx, shell, auth, Booking, booking-service, identity-service, Keycloak, and PostgreSQL.

### Q5. What environment blockers remain?

A. Docker proxy/cache for Elastic image pull and Bash availability for audit detectors
B. Missing AWS account
C. Missing VPC peering
D. Missing KMS keys
E. No blockers
X. Other

[Answer]: A

Rationale: Build and Test recorded Docker pull failure for `docker.elastic.co/elasticsearch/elasticsearch:8.16.1` and Bash detector failures. These are environment blockers, not code PASS evidence.

## Open Follow-Ups

- Configure Docker proxy/cache on the self-hosted proof runner.
- Ensure Bash is available for `erp-fidelity-audit` and `aidlc-audit`.
- Rerun full live W2-01 acceptance and replace the BLOCKED evidence package with PASS evidence before merge/release.
