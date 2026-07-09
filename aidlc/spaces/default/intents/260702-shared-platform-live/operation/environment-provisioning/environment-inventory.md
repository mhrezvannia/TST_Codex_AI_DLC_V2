# Environment Inventory

## Inputs

This inventory consumes unit `deployment-architecture`, unit `infrastructure-services`, and `cd-config` artifacts.

## Local Runtime Inventory

| Component | Expected source | Port | Current status |
| --- | --- | --- | --- |
| Node.js | Workstation toolchain | n/a | Ready: Node `v24.18.0` |
| Yarn/Corepack | Workstation toolchain | n/a | Mixed: Corepack Yarn works, direct `yarn` command unavailable |
| Java 21 | Workstation toolchain | n/a | Blocked: `java` unavailable |
| Maven | Workstation toolchain | n/a | Blocked: `mvn` unavailable |
| Docker Desktop/Compose | Workstation runtime | n/a | Blocked: Docker daemon unavailable |
| Postgres | `compose.yaml` | `5432` | Ready: port is listening |
| Keycloak | `compose.yaml` | `8080` | Blocked: port not listening |
| Identity service | `compose.yaml` / `deployment-architecture` | `8082` | Blocked: port not listening |
| Reference Data service | `compose.yaml` / `deployment-architecture` | `8083` | Blocked: port not listening |
| Schema Registry | `compose.yaml` / `infrastructure-services` | `8081` | Blocked: port not listening |
| Kafka | `compose.yaml` / `infrastructure-services` | `9092` | Blocked: port not listening |
| nginx | `compose.yaml` / `cd-config` | `8088` | Blocked: port not listening |

## Profiles

| Profile | Services | Status |
| --- | --- | --- |
| Base dependencies | postgres, keycloak, kafka, schema-registry | Partially available: Postgres only |
| `apps` | identity-service, reference-data-service, apps-auth, apps-reference-data, nginx | Blocked |
| `seed` | seed-loader | Dry-run works; live apply blocked |
| `observability` | prometheus, grafana, jaeger, otel, elasticsearch, kibana | Optional and currently not running |

## Configuration Inventory

Local flags from `cd-config`:

- `APP_ENV=local`
- `AUTH_BYPASS=true`
- `REFERENCE_DATA_AUTH_BYPASS=true`
- `IDENTITY_SERVICE_URL=http://localhost:8082`
- `REFERENCE_DATA_SERVICE_URL=http://localhost:8083`

## Cloud Inventory

No AWS VPC, subnet, security group, NACL, Secrets Manager, Parameter Store, cross-account, or cross-VPC resources are provisioned for this intent. Current infrastructure target is local/on-prem Compose.
