# Async Event Contract — `booking.confirmed`

> Producer-published — **no bilateral negotiation**. Customer Booking owns this contract; Container Movement Management conforms (Conformist).

> **Contract Name:** `booking.confirmed`
> **Producer:** Customer Booking (`booking-service`) · **Consumer(s):** Container Movement Management (`container-service`)
> **Program Vision §5 reference:** Integration Contracts row `booking.confirmed` (name authoritative there).
> **Enterprise standard:** common Avro envelope + Confluent Schema Registry + message-pact (Enterprise Tech-Env §5); compatibility **BACKWARD**.
> **Authoritative schema:** `booking-service/contracts/avro/booking-confirmed.v1.avsc` → Schema-Registry subject `booking.confirmed-value`.
> **Status:** Draft v0.1 · **Owner:** Booking lead (producer) · 2026-07-07.

---

## 1. Purpose & trigger

Emitted when a booking confirmation is issued — after both commercial determination (agreement + charges) and capacity validation have succeeded (Customer Booking Module Vision, steps 3–8). It gives Container Movement Management the shipment context and the full ordered routing it needs to open the container journey and derive the expected moves for every port on the route (POL, transshipment legs, POD). It is **re-emitted with an incremented `bookingRevision`** when a basic amendment (equipment quantity, type/size, or a later container-number assignment) causes the booking to be confirmed again (see §5).

## 2. Topic & delivery

| Property | Value |
|----------|-------|
| Topic | `booking.confirmed` |
| **Partition key** | booking id — guarantees per-booking ordering |
| Ordering guarantee | per-key (within partition) |
| Retention / compaction | time-retained; not compacted (this is a lifecycle event, not a reference set) |
| Delivery | at-least-once via **transactional outbox**; consumers **dedupe on envelope `id`** and tolerate out-of-order |
| Idempotency / re-confirmation | keyed on **`bookingId` + `bookingRevision`**: the first confirmation is `bookingRevision = 1`; an in-MVP basic amendment (equipment quantity, type/size, or a later container-number assignment) is **re-confirmed by Booking** and re-emitted as `booking.confirmed` with an incremented `bookingRevision` carrying the **full current state**. Consumers upsert on `bookingId`, apply the highest revision seen, and ignore stale/older or duplicate revisions. Per-`bookingId` ordering (above) guarantees revisions arrive in order |

## 3. Envelope (inherited — not restated)

Composes the common Avro header (Enterprise §5): `id, source, type, time, correlationId, dataSchemaVersion`. For this contract: `type = booking.confirmed`, `source = booking-service`, `dataSchemaVersion = 1`. The `correlationId` is propagated from the originating booking so the whole flow (request → agreement → charge → confirmation → tracking) is traceable end-to-end.

## 4. Payload

Field-level shape is the **Avro `.avsc`** (Appendix A), registered in Schema Registry. _Indicative contents:_ booking reference + revision + full ordered routing (legs carrying load/discharge UN/LOCODE + voyage reference) + equipment assignment (type + quantity + optional container id). Every emission carries the **full current** `routing[]` and `equipment[]` (not a delta), so a re-confirmation (see §5) is self-contained and consumers reconcile by replacing state for the `bookingId`. The per-line container id (`equipmentId`) is **absent at initial confirmation** (containers not yet assigned) and is **populated on a later re-confirmation** once Booking knows the container numbers (obtained via a separate contract); CMM then keeps that reference against the journey. Cross-context references are carried as **Shared Platform reference codes** (voyage id, UN/LOCODE ports, equipment-type code) — consumers resolve details from their local reference replica; the event does not restate reference-data attributes. Reefer/DG indicators and commodity code are **deliberately excluded** to keep the event minimal; if a consumer later needs them, they are added as additive optional fields (BACKWARD-compatible). Do not restate fields here — the registered schema is authoritative.

## 5. Change semantics

`booking.confirmed` carries no `changeType` enum, but it is **not** a strictly one-shot event. It is emitted in two situations, distinguished by the monotonic **`bookingRevision`** field:

