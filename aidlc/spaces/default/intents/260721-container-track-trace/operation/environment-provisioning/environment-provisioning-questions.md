# W2-04 Environment Provisioning Decisions

## Upstream Context

These answers apply the portable `deployment-architecture`, retain the service
boundaries in `infrastructure-services`, and enforce the HOLD and promotion
constraints in `cd-config`.

## Decisions

### 1. Are all environments provisioned per Infrastructure Design?

**Answer — no:** The protected manager Compose project is only partially
running, the ephemeral `linercore-wave-a` environment is absent, and staging
and production are not provisioned. This is recorded as `NOT READY / HOLD`.

### 2. Are VPCs, subnets, security groups, and NACLs correct?

**Answer — not applicable:** W2-04 targets on-premises Docker Compose and has no
AWS IaC or AWS environment. The observed `linercore-local` bridge network is not
an AWS network control. No cloud topology will be invented.

### 3. Are secrets correctly injected through Secrets Manager or Parameter Store?

**Answer — local only, production unproven:** AWS Secrets Manager and SSM
Parameter Store do not apply. The local Compose source references named
variables and no values were exposed during validation. No Compose secret block
or tracked `.env` was found. A later non-local environment must adopt an
approved secret store, least-privilege access, rotation, and redacted evidence.

### 4. Is cross-account or cross-VPC connectivity validated?

**Answer — not applicable:** No AWS account, VPC, peering, transit gateway, or
cross-account dependency is part of the approved intent.

### 5. Should this stage provision or repair an environment now?

**Answer — no:** The manager project is protected, Wave A creation belongs to
the serialized CI controller, and staging/production have no approved targets.
This stage performs inventory and validation only.

### 6. Is the manager demo healthy?

**Answer — no:** Core backend endpoints became reachable, but nginx/edge,
shell, frontend applications, and observability services remained stopped.
Port 8088 refused connections and the demo guard failed twice.

### 7. Is Wave A acceptance ready to run?

**Answer — no:** The isolated project is absent and the CI controller still
lacks complete fixture creation, current-image Playwright invocation, evidence
validation, and scoped cleanup wiring.

### 8. Does this environment evidence authorize deployment?

**Answer — no:** The environment result is `NOT READY / HOLD`. All
release-blocking `cd-config` conditions must pass before any staging promotion,
and production remains prohibited until separately approved and provisioned.
The historical W1 result remains `BLOCKED_WAIVED`.

## Approval Meaning

Approval of this stage accepts the accuracy of the inventory, validation
findings, non-applicable AWS classification, and remediation list. It does not
approve environment mutation, waive a failed guard, or authorize deployment.

