# Architecture Decisions - W1-01 Booking Quote-to-Cash

## Decision Index

| ADR | Decision | Status | Reversibility |
|---|---|---|---|
| ADR-001 | Kafka choreography with transactional application consumers | Proposed, user-confirmed | Medium |
| ADR-002 | Atomic enterprise event-contract cutover | Proposed, user-confirmed | Low after external adoption |
| ADR-003 | Service-owned consumed-event receipts and Booking status projection | Proposed, user-confirmed | Medium |
| ADR-004 | Charge-owned idempotent pricing API | Proposed, user-confirmed | Medium |
| ADR-005 | Booking-local Next.js BFF and UI | Proposed, user-confirmed | High |

## ADR-001 - Kafka Choreography with Transactional Consumers

### Context

The baseline in `architecture.md` publishes outbox events but still calls Booking↔CMM synchronously and has no Kafka consumers. `requirements.md` requires Kafka-only normal delivery, at-least-once dedupe, no partial state, and p95 five-second returned status. The shared publisher/relay foundation already exists.

### Decision

Remove normal-path synchronous handoffs. Add thin service-local Spring Kafka listeners that map canonical `GenericRecord` values and call one `@Transactional` application-service method. CMM commits receipt, journey/revision, and resulting status outbox together; Booking commits receipt and status projection together. Existing service publishers continue to use `KafkaGenericRecordPublisher`, `ConfluentSchemaRegistrar`, `ScheduledOutboxRelay`, and `NoopMessagingGuard`.

Consumers attempt initial delivery plus retries at 250ms and 1s, then publish permanent/exhausted records to a consuming-service-owned seven-day DLT. Contract/deserialization errors go directly to DLT. Replay preserves envelope ID. Booking confirmation is serialized at the database row, carries `Idempotency-Key` through BFF/controller/application, uses a stable RFC 4122 UUIDv5 envelope ID derived from booking/revision, and enforces unique `(event_type, booking_id, revision)` outbox identity.

### Consequences

- Positive: state and dedupe are atomic; services are temporally decoupled; restarts/redelivery are safe; existing shared infrastructure is adopted.
- Negative: user-visible CMM status is eventually consistent; consumer retry/DLT behavior and lag observability become mandatory.
- Neutral: Booking confirmation can succeed while CMM is unavailable, so UI must show pending rather than failure.

### Alternatives Rejected

- Keep HTTP behind automatic Kafka fallback: rejected because it creates two normal delivery paths, duplicate side effects, and violates FR-W1-011.
- Add a generic inbox plus scheduled business worker: rejected for W1 because it adds a second queue/scheduler and latency while the local transaction already provides durable dedupe.
- Let listeners write repositories directly: rejected because it bypasses application authorization/audit/domain boundaries.

### Security and Compliance

Listeners validate source/type/schema. Payloads carry identifiers, not party attributes. Local bypass identity remains profile-scoped and fails closed elsewhere. W1 has an explicit local-only waiver for broker TLS/SASL/service ACLs; those controls are not claimed by the W1 exit gate.

### Reversibility

Medium. Listener adapters can later be replaced by a shared consumer framework without changing application ports; reintroducing synchronous behavior is intentionally unsupported.

## ADR-002 - Atomic Enterprise Event Contract Cutover

### Context

Current executable `.avsc` files are flat and contradict the enterprise appendices. FR-W1-013 requires exact enterprise field names across root Avro, AsyncAPI, examples, fixtures, service resources, producers, and consumers. A mixed event family would make broker evidence ambiguous.

### Decision

Replace both W1 event families atomically with one registered Avro record per event containing the exact common envelope (`id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`) and nested appendix `data`. Update every executable representation and adapter in the same Bolt. Reject legacy flat records on W1 consumers.

`artifacts/w0-01-live/schema-subjects.json` proves the flat, unreleased candidate subjects were registered in the disposable local registry. W1 exports their old schemas/fingerprints, proves no released/external consumer, permanently retires only those two local subjects, registers canonical enterprise schemas as version 1, and immediately enforces BACKWARD for subsequent evolution. Producer startup is blocked until a canonical fingerprint/version-1 preflight passes. A non-local registry containing the flat fingerprint is not reset; deployment stops and requires a new major event type/subject decision.

