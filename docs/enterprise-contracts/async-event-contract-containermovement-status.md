# Async Event Contract — `containermovement.status`

> Producer-published — **no bilateral negotiation**. The producer (Container Movement Management) owns this contract; the consumer (Customer Booking) conforms (Conformist). This is the reverse-direction sibling of `booking.confirmed`.

> **Contract Name:** `containermovement.status`
> **Producer:** Container Movement Management (`container-service`) · **Consumer(s):** Customer Booking (`booking-service`)
> **Program Vision §5 reference:** Integration Contracts row — *"All validated movements / status · `containermovement.status` · Container Movement Management → Customer Booking · Any move recorded · Validated container moves with actual dates (DCSA-coded), derived status and availability — undifferentiated (CMM does not flag D&D moves) · Async event."* (Name authoritative there.)
> **Enterprise standard:** common Avro envelope + Confluent Schema Registry + message-pact (Enterprise Tech-Env §5); compatibility **BACKWARD**.
> **Authoritative schema:** `container-service/contracts/avro/containermovement-status.v1.avsc` → Schema-Registry subject `containermovement.status-value`.
> **Status:** Draft v0.1 · **Owner:** Equipment Control team (producer, named contact TBD) · 2026-07-07.

---

## 1. Purpose & trigger

Emitted whenever Container Movement Management records a **validated** container move or lifecycle event, so Customer Booking can maintain the single per-booking lifecycle status and recognise D&D-bounding moves to trigger Charge. CMM reports **every** validated move (with its actual/occurred date) as an undifferentiated feed — it does **not** flag which moves are D&D-relevant; Booking makes that determination against the bounding-move set derived from Charge's rule types.

## 2. Topic & delivery

| Property | Value |
|----------|-------|
| Topic | `containermovement.status` |
| **Partition key** | **composite `bookingRef` + `containerRef`** — guarantees per-container-within-a-booking ordering, matching CMM's tracking granularity (one container within one booking) |
| Ordering guarantee | per-key (within partition) — i.e. per container-within-booking |
| Retention / compaction | **time-retained; not compacted** — each move is a distinct, append-only fact (a timeline), not a latest-state snapshot, so log compaction would wrongly collapse history |
| Delivery | at-least-once via **transactional outbox**; consumers **dedupe on envelope `id`**, are idempotent, and tolerate out-of-order / late events (movements arrive messy across terminals — CMM tracks *occurred* vs *received* time, Enterprise §5) |

## 3. Envelope (inherited — not restated)

Composes the common Avro header (Enterprise §5): `id, source, type, time, correlationId, dataSchemaVersion`. For this contract: `type = containermovement.status`, `source = container-service`, `dataSchemaVersion = 1`. The header is embedded in the registered `.avsc`; it is not a second envelope format and is not repeated in the payload.

## 4. Payload

Field-level shape is the **Avro `.avsc`** (Appendix A), registered in Schema Registry. _Indicative contents:_ container reference, booking reference, DCSA equipment move code, DCSA event classifier (`PLN`/`EST`/`ACT`), occurred (actual) date, received date, CMM-derived status, laden/empty and transshipment flags, and move location (UN/LOCODE + facility). Do not restate fields here — the registered schema is authoritative.

## 5. Change semantics

