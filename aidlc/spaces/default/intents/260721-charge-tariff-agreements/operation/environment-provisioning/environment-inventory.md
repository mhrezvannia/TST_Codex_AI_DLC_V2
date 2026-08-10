# Environment Inventory — W2-03

## Scope and provenance

This inventory consumes every unit `deployment-architecture`,
`infrastructure-services`, and the approved `cd-config`. It inventories the
version-controlled local Wave A definition and host capabilities without
provisioning or mutating containers, databases, ports, volumes, or manager
resources.

Observed tool versions:

| Tool | Version/status |
| --- | --- |
| Node.js | 24.18.0 |
| npm | 11.16.0 |
| Java | Temurin 21.0.11 |
| Maven | 3.9.8 |
| Bun | 1.3.14 |
| Docker child-process capability | BLOCKED (`spawnSync docker EPERM`) |
| Native evidence commit | BLOCKED by previously observed Win32 error 87 |

## Approved local topology

The read-only wrapper render completed and reported:

- Compose project `linercore-wave-a`;
- network `linercore-wave-a-network`;
- loopback nginx edge 18088;
- Auth, Booking, Charge Agreements, Identity, Reference Data, supporting
  services, PostgreSQL, Kafka, Schema Registry, Keycloak, and seed-loader
  definitions;
- service-local resource limits, health checks, bounded deadlines, and
  fail-closed/local-profile settings;
- no manager port 8088 publication by the Wave A project.

The host prerequisite probe observed ports 5432, 8080, 8082, 8083, 8088, 8081,
9092, and 3001 listening. These are existing host/manager observations, not
proof that the isolated Wave A project is running or healthy.

## Cloud and security inventory

| Control | Inventory |
| --- | --- |
| AWS accounts/regions/VPC/subnets | not defined |
| Security groups/NACL/cross-VPC | not applicable to local Compose |
| IAM roles/policies | not defined |
| Secrets Manager/Parameter Store | not defined |
| Local secrets | explicit local-profile values in version-controlled runtime configuration |
| Non-local secret behavior | required to fail closed |
| Data stores | service-owned PostgreSQL databases in local Compose |
| Public ingress | none approved; loopback-only acceptance edge |
| Compliance framework claim | none approved |

Local credentials are acceptable only inside the declared local profile and
must never be promoted as cloud/production secret management.