### Consequences

- Positive: one authoritative runtime contract; exact serde/provider-consumer/live evidence; no translation drift.
- Negative: all current W1 producers/consumers must deploy together; existing flat test fixtures are intentionally broken and replaced; the one-time subject baseline exception is valid only for the unreleased local registry.
- Neutral: this is a coordinated monorepo cutover, not a rolling multi-organization migration.

### Alternatives Rejected

- Dual publish/read: rejected because no external legacy consumer is identified and two paths double the test/idempotency surface.
- Translate only at HTTP/UI: rejected because the real broker record would still violate the contract and audit gate.
- Keep payload-only Avro plus an out-of-band header: rejected because the contract requires one registered embedded record.
- Register the incompatible shape under the existing subject history: rejected because BACKWARD compatibility must reject it.

### Security and Compliance

The canonical envelope improves provenance and correlation. Contract tests assert that no customer attributes/PII are introduced. Canonical version/fingerprint evidence and BACKWARD configuration are blocking; service-specific broker authorization is covered by the W1 local-only waiver.

### Reversibility

Low after another consumer adopts v1. Before merge it is a normal code rollback; afterward breaking changes require a new event type/version.

## ADR-003 - Service-Owned Receipts and Booking Projection

### Context

Existing idempotency stores are command-key oriented; requirements explicitly dedupe on envelope `id`. Existing Booking movement state is embedded in a generic attributes map, which is insufficient for exact canonical fields, ordering, and UI status provenance.

### Decision

Add a consumed-event receipt table/repository in Booking and CMM, keyed by envelope ID. Receipt uses `INSERT ... ON CONFLICT DO NOTHING` inside the business transaction. Keep CMM highest booking revision with its journey. Add a Booking-owned `booking_movement_status` projection keyed by `(bookingRef, containerRef)` with canonical movement fields and event ordering metadata. One guarded SQL upsert compares `(occurredDateTime, classifierRank, receivedDateTime, eventId)`, where `PLN=1`, `EST=2`, `ACT=3`; classifier rank breaks equal occurred times only. The Booking detail API joins its own projection; neither UI nor Booking queries CMM at read time.

### Consequences

- Positive: exact dedupe semantics, deterministic stale handling, stable Booking detail when CMM is unavailable, clear data ownership.
- Negative: projection storage duplicates a subset of CMM facts; schema/additive migrations and cleanup policy are required.
- Neutral: at-least-once event history remains in Kafka while Booking stores only receipts and the latest query projection.

### Alternatives Rejected

- Reuse `booking_idempotency`/`container_movement_idempotency` unchanged: rejected because producer keys and envelope IDs have different semantics and retention.
- Query CMM synchronously from detail: rejected because it recreates runtime coupling and weakens the stable route.
- Introduce a new cross-service read application: rejected as unjustified W1 scope and operational overhead.

### Security and Compliance

Projection rows contain booking/equipment/reference codes and correlation provenance only. APIs apply Booking authorization; raw event payloads and offsets stay outside primary UI.

### Reversibility

Medium. A later dedicated read model can consume the same event without changing producer contracts; Booking projection tables can then be retired with a data migration.

## ADR-004 - Charge-Owned Idempotent Pricing API

### Context

Charge already implements active-agreement pricing, while Booking currently calls active lookup and reconstructs pricing locally. The bilateral contract fixes `POST /pricing-requests`, v1 media type, itemized response, idempotency, error semantics, and an 800ms local p99 gate.

### Decision

Expose Charge's existing pricing engine through an idempotent pricing application method and dedicated `PricingApiController`. `contracts/openapi/pricing.v1.yaml`, `contracts/pact/booking-charge-pricing-fixtures.json`, and the contract catalog are the executable shape/interaction sources. Agreement resolves first and a tariff port second; W1's no-tariff adapter returns none until W2-03 while the contract supports `AGREEMENT|TARIFF`.

