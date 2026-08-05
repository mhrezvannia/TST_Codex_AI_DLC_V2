# Services - W2-04 Container Journey & Track-Trace

## Service Topology

The topology refines `requirements.md` and `stories.md` without adding a new
backend bounded context. It preserves the independently deployable services and
service-owned stores documented in `architecture.md` and
`component-inventory.md`, and follows `team-practices.md` by proving PB-01 on
the real Kafka/PostgreSQL/shared-shell path before deeper lifecycle work.

| Deployable | W2-04 responsibility | Owned state | Scaling/lifecycle |
|---|---|---|---|
| Container Movement service | confirmation intake, expected plan, capture, lifecycle, queries, status outbox/relay | CMM PostgreSQL | Stateless Spring instances over one service DB; Kafka/HTTP instances scale horizontally with partition/DB coordination. |
| Booking service | publish confirmation; consume status; durable receipt/latest projection; Booking detail | Booking PostgreSQL | Existing stateless service; consumer scales within its Kafka group. |
| Identity service | exact permission catalog, assignments, authorization decisions | Identity-owned catalog/assignments/audit | Existing authoritative service; non-local unavailability fails capture closed. |
| Reference Data service | active route/movement location validation | Reference Data PostgreSQL | Existing synchronous dependency; unavailable and invalid remain distinct. |
| Container Movement app | list/detail/timeline/capture BFF and routed UI | no domain database; transient request state only | New CMM-owned Next.js app mounted by shared edge. |
| Shared shell/Nginx | authenticated chrome and canonical route mount | session/routing configuration only | W2-02/integration-owned; W2-04 consumes, not redesigns. |
| Kafka + Schema Registry | ordered at-least-once facts and BACKWARD contract authority | time-retained topics/schemas | Existing platform; booking+container key preserves per-journey ordering. |

No AWS service, public cloud path, EDI gateway, fleet/depot service, or M&R
service is introduced. The AWS support review applies reliability, security,
operability, performance, cost, and sustainability principles to the existing
portable/on-prem topology only.

## Orchestration and Choreography

Cross-service workflow is event choreography; each service orchestrates only its
own local transaction.

1. Booking confirms and commits its existing confirmation outbox.
2. Booking relay publishes logical `booking.confirmed` on physical
   `booking.events` using the registered schema.
3. CMM listener maps the record and invokes one `JourneyIntakeUseCase`
   transaction.
4. CMM commits journey/plan/idempotency/audit and sequence-0 PLN LOAD status
   outbox, then acknowledges the input record.
5. The CMM relay publishes committed `containermovement.status` facts.
6. Booking consumes each fact, commits receipt/disposition/latest projection,
   then acknowledges.
7. CMM and Booking UIs read only their owners' stores through their services.

Manual capture is synchronous only from CMM UI/BFF to the CMM API. It never
calls Booking. Accepted effects are later propagated by the outbox/Kafka path.

## Communication Contracts

### `booking.confirmed` inbound to CMM

- Physical topic: `booking.events`; logical discriminator: `booking.confirmed`.
- Producer: Booking; consumer: CMM.
- Delivery: at least once; CMM dedupes envelope/idempotency and reconciles only
  a stronger booking revision.
- Required slice data: booking reference/revision, assigned equipment, POL/POD,
  source, correlation, event identity.
- Failure: invalid/inactive reference is permanent and observable; transient
  Identity/Reference Data/database failures are retryable without partial state.

### `containermovement.status` outbound from CMM

- Topic/subject: `containermovement.status` /
  `containermovement.status-value`.
- Producer: CMM; conformist consumer: Booking.
- Key: booking reference + container reference.
- Contract: producer-owned v1 Avro/AsyncAPI/Pact, BACKWARD compatibility,
  defaulted non-negative `sequenceNumber`.
- Planned compatibility fact: PLN LOAD@POL, lifecycle Allocated, sequence 0.
- Actual facts: ACT GTOT/LOAD/DISC/GTIN with sequence 1/2/3/4 and exact
  lifecycle/load-state/location/timestamps/correlation.
