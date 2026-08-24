# Infrastructure Services - U02 Reference Data Operational Completion

## Source Alignment

**Consumed inputs.** `services.md` supplies the backend service and data-ownership map; `components.md` supplies the component catalogue and non-responsibilities; `logical-components.md` supplies U02's inventory including the build-time catalog components; `security-design.md` supplies the credential and validation-boundary rules; `scalability-design.md` supplies the no-cache and no-new-store boundary; `reliability-design.md` supplies per-dependency failure behaviour and the build-time failure domain; `performance-design.md` supplies the bounded-call and compile-time-catalog properties; and `business-logic-model.md` supplies the calls U02 makes.

## Services U02 Consumes

U02 provisions **no** infrastructure service. It consumes two — the same two as U01, but with a command path added.

| Service | Owner | U02 use | Credential | Failure behaviour |
| --- | --- | --- | --- | --- |
| Identity | Identity | Separate current-request decisions for read, create, and update | Request-scoped session context | Deny and outage stop before provider access; outage is retryable 503 with zero provider calls |
| Reference Data service | Reference | Set/record/detail reads, history, create via PUT-by-ID `version=0`, update with exact version | Existing Reference service credential and trusted correlation | Provider error or stale truth with source and time; one of nine dispositions on a command; history failure scoped to its panel |

## Data Stores

| Store | Owner | U02 relationship |
| --- | --- | --- |
| Reference PostgreSQL | Reference service | Reached only through the service HTTP contract; U02 writes through commands, never through SQL |
| Identity PostgreSQL | Identity | Never reached by U02 |

U02 adds no database, schema, migration, table, or volume. The provider's existing `Map<String,String>` attribute shape is retained — U02 requires no persistence change to deliver the V1 catalog behaviour, which is precisely why the catalogs are build-time allow-lists rather than a schema migration.

## The Build-Time Components

Three artifacts that are components in the design sense without being provisioned infrastructure:

| Component | Where it lives | Infrastructure consequence |
| --- | --- | --- |
| `ReferenceFormCatalogV1` | BFF source | Compile-time data; no runtime fetch, no service to provision |
| `ReferenceFieldCatalogV1` | Reference service source | Compile-time data; no schema endpoint to expose |
| Producer/consumer fixture | Shared test asset | Couples two build gates; drift fails the build, not a request |

The fixture is the only genuinely new coupling U02 introduces, and it is a **CI** coupling rather than a runtime one — which is where `cicd-pipeline.md` picks it up.

## Not Provisioned

| Infrastructure service | Why not | Forecloses it |
| --- | --- | --- |
| Cache | Last-known facts require provider source and time; authorization is never cached | Application Design; FR-019, FR-020 |
| Draft / session store | Drafts are transient and must not outlive the authorization that permitted them | `business-rules.md` persistence boundary |
| Runtime schema service | Removed by design in favour of compile-time catalogs | U02 functional design |
| Message queue / Kafka topic | U02 is entirely synchronous | Application Design (no new topic) |
| Search service | No provider search contract; search is BLOCKED | `requirements.md` Provider Capability Matrix |
| CDN | No public hosting | NFR-012 |
| Load balancer | One instance per service | `services.md` |
| Service discovery | Compose DNS resolves service names | `services.md` |
| Secrets manager | U02 introduces no new secret | `tech-stack-decisions.md` |
| Object storage | No file, upload, or export surface | U02 scope |
| Read replica / replication | Provider-owned; U02 owns no data | U02 non-responsibilities |

## Integration Boundaries

The Reference app imports no other domain app React code and holds no other service database connection. Commands carry a server-issued credential, trusted correlation, and the exact provider version — never browser-supplied authority. Architecture tests enforce all of this at build time.

## Verification

Contract tests cover per-command policy, catalog fixture parity, unknown-key rejection at both boundaries, exact-version propagation, stable-ID create through the PUT-by-ID seam, and every result-to-HTTP mapping. Architecture tests assert no cross-app import, no cross-service database access, and no new store or client in configuration. Live Compose checks cover each dependency failure behaviour individually, and a deliberate catalog-drift fixture must fail the build rather than a request. Per NFR-011 an unexercised dependency failure is BLOCKED evidence, not a pass.