Persist a durable atomic `IN_PROGRESS -> COMPLETED|MANUAL` request state keyed by `bookingId:amendmentSeq`, with unique idempotency key, unique booking/version, request hash, owner token, and ten-second lease. A short `REQUIRES_NEW` claim commits before calculation; a second `REQUIRES_NEW` fenced CAS completes. One contender may CAS-take an expired lease; stale-owner completion is rejected. Same terminal key/hash replays; live in-progress returns 409 `PRICING_IN_PROGRESS`; hash/version collision returns 409 `IDEMPOTENCY_CONFLICT`. Refactor Booking's client to the exact DTO contract, a two-second timeout, one retry only for timeout/503 with the same key, and a per-endpoint circuit breaker that opens after five failed operations and half-opens after 30 seconds. Open/terminal failure maps to manual/blocked state without partial charges.

### Consequences

- Positive: pricing ownership is correct; Booking cannot drift from Charge calculation; retries are deterministic; provider/consumer tests have a real seam.
- Negative: confirmation depends on synchronous Charge availability within the pricing step; API DTO/domain mappings expand.
- Neutral: Booking stores a snapshot for audit and confirmation but does not own rates or recomputation.

### Alternatives Rejected

- Keep Booking-local calculation: rejected because it duplicates rate logic and violates the bilateral contract.
- Share the Charge engine as a linked library: rejected because it couples deployment/data access and bypasses the service boundary.
- Make pricing asynchronous: rejected because W1 requires an immediate actionable quote before confirmation and the approved contract is HTTP.

### Security and Compliance

The adapter propagates correlation and service identity. Charge authorizes the `pricing:invoke` action and returns reference IDs and monetary lines, not agreement internals. Non-local identity absence fails startup. The OpenAPI defines all request/response fields, headers, 400/404/409/422/503 errors, charge lines, and D&D rule entries.

### Reversibility

Medium. The port isolates Booking from HTTP implementation, but changing the published pricing contract requires bilateral versioning.

## ADR-005 - Booking-Local Next.js BFF and UI

### Context

`component-inventory.md` finds `apps/booking` incomplete and non-routable. Refined Mockups require stable list/create/detail routes, live comboboxes, one valid action, bounded polling, WCAG 2.1 AA, and W2-02 visual primitives while excluding W2-01's global shell.

### Decision

Complete `apps/booking` as a Next.js App Router app. Use server-only BFF route handlers and a typed Booking client for backend URL, local identity, correlation, and error normalization. Browser components call only local `/api/bookings/**` routes and reuse `@erp/ui`. Detail polling reads Booking's projection every second while visible/focused for a cumulative 30 seconds.

### Consequences

- Positive: backend topology/identity stays server-side; routes match approved UX; future W2-01 shell can wrap without route changes.
- Negative: BFF mappings require tests and add one network hop; the existing single workbench is replaced rather than incrementally styled.
- Neutral: CMM has no W1 user-facing app because its only W1 value is observed through Booking detail and database/event proof.

### Alternatives Rejected

- Direct browser calls to all services: rejected due CORS, credential exposure, coupling, and incoherent error handling.
- New combined Booking/CMM frontend: rejected as outside intent ownership and W2 scope.
- Keep a single demo workbench with fallback data: rejected because stable routes, live references, and real-state evidence are mandatory.

### Security and Compliance

BFF service configuration is server-only; local identity is profile-guarded; no demo actor is accepted outside local. Keyboard, contrast, announcements, focus, and responsive no-overlap checks are blocking.

### Reversibility

High. The route and component boundaries can move under the future global shell without changing backend contracts.

## Cross-Decision Tradeoff

The design chooses a small amount of local persistence and BFF mapping to eliminate runtime cross-service reads and duplicate business ownership. This is the lowest-complexity architecture that satisfies the synchronous pricing need and the asynchronous Booking-CMM round trip in `stories.md` while preserving the existing service/module topology in `team-practices.md`.

## Migration and Measurement Decision