- Topic remains time-retained and non-compacted; each accepted actual movement
  is a distinct fact.

### Synchronous internal HTTP

- CMM -> Identity: authoritative resource/action decision for read/capture and
  service actions.
- CMM -> Reference Data: validate active POL/POD/movement location references.
- Browser -> CMM BFF -> CMM API: list/detail/capture with authenticated session,
  correlation, and idempotency propagation.
- Booking and CMM never synchronously query each other for normal delivery.

## Local Transaction Boundaries

### Journey intake transaction

Commits exactly one disposition:

- opened/reconciled: snapshot + intake identity + audit + planned status outbox;
- duplicate/stale: durable idempotent/audit disposition without another journey
  or plan;
- invalid reference: explicit failure evidence and no journey/outbox.

Kafka acknowledgement occurs only after commit. A retry observes the committed
identity and does not double-open or double-enqueue.

### Accepted capture transaction

Commits capture-attempt row, movement ledger row, next journey snapshot/lifecycle/
version, capture request disposition, accepted audit, and one pending status
outbox row atomically.
Database uniqueness and aggregate sequence policy prevent double advancement.

### Rejected capture transaction

Returns a stable rejected result. A new key commits request disposition,
capture attempt, rejection evidence, and rejection audit. Same/conflicting-key
duplicates leave the stored request immutable and commit attempt/rejection/audit
only. It does not save the snapshot, append
accepted movement, enqueue status, or reach Booking. This targeted result avoids
a second transaction while keeping HTTP conflict mapping outside the domain.

Before semantic evaluation, the transaction atomically claims the idempotency
key/fingerprint. A same-key/same-fingerprint accepted result becomes an
observable duplicate; a stored rejected result also becomes
`DUPLICATE_MOVEMENT` while retaining its original rejection as evidence; a
different fingerprint returns duplicate with `IDEMPOTENCY_KEY_REUSED`. Concurrent claimers
serialize on the unique key and observe the winner. Each invocation appends
attempt/rejection/audit evidence, while only the first accepted disposition can create
accepted history/outbox.

### Booking consumption transaction

Locks/validates the booking, verifies assigned equipment, inserts one receipt,
applies sequence-aware latest projection when stronger, records disposition,
and audits before acknowledging the Kafka record.

## Data and Service Lifecycle

### CMM schema lifecycle

- Introduce Flyway with a baseline matching existing W1 tables and no destructive
  volume reset.
- Add ordered migrations for snapshot versioning, expected/accepted/rejection/
  request evidence, positive sequence uniqueness, and Booking contract support.
- Normalize safe legacy outbox states to the canonical Java lifecycle and change
  constraints without losing W1 rows.
- Prove existing-data upgrade, backfill/compatibility read, restart, and
  forward-repair/restore behavior on the isolated stack.

### Outbox relay lifecycle

`PENDING -> IN_PROGRESS -> PUBLISHED` on success.
Transient publish/registry failures become `RETRYABLE` with bounded backoff and
lease recovery. Schema/invariant failures become `FAILED_PERMANENT`. Claiming is
atomic and expired leases are recoverable; a status row is never reset merely
because its state vocabulary differs from SQL.
Each claim carries worker, random token, and monotonically increasing fencing
version. Publish/retry/failure completion uses a conditional update over all
claim fields and `IN_PROGRESS`; an expired stale worker cannot mark a row after
reclaim. A publish-before-lease-loss may still redeliver, which is permitted by
the at-least-once contract and handled by Booking receipts.

### UI lifecycle

Server routes use stable skeleton loading and owned error/not-found boundaries.
Capture uses local pending state, preserves entered values on failure, announces
accepted/rejected outcomes, and refreshes the server-owned detail after success.
Degraded reads are labelled last-known; capture remains disabled until authority
and references can be confirmed.

