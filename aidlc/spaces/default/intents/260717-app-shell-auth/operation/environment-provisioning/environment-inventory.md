# Environment Inventory - W2-01 App Shell and Auth

## Upstream Inputs

This inventory consumes per-unit `deployment-architecture`, per-unit `infrastructure-services`, and `operation/deployment-pipeline/cd-config.md`.

The `deployment-architecture` artifacts define a local/on-prem Compose/Nginx proof stack. The `infrastructure-services` artifacts identify the new `apps-shell` service plus existing auth, Booking, identity, Keycloak, data, messaging, and observability services. The `cd-config` artifact defines continuous delivery to this proof environment only.

## Environment Scope

| Environment | Status | Notes |
| --- | --- | --- |
| Local Compose default profile | Runtime validated | Application services pass live browser acceptance through Nginx |
| Local Compose `full` profile | Runtime available; clean rebuild unproven | Official Elastic images run locally; the later hard-coded full `--build` attempt timed out while transferring large contexts |
| AWS dev/staging/prod | Not provisioned by W2-01 | No AWS IaC, VPC, subnet, security group, NACL, Secrets Manager, or Parameter Store resource is declared |
| Production | Out of scope | Requires future production deployment architecture and smoke plan |

## Full Profile Service Inventory

`docker compose --profile full config --services` reports:

| Service | W2-01 role |
| --- | --- |
| `nginx` | Browser edge for `/`, `/booking*`, `/bookings*`, `/auth*` |
| `apps-shell` | New authenticated shell host |
| `apps-auth` | Existing sign-in/session/sign-out owner |
| `apps-booking` | Existing Booking BFF/UI source |
| `booking-service` | Booking API and identity authorization adapter |
| `identity-service` | Permission catalog and `/internal/identity/authorize` |
| `keycloak` | OIDC/local authentication runtime |
| `postgres` | Existing persistence for identity/Booking and shared services |
| `seed-loader` | Local fixture provisioning |
| `kafka`, `schema-registry` | Existing W0/W1 messaging dependencies |
| `reference-data-service`, `apps-reference-data` | Existing W0-02/reference-data surfaces preserved |
| `charge-agreement-service`, `apps-charge-agreements` | Existing W1 quote-to-cash surfaces preserved |
| `container-movement-service`, `apps-container-movement` | Existing enterprise surfaces preserved |
| `otel-collector`, `jaeger`, `prometheus`, `grafana`, `elasticsearch`, `kibana` | Existing observability/search dependencies |
| `contract-devtools` | Existing contract/developer support service |

## Configuration Inventory

| Configuration | Source | Required state |
| --- | --- | --- |
| Shell service build | `compose.yaml`, `infrastructure-services` | `apps-shell` builds workspace `@erp/app-shell` |
| Shell edge routes | `infrastructure/nginx/default.conf`, `deployment-architecture` | `/`, `/booking*`, and `/bookings*` reach `apps-shell` |
| Auth routes | `deployment-architecture`, `infrastructure-services` | `/auth*` remains owned by `apps-auth` |
| Booking service URL | Compose DNS | Server-side calls use `http://booking-service:8085` |
| Identity service URL | Compose DNS | Booking service can call `http://identity-service:8082/internal/identity/authorize` |
| Session cookie | `packages/auth`, auth app | `lc_session` remains HttpOnly/SameSite and is redacted from evidence |
| Service token | Server-side environment | Must not be exposed to browser or artifact values |

## Security And Compliance Inventory

| Control | Status | Evidence or blocker |
| --- | --- | --- |
| Authentication | PASS in live proof | Keycloak/auth app login, session, sign-out, and stale-call rejection observed |
| Authorization | PASS in live proof | Booking allow and reference-admin deny scenarios preserve the real OIDC subject |
| Secret handling | PASS for W2 evidence | Evidence leak scan passed; no Secrets Manager/Parameter Store scope in W2-01 |
| Audit evidence | PASS | Git Bash executes both required detector scripts with exit `0` |
| Network controls | Local only | No AWS VPC/security group/NACL scope; Docker network and Nginx routing are the active controls |
| Data residency | No new claim | W2-01 does not introduce cloud data placement |

## Provisioning Decision

No AWS environment is provisioned in W2-01. The environment is inventory-complete and validated for local/on-prem W2 proof. Production provisioning and a clean full-profile rebuild remain outside this acceptance claim.