Booking, CMM, and Charge adopt Flyway V1 current baselines plus additive V2 W1 migrations. Existing databases baseline at V1; fresh databases execute both. Upgrade evidence includes pre-migration data snapshot, Flyway checksums/history, backfill assertions, two restarts, and restore/forward-repair proof. PostgreSQL reset is not permitted.

Performance gates use fixed nearest-rank methods: pricing has 100 warm-up plus 1,000 measured requests at concurrency 10; confirm-to-visible status has 10 warm-up plus 100 measured journeys at concurrency 5. Every failed sample fails the gate and remains in raw evidence under `artifacts/w1-01-live/`.

## Upstream Trace

These ADRs resolve decisions required by `requirements.md` and `stories.md`, correct the gaps in `architecture.md` and `component-inventory.md`, and remain within `team-practices.md`. User selections are recorded in `application-design-questions.md`.

## Approved Governance Records

### EXCEPTION-W1-01-001 - Unreleased Local Schema Rebaseline

| Field | Record |
|---|---|
| Status | Approved 2026-07-15 by intent owner through the audited AI-DLC Q7 decision |
| Scope | Only `booking.confirmed-value` and `containermovement.status-value` in the disposable local W1 Compose Schema Registry |
| Rationale | W0 registered flat candidate schemas before the authoritative enterprise v1 contract; exact final type/subject names must be retained |
| Preconditions | Export old schema/version/fingerprint evidence; prove local environment and no released/external consumer; stop all W1 producers |
| Existing evidence | `artifacts/w0-01-live/booking-events.jsonl:186` is a flat decoded record; `artifacts/w0-01-live/schema-subjects.json` names both subjects; W1 CodeKB `architecture.md` records both consumers missing. Pre-cutover flat file SHA-256 values are Booking `FFD2051628251DC35A6E9D99396889CEBDF17FDB7AB661C9DA80D1E193AF1586` and CMM `89B7C3DC1217F82CF2DB7F2015DE751906B5785A58536275B50EE293E6DBA837` |
| Procedure | Permanently retire only the two subjects, register canonical enterprise records as version 1, set BACKWARD, verify canonical fingerprints before producer startup |
| Guardrail | Any non-local or released legacy subject blocks deployment and requires a new major event decision; no reset is allowed |
| Expiry | Automatically expires when W1-01 merges; cannot be reused by another intent/environment |
| Evidence owner | W1 release reviewer under `artifacts/w1-01-live/schema-registry/` |

### WAIVER-W1-01-001 - Local Compose Broker Transport Security

| Field | Record |
|---|---|
| Status | Approved 2026-07-15 by intent owner through the audited AI-DLC Q8 decision |
| Standard deviated | Mandated Kafka TLS, SASL/authenticated service identity, and service-specific topic ACLs |
| Scope | Single-broker local Docker Compose W1 proof only; never staging/production/non-local |
| Risk | A process with local network access could impersonate a producer/consumer or inspect traffic |
| Mitigations | Isolated Compose network; source/type/schema validation; local-profile identity guard; non-local fail-closed tests; noop rejection; no party attributes in events; ephemeral proof data |
| Approver | W1 intent owner; decision and exact option stored in the active intent audit |
| Review owner | Platform security owner at W2-01/platform broker-security entry |
| Expiry | 2026-10-15 or secured broker identity delivery, whichever is earlier; auto-block after expiry |
| Conformance reference | W1 local only; broker authorization/TLS is not claimed by W1 evidence |

## Review

Verdict: NOT-READY

### Blocking Findings