## Resilience and Failure Isolation

| Failure | Behavior | Observable evidence |
|---|---|---|
| Duplicate `booking.confirmed` | Return existing journey disposition; no duplicate plan/outbox | intake idempotency and audit |
| Duplicate manual capture | HTTP 409 `DUPLICATE_MOVEMENT`; rejected-only commit | original movement, correlation, rejection/audit row |
| Illegal next code | HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT`; rejected-only commit | required next code, correlation, rejection/audit row |
| Identity denied | 403 for read/capture; serve no new domain data | denied UI and security audit |
| Identity unavailable | fail new read/capture closed with dependency-unavailable state; a browser may retain already-rendered content but cannot refresh or act | degraded/Retry UI and correlation |
| Reference Data unavailable after read authorization | serve persisted CMM read as reference-freshness `last-known`; disable capture | labelled data, dependency reason, Retry |
| Kafka unavailable | accepted local transaction remains pending/retryable in outbox | relay state/lag; UI publication pending |
| Schema incompatible | permanent publication failure; no false published state | failed-permanent row and audit/metric |
| Booking duplicate/stale | receipt disposition, latest projection unchanged | Booking receipt/audit |
| CMM app/backend unavailable | actionable retry; no entered-form loss where page state exists | error boundary/live region |

Retries apply only to transient infrastructure failures. Validation, denial,
duplicate, out-of-sequence, and schema incompatibility are not blindly retried.

## Security and Compliance Implications

- Identity remains the policy decision authority. Equipment Control receives
  read+capture; Customer Service receives read only.
- The CMM API authorizes every request independently of UI capability hints.
- Request actor query/body fallbacks are removed from authority; service
  identities are explicit and least privilege.
- Broker authorization limits CMM to produce status and Booking to consume it.
- Correlation and stable evidence are exposed to operators; secrets, raw tokens,
  and primary-screen raw event payloads are not.
- Rejection and authorization evidence records actor/source, action, target,
  reason, correlation, and time without mutating accepted business state.

There is no reusable authorization cache in W2-04. “Last-known” describes
CMM-owned business/reference freshness after a successful read authorization,
never a cached permission decision. CMM database unavailability fails the page;
Kafka/Booking delay labels publication/projection state but does not invalidate
an otherwise authorized CMM read or accepted capture.

## Scaling and Performance Characteristics

- The thin slice has one journey per booking/container; partitioning by
  booking+container serializes status ordering for that key.
- CMM and Booking application nodes remain stateless and horizontally scalable;
  database row/version controls and Kafka consumer groups coordinate work.
- List reads use indexed filters/pagination; timeline reads are bounded to one
  journey's two expected plus accepted/rejection evidence.
- No cache or CQRS service is added. Booking's existing latest projection is the
  only cross-context read model required.
- Healthy local propagation target is at most 30 seconds; relay lag and consumer
  disposition are the controlling indicators.

## Operational and Acceptance Lifecycle

PB-01 proves confirmation -> CMM DB -> GTOT -> status broker -> Booking DB/UI,
plus one out-of-sequence rejection. Later work adds remaining transitions and
full responsive/state evidence. Final live acceptance waits for W2-02 merge and
integration synchronization, reserves the single `linercore-wave-a` controller,
uses `scripts/wave-a-compose.mjs`, and runs `npm run demo:guard` before and after.
The historical W1 BLOCKED/waiver and later real PASS remain immutable separate
records; W2-04 evidence never relabels either.

## Requirement and Story Coverage

| Service interaction | Requirements | Stories |
|---|---|---|
| Booking -> CMM intake | FR-01, FR-02, FR-07 | US-01 |
| CMM capture/query/UI | FR-03 through FR-07, FR-12, FR-13 | US-02 through US-05, US-08 |
| CMM -> Booking status | FR-08 through FR-11 | US-06, US-07 |
| Serialized live topology | FR-14 and NFR-01 through NFR-10 | US-09 |
