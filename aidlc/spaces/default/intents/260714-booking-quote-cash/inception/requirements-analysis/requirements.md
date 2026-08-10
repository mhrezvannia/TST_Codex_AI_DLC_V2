# Requirements - W1-01 Booking Quote-to-Cash

## Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-W1-001 | The Booking app shall provide stable `/bookings`, `/bookings/new`, and `/bookings/{bookingId}` routes. The create flow shall accept one customer, one routing leg, one voyage, one equipment line with quantity one, one valid ISO 6346 `equipmentId`, and USD/FCL-dry defaults. | Must | `intent-statement.md`, `scope-document.md` |
| FR-W1-002 | Booking shall validate the customer, load/discharge UN/LOCODEs, voyage, and equipment type against the live Reference Data service and shall prevent pricing/confirmation while any reference is absent or inactive. | Must | `intent-statement.md`, W0-02 prerequisite |
| FR-W1-003 | Booking shall request a real quote from Charge with idempotent `POST /pricing-requests`, `application/vnd.api.v1+json`, correlation and idempotency headers. Charge shall return an itemized USD `pricing.result` resolved from an approved active agreement; Booking shall persist the complete snapshot and basis reference. | Must | bilateral pricing contract, `scope-document.md` |
| FR-W1-004 | On `NO_RATE`, timeout, 503, or circuit-open, Booking shall enter an explicit manual-pricing state, show an actionable reason, never persist partial/guessed charges, and prevent confirmation. Booking shall retry at most once on timeout/503 and never retry a 4xx response. | Must | bilateral pricing contract |
| FR-W1-005 | Booking shall confirm only a reference-valid booking with a successful immutable pricing snapshot. Confirmation shall atomically persist status/revision and one pending `booking.confirmed` outbox event. | Must | `intent-statement.md`, `architecture.md` |
| FR-W1-006 | The Booking relay shall publish the canonical enterprise `booking.confirmed` v1 record to topic `booking.confirmed`, keyed by `bookingId`, through the adopted shared messaging infrastructure and Schema Registry BACKWARD compatibility. | Must | booking-confirmed enterprise contract, `team-practices.md` |
| FR-W1-007 | CMM shall consume `booking.confirmed`, dedupe on envelope `id`, ignore duplicate/stale revisions, apply the highest `bookingRevision`, and transactionally create/update one journey representation for the one equipment assignment. | Must | booking-confirmed enterprise contract |
| FR-W1-008 | After the journey opens, CMM shall transactionally enqueue and publish a canonical `containermovement.status` v1 event to topic `containermovement.status`, keyed by `bookingRef + containerRef`, using the valid equipment ID and a contract-valid planned/validated equipment lifecycle state. | Must | movement-status enterprise contract, `scope-document.md` |
| FR-W1-009 | Booking shall consume `containermovement.status`, dedupe on envelope `id`, persist the status projection and idempotency marker in one transaction, tolerate late/out-of-order events, and retain correlation provenance. | Must | movement-status enterprise contract, `architecture.md` |
| FR-W1-010 | The Booking detail route shall render booking, routing, equipment, itemized quote/basis, confirmation state, and latest CMM journey/movement status. It shall expose loading, unavailable, manual-pricing, validation-error, pending-event, and success states without losing the stable route. | Must | `scope-document.md`, `business-overview.md` |
| FR-W1-011 | Normal Booking-to-CMM and CMM-to-Booking delivery shall be Kafka-only. Confirm/reconfirm and movement capture shall not synchronously call the other service; HTTP endpoints may remain only when explicitly documented as non-normal diagnostics/compatibility surfaces. | Must | affirmed Kafka-only practice, `architecture.md` |
| FR-W1-012 | Re-delivery and service restart shall not create duplicate journeys, duplicate Booking projections, duplicate pricing results, or duplicate logical outbox events. Persisted Booking and CMM state shall remain queryable after restart. | Must | Definition of Done, `team-practices.md` |
| FR-W1-013 | W1 shall update executable Avro, AsyncAPI, examples, message fixtures, service-local resources, producers, and consumers together to the enterprise appendix schemas; no flat legacy field shall remain on the W1 normal event path. | Must | requirements answer Q1, contract governance |
| FR-W1-014 | W1 shall add Booking frontend test/typecheck and Booking/CMM domain-purity checks to the blocking quality aggregator, then produce live evidence and green `aidlc-audit` and `erp-fidelity-audit` results before merge. | Must | `code-structure.md`, `team-practices.md` |

## Data & Standards Alignment

