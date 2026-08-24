# Services - W4-01 Module List-Detail Uplift

## Sources and Topology Decision

This design implements approved `requirements.md` and `stories.md`, preserves `architecture.md` and `component-inventory.md`, and follows `team-practices.md`. It retains five bounded backend services, their owned PostgreSQL stores, current Kafka published language, monorepo frontends, and the isolated `linercore-wave-a` Compose acceptance environment.

No AWS resource, production cluster, backend microservice, database, shared cache, or Kafka topic is added. AWS mapping is NOT APPLICABLE because W4 makes local acceptance claims only.

## Deployables and Exact Ownership

| Deployable | W4 responsibility | Canonical paths | Ownership constraint |
| --- | --- | --- | --- |
| `apps/shell` | Home plus existing canonical Booking composition and Booking-to-Journey relationship adapter | `/`, `/booking`, `/booking/[bookingId]`; existing validated `/bookings*` retirement behavior | Renders shared `PlatformShell`; does not absorb Reference, Charge, or CMM pages |
| `apps/reference-data` | Reference set/list/detail/create/edit and BFF | `/reference-data*`, with `basePath=/reference-data` | No local rail/top bar/theme/auth shell |
| `apps/charge-agreements` | Agreements, rates, conditional Approval Queue, manual evidence and BFF | `/charge-agreements*`, existing base path retained | No local shell; queue segments require verified provider filters |
| `apps/container-movement` | New CMM recent/detail/capture routes and BFF | `/container-movement`, `/container-movement/journeys/[journeyId]`, `basePath=/container-movement` | New frontend deployable only; no backend or local shell |
| `@erp/ui` + shell registry | One shared executable shell, tokens, primitives, navigation schema | Consumed by every canonical app | W2-02 platform ownership; no W4 fork |
| Nginx/Compose wrapper | Prefix routing, header hygiene, CMM service/app integration | One host/entry URL | Does not render or authorize domain content |

The existing `apps/booking` `/bookings*` frontend is not the owner of the W4 relationship change. Source inspection shows the binding Journey-to-Booking target is `/booking/[bookingId]` in `apps/shell`; W4 changes that shell-owned page/BFF seam only. Any broader Booking route consolidation is outside W4.

## Shared Shell Composition Mechanism

The reverse proxy does not wrap HTML. Each canonical Next.js deployable produces a complete document by invoking the same platform-owned `PlatformShell` export and shared route registry. W2-02 must evolve the current `@erp/ui` shell API to accept trusted session, visible route registrations, active module, breadcrumbs, and children; `apps/shell` must replace its separate `ShellFrame`, while Reference and Charge replace their title-derived local shell calls. CMM consumes the resulting contract from first implementation.

Nginx preserves `/reference-data`, `/charge-agreements`, and `/container-movement` prefixes. Each domain app has the matching Next `basePath`; assets resolve under the same prefix. Direct navigation and refresh therefore route to the owning app, which authenticates the host-wide session and renders the one shared shell implementation. Root paths return 200; CMM receives no invented legacy redirect. Unknown/ambiguous legacy-looking paths return 404 except the four approved Charge 308 mappings.

A shared Nginx include is applied to every public location. It clears exactly `Authorization`, `Idempotency-Key`, `X-Actor-Subject`, `X-Actor-Subject-Id`, `X-Correlation-Id`, `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-LinerCore-Service-Id`, `X-LinerCore-Service-Token`, and `X-LinerCore-Subject-Assertion`; it then sets trusted Host, forwarded host/proto/for, and request-ID correlation values. Cookie and ordinary representation headers use normal proxy forwarding. Internal BFF service calls bypass the public edge and set their own trust headers. App health is checked internally at each base-path-aware `/api/health`; health endpoints do not authorize domain reads.

Booking/Journey cross-links use a signed ten-minute origin token rather than cross-module `returnTo`. The token binds current subject, exact source kind/record ID/canonical href, and expected target module. Booking-origin and Journey-origin Back links appear only after target-side verification; invalid or absent tokens fall back to the target canonical root.

## Backend Services

| Service | W4 change | Data owner | Compatibility posture |
| --- | --- | --- | --- |
| Identity | Register/verify proposed CMM read/capture capabilities and current-request policy | Identity DB | Required platform dependency; fail closed until executable |
| Reference Data | Existing Reference reads/mutations; existing bounded active-option service contract | Reference DB | No search/sort invention; action gaps remain blocked |
| Charge Agreement | Existing Agreement/rate/manual evidence; admit approval filters only when tested | Charge DB | Existing v2 media/contracts retained |
| Booking | No W4 backend command; current Booking truth and movement projection remain | Booking DB | Relationship is a shell BFF read against CMM |
| Container Movement | Add v2 media contract, verified subject assertion, trusted capture headers, `timelineV1` projection | CMM DB | Existing default JSON and actor-shaped internal v1 remain compatible but are not public browser seams |

## Communication Contracts

