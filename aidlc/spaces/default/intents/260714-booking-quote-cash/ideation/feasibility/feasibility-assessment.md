# Feasibility Assessment - W1-01 Booking Quote-to-Cash

## Inputs And Decision

This assessment uses the upstream `ideation/intent-capture/intent-statement.md`, `ideation/market-research/competitive-analysis.md`, `ideation/market-research/market-trends.md`, and `ideation/market-research/build-vs-buy.md` together with current source and W0 live evidence.

**Decision: feasible with controlled high-risk migrations.** The codebase has the required service boundaries, PostgreSQL repositories, live synchronous Charge client, transactional outboxes, W0 Kafka/Schema Registry publishers, scheduled relays, and Compose topology. W1 must add missing consumer behavior and replace flat domain/wire/UI shapes without preserving a dual-delivery architecture.

There is no identified technical blocker that requires changing the intent. Feasibility depends on sequencing the contract and data migrations before removing HTTP callbacks, preserving existing records, and proving the full return loop on the canonical Compose stack.

## Existing Enablers

| Enabler | Current evidence | Feasibility contribution |
|---|---|---|
| Service ownership boundaries | Separate Booking, Charge, CMM, Reference Data services and databases | Supports contract-first changes without cross-database coupling |
| Booking state machine | Domain lifecycle and tested create, validate, price, confirm behavior | Existing business flow can be evolved rather than rewritten |
| Atomic confirmation | `BookingApplicationService.confirm` is `@Transactional` and writes state plus outbox | Removes the earlier state/outbox dual-write defect |
| Shared eventing | W0 real publishers, Schema Registry adapters, scheduled relays, no-op guards, and live evidence | Producer-side infrastructure is available and must be reused |
| CMM idempotency | Booking revision and event-id handling already exist in application logic | Provides a base for real Kafka consumption |
| Booking status projection logic | Existing duplicate and stale-sequence handling | Provides a base for the CMM-to-Booking consumer |
| Reference completeness | W0-02 canonical vessel/voyage, equipment type, and charge code records | Removes the known reference-data precursor |
| Compose topology | PostgreSQL, Kafka, Schema Registry, all services; host Postgres defaults to `55432` | Provides the required exit environment without conflicting with host port 5432 |

## Current Gaps

| Gap | Evidence | Required W1 response |
|---|---|---|
| Flat Booking aggregate | `Booking` stores origin, destination, one equipment string, revision, and attribute bag | Introduce typed routing and equipment lines plus canonical booking identity concepts |
| Flat persistence index columns and JSON snapshot | `booking-schema.sql` and `JdbcBookingRepository` index flat origin/destination-era state | Add an explicit compatible migration and snapshot deserialization strategy |
| Contract-inaccurate `booking.confirmed` schema | Current `.avsc` carries `originLocationId`, `destinationLocationId`, and `equipmentTypeId` | Replace with exact authoritative routing/equipment fields and update every mapper/serde/consumer test |
| Contract-inaccurate movement schema | Current `.avsc` carries `containerId`, `movementStatus`, and sequence fields rather than the frozen status contract | Align schema and mappings to the authoritative contract while preserving dedupe and ordering metadata in the envelope/consumer model |
| Synchronous Booking-to-CMM delivery | Booking controller calls `HttpContainerMovementClient` after confirmation | Add Kafka consumer proof, then remove HTTP delivery from confirm/reconfirm request paths |
| Synchronous CMM-to-Booking delivery | CMM controller calls `HttpBookingMovementStatusClient` after journey/movement mutations | Add real status consumer in Booking, then remove callback delivery from live paths |
| No Kafka consumers | No `@KafkaListener`, consumer factory, or equivalent adapter exists in service source | Add consumer-side shared/adopted messaging configuration, serde, error handling, and idempotent application invocation |
| Non-transactional status consume | Booking saves projection and idempotency separately without `@Transactional` | Make status projection plus dedupe record atomic |
| Incomplete Booking frontend tree | `BookingWorkbench.tsx` imports missing `lib/bookings`; package test references missing `page.test.tsx`; no detail route exists | Restore/build the BFF data layer, list route, detail route, tests, and explicit UI states |

## Technical Viability

### Domain and persistence