| Concept | Canonical name and standard | W1 rule |
|---|---|---|
| Booking identity | `bookingId`, carrier booking reference semantics | Stable across all hops; `bookingRevision` starts at 1 |
| Routing | `routing[]` with `legSequence`, `loadUnLocode`, `dischargeUnLocode`, `voyageId` | Exactly one leg in W1; UN/LOCODE and active voyage references |
| Equipment | `equipment[]` with `equipmentTypeCode`, `quantity`, `equipmentId` | ISO 6346/DCSA type code, quantity 1, valid ISO 6346 physical ID for live W1 |
| Event envelope | `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion` | Common enterprise header; `dataSchemaVersion = 1` |
| Movement identity | `bookingRef`, `containerRef`, optional `movementId` | Composite Kafka key `bookingRef + containerRef` |
| Movement vocabulary | `moveCode`, `eventClassifierCode`, `derivedStatus`, `emptyIndicatorCode`, `transshipment` | DCSA T&T v2.2 equipment event; classifier `PLN`, `EST`, or `ACT` |
| Movement time | `occurredDateTime`, `receivedDateTime` | ISO-8601 UTC; preserve occurred-versus-received distinction |
| Movement location | `location.unLocationCode`, optional `facilityCode`, `facilityTypeCode` | UN/LOCODE plus DCSA facility vocabulary when present |
| Money | Itemized charge amount + ISO 4217 `USD`, `pricingBasis`, `pricingRef` | No partial/guessed quote; agreement basis for the W1 happy path |

The authoritative W1 Avro artifacts shall be generated from the enterprise contract appendix shapes, replacing the current flat `contracts/avro/booking.confirmed.avsc` and `containermovement.status.avsc`. Field spelling and casing shall match those `.avsc` files exactly in domain mapping, producer records, consumer access, fixtures, and tests.

## Cross-Module Contracts

| Contract | Producer | Consumer | Style | Binding behavior |
|---|---|---|---|---|
| `pricing.request` / `pricing.result` | Booking / Charge | Charge / Booking | Synchronous HTTP | `POST /pricing-requests`, versioned media type, p99 <= 800 ms, idempotent, max one retry on timeout/503 |
| `booking.confirmed` | Booking | CMM | Kafka/Avro | Topic and type `booking.confirmed`; per-booking key/order; transactional outbox; CMM dedupe and revision upsert |
| `containermovement.status` | CMM | Booking | Kafka/Avro | Topic and type `containermovement.status`; composite key; append-only movement fact; Booking dedupe/projection |
| Reference validation | Booking | Reference Data | Synchronous HTTP | Live active-record validation by stable business code/ID; no copied reference attributes |

Contract ownership follows the backlog: Booking drives; Charge owns the pricing provider; CMM owns the consumers/status producer; `contracts/` changes require producer and consumer review. The current flat Avro files and `/api/pricing/quote` OpenAPI path are superseded for W1 by the answers in `requirements-analysis-questions.md`.

## Non-Functional Requirements

| ID | Requirement | Verification |
|---|---|---|
| NFR-W1-001 | After warm-up on the local Compose stack, valid agreement pricing shall meet p99 <= 800 ms. | Timed sample set with percentile evidence |
| NFR-W1-002 | From a successful confirm response, the returned CMM status shall be visible on Booking detail within p95 <= 5 s. | Browser/API timed end-to-end runs |
| NFR-W1-003 | Event delivery shall be at-least-once with exactly-once business effects through durable inbox/idempotency state. | Duplicate, stale revision, restart, and replay tests |
| NFR-W1-004 | Booking state plus outbox, CMM state plus outbox, and consumer state plus dedupe marker shall commit atomically at their respective boundaries. | Transaction rollback integration tests |
| NFR-W1-005 | Avro subjects shall use Schema Registry BACKWARD compatibility; additive optional fields require defaults and breaking changes require a new event major/type. | Compatibility checks against live Schema Registry |
| NFR-W1-006 | Correlation ID shall propagate through pricing, confirmation, both event hops, persistence, logs, and evidence. Events shall contain no customer PII beyond stable business references allowed by contract. | Trace/evidence correlation and payload inspection |
| NFR-W1-007 | Local-profile service identity may be used only in Compose/local. Any non-local profile shall fail closed without authenticated service identity; full JWT/RS256 remains W2-01. | Profile-guard tests |
| NFR-W1-008 | Booking UI routes and states shall meet WCAG 2.1 AA contrast, keyboard/focus behavior, responsive text/layout, and no-overlap checks at desktop/mobile widths. | Component tests plus browser screenshots/interactions |
| NFR-W1-009 | Changed W1 backend and frontend code shall meet at least 80 percent line coverage, while all repository quality, contract, audit, and live gates remain blocking. | Coverage reports and gate evidence |
| NFR-W1-010 | Metrics/evidence shall expose outbox publish lag, consumer lag, dedupe/redelivery count, pricing latency/fallback, and end-to-end status latency. | Runtime metrics or deterministic evidence extraction |

## Acceptance Criteria (live behavior)