1. **The event cutover cannot satisfy its own Schema Registry rule.** ADR-002 replaces the existing flat schemas in-place under the existing `booking.confirmed-value` and `containermovement.status-value` subjects while requiring BACKWARD compatibility. Removing the flat required fields and adding the envelope plus required `data` records is a breaking change that a registry with either current schema registered must reject. Before Construction, prove those subjects have no registered legacy version or define a versioned type/subject migration consistent with the enterprise rule that breaking changes do not edit v1 in place.
2. **The pricing API is not frozen as an executable enterprise contract.** C01 omits the provider OpenAPI and HTTP Pact artifacts, while the method design lists only top-level names and leaves `dates`, `quantities`, charge-line requirements, D&D rule entries, standard errors, headers, and response constraints unspecified. It also describes active-agreement-only resolution although the bilateral contract requires `AGREEMENT | TARIFF` and permits `NO_RATE` only when neither resolves. Name the authoritative checked-in OpenAPI/Pact files and define provider/consumer behavior for every required schema and status before calling the seam exact.
3. **Pricing idempotency is race-prone and omits binding contract behavior.** `findByIdempotencyKey` followed by `save` does not reserve a key atomically, define an in-progress replay response, or prevent duplicate pricing/manual-case side effects under concurrent requests. The design also omits the required key composition (`bookingId + amendmentSeq`), at-most-one in-flight request per booking version, 2-second consumer timeout, and 5-failure/30-second circuit-breaker behavior. Specify an atomic claim/result state machine and the exact client policy.
4. **Confirmation does not prevent duplicate logical events.** `confirm` has no command idempotency key or concurrency precondition, and an outbox event-ID primary key does not stop two concurrent confirmations from generating different IDs for the same booking revision. Add an optimistic/pessimistic booking transition guard or a unique logical outbox constraint such as booking, revision, and event type, with deterministic replay behavior, to satisfy FR-W1-012.
5. **Consumer ordering and poison-message behavior are not implementable deterministically.** `recordIfAbsent` and `upsertIfNewer` do not state the required atomic SQL/conflict semantics, the classifier rank in the ordering tuple is undefined, and bounded retry/DLT handling has no attempts, backoff, topic, retention, ownership, or replay rule. Define these so concurrent duplicates, late PLN/EST/ACT facts, constraint conflicts, and permanent contract errors cannot regress state or block a partition indefinitely.
6. **Security acceptance is contradictory.** ADR-002 calls producer/consumer authorization blocking evidence, ADR-001 applies broker ACLs only when configured, and `services.md` defers broker authentication, ACLs, and TLS. State whether W1 Compose must enforce and test service-specific broker identities; otherwise record the approved local-only deviation/waiver and remove the incompatible blocking claim.

### Non-Blocking Risks

1. Bare references such as `architecture.md`, `component-inventory.md`, and `team-practices.md` resolve to multiple intent/CodeKB copies; pin the W1-01 paths to prevent later review against stale upstream artifacts.
2. The dependency matrix gives CMM an HTTP Reference Data dependency that no component, method, or runtime step uses, and the build diagram omits the Charge data-access-to-application-port edge.
3. Mutable startup SQL is retained despite the requirement for ordered, repeatable, data-preserving changes; construction needs explicit backfill/upgrade and rollback evidence for existing booking snapshots.
4. The p99/p95 gates lack sample size, load/concurrency, warm-up, and percentile calculation rules, so independent runs may produce incomparable evidence.

## Review - Iteration 2

Verdict: NOT-READY

| # | Prior blocker | Closure | Verification |
|---|---|---|---|
| 1 | Avro cutover versus BACKWARD history | PARTIAL | A disposable-local rebaseline procedure is now defined, but `artifacts/w0-01-live/schema-subjects.json` contains only subject names: it proves neither registered versions/fingerprints nor absence of released consumers. No approved exception/waiver artifact is identified. The claimed safe v1 reset is therefore not yet substantiated. |
| 2 | Executable pricing contract absent/inexact | OPEN | `contracts/openapi/pricing.v1.yaml` does not exist. The existing pricing Pact still calls `/api/pricing/quote`, and the catalog still points to `contracts/openapi/charge-agreements.yaml`; `dates` and `quantities` remain described only as "typed" rather than field-defined. Exact provider/consumer alignment cannot be reviewed until these sources agree. |
| 3 | Pricing idempotency/concurrency | PARTIAL | Unique claim/result states and client timeout/retry/breaker rules are specified. The transaction model is not: one outer `@Transactional requestPricing` keeps `IN_PROGRESS` invisible until completion, while a separately committed claim can be observed but can remain orphaned after a crash. Define transaction propagation, owner fencing, expiry/reclaim, and completion CAS behavior. |
| 4 | Duplicate logical confirmation events | PARTIAL | Row locking, command receipt, deterministic identity, and the logical outbox uniqueness constraint close the database race. The implementation-contract signature for `BookingApiController.confirm` still has no `Idempotency-Key` input, and the proposed `booking-confirmed:<bookingId>:r<revision>` envelope ID is not the enterprise ULID/UUID form. Carry the key through BFF/controller/application boundaries and use a contract-valid stable ID. |
| 5 | Consumer ordering and poison handling | CLOSED | Receipt insert and projection update are atomic SQL operations; classifier ordering is fixed; retry count/backoff, DLT names/retention/ownership, and replay identity are defined consistently across methods, services, dependencies, and ADRs. |
| 6 | Security acceptance contradiction | PARTIAL | The exit-gate contradiction is removed and the local control set is coherent, but the asserted broker-security waiver has no ID, approver, scope artifact, or expiry. Enterprise waiver governance requires that record before the deferred mandated controls can be treated as accepted. |

