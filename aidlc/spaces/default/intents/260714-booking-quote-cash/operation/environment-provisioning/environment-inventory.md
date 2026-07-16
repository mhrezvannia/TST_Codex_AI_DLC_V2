# Environment Inventory - W1-01

## Upstream Inputs

This inventory consumes every unit `infrastructure-design/deployment-architecture.md`, every unit `infrastructure-design/infrastructure-services.md`, and `operation/deployment-pipeline/cd-config.md`.

## Provisioning Scope

| Environment | Status | Notes |
|---|---|---|
| Local Compose `core` | DEFINED | PostgreSQL, Keycloak, Kafka, Schema Registry |
| Local Compose `app` | DEFINED | Core plus Identity, Reference Data, Charge, Booking, CMM, apps, nginx, seed loader |
| Local Compose `observability` | DEFINED | Prometheus, Grafana, Jaeger, OTel Collector, Elasticsearch, Kibana |
| Local Compose `full` | DEFINED | All local profiles combined |
| AWS dev/staging/prod | NOT PROVISIONED | Out of scope for W1 local release proof |

## Local Runtime Services

| Service | Host port | Container port | Profiles |
|---|---:|---:|---|
| postgres | 55432 | 5432 | core, app, devtools, full |
| keycloak | 8080 | 8080 | core, app, devtools, full |
| schema-registry | 8081 | 8081 | core, app, devtools, full |
| kafka | 9092 | 9092 | core, app, devtools, full |
| identity-service | 8082 | 8082 | app, full |
| reference-data-service | 8083 | 8083 | app, full |
| charge-agreement-service | 8084 | 8084 | app, full |
| booking-service | 8085 | 8085 | app, full |
| container-movement-service | 8086 | 8086 | app, full |
| apps-booking | 3001 | 3000 | app, full |
| apps-reference-data | 3002 | 3000 | app, full |
| nginx | 8088 | 80 | app, full |
| prometheus | 9090 | 9090 | observability, full |
| grafana | 3003 | 3000 | observability, full |

## Service Identities

| Service | Local client ID | Capabilities |
|---|---|---|
| identity-service | `linercore-identity-service` | identity roles/audit/status read |
| reference-data-service | `linercore-reference-data-service` | reference data read/create/update/status |
| booking-service | `linercore-booking-service` | booking read/create/update, pricing request, movement-status consume |
| charge-agreement-service | `linercore-charge-agreement-service` | pricing read/calculate/status |
| container-movement-service | `linercore-container-movement-service` | movement read/create, booking-confirmed consume, status |

## Metadata Updates

Updated:

```text
infrastructure/runtime/profiles.json
```

The metadata now reflects W1 Booking, Charge, CMM, Booking UI, non-default PostgreSQL host port `55432`, and Grafana host port `3003`.

## Not Provisioned

- AWS VPC, subnets, security groups, NACLs, IAM roles, KMS, Secrets Manager, Parameter Store, RDS, ECS, ECR, or CloudWatch resources.
- Production or staging environments.
- Cross-account or cross-VPC connectivity.

Those are not required for the W1 local Compose release proof described by `cd-config`.