| Requirement | Given / When / Then |
|---|---|
| FR-W1-001 | Given the running Booking app, when an agent creates the one-leg/one-equipment booking, then `/bookings/{bookingId}` loads and renders the persisted draft after refresh. |
| FR-W1-002 | Given an inactive or unknown customer/location/voyage/equipment code, when validation runs, then the UI identifies the invalid field and neither pricing nor confirmation proceeds; active seeded references pass. |
| FR-W1-003 | Given an approved matching agreement, when the agent prices the booking, then Charge receives one contract-valid request and Booking detail shows the persisted itemized USD quote and agreement `pricingRef`. |
| FR-W1-004 | Given no rate or a simulated Charge timeout/503, when pricing runs, then the booking enters manual pricing with no guessed amount and confirm remains unavailable. |
| FR-W1-005 | Given a validated and priced booking, when confirm succeeds, then the database contains the confirmed revision and exactly one corresponding pending/published outbox record; rollback leaves neither partial result. |
| FR-W1-006 | Given the real broker and Schema Registry, when the relay publishes, then a schema-valid canonical record appears on `booking.confirmed` with exact enterprise fields and the booking key. |
| FR-W1-007 | Given that event, when CMM consumes it twice and later receives a stale revision, then one journey remains and only the highest revision is applied. |
| FR-W1-008 | Given the opened journey and valid equipment ID, when CMM emits its initial contract-valid lifecycle status, then one schema-valid record appears on `containermovement.status` with the composite key. |
| FR-W1-009 | Given duplicate and out-of-order status delivery, when Booking consumes it, then one idempotent projection is committed and the latest valid business state is retained. |
| FR-W1-010 | Given the round trip, when the agent opens/refreshes Booking detail, then route, equipment, quote, confirmed state, and CMM status render within the latency target; unavailable/pending errors remain explicit. |
| FR-W1-011 | Given normal confirm and movement flows, when network traffic and logs are inspected, then no Booking-to-CMM or CMM-to-Booking synchronous delivery call occurs. |
| FR-W1-012 | Given a completed round trip, when Booking/CMM restart and Kafka replays the same events, then persisted state remains queryable and no duplicate logical records are created. |
| FR-W1-013 | Given contract validation, when catalog/provider/schema checks run, then Avro, AsyncAPI, examples, fixtures, service resources, and serde tests agree on exact canonical names. |
| FR-W1-014 | Given the final W1 branch, when all quality commands and live detectors run, then Maven, frontend, contracts, readiness, `aidlc-audit`, and `erp-fidelity-audit` are green with evidence paths under `artifacts/`. |

## Assumptions & Constraints

- W0-01 shared eventing and W0-02 seeded reference data are adopted, not reimplemented.
- The live happy path has an approved agreement, one voyage, one routing leg, one dry equipment line, quantity one, valid ISO 6346 equipment ID, and USD.
- PostgreSQL uses a non-default host port, 55432 unless explicitly overridden; container-internal PostgreSQL remains 5432.
- Kafka and Schema Registry are mandatory for acceptance; local-noop messaging cannot satisfy the exit gate.
- W1 Construction Bolts base/target `integ/main-reconciled`; contract files are a dual-review shared kernel.
- Booking UI inherits W2-02 visual language only. W2-01 app shell/full auth remains deferred.
- Database changes must preserve existing W0/W1 data and have ordered, repeatable migration evidence; destructive reset is not an acceptance strategy.

## Out of Scope

- Multi-leg/transshipment booking entry, rolls, splits, cancellations, and general amendment/reconfirmation UX.
- D&D pricing/invoice behavior, tariff/surcharge depth, reefer/DG parameters, capacity allocation, and container assignment workflows beyond the one W1 fixture field.
- Global application shell, end-user login/session propagation, full service JWT rollout, and global design-system migration.
- Customer-facing DCSA Track & Trace API and operational terminal/EDI movement ingestion.
- Cloud/staging/production provisioning and observability platform expansion beyond W1 evidence hooks.

## Open Questions

1. Any requirement blocked on a deferred enterprise decision?
   - A. None - all W1 inputs are now available (recommended)
   - B. Yes - list the blocking decision and owner
   - X. Other
   - `[Answer]:` A - None; the five Requirements Analysis decisions close the W1 contract and runtime ambiguities.

## Upstream Trace

This artifact derives from `intent-statement.md`, `scope-document.md`, `business-overview.md`, `architecture.md`, `code-structure.md`, and `team-practices.md`. Detailed answers are recorded in `requirements-analysis-questions.md`.

## Review

Verdict: READY

- Q1 is carried through in FR-W1-006, FR-W1-008, FR-W1-013, Data & Standards Alignment, and Cross-Module Contracts; the flat Avro path is explicitly superseded.
- Q2 is carried through in FR-W1-003 and Cross-Module Contracts with `POST /pricing-requests`, versioned media type, idempotency, retry, and p99 behavior.
- Q3 is carried through in FR-W1-001, FR-W1-008, Data & Standards Alignment, and Assumptions & Constraints with one valid ISO 6346 equipment ID in the live W1 path.
- Q4 is carried through in NFR-W1-001, NFR-W1-002, and live acceptance criteria with blocking pricing p99 and confirm-to-visible-status p95 thresholds.
- Q5 is carried through in NFR-W1-007 and Out of Scope: local-profile service identity is bounded to Compose/local, non-local fails closed, and full JWT/RS256 remains deferred.
