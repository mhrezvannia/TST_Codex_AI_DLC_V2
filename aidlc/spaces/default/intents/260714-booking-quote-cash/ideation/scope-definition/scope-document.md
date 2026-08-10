# Scope Document - W1-01 Booking Quote-to-Cash

## Source And Outcome

This scope operationalizes `ideation/intent-capture/intent-statement.md`, uses the viability decision in `ideation/feasibility/feasibility-assessment.md`, and treats every release-blocking condition in `ideation/feasibility/constraint-register.md` as binding.

W1-01 delivers one observable booking-desk journey: an agent creates one direct-leg, dry-FCL, quantity-one, USD booking; validates it against live Reference Data; obtains and persists a live Charge quote; confirms through Booking's transactional outbox; observes CMM create the journey from `booking.confirmed`; receives `containermovement.status` back into Booking; and sees the persisted commercial and movement state on the Booking detail page.

The release is a walking skeleton, not a collection of backend endpoints. It is complete only when the same record crosses UI, API, domain, persistence, synchronous service contracts, both Kafka event seams, and the browser-visible read path on the real Compose stack.

## Minimum Release Boundary

### In scope

- A contract-true Booking aggregate and API shape using `carrierBookingReference`, `bookingRevision`, one ordered routing leg, and one equipment line.
- A compatible persistence migration or snapshot upcaster that keeps existing Booking records readable.
- A working Booking-local list-to-detail UI/API path with loading, empty, populated, error, and not-found behavior.
- Live validation of the selected customer, locations, vessel/voyage, equipment type, commodity, and USD currency against Reference Data.
- A live Booking-to-Charge pricing request and persisted quote result under the frozen bilateral behavior.
- Contract-exact Avro schemas, mappers, serde tests, producer records, and consumer records for `booking.confirmed` and `containermovement.status`.
- An idempotent CMM consumer that persists one journey per booking revision before acknowledgement.
- An atomic Booking status consumer that commits projection and envelope-ID dedupe state together and rejects stale updates.
- Removal of synchronous Booking-to-CMM confirmation and CMM-to-Booking status delivery from live request paths after both Kafka paths are proven.
- Compose restart and redelivery proof, automated quality gates, both repository audits, and evidence under `artifacts/w1-01-live/`.

### Out of scope

- Global shell, production authentication, and removal of development-only local identity behavior (`W2-01`).
- Full shared design-system migration (`W2-02`).
- Full tariff/agreement administration (`W2-03`).
- Broad track-and-trace ingestion and operational event coverage (`W2-04`).
- D&D rules, pricing, and invoicing (`W3-01`, `W3-02`).
- Booking amendments, reconfirmation breadth, cancellations, rolls, and splits (`W3-03`, `P2-03`).
- Multi-leg or transshipment routing (`P2-04`), external EDI/OHS integration (`P2-02`, `P2-05`), and reefer/DG detail (`P2-06`).
- Production AWS topology, scale claims, or availability commitments not established by an approved operation requirement.

## Prioritization

MoSCoW is used because W1-01 is a fixed contract intent with a binary live exit gate. Quantitative RICE or WSJF scores are not used because no defensible reach, capacity, duration, or cost-of-delay data exists.

| Priority | Capabilities | Release treatment |
|---|---|---|
| Must | Contract-true model and compatible data; working create/read UI/API; live Reference Data validation; live Charge quote; both Kafka consumers; Kafka-only cutover; idempotency; browser and Compose evidence; tests and audits | Required to close W1-01 |
| Should | Operator-useful correlation/error diagnostics and restrained Booking-local UX polish beyond the explicit state coverage | Include when it fits without widening the intent; omission does not weaken evidence |
| Could | Additional developer fixtures or diagnostics that shorten local reproduction but do not alter behavior | Include only after all Must evidence is green |
| Won't | Authentication/shell, full design migration, tariff breadth, D&D, invoices, amendments, multi-leg routing, broad T&T, EDI/OHS, reefer/DG, production-cloud claims | Owned by named later intents |

Every proto-Unit in the release backlog is a Must because each is one segment of the single required value stream. Scope control comes from keeping each segment to one leg, one equipment line, one quote, one booking revision, and one movement journey, rather than dropping a cross-module seam.

## Value Stream Map

| Step | Actor-visible value | System path | Proof |
|---|---|---|---|
| 1. Capture | Agent can create and reopen the thin booking | Booking UI -> API -> domain -> PostgreSQL | Browser, API, and persistence assertions |
| 2. Validate | Agent sees canonical references accepted or rejected | Booking -> live Reference Data | Live service calls and validation states |
| 3. Price | Agent sees a real persisted USD quote | Booking -> live Charge -> Booking | Provider request/result and stored quote |
| 4. Confirm | Confirmation returns without depending on CMM availability | Booking transaction -> outbox -> Schema Registry/Kafka | Atomic state/outbox and topic record |
| 5. Open journey | Operations state exists once for the confirmed revision | Kafka -> CMM consumer -> CMM PostgreSQL/outbox | Journey and dedupe assertions |
| 6. Return status | Booking receives movement progress asynchronously | CMM relay -> Kafka -> Booking consumer | Status topic, projection, and ordering assertions |
| 7. Inspect | Agent sees commercial and journey state together | Booking detail API -> Booking UI | Browser proof across required UI states |
| 8. Recover | Replays and restarts do not duplicate business state | Compose restart + event redelivery | Stable row counts and unchanged projections |

## Dependency And Sequence Policy

The delivery order is walking-skeleton and risk-first within the dependency DAG:

1. Establish a green Booking UI/API baseline while introducing contract-true domain and compatible persistence behavior.
2. Connect canonical Reference Data validation and live Charge pricing to that same record.
3. Align both authoritative schemas and mappings, then add the CMM confirmation consumer and Booking status consumer.
4. Prove both asynchronous paths before deleting synchronous event-delivery calls and live callback configuration.
5. Close with restart/redelivery, browser, topic, database, test, audit, and evidence verification.

HTTP callback removal cannot precede consumer proof. Final UI work cannot be postponed to a detached frontend phase; each increment keeps the Booking screen aligned with the domain/API state it introduces.

## Scope Controls

- No hard calendar deadline has been supplied. A future deadline can reduce optional polish but cannot waive contract fidelity, compatible migration, live Compose proof, tests, or either audit.
- Contract changes require producer and consumer ownership review. Adapter mappings may differ internally only when tests preserve exact wire names and semantics.
- Cross-context access remains HTTP or Kafka; no shared database access is allowed.
- Events carry operational references and shipment context only; W1 does not expand customer or payment data on topics.
- Any critical RAID item remains release-blocking until its named closure evidence is linked from `artifacts/w1-01-live/`.

## Validation Of Decisions

The confirmed answers contain no unresolved contradiction. The complete thin loop matches the intent outcome; its Must capabilities satisfy the feasibility conditions; the contracts-first order respects migration and consumer dependencies; and the no-exception policy matches the constraint register. The only open uncertainty is implementation detail, which belongs to Application Design and later Inception stages rather than scope expansion.
