# Component Dependency - W2-04 Container Journey & Track-Trace

## Dependency Principles

This map implements the boundaries required by `requirements.md` and the
vertical flow in `stories.md`. It preserves the hexagonal/event-driven direction
observed in `architecture.md`, reuses the seams listed in
`component-inventory.md`, and applies `team-practices.md`: acyclic ports,
service-owned databases, Kafka-only cross-module delivery, and no shared-shell or
`packages/ui` redesign.

Dependencies point inward from adapters to application/domain. Cross-service
data is exchanged only through owned HTTP contracts or registered events; no
component reads another service's database.

## Dependency Matrix

Legend: `D` direct compile/runtime dependency; `P` dependency through a port or
contract; `E` asynchronous event; `-` none.

| From / To | CMM domain | CMM app | CMM DB adapters | CMM REST | CMM messaging | Identity | Reference Data | Booking | CMM app UI | Shell/UI pkg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| CMM domain | - | - | - | - | - | - | - | - | - | - |
| CMM application | D | - | P | - | P | P | P | - | - | - |
| CMM DB adapters | D | D/P | - | - | - | - | - | - | - | - |
| CMM REST adapter | D/DTO | D | - | - | - | - | - | - | - | - |
| CMM messaging adapters | D/DTO | D | P | - | - | - | - | E | - | - |
| Booking consumer/projection | - | - | - | - | E | - | - | - | - | - |
| CMM Next.js app | - | - | - | P/HTTP | - | P/session | - | - | - | D |
| Booking UI | - | - | - | - | - | P/session | - | D/API | P/link only | D |

The CMM domain has no outbound dependencies. The CMM application defines ports;
adapters implement them. Booking and CMM share wire contracts, not Java domain
types or database tables. Frontends import shared packages but never each other.

## In-Process CMM Dependency Flow

```text
[Kafka listener] -----> [JourneyIntakeUseCase] -----> [ContainerJourney]
                                 |                         |
                                 |                         v
                                 +---- ports -----> [Transition/value model]
                                 |
                                 +---- ports -----> [Identity / Reference Data]
                                 +---- ports -----> [Journey / request / audit / outbox adapters]

[REST controller] ----> [MovementCaptureUseCase] --> [ContainerJourney]
                                 |
                                 +---- ports -----> [movement / rejection / request / outbox adapters]

[REST controller] ----> [JourneyQueryUseCase] ------> [CMM read adapters]

[Outbox relay] --------> [MovementStatusPublisher] --> [Kafka / Schema Registry]
```

The application layer is the only local transaction orchestrator. Domain
objects decide semantics; repositories persist decisions; adapters translate
transport/security/reference concerns.

## Broker-to-Database-to-Booking Data Flow

1. Booking database commits a confirmed booking and `booking.confirmed` outbox.
2. Booking relay publishes to `booking.events` with the logical discriminator.
3. CMM listener maps the Avro record and calls the intake transaction.
4. CMM database commits journey snapshot, two expected moves, intake identity,
   audit, and PLN LOAD sequence-0 outbox.
5. CMM relay publishes keyed `containermovement.status`.
6. Booking listener maps the record, verifies booking/equipment, inserts receipt,
   and applies the stronger latest projection.
7. Booking detail reads only Booking PostgreSQL and links to the canonical CMM
   detail route.
8. Each later accepted ACT capture repeats steps 4-7 with positive sequence 1-4.

There is no Booking-to-CMM or CMM-to-Booking synchronous normal-delivery edge.

## Accepted Capture Data Flow

1. `MovementCapturePanel` sends preserved form values through the CMM BFF with
   session subject, correlation, and idempotency headers.
2. REST verifies authentication, builds explicit `CaptureRequestContext`, and
   maps the request; it does not make the authorization decision.
3. The application use case evaluates exact capture permission through
   `AuthorizationPort`, validates reference freshness, and loads the current aggregate
   plus any request/occurrence duplicate evidence.
4. `MovementTransitionPolicy` returns `MovementAccepted`.
5. One CMM transaction appends capture attempt/movement ledger, completes the
   request disposition, appends audit, saves the next versioned snapshot, and
   enqueues one status fact.
6. REST returns updated journey and publication-pending state.
7. Relay/Booking propagation occurs asynchronously; UI refresh shows published/
   applied evidence when available.

## Rejected Capture Data Flow

1. Steps 1-3 are identical to accepted capture.
2. Policy returns `MovementRejected` with duplicate original evidence or
   required next code.
3. One transaction appends attempt/rejection/audit evidence and completes a new
   request disposition only when this was a new key.
4. REST maps the result to stable HTTP 409 with the original correlation.
5. The panel preserves values, focuses/announces the summary, and offers the
   corrective action.
6. No snapshot, accepted ledger, status outbox, broker fact, or Booking
   projection edge is exercised.

This negative-path dependency cut is an acceptance invariant, not merely an
implementation preference.

Idempotency precedes the semantic decision inside the application
transaction: the unique key/fingerprint claim yields new, same-request, or
conflicting-request. Stored results are not re-evaluated: same/conflicting keys
return wire-visible `DUPLICATE_MOVEMENT` with applicable original evidence;
every invocation appends attempt/rejection/audit evidence. Concurrent inserts
serialize on the key, so exactly one new claim can reach accepted mutation.

