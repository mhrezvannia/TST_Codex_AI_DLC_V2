# Environment Provisioning Questions — W2-02 Design-System Closure

## Resolved environment questions

The answers are derived from `booking-design-system-closure/infrastructure-design/deployment-architecture.md`, `booking-design-system-closure/infrastructure-design/infrastructure-services.md`, and `operation/deployment-pipeline/cd-config.md`.

### Q1. Are all designed environments provisioned?

Yes for the only designed runtime boundary. The protected manager is already running and healthy, while the ephemeral `linercore-wave-a` acceptance project is intentionally absent between runs. Its required images and Compose configuration are available for the next deployment-execution stage.

No staging or production environment was designed or provisioned.

### Q2. Are VPCs, subnets, security groups, and NACLs correct?

Not applicable. W2-02 defines no AWS account, VPC, subnet, security group, NACL, public load balancer, Kubernetes cluster, or cloud network. Docker Compose project names, networks, profiles, and non-overlapping host ports are the applicable local isolation controls.

### Q3. Are Secrets Manager or Parameter Store values injected correctly?

Not applicable. No Secrets Manager, Parameter Store, KMS key, or cloud secret is selected. Local/test session material and control tokens are injected at runtime through ignored environment/state files; values were not printed or copied into provisioning evidence.

### Q4. Is cross-account or cross-VPC connectivity validated?

Not applicable. There are no AWS accounts or VPCs in scope. Local service discovery uses existing Compose service names, and browser ingress uses only the isolated nginx edge.

## Deferred environment questions

AWS region/account structure, cloud networking, IAM, encryption keys, managed secrets, backup, disaster recovery, staging, production, data residency, and cost controls require a separately approved infrastructure intent. Their absence is explicit and is not treated as validation PASS.
