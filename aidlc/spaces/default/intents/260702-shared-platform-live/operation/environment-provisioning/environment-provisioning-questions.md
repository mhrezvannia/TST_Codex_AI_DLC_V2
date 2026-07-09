# Environment Provisioning Questions

## Questions

### Q1. Are all environments provisioned per infrastructure design?

A. No - local/on-prem prerequisites are partially missing  
B. Yes - all local services are running  
C. Cloud environments are provisioned  
D. Environment provisioning is not required  
X. Other

[Answer]: A - Readiness evidence shows Node and Postgres are available, while Java, Maven, Docker, and app service ports are blocked.

### Q2. Are VPCs, subnets, security groups, and NACLs correct?

A. Not applicable for current local/on-prem Compose scope  
B. Yes, AWS networking is configured  
C. No, AWS networking needs changes  
D. Unknown  
X. Other

[Answer]: A - `deployment-architecture`, `infrastructure-services`, and `cd-config` target local Compose/self-hosted execution, not AWS network resources.

### Q3. Are secrets correctly injected?

A. Local env examples exist; production secret stores are out of scope  
B. Secrets Manager configured  
C. Parameter Store configured  
D. Secrets are missing  
X. Other

[Answer]: A - `infrastructure/env/local.env.example` and Compose env values exist; cloud secret injection is not part of this local scope.

### Q4. Is cross-account or cross-VPC connectivity validated?

A. Not applicable for local Shared Platform  
B. Yes  
C. No  
D. Required later  
X. Other

[Answer]: A - No cross-account or cross-VPC topology exists in this intent.

### Q5. What must be provisioned next?

A. Java 21, Maven, Docker Desktop, local service images, and service ports  
B. AWS VPC and IAM  
C. Kubernetes cluster  
D. Nothing  
X. Other

[Answer]: A - Runtime blockers prevent full local deployment and live readiness.