Viable. The Booking record is immutable and serialized as a JSON snapshot, which makes adding typed nested structures straightforward at the Java model level. Migration risk is concentrated in deserializing existing snapshots and maintaining query/index columns. The implementation should either provide a legacy snapshot reader/upcaster or a deterministic SQL/application migration before the new record becomes mandatory. Dropping data is not permitted.

### Synchronous pricing

Viable. The live Charge call already exists and W0 proof exercised create, validate, price, and confirm. W1 must update the pricing request mapping to the new routing/equipment/commodity concepts without changing the frozen bilateral timeout, retry, idempotency, and error behavior.

### Asynchronous confirmation and status return

Viable with high implementation risk. Producer-side relays are proven. Consumer-side adapters, offset/error behavior, schema decoding, and consumer lifecycle are absent. The application services already expose most consumer business logic, so the missing work is bounded: deserialize and validate, invoke an atomic application method, commit before acknowledging, and handle retry/dead-letter behavior consistently.

The cutover order is mandatory:

1. Contract-exact schemas and serde tests.
2. CMM `booking.confirmed` consumer with idempotent journey proof.
3. Booking `containermovement.status` consumer with atomic projection proof.
4. Compose integration proof for both directions.
5. Remove both synchronous event-delivery calls and their live configuration.
6. Redelivery and restart proof.

### Frontend

Viable but larger than a component edit. The branch has one workbench component but lacks its imported data module, page entry, API routes, detail route, and referenced test file. W1 should build a coherent Booking app surface using the existing `@erp/ui` primitives available on the integration base, while keeping global shell/auth and full design-system work out of scope.

## AWS And Runtime Perspective

W1's authoritative environment is local Compose. No AWS account, region, service quota, production availability target, or approved cloud topology is supplied, so an AWS deployment claim would be fabricated. The architecture remains cloud-portable because services are stateless outside service-owned PostgreSQL databases and Kafka, configuration is externalized, and the shared relay uses work claiming.

Later production design must address managed PostgreSQL/Kafka choices, multi-AZ topology, IAM/secret management, encryption, backup/restore, observability, cost, and environment parity. Those decisions are not release blockers for this local vertical intent unless the Operation stages establish them from approved requirements.

## Compliance And Data Perspective

No payment-card or health data is in W1 scope, so PCI-DSS and HIPAA are not triggered by the described flow. Booking data is internal/confidential operational data and may indirectly reference a customer. Events must remain minimized: stable references and shipment context only, no customer attributes or unnecessary personal data.

Required controls for W1 are authenticated/authorized service actions, topic produce/consume restrictions in deployed environments, transport encryption expectations, least privilege, correlation and audit trails, controlled logs, and a configurable retention policy. Geography and data-residency obligations are not yet specified; they remain a program-level compliance dependency before production deployment, not a reason to weaken local evidence.

## Reliability And Performance

- Confirmation must succeed independently of CMM availability once Booking state and outbox commit.
- At-least-once delivery requires envelope-id dedupe and booking-revision/staleness handling.
- Consumer acknowledgement must follow successful local transaction commit.
- The frozen pricing seam retains its p99/timeout/retry behavior; W1 does not invent an unsupported booking-volume target.
- Live proof must include service restart and redelivery, not only first delivery.
- Outbox permanent failures must be zero for the designated proof records.

## Delivery Estimate And Sequencing

The intent remains appropriately sized as approximately six vertical units. The highest-risk consumer and schema work should land in the walking skeleton, not at the end. UI detail work should evolve with the domain/API rather than wait for a final frontend-only unit.

No calendar estimate is asserted because team capacity is not provided. Quality gates, live Compose proof, and both audits are fixed exit conditions rather than schedule variables.

## Go / No-Go Conditions

**Go** when design preserves the closed W0 infrastructure, frozen contracts, service ownership, compatible data migration, and Kafka-only event delivery.

**Stop and escalate** if any of these occurs:

- a required contract change lacks producer and consumer approval;
- existing Booking records cannot be migrated or upcast deterministically;
- consumer processing cannot atomically combine projection/dedupe state before acknowledgement;
- Compose cannot run the real broker/Schema Registry/service path;
- a proposal requires shared database access or indefinite dual event delivery.

Subject to those controls, W1-01 is feasible and should proceed.
