# W2-04 Environment Inventory

## Scope and Upstream Trace

This inventory validates the portable on-premises topology defined by
`deployment-architecture`, the service ownership recorded in
`infrastructure-services`, and the promotion constraints in `cd-config`.
W2-04 does not authorize an AWS environment, public-cloud expansion, or a new
production topology.

Observed window: 2026-07-28 07:54-07:58 UTC. The checks were read-only. No
container, network, volume, credential, AWS resource, staging environment, or
production environment was created, changed, started, stopped, or deleted.

## Environment Summary

| Environment | Target | Provisioning state | Health state | Release use |
|---|---|---|---|---|
| Manager demo | Compose project `linercore-shared-platform` from `D:\TST_Codex_integ` | Partially present | **NOT READY**: port 8088 has no listener and `npm run demo:guard` fails | Protected reference only; never an acceptance target |
| Wave A acceptance | Isolated Compose project `linercore-wave-a` | Absent | Not testable | Expected to be ephemeral and serialized, but current CI creation/cleanup remains unwired |
| CI runner | `[self-hosted, on-prem, linux]` | Declared by `cd-config` | Runner execution not observed in this stage | HOLD |
| Staging | Existing portable Compose topology, if separately approved | Not provisioned | Not testable | Promotion disabled |
| Production | No approved target | Not configured | Not testable | Deployment prohibited |
| AWS accounts/VPCs | None in approved W2-04 scope | Not applicable | Not applicable | No CDK, CloudFormation, or Terraform target found |

## Manager Compose Inventory

The Docker engine reported one Compose project, `linercore-shared-platform`.
Nine project containers were running at the final inventory snapshot:

| Service | Port | Observed result |
|---|---:|---|
| Identity | 8082 | HTTP health 200 |
| Keycloak | 8080 | Container healthy |
| Reference Data | 8083 | HTTP health 200 |
| Charge Agreement | 8084 | HTTP health 200 |
| Booking | 8085 | HTTP health 200 after an automatic start during observation |
| Container Movement | 8086 | HTTP health 200 |
| Schema Registry | 8081 | HTTP 200 and container healthy |
| PostgreSQL | 55432 -> 5432 | Container healthy |
| Kafka | 9092 | Container healthy |

The following manager components remained stopped at the final snapshot or were
not reachable: nginx/edge, shell, Booking app, auth app, Charge Agreements app,
Reference Data app, Grafana, Prometheus, Jaeger, OpenTelemetry Collector,
Kibana, Elasticsearch, contract devtools, and seed loader. The manager edge at
port 8088 was unreachable on both guard attempts.

This partial service availability is not equivalent to an operational manager
demo and cannot satisfy the `cd-config` pre/post guard.

## Networks and Persistent State

- `linercore-local` is a local Docker bridge network with nine attached
  containers at observation time.
- The network is not marked internal, has IPv6 disabled, and is not an AWS VPC,
  subnet, security group, or NACL.
- One named manager PostgreSQL volume,
  `linercore-shared-platform_linercore_postgres_data`, and five anonymous local
  volumes were present.
- No `linercore-wave-a` containers, project network, or project-scoped volume
  was observed.
- No destructive reset or unscoped Compose teardown was performed.

## Configuration and Secret Surfaces

The manager source Compose file references 42 named environment variables,
including service ports, database passwords, service tokens, session
configuration, and local authentication settings. The inspection recorded only
variable names; it did not read or emit values.

No Compose `secrets:` block and no Git-tracked `.env` file were found in the
manager repository. This is acceptable only as evidence of the existing local
profile; it is not proof of production-grade secret injection. AWS Secrets
Manager and SSM Parameter Store are not applicable because no AWS target exists.
Any later non-local target must provide an approved owner-controlled secret
store, least-privilege access, rotation, and redacted evidence before promotion.

## Ownership

Container Movement owns the journey, movement ledger, audit, outbox, and its
page composition. Booking owns event receipt and latest-per-container
projection. The platform owner owns the manager Compose project, Kafka, Schema
Registry, Identity, Reference Data, networking, volumes, and serialized Wave A
controller. The release reviewer owns evidence classification and must keep the
current result on HOLD until every release-blocking validation passes.

