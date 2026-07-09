# Environment Inventory - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `deployment-architecture`, `infrastructure-services`, and `cd-config`.

## Local Runtime Components

| Component | Source | Port / Route | Provisioning Status |
| --- | --- | --- | --- |
| Charge Agreement backend | `services/charge-agreement-service/container` | `8084` | Defined, not running |
| Charge Agreement frontend | `apps/charge-agreements` | `3002` | Defined, not running |
| Local reverse proxy | `scripts/local-reverse-proxy.mjs` | `/charge-agreements/` | Route configured, proxy not running |
| Java runtime | `.local-tools/jdk-21` when available | Local process dependency | Available from prior build/test commands |
| Maven runtime | `.local-tools/apache-maven` when available | Build/test dependency | Available from prior build/test commands |
| Yarn workspace | `.yarn/releases/yarn-4.5.3.cjs` | Frontend build/test dependency | Available from prior build/test commands |

## External Infrastructure

No AWS VPC, subnet, security group, NACL, IAM, Secrets Manager, Parameter Store, database, Kafka, or schema registry resource is provisioned for U01. This is aligned with `infrastructure-services`, which explicitly excludes database, Kafka, and schema registry dependencies for the walking skeleton.

## Configuration Inputs

| Input | Current Value |
| --- | --- |
| Backend profile | `local` via `application-local.yaml` |
| Backend module endpoint | `/api/charge-agreements/module-info` |
| Frontend API route | `/api/module-info` proxy route inside app |
| Reverse proxy target | `CHARGE_AGREEMENTS_APP_URL` or `http://127.0.0.1:3002/` |

## Security Inventory

No new cloud security boundary is introduced. No secret material is required for U01. Authentication bypass behavior remains outside this stage; deployment validation should use the current local auth mode configured by the application when servers are intentionally started again.