The prior cross-reference, dependency-edge, migration, and performance-measurement risks are closed by the Source Register, CMM Reference Data responsibility and Charge adapter edge, Flyway V1/V2 evidence plan, and fixed sample/percentile protocol.

### Remaining Risks

1. Manual pricing ownership is split: Charge owns `ManualPricingCaseRepository`, while Booking must create the manual queue/state when Charge is unreachable or the circuit is open. Define the authoritative manual work item and correlation between the two records.
2. The no-op `TariffPricingPort` preserves the API enum but does not implement tariff fallback until W2-03; W1 Pact/provider evidence must avoid claiming that the `TARIFF` behavior is operational.
3. DLT capacity, alert thresholds, and replay authorization remain for NFR/operations design; the specified seven-day retention alone does not prevent silent accumulation.

## Review - Recovery Final

Verdict: READY

This is an inline recovery review selected by the user after the two configured independent iterations were exhausted. It is not an independent verdict; both earlier `NOT-READY` reviews remain above as the audit trail.

| # | Blocking area | Final closure evidence |
|---|---|---|
| 1 | Schema history | Approved `EXCEPTION-W1-01-001` now records scope, existing W0 flat evidence/fingerprints, canonical-v1 procedure, non-local prohibition, owner, evidence path, and merge expiry |
| 2 | Executable pricing contract | `contracts/openapi/pricing.v1.yaml`, pricing Pact, response example, and catalog now agree on `/pricing-requests`, v1 media type, headers, typed dates/quantities, charges, D&D rule entries, and error statuses; YAML/JSON parse checks pass |
| 3 | Pricing race/crash safety | Short committed `REQUIRES_NEW` claim/completion transactions, ten-second lease, owner fencing, expired-lease CAS takeover, unique booking/version, and deterministic replay/conflict behavior are specified |
| 4 | Confirmation duplicates | `Idempotency-Key` crosses BFF/controller/application, booking row locking serializes transition, UUIDv5 provides a contract-valid stable envelope ID, and logical outbox uniqueness protects booking/revision/event type |
| 5 | Consumer ordering/poison records | Atomic receipt/upsert, fixed classifier rank, bounded retries, named DLTs, retention/capacity/alerts, replay authorization, and preserved event identity are specified |
| 6 | Security governance | Approved `WAIVER-W1-01-001` identifies the mandated controls, local-only scope, risk, mitigations, approver evidence, review owner, expiry, and claims boundary |

The first-review non-blocking issues are also closed: W1 paths are pinned, CMM Reference Data and Charge data-access dependencies are explicit, Flyway baseline/V2 upgrade evidence is fixed, and percentile runs are reproducible. Manual work ownership is split explicitly, tariff operation is not claimed in W1, and DLT alert/replay controls are defined.

Implementation caveats are assigned to Construction rather than hidden: root contract/provider validators still encode the old Shared Platform scope and pricing path, so the contract unit must update their expectations before claiming a green quality gate. No design contradiction remains for Units Generation.