- **Initial confirmation** — `bookingRevision = 1`. Emitted once both commercial determination (agreement + charges) and capacity validation first succeed.
- **Re-confirmation after a basic amendment** — `bookingRevision` incremented (2, 3, …). A basic, in-MVP amendment that changes the shipment context CMM consumes — an **equipment quantity change**, an **equipment type/size change**, or a **container-number (equipment ID) assignment** (populating `equipmentId` once containers are known, via a separate contract) — is re-run through the same commercial and capacity gates on the Booking side (i.e. **the booking is confirmed again**) and re-emitted as `booking.confirmed` carrying the **full current** `routing[]` and `equipment[]`.

Consumers therefore treat the event as an **upsert keyed on `bookingId`**: apply the state of the highest `bookingRevision` seen, reconcile their journeys against the full equipment/routing set (adding units; when a container number (`equipmentId`) is present it identifies the exact unit, so CMM attaches or retires the specific journey and keeps the reference; when it is absent — e.g. at initial confirmation — reconciliation is by count), and ignore any older or duplicate revision.

**Out of scope for this contract** (separate, deferred Phase-2 contracts — *not* variants of this event): **routing changes (rolls), splits, and cancellations.** A cancellation in particular needs a future `booking.cancelled` event so CMM can close the journey; it cannot be expressed by `booking.confirmed`.

## 6. Schema evolution

- Compatibility mode: **BACKWARD** (Schema Registry). Additive optional fields only within a major (defaults required).
- `dataSchemaVersion` bumps on any payload change; breaking changes ⇒ a new `type` version (e.g. `booking.confirmed.v2`), never an in-place edit.
- The **PR-stage Avro compatibility check** (Enterprise §10) gates every schema change.

## 7. Security

- Topic-level **produce/consume authorization** + broker authentication (not module-to-module auth).
- Provenance travels in the envelope `source` (`booking-service`) + `correlationId`.
- No PII on the wire: customer/party is referenced only indirectly via the booking id; this event carries no party attributes.

## 8. Contract testing (message-pact + Schema Registry)

- Container Movement Management writes a message-pact asserting the fields it reads → pact file → Pact Broker.
- Customer Booking verifies the CMM message-pact in its pipeline + the SR **BACKWARD** compatibility check.
- Both gates green ⇒ the event is freeze-ready.

```java
// Consumer (CMM) — message-pact skeleton
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "booking-service", providerType = ProviderType.ASYNCH)
class BookingConfirmedConsumerTest {

  @Pact(consumer = "container-service")
  MessagePact bookingConfirmed(MessagePactBuilder builder) {
    return builder
      .given("a booking has been confirmed")
      .expectsToReceive("a booking.confirmed event")
      .withContent(new PactDslJsonBody()
        .stringType("type", "booking.confirmed")
        .stringType("correlationId")
        .object("data")
          .stringType("bookingId")
          .integerType("bookingRevision")
          .minArrayLike("routing", 1)
            .integerType("legSequence")
            .stringType("loadUnLocode")
            .stringType("dischargeUnLocode")
            .stringType("voyageId")
          .closeObject().closeArray()
          .minArrayLike("equipment", 1)
            .stringType("equipmentTypeCode")
            .integerType("quantity")
            .stringType("equipmentId")   // optional — present only once the container number is known
          .closeObject().closeArray()
        .closeObject())
      .toPact();
  }

  @Test
  void cmmCanDeriveExpectedMovesFromEvent(List<Message> messages) { /* assert POL/PTS/POD derivation */ }
}
```

```java
// Producer (Booking) — provider verification skeleton
@Provider("booking-service")
@PactBroker
class BookingEventProviderTest {
  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  void verify(PactVerificationContext context) { context.verifyInteraction(); }

  @PactVerifyProvider("a booking.confirmed event")
  String produceBookingConfirmed() {
    return eventFactory.bookingConfirmed(/* sample */).toJson();  // must match the registered Avro
  }
}
```

## 9. Observability

- `correlationId` carried from the originating booking command through the event (inherited).
- Producer metric: outbox publish lag (booking-service).
- Consumer metric: consume lag + dedupe/redelivery count (container-service).

## 10. Consumers & their expectations

| Consumer | Fields depended on | Message-pact registered? |
|----------|--------------------|--------------------------|
| Container Movement Management | `bookingId`, `bookingRevision`, `routing[]` (`legSequence`, `loadUnLocode`, `dischargeUnLocode`, `voyageId`), `equipment[]` (`equipmentTypeCode`, `quantity`, `equipmentId` — optional) | [ ] |

