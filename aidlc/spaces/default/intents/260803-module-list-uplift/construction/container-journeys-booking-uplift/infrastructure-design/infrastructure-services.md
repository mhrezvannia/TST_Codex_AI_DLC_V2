# Infrastructure Services - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

**Consumed inputs.** `services.md` supplies the backend service, data-ownership, and event-choreography map including the recorded control gap; `components.md` supplies the component catalogue and non-responsibilities; `logical-components.md` supplies U04's inventory and the 3.4 handoff; `security-design.md` supplies the assertion, credential, and non-exposure rules; `scalability-design.md` supplies the no-new-store boundary and the deliberate non-reliance on the event path; `reliability-design.md` supplies per-dependency failure behaviour and the poison/replay blocker; `performance-design.md` supplies the bounded-call properties; and `business-logic-model.md` supplies the calls U04 makes.

## Services U04 Consumes

U04 provisions one new **application** service (the CMM frontend, covered in `deployment-architecture.md`) and **no** new infrastructure service. It consumes four.

| Service | Owner | U04 use | Credential | Failure behaviour |
| --- | --- | --- | --- | --- |
| Identity | Identity | `container-movement:read` and `container-movement:capture`, per request | Request-scoped session context | Deny and outage stop before CMM/Reference access; outage is retryable 503. **Both capabilities unregistered today — every route fails closed until they exist** |
| Container Movement service | CMM owner | v2 reads, `timelineV1`, capture, exact `bookingId` lookup | Signed HMAC subject assertion (new, dedicated key) | Provider error, or stale truth with source and time; assertion failure fails closed with no fallback to v1 or default JSON |
| Reference Data service | Reference | Bounded active-location options | Existing fixed Reference service credential + trusted correlation | Raw authorized IDs with `Label unavailable`; capture disabled with its own distinct reason |
| Booking service | Booking | No direct U04 call — the shell adapter calls **CMM** by `bookingId`; Booking's own page reads its own truth | n/a | Booking page renders; its relationship region degrades independently |

## Data Stores

| Store | Owner | U04 relationship |
| --- | --- | --- |
| CMM PostgreSQL | CMM service | Reached only through the v2 HTTP contract; never directly |
| Reference PostgreSQL | Reference service | Reached only through the bounded location port |
| Booking PostgreSQL | Booking service | Never reached by U04 |
| Identity PostgreSQL | Identity | Never reached by U04 |

U04 adds no database, schema, migration, or volume. The `timelineV1` projection is computed in the CMM service from current state and is **not persisted as a second authority** — a design decision with an infrastructure consequence: there is no table, cache, or materialized view to provision or invalidate.

## Messaging

U04 consumes existing choreography and changes nothing about it.

| Element | State | U04 relationship |
| --- | --- | --- |
| `booking.confirmed` topic | Existing | CMM consumes idempotently with revision guards |
| `containermovement.status` topic | Existing | Booking consumes with durable receipts and stale-sequence rules |
| Publisher outboxes | Existing, with PENDING / retryable / permanent dispositions | Unchanged |
| Listener containers | Existing, concurrency 3, stable consumer groups | Unchanged |
| Error handler, bounded retry, DLQ, poison ledger, replay contract | **Absent** | **Not provisioned by U04.** W4 adds no topic and does not invent messaging controls it does not own |

The last row is an infrastructure gap with an infrastructure-shaped temptation: it would be easy to add a DLQ topic here and call the problem solved. Doing so would create a control the running system does not have, owned by no one, verified by nothing. It stays open, with owner and evidence path, and remains a hard completion condition for U04 and the intent.

## Not Provisioned

| Infrastructure service | Why not | Forecloses it |
| --- | --- | --- |
| Cache | Last-known facts need provider source and time; authorization never cached | Application Design; FR-019, FR-020 |
| New Kafka topic (including a DLQ) | W4 adds no topic; an unowned control is worse than a visible gap | `services.md`, the recorded BLOCKED exit |
| Search service | No search contract exists for Journeys | `requirements.md` Provider Capability Matrix |
| CDN | No public hosting | NFR-012 |
| Load balancer | One instance per service | `services.md` |
| Service discovery | Compose DNS resolves service names | `services.md` |
| Secrets manager / vault | One new key, provisioned the way existing service credentials are; no vault exists in the stack | `technology-stack.md` |
| Object storage | No file or export surface | U04 scope |
| Read replica / replication | Provider-owned; U04 owns no data | U04 non-responsibilities |

## Integration Boundaries

The CMM app imports no other domain app's React code and holds no other service's database connection. The shell-hosted Booking relationship adapter calls CMM v2 by exact `bookingId` and does not query Booking's or CMM's stores directly. Every cross-service call carries server-issued trust material — assertion for CMM, service credential for Reference — never forwarded browser authority. All covered by architecture tests, so violations fail the build.

## Verification

Contract tests cover v2 media negotiation with additive v1 compatibility, assertion issuance and verification including spoof and expiry rejection, the bounded location port's authorization/cardinality/failure mapping, and exact-`bookingId` lookup across four outcomes. Architecture tests assert no cross-app import, no cross-service database access, and no new store, topic, or client in configuration. Live Compose checks cover each dependency's failure behaviour individually, including a blocked-partition scenario demonstrating that CMM Journey truth and synchronous reads stay correct. Per NFR-011 an unexercised dependency failure is BLOCKED evidence, not a pass.