## Authorization Dependency Flow

```text
[Browser session]
       |
       v
[CMM BFF] ---- subject/correlation ----> [CMM REST: authenticate/map]
                                              |
                                              v
                                [Application query/capture]
                                              |
                                              v
                                      [AuthorizationPort]
                                              |
                                              v
                                  [Identity authorize endpoint]
                                              |
                         +--------------------+--------------------+
                         |                                         |
                   allow read/capture                         deny/unavailable
                         |                                         |
                         v                                         v
                 [query or command]                  [403/degraded; no write]
```

UI permission hints may hide/disable capture but are not authority. Backend
evaluation remains mandatory. Customer Service cannot acquire capture by direct
API use; Equipment Control can after authoritative assignment.

Identity outcome matrix:

| Identity result | New read | Capture | Existing browser content |
|---|---|---|---|
| allow read (+ capture where granted) | serve CMM persisted data | continue to reference/domain checks | refresh normally |
| deny | 403, no new data | 403, no write | replace/cover with denied state on next interaction |
| unavailable | dependency-unavailable, no new data | disabled/503, no write | may remain visibly stale but cannot refresh or submit |

After an allowed read, Reference Data unavailability may mark route/reference
facts last-known because they are already persisted in CMM. It never authorizes
a user and always disables capture. CMM DB failure serves no journey; Kafka or
Booking delay affects publication labels only.

## Frontend Component Dependencies

| Component | Depends on | Must not depend on |
|---|---|---|
| list/detail server routes | CMM server API client, `@erp/ui`, auth/session helpers | Booking app internals, raw Kafka/SR clients |
| `MovementTimeline` | journey detail DTO, shared display primitives | Booking projection model, chart library |
| `MovementCapturePanel` | capture BFF route, local React state, shared inputs/Drawer/feedback | RTK/global store, `packages/ui` source edits |
| CMM BFF | `packages/api-core`/auth patterns where available, CMM backend | actor query/body fallback, another service DB |
| Booking status panel | Booking-owned API DTO, shared primitives | CMM timeline fetch as normal data source |
| shell mount | integration-owned route/module metadata | CMM domain logic or independent chrome |

At 768 the capture component depends on the existing shared Drawer only if W2-02
provides it. A missing primitive becomes an integration request; W2-04 does not
create a parallel component library.

## Shared Resources and Ownership

| Resource | Owner | Consumers | Coordination rule |
|---|---|---|---|
| `booking.events` / confirmation schema | Booking producer | CMM | Producer/consumer contract review; logical discriminator retained. |
| `containermovement.status` schema/topic | CMM producer | Booking | Producer-owned v1; BACKWARD check, Pact/AsyncAPI/fixtures synchronized. |
| CMM PostgreSQL/Flyway chain | CMM | CMM only | One explicit migration owner; no destructive reset evidence. |
| Booking PostgreSQL/Flyway chain | Booking | Booking only | Add defaulted sequence columns/comparator; no CMM query. |
| Identity permission catalog | Identity | CMM/shell/acceptance setup | Exact tuples/grants; evaluator authoritative. |
| Reference Data API | Reference Data | CMM | Stable IDs; unavailable vs invalid distinction. |
| `packages/ui` and shell | W2-02/integration | all module apps | W2-04 consumes only and records missing primitives. |
| `linercore-wave-a` stack | serialized Wave A controller | W2-02/03/04 final acceptance | One controller at a time; demo guard before/after. |

Outbox claim dependency: the relay receives event plus an opaque claim
token/version. Its success/failure callback must present that claim to the
repository, whose conditional update fences expired workers. Publisher success
without a successful conditional mark may cause safe at-least-once redelivery;
it cannot let the stale worker overwrite the newer claim.

## Coupling and Change Impact

- A domain transition change affects CMM policy/aggregate/tests and emitted
  lifecycle facts, but not Booking's full domain model.
- A v1 wire-field change affects Avro, AsyncAPI, fixtures/Pacts, producer mapper,
  Booking mapper/projection, and Schema Registry compatibility together.
- A CMM schema change stays behind CMM repositories and its Flyway chain.
- A UI composition change stays in `apps/container-movement` and the page record;
  shared primitive changes require W2-02/integration ownership.
- An Identity action/catalog change requires authoritative catalog/evaluator and
  acceptance assignments; a local CMM allow-all adapter is not a substitute.

## Traceability

| Flow | Requirements | Stories / acceptance |
|---|---|---|
| confirmation -> planned journey | FR-01, FR-02, FR-07 | US-01 / AC-01 |
| capture -> accepted state | FR-04, FR-05, FR-07 | US-03 / AC-02 |
| conflict cut path | FR-06 | US-04, US-05 / AC-03, AC-04 |
| outbox -> Booking | FR-08 through FR-11 | US-06, US-07 / AC-05 through AC-07 |
| Identity path | FR-12 | US-08 / AC-08 |
| frontend route/state path | FR-03, FR-13 | US-02 through US-05 / AC-09 |
| shared live resources | FR-14, NFR-10 | US-09 / AC-10 through AC-12 |
