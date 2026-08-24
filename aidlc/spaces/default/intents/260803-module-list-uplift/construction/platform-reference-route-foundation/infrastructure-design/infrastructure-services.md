# Infrastructure Services - U01 Platform and Reference Route Foundation

## Source Alignment

**Consumed inputs.** `services.md` supplies the backend service and data-ownership map; `components.md` supplies the component catalogue and non-responsibilities; `logical-components.md` supplies U01's inventory and shared-resource analysis; `security-design.md` supplies the trust rules for service calls; `scalability-design.md` supplies the no-cache and no-new-store boundary; `reliability-design.md` supplies per-dependency failure behaviour; `performance-design.md` supplies the bounded-call properties; and `business-logic-model.md` supplies the calls U01 makes.

## Services U01 Consumes

U01 provisions **no** infrastructure service. It consumes two.

| Service | Owner | U01 use | Credential | Failure behaviour |
| --- | --- | --- | --- | --- |
| Identity | Identity | Current-request `reference-data:read` decision on every read including refresh | Request-scoped session context | Deny and outage both stop before provider access; outage is retryable 503 with zero provider calls |
| Reference Data service | Reference | `listSets`, `listRecords`, `getRecord` | Existing Reference service credential and trusted correlation | Provider error, or stale truth when source and time are supplied; history failure scoped to its panel |

U01 has no mutation path and no bounded option port, so its dependency surface is the smallest of the four units — which is what makes it usable as the platform baseline.

## Data Stores

| Store | Owner | U01 relationship |
| --- | --- | --- |
| Reference PostgreSQL | Reference service | Reached only through the service HTTP contract; never directly |
| Identity PostgreSQL | Identity | Never reached by U01 |

U01 adds no database, schema, migration, or volume, and holds no connection string to another service store.

## Not Provisioned

| Infrastructure service | Why not | Forecloses it |
| --- | --- | --- |
| Cache | Last-known facts require provider source and time; authorization is never cached | Application Design; FR-019, FR-020 |
| Message queue / Kafka topic | U01 is entirely synchronous | Application Design (no new topic) |
| Search service | No provider search contract exists; search is BLOCKED | `requirements.md` Provider Capability Matrix |
| CDN | No public hosting | NFR-012 |
| Load balancer | One instance per service | `services.md` |
| Service discovery | Compose DNS resolves service names | `services.md` |
| Secrets manager | U01 introduces no new secret | `tech-stack-decisions.md` |
| Object storage | No file or export surface | U01 scope |
| Read replica / replication | Provider-owned; U01 owns no data | U01 non-responsibilities |

## Integration Boundaries

The Reference app imports no other domain app React code and holds no other service database connection. Every cross-service call carries a server-issued credential and trusted correlation, never forwarded browser authority. U01 installs the architecture tests that enforce this — the cheapest place to prevent a class of regression is the first integrated route.

## Verification

Contract tests cover policy evaluation, the provider-call prohibition on DENY and outage, and the strict input rejection classes. Architecture tests assert no cross-app import, no cross-service database access, and no new store or client in configuration. Live Compose checks cover each dependency failure behaviour individually. Per NFR-011 an unexercised dependency failure is BLOCKED evidence, not a pass.