This event family **carries a discriminator**: the DCSA move code (`moveCode`) together with its `eventClassifierCode`. The permitted vocabulary is the **DCSA Track & Trace v2.2 equipment (container-level) event** set — the only category CMM owns and validates (pinned via CMM's `MoveType` catalog to DCSA T&T v2.2, per Program Vision §10 Resolved Decisions). CMM emits an **undifferentiated** feed across these — it does **not** classify D&D-bounding moves and carries no D&D-specific signal; Booking interprets the feed.

**Event classifier codes** (`eventClassifierCode`):

| Code | Meaning |
|------|---------|
| `PLN` | Planned |
| `EST` | Estimated |
| `ACT` | Actual |

**Equipment (container-level) event codes** — the permitted `moveCode` domain:

| Code | Description | | Code | Description |
|------|-------------|-|------|-------------|
| `LOAD` | Load onto transport | | `PICK` | Pick-up |
| `DISC` | Discharge from transport | | `DROP` | Drop-off |
| `GTIN` | Gate in | | `INSP` | Inspection |
| `GTOT` | Gate out | | `RMVD` | Seal removed |
| `STUF` | Stuffing (packing) | | `RSEA` | Resealed after inspection |
| `STRP` | Stripping (unpacking) | | | |

**Out of scope for this contract (by module boundary):**

- **Transport events** (vessel `ARRI` / `DEPA`) are vessel-level facts owned by the **Shared Platform** Vessel/Voyage schedule; CMM *consumes* them as reference data to derive expected moves and variance, and does not re-emit them on this per-container feed.
- **Shipment / document events** (`RECE`, `CONF`, `REJE`, `ISSU`, `SURR`, …) are document-level, owned by **Customer Booking** (the inbound `booking.confirmed` seam already carries `CONF`) and the Phase-3 Documentation module. They are not emitted here.

`moveCode` is carried as a **string constrained to the DCSA v2.2 equipment vocabulary** (validated by CMM's `MovementValidationService` for DCSA-name conformance), rather than an Avro enum — so pinning to a later DCSA version or enabling the Phase-2 configurable catalog stays **BACKWARD**-compatible without a breaking enum change. The equipment table above is the authoritative enumeration of the permitted domain at v1.

## 6. Schema evolution

- Compatibility mode: **BACKWARD** (Schema Registry). Additive optional fields only within a major.
- `dataSchemaVersion` bumps on any payload change; breaking changes ⇒ a new `type` version (never an in-place edit, Enterprise §5).
- Extending the DCSA vocabulary (new `moveCode` string values) is **not** a schema change because `moveCode` is a validated string, not an enum — the DCSA-version pin is governed by CMM's catalog, not by the wire schema.
- The **PR-stage Avro compatibility check** (Enterprise §10) gates every schema change.

## 7. Security

- Topic-level **produce/consume authorization** + broker authentication (not module-to-module auth). Only `container-service` may produce; only authorized consumers (Booking) may subscribe.
- Provenance travels in the envelope `source` (`container-service`) + `correlationId`.
- Note (DCSA §Security): customer-facing track-and-trace exposure by `equipmentReference` alone is a separate, deferred concern (CMM's DCSA Open Host Service, Phase 2) — not this internal event.

## 8. Contract testing (message-pact + Schema Registry)

- The **consumer** (Booking) writes a message-pact asserting the fields it reads → pact file → Pact Broker.
- The **producer** (CMM) verifies the consumer message-pact in its pipeline + the SR **BACKWARD** compatibility check.
- Both gates green ⇒ the event is freeze-ready.

```java
// Consumer (Booking) — message-pact skeleton
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "container-service", providerType = ProviderType.ASYNCH)
class ContainerMovementStatusConsumerTest {

  @Pact(consumer = "booking-service")
  MessagePact containerMovementStatus(MessagePactBuilder builder) {
    return builder
      .given("a container move has been validated")
      .expectsToReceive("a containermovement.status event")
      .withContent(new PactDslJsonBody()
        .stringType("type", "containermovement.status")
        .stringType("correlationId", "b3f1c2a4-9e77-4d2a-8c11-2f0a6b5e9d10")
        .object("data")
          .stringType("bookingRef", "CAX698840")
          .stringType("containerRef", "APZU4812090")
          .stringType("moveCode", "GTOT")
          .stringType("eventClassifierCode", "ACT")
          .stringType("occurredDateTime", "2026-04-01T14:12:56Z")
          .stringType("derivedStatus", "GATED_OUT_LADEN")
          .stringType("emptyIndicatorCode", "LADEN")
          .booleanType("transshipment", false)
        .closeObject())
      .toPact();
  }

  @Test
  void bookingCanProjectStatusAndRecogniseDndBoundingMove(List<Message> messages) { /* assert mapping */ }
}
```

```java
// Producer (CMM) — provider verification skeleton
@Provider("container-service")
@PactBroker
class ContainerMovementEventProviderTest {
  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  void verify(PactVerificationContext context) { context.verifyInteraction(); }

  @PactVerifyProvider("a containermovement.status event")
  String produceContainerMovementStatus() {
    return eventFactory.containerMovementStatus(/* sample */).toJson();  // must match the registered Avro
  }
}
```

## 9. Observability

- `correlationId` carried from the originating move-capture/validation command through the event (inherited; propagated across every hop, Enterprise §5/§9).
- Producer metric: outbox publish lag. Consumer metric: consume lag + dedupe/redelivery count.
- Domain-specific: occurred-vs-received time gap is available on the payload for late/out-of-order diagnosis.

## 10. Consumers & their expectations

| Consumer | Fields depended on | Message-pact registered? |
|----------|--------------------|--------------------------|
| Customer Booking (`booking-service`) | `bookingRef`, `containerRef`, `moveCode`, `eventClassifierCode`, `occurredDateTime`, `derivedStatus`, `emptyIndicatorCode`, `transshipment` — used to (a) project the single per-booking lifecycle status (CQRS read model) and (b) recognise D&D-bounding moves against the bounding-move set derived from Charge's rule types, triggering `pricing.dnd-request` | [ ] |

## 11. Sign-off

| Role | Name | Date |
|------|------|------|
| Producer owner (CMM / Equipment Control) | | |
| Consumer acknowledged (Customer Booking) | | |

---

### Appendix A — Avro schema skeleton (registered as the authoritative artifact)

```json
{
  "type": "record",
  "name": "ContainerMovementStatus",
  "namespace": "com.linercore.containermovement.events.v1",
  "doc": "Payload for contract containermovement.status. Envelope fields (id, source, type, time, correlationId, dataSchemaVersion) are added by the common header schema, not repeated here. CMM reports every validated move undifferentiated; it does not flag D&D-bounding moves.",
  "fields": [
    { "name": "bookingRef", "type": "string", "doc": "carrierBookingReference — half of the composite partition key" },
    { "name": "containerRef", "type": "string", "doc": "equipmentReference (ISO 6346) — half of the composite partition key" },
    { "name": "movementId", "type": ["null", "string"], "default": null, "doc": "Stable business id of the validated move (optional; envelope id governs dedupe)" },
    { "name": "moveCode", "type": "string", "doc": "DCSA T&T v2.2 equipment (container-level) event code (e.g. LOAD, DISC, GTIN, GTOT, STUF, STRP, PICK, DROP, INSP, RMVD, RSEA). String, not enum, to stay BACKWARD-compatible as the DCSA pin/catalog evolves. Transport/shipment codes are out of scope by module boundary (see §5)." },
    {
      "name": "eventClassifierCode",
      "type": { "type": "enum", "name": "EventClassifierCode",
        "symbols": ["PLN", "EST", "ACT"] },
      "doc": "DCSA classifier: Planned / Estimated / Actual"
    },
    { "name": "occurredDateTime", "type": "string", "doc": "ISO-8601 UTC — actual (occurred) date/time of the move" },
    { "name": "receivedDateTime", "type": "string", "doc": "ISO-8601 UTC — when CMM received/validated the move (occurred-vs-received handling)" },
    { "name": "derivedStatus", "type": "string", "doc": "CMM-derived container status after this move" },
    {
      "name": "emptyIndicatorCode",
      "type": { "type": "enum", "name": "EmptyIndicatorCode",
        "symbols": ["EMPTY", "LADEN"] },
      "doc": "DCSA laden/empty indicator"
    },
    { "name": "transshipment", "type": "boolean", "default": false, "doc": "True when the move belongs to a transshipment (PTS) leg" },
    {
      "name": "location",
      "type": ["null", {
        "type": "record", "name": "MovementLocation",
        "fields": [
          { "name": "unLocationCode", "type": ["null", "string"], "default": null, "doc": "UN/LOCODE" },
          { "name": "facilityCode", "type": ["null", "string"], "default": null },
          { "name": "facilityTypeCode", "type": ["null", "string"], "default": null, "doc": "DCSA facility type (POTE, DEPO, CLOC, INTE...)" }
        ]
      }],
      "default": null
    }
    // additive optional fields only, with defaults, to stay BACKWARD-compatible
  ]
}
```

### Appendix B — AsyncAPI skeleton (channel binding)

```yaml
asyncapi: 3.0.0
info: { title: Container Movement Events, version: "1.0.0" }
channels:
  containerMovementStatus:
    address: containermovement.status
    messages:
      containerMovementStatus:
        $ref: '#/components/messages/ContainerMovementStatus'
operations:
  publishContainerMovementStatus:
    action: send
    channel: { $ref: '#/channels/containerMovementStatus' }
components:
  messages:
    ContainerMovementStatus:
      contentType: application/avro
      payload:
        schemaFormat: application/vnd.apache.avro;version=1.9.0
        schema: { $ref: './avro/containermovement-status.v1.avsc' }   # the registered subject
```