| Caller | Callee | Pattern | Exact contract | Failure posture |
| --- | --- | --- | --- | --- |
| Edge | canonical app | HTTP prefix route | Preserved path/query, host-wide cookie, sanitized forwarded headers | Target-scoped 404/503; other prefixes survive |
| Canonical app | `@erp/ui`/registry | package consumption | `PlatformShellProps`, `ShellRouteRegistration[]` | Missing shared release is BLOCKED; no local fork |
| Domain BFF | Identity | synchronous policy | exact resource/action/current subject | deny/outage distinct, both fail closed |
| Reference BFF | Reference service | REST | existing set/record/history/mutation contracts | typed denied/not-found/conflict/unavailable |
| Charge BFF | Charge service | REST | existing Agreement/rate/manual contracts | reject unsupported keys; no client queue merge |
| Charge BFF | Reference service | service REST | `GET /charge-agreements/api/reference-options` accepts single `domain`, `kind`, optional bounded `q`; maps to active `GET /reference-sets/{set}/records?includeInactive=false&page=0&size=50`; returns <=50 typed options | invalid query 400 without provider call; deny/unavailable distinct; no app import |
| CMM BFF | CMM service | REST v2 | assertion-bound recent/detail/by-Booking, `timelineV1`, trusted capture headers | no client lifecycle calculation; unknown command refetch |
| CMM BFF | Reference service | service REST | active location options | read may show raw ID; capture disabled if validation unavailable |
| Shell Booking BFF | CMM service | REST v2 | exact Journey by `bookingId` | present/not-created/denied/unavailable remain distinct |
| Booking service | Kafka | outbox publish | existing `booking.confirmed` Avro | durable retry/permanent outbox status |
| Kafka | CMM service | consume | Booking confirmation keyed/identified by event idempotency key | duplicate/stale reconciliation is idempotent; poison handling gap below |
| CMM service | Kafka | outbox publish | existing `containermovement.status` Avro | persistence and publication remain separate |
| Kafka | Booking service | consume | movement status with stable event ID/sequence | receipt insert suppresses duplicate; stale sequence ignored; poison gap below |

## CMM V2 and Trusted Identity

The CMM BFF follows the existing Charge subject-assertion pattern rather than forwarding browser authority. A short-lived HMAC assertion binds issuer, key ID, authenticated subject, HTTP method, normalized provider path, correlation ID, issued/expiry time, and nonce. The CMM v2 controller verifies it with a dedicated key, ignores/rejects actor query/body fields, and maps the verified subject into existing application ports.

V2 capture carries provider idempotency in `Idempotency-Key` and correlation in `X-Correlation-Id`. The BFF obtains the key only from its signed capture-attempt token. The provider continues to persist the accepted movement/idempotency receipt in the CMM-owned transaction. Existing direct v1 service calls are an internal compatibility surface and are not exposed by Nginx.

## Orchestration and Consistency

Synchronous UI work remains narrow: authenticate, authorize, validate allow-lists, call the owner, translate typed outcomes, and re-read after an accepted command. There is no distributed UI transaction or synchronous Booking-to-CMM creation call.

Booking confirmation and movement status remain asynchronous choreography. CMM capture persistence, CMM outbox publication, broker delivery, and Booking projection application are separately observable truths. The UI never infers a later truth from an earlier one.

## Verified Event Controls and Known Gap

Source evidence establishes these controls:

- Booking and CMM publishers use owned outbox records with `PENDING`, retryable delay, and permanent-failure dispositions.
- CMM consumes `booking.confirmed` idempotently through the event idempotency key, reconciles only newer Booking revisions, and records stale/duplicate audit outcomes.
- Booking consumes `containermovement.status` through a durable event receipt, rejects container mismatch, suppresses duplicate event IDs, and ignores stale/weak projection updates.
- Both Kafka listeners use stable consumer group IDs and concurrency three.

Source evidence also shows no configured listener error handler, bounded retry policy, dead-letter topic, poison-message ledger, or replay operator contract in either listener container factory. W4 does not invent a new Kafka topic. Therefore poison-message/DLQ/replay readiness is a BLOCKED platform/service-owner dependency, not an existing PASS.

Current blast radius is explicit: a poison record can repeatedly block its Kafka partition; other partitions, owning-service persisted truth, synchronous module reads, and direct Booking-to-Journey lookup remain available. CMM-to-Booking lag affects only Booking's projected movement evidence, not CMM Journey truth. Construction cannot label the event loop acceptance-green until the owners either (a) provide verified existing replay/poison controls or (b) approve a bounded failure-handling change and its contract tests through normal scope/change control.

## Data, Cache, and Degradation

Each service retains its PostgreSQL database. W4 adds no shared cache or BFF persistence. Last-known facts appear only when an owning authorized provider supplies data source/time; authorization is never cached. Raw authorized IDs may remain visible when label lookup fails, but mutation requiring canonical active Reference validation is disabled.

CMM `timelineV1` is computed inside the owning service from current expected/history state. It is not persisted as a second authority. Received time and event source remain absent because current Journey state does not own them.

## Approval Queue Admission

The Charge app/BFF owns the candidate screen, but each Agreement and Rate segment is independently enabled only after the respective server supports its Draft/pending filter plus bounded page/size and exact read capability. A missing segment is unavailable with owner/evidence; the BFF never downloads broad sets or merges/filter them in memory.

## Local Lifecycle and Acceptance

The canonical evidence environment remains the isolated Compose project and approved wrapper in `team-practices.md`. W4 adds the CMM app image, base-path-aware health check, internal CMM service URL, assertion key material, and Nginx prefix to that topology. Manager-demo guard, startup/health evidence, direct refresh, shared-shell landmark checks, and target-scoped failure tests are mandatory.

Approved p95 thresholds under ten local users are acceptance targets, not production SLOs. No multi-AZ, autoscaling, backup, disaster recovery, production cost, cadence, or AWS Well-Architected claim is made.

## Traceability

The per-item requirements/story-to-component/contract/ADR/verification mapping is in `components.md`. This service artifact supplies its shell composition, CMM v2, Charge-to-Reference, Booking ownership, event idempotency, known poison/replay gap, and blast-radius evidence.
