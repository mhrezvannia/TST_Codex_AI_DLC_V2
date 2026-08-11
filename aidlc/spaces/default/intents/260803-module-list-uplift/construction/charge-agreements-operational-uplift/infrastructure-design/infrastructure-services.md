# Infrastructure Services - U03 Charge Agreements Operational Uplift

## Source Alignment

**Consumed inputs.** `services.md` supplies the backend service and data-ownership map; `components.md` supplies the component catalogue and its non-responsibilities; `logical-components.md` supplies U03's component inventory and shared-resource analysis; `security-design.md` supplies the credential and trust rules for service-to-service calls; `scalability-design.md` supplies the no-cache and no-new-store boundary; `reliability-design.md` supplies the per-dependency failure behaviour; `performance-design.md` supplies the bounded-call properties; and `business-logic-model.md` supplies the calls U03 actually makes.

## Services U03 Consumes

U03 provisions **no** infrastructure service. It consumes three, each over HTTP on the internal Compose network.

| Service | Owner | U03 use | Credential | Failure behaviour |
| --- | --- | --- | --- | --- |
| Identity | Identity | Current-request policy decision per read and per command | Request-scoped session context | Deny and outage both stop before provider access; outage is retryable 503 |
| Charge Agreement service | Charge | Agreement list/detail, versions, rate versions, lifecycle commands, manual-pricing evidence, queue segments | Existing Charge service credential + trusted correlation | Provider error, or stale truth when source and time are supplied |
| Reference Data service | Reference | Bounded active-option lookup for customer, trade lane, commodity labels | Existing fixed Reference service credential + trusted correlation | Raw authorized IDs with `Label unavailable`; canonical-validation actions unavailable |

The Reference call is service-to-service with a fixed credential, gated behind the current request's Charge read capability — the confused-deputy control, restated here because it is a property of the *call*, not only of the code.

## Data Stores

| Store | Owner | U03 relationship |
| --- | --- | --- |
| Charge PostgreSQL | Charge service | Reached only through the service's HTTP contract; never directly |
| Reference PostgreSQL | Reference service | Reached only through the bounded option port; no shared SQL |
| Identity PostgreSQL | Identity | Never reached by U03 |

U03 adds no database, schema, migration, table, view, or index. Cross-service SQL is prohibited, and no connection string to another service's store exists in the Charge app's configuration.

## Not Provisioned

| Infrastructure service | Why not | Forecloses it |
| --- | --- | --- |
| Cache (Redis/Memcached/in-process) | Last-known facts require provider source and time; authorization is never cached. A cache would be an unowned second source of truth | Application Design (no cache); FR-019, FR-020 |
| Message queue / new Kafka topic | U03 is entirely synchronous; W4 adds no topic | Application Design (no new topic) |
| Search service | No generic search exists at any layer; the provider has no verified search contract | `requirements.md` Provider Capability Matrix |
| CDN | No public hosting | NFR-012 |
| Load balancer | One instance per service | `services.md` |
| Service discovery | Compose DNS resolves service names; nothing to add | `services.md` |
| Secrets manager / vault | U03 introduces no new secret; existing service credentials are already provisioned | `tech-stack-decisions.md` |
| Object storage | No file, upload, or export surface in U03 | U03 scope |
| Read replica / replication | Provider-owned; U03 owns no data | U03 non-responsibilities |

## Integration Boundaries

Two rules make the above enforceable rather than aspirational: the Charge app imports no Reference application code and holds no Reference database connection, and every cross-service call carries a service credential plus trusted correlation issued server-side. Both are covered by architecture tests, so a violation fails the build rather than being discovered in review.

## Verification

Contract tests cover the bounded Reference option query with its authorization, cardinality cap, and four-way failure mapping. Architecture tests assert no cross-app import, no cross-service database access, and no new store or client in configuration. Live Compose checks cover each dependency's failure behaviour individually. Per NFR-011 an unexercised dependency failure is BLOCKED evidence, not a pass.