## 11. Sign-off

| Role | Name | Date |
|------|------|------|
| Producer owner (Booking) | | |
| Consumer acknowledged (CMM) | | |

---

### Appendix A — Avro schema skeleton (registered as the authoritative artifact)

```json
{
  "type": "record",
  "name": "BookingConfirmed",
  "namespace": "com.linercore.booking.events.v1",
  "doc": "Payload for contract booking.confirmed. Envelope fields (id, source, type, time, correlationId, dataSchemaVersion) are added by the common header schema, not repeated here. Cross-context references are Shared Platform reference codes; consumers resolve details from their local reference replica.",
  "fields": [
    {
      "name": "bookingId",
      "type": "string",
      "doc": "Canonical Booking reference (owned by Customer Booking). Stable correlation key for the whole shipment lifecycle and the upsert key for consumers."
    },
    {
      "name": "bookingRevision",
      "type": "int",
      "default": 1,
      "doc": "Monotonic revision of the confirmed booking. 1 = initial confirmation; incremented on each basic re-confirmation (equipment quantity or type/size change). Consumers upsert on bookingId, apply the highest revision seen, and ignore older/duplicate revisions."
    },
    {
      "name": "routing",
      "doc": "Full ordered routing including transshipment legs. First leg's loadUnLocode is the POL; last leg's dischargeUnLocode is the POD; intermediate discharge/load ports are transshipment points (PTS).",
      "type": {
        "type": "array",
        "items": {
          "type": "record",
          "name": "RoutingLeg",
          "fields": [
            { "name": "legSequence", "type": "int", "doc": "1-based order of the leg on the route; unambiguous even if array order is not relied upon." },
            { "name": "loadUnLocode", "type": "string", "doc": "UN/LOCODE of the load port for this leg (Shared Platform Port/Location key)." },
            { "name": "dischargeUnLocode", "type": "string", "doc": "UN/LOCODE of the discharge port for this leg." },
            { "name": "voyageId", "type": "string", "doc": "Shared Platform Vessel/Voyage reference code for this leg. Consumer resolves vessel/schedule from its voyage replica." }
          ]
        }
      }
    },
    {
      "name": "equipment",
      "doc": "Equipment assignment: type + quantity, plus the optional physical container number once known. Container numbers are absent at initial confirmation and populated on a later re-confirmation (see equipmentId).",
      "type": {
        "type": "array",
        "items": {
          "type": "record",
          "name": "EquipmentAssignment",
          "fields": [
            { "name": "equipmentTypeCode", "type": "string", "doc": "Shared Platform Equipment-type reference code." },
            { "name": "quantity", "type": "int" },
            { "name": "equipmentId", "type": ["null", "string"], "default": null, "doc": "Physical container number (ISO 6346), e.g. APZU4812090. OPTIONAL: absent at initial confirmation (not yet assigned); populated on a later re-confirmation once Booking knows the container numbers (obtained via a separate contract). CMM keeps this reference against the journey. Nullable + defaulted to stay BACKWARD-compatible." }
          ]
        }
      }
    }
    // additive optional fields only, with defaults, to stay BACKWARD-compatible
  ]
}
```

### Appendix B — AsyncAPI skeleton (channel binding)

```yaml
asyncapi: 3.0.0
info: { title: Booking Events, version: "1.0.0" }
channels:
  bookingConfirmed:
    address: booking.confirmed
    messages:
      bookingConfirmed:
        $ref: '#/components/messages/BookingConfirmed'
operations:
  publishBookingConfirmed:
    action: send
    channel: { $ref: '#/channels/bookingConfirmed' }
components:
  messages:
    BookingConfirmed:
      contentType: application/avro
      payload:
        schemaFormat: application/vnd.apache.avro;version=1.9.0
        schema: { $ref: './avro/booking-confirmed.v1.avsc' }   # the registered subject
```

---

*Draft v0.1. Producer-owned contract for `booking.confirmed` (Customer Booking → Container Movement Management). Conforms to Enterprise Technical Environment v1.1 (common Avro envelope, Confluent Schema Registry, BACKWARD compatibility, transactional outbox, message-pact). Subordinate to Program Vision §5, which is authoritative for the contract name and the producer/consumer map.*
