# Bilateral Contract Spec — Customer Booking ↔ Charge Calculation & Customer Agreement (Pricing seam)

> **Seam:** Customer Booking ↔ Charge & Customer Agreement
> **Relationship (DDD):** Customer/Supplier — co-evolved; Booking is Customer (consumer), Charge is Supplier (provider). Synchronous, on the booking critical path (Program Vision §5 Context Map).
> **Contracts covered:** `pricing.request`, `pricing.result`, `pricing.dnd-request`, `pricing.dnd-result`.
> **Program Vision §5 reference:** Integration Contracts rows for the above (names are authoritative there; not restated here).
> **Enterprise standard:** REST + OpenAPI 3.x, JWT/RS256 service auth, standard error envelope, media-type versioning (Enterprise Tech-Env §5).
> **Authoritative schema:** `pricing-service/contracts/openapi/pricing.v1.yaml` — this doc governs *interaction*; the OpenAPI governs *shape*.
> **Status:** Draft v0.1 · **Owners:** Booking lead (consumer) + Charge lead (provider) · 2026-07-01.

---

## 1. Purpose & why this seam is bilateral

This seam is documented as a negotiated bilateral contract, rather than left to a producer-published schema alone, because it is synchronous, sits on the booking critical path, and joins a tightly co-evolved Customer/Supplier pair. A booking must not confirm against a stale or guessed charge, so Booking and Charge build in close coordination and must agree the behaviour an OpenAPI cannot express: latency budgets, timeout and retry rules, idempotency, circuit-breaking, and the degrade-to-manual fallback. The same synchronous coupling carries both booking-time pricing and movement-driven detention & demurrage (D&D) pricing — Charge owns the D&D ruleset, Booking owns the trigger — so any change to either pair is co-reviewed by both owners. Getting this seam right is the platform's core revenue-protection loop (correct pricing at booking time; captured D&D after movement).

## 2. Contracts in scope

| Contract Name | Direction | Trigger | Indicative payload (see OpenAPI for fields) |
|---------------|-----------|---------|---------------------------------------------|
| `pricing.request` | Booking → Charge (request) | Booking created, or amended in a way that changes a pricing-determining input (any `pricing.request` payload field) | Trade lane, POL & POD (port pair), equipment type, customer/party, commodity code, reefer/DG indicators, dates, quantities |
| `pricing.result` | Charge → Booking (response) | Pricing complete | Itemised charge breakdown (base freight + surcharges + local charges) + pricing-basis reference (agreement or tariff) + **all D&D rule types applicable to this booking** (per rule type: identifier/name, start & end DCSA v2.2 move codes, empty/laden qualifier — no free time or rates) |
| `pricing.dnd-request` | Booking → Charge (request) | Booking recognises a D&D-bounding move (from `containermovement.status`) | D&D rule type (which rule Booking is pricing) + start & end bounding movements (each: DCSA v2.2 move code, empty/laden, timestamp), equipment id, booking reference, pricing-basis reference (agreement or tariff) |
| `pricing.dnd-result` | Charge → Booking (response) | D&D pricing request received | D&D rule type applied + itemised D&D charge breakdown + booking reference |

_The two request/response pairs ride the **same** synchronous seam; the D&D pair reuses the booking-time coupling. Charge publishes no Kafka event for D&D — the former async `charge.dnd-calculated` is replaced by the synchronous `pricing.dnd-result` (Program Vision §10 Resolved Decisions)._

> **Note on pricing-basis reference (agreement *or* tariff):** Charge resolves pricing against a customer agreement where one exists and falls back to the published tariff where none does. Both `pricing.result` and `pricing.dnd-request` therefore carry a **discriminated pricing-basis reference** — `pricingBasis` (`AGREEMENT` | `TARIFF`) plus `pricingRef` — with exactly one present. Booking stores and echoes this reference so the D&D request prices against the same basis the booking was priced on. `NO_RATE` (404, §4) is returned only when **neither** an agreement nor a tariff resolves.

> **Note on D&D rule types in `pricing.result`:** because Booking owns the D&D *trigger* but not the D&D *ruleset*, Charge returns — at booking time — the set of D&D rule types **applicable to this booking** (derived from the resolved agreement/tariff for its lane, equipment, and **POL/POD locations** — D&D rules are location-based, so applicability is keyed on the ports, not a request-level direction flag; a single booking may legitimately carry all three MVP rule types at once — export detention at the POL, import demurrage and import detention at the POD). Each entry carries the rule-type identifier and its **start/end DCSA v2.2 move codes** (plus empty/laden qualifier) so Booking can recognise a bounding move in the `containermovement.status` feed and know when to fire `pricing.dnd-request`. **Free time and daily rates are deliberately excluded** — they stay in Charge and are applied only when Charge computes the D&D charge. This block appears in `pricing.result` only, not in `pricing.dnd-result`.

> **Note on the `pricing.request` amendment trigger:** re-pricing fires **only** when an amendment changes a pricing-determining input (i.e. one of the `pricing.request` payload fields above). Amendments that affect only capacity/sailing re-run the operational check instead, and amendments touching no pricing input trigger no `pricing.request` at all (Booking Vision v1.2, Journey 2 — conditional re-validation).

## 3. Interaction semantics

| Property | Booking-time pricing (`pricing.request`) | D&D pricing (`pricing.dnd-request`) |
|----------|------------------------------------------|-------------------------------------|
| Endpoint | `POST /pricing-requests` | `POST /dnd-pricing-requests` |
| Media-type version | `application/vnd.api.v1+json` | `application/vnd.api.v1+json` |
| **Latency budget (p99)** | 800 ms — on the booking-confirmation critical path | 1.5 s — triggered off an async movement, not blocking confirmation |
| **Timeout (consumer-side)** | 2 s | 3 s |
| **Retry policy** | ≤1 retry, only on timeout/503; **never on 4xx** | ≤1 retry, only on timeout/503; **never on 4xx** |
| **Idempotency** | `Idempotency-Key` = `bookingId + amendmentSeq`; provider dedupes; same key ⇒ same result | `Idempotency-Key` = `bookingId + equipmentId + closingMovementEventId`; provider dedupes; same key ⇒ same result |
| **Concurrency** | At-most-one in-flight pricing per booking version | At-most-one in-flight D&D pricing per (booking, equipment, closing event) |

## 4. Error model

Both endpoints surface the standard error envelope (Enterprise §5: `code`, `message`, `correlationId`). The seam-specific failure cases Booking must handle distinctly:

| Condition | HTTP | Code | Consumer (Booking) action |
|-----------|------|------|---------------------------|
| Malformed request (unparseable JSON, wrong content-type, missing/wrong-typed field) | 400 | `PRICING_BAD_REQUEST` | Fix the request; **do not retry** (a client/integration defect) |
| Semantic validation failure (well-formed, but an unacceptable value — e.g. unknown commodity code, unserved trade lane, unrecognised equipment type) | 422 | `PRICING_VALIDATION` | **Block confirmation**; surface to user; do not retry |
| Commodity not eligible under the applicable agreement or tariff | 422 | `COMMODITY_NOT_ELIGIBLE` | **Block confirmation**; surface to user; do not retry (booking-time only) |
| No agreement **and** no tariff resolves | 404 | `NO_RATE` | Fall back to manual pricing; do not retry |
| Charge unavailable | 503 / timeout | — | **Degrade to manual** (see §5) |

_`COMMODITY_NOT_ELIGIBLE` is distinct from `PRICING_VALIDATION` because commodity-code eligibility is a hard confirmation gate in the Booking vision (v1.2): a booking must not confirm if the commodity code is rejected by agreement determination._

## 5. Failure & degradation behaviour

This is the heart of the bilateral doc — agreed explicitly by both owners.

- **Booking-time pricing (Hard dependency, degrades to manual).** Booking's dependency on Charge is Hard but degrades to manual (Program §5 Dependency Matrix). On timeout / 503 / circuit-open, Booking **queues the booking for manual pricing and flags it** rather than blocking or guessing. A booking is never confirmed against a stale or guessed charge.
- **D&D pricing (does not block confirmation).** Because D&D is triggered off the asynchronous movement feed and not on the confirmation critical path, on failure Booking **queues and retries; if still failing after the retry, it flags the booking for manual D&D pricing**. It never blocks and never guesses a D&D charge.
- **Circuit breaker:** open after **5 consecutive failures**; half-open probe after **30 s**. Applies per endpoint. The breaker counts **failed attempts *after* the ≤1 retry** (one attempt = original + its retry), not raw calls; while the circuit is **open**, Booking **skips the call entirely and goes straight to the manual queue**. A failed half-open probe re-opens the circuit (30 s timer restarts); a successful probe closes it and normal traffic resumes.
- **Safe-to-retry set:** idempotent requests on timeout/503 only (never on 4xx).
- **No partial charges:** a `pricing.result` (and a `pricing.dnd-result`) is all-or-nothing; Booking never persists a half-priced booking or a partial D&D charge.

## 6. Versioning & co-evolution protocol

- **Compatibility:** backward-compatible changes only within a major (Enterprise §5). Additive fields are safe; removals/renames/semantic changes require a new media-type version.
- **Breaking change protocol:** provider ships `v(N+1)` alongside `vN`; consumer migrates within an agreed window; `vN` is deprecated then retired by an agreed date.
- **Co-evolution trigger:** because these two co-evolve, any change to either pair (booking-time or D&D) is reviewed by **both** owners before merge.
- **DCSA vocabulary:** the movement-event codes carried on `pricing.dnd-request` are pinned to **DCSA Track & Trace v2.2** (program-level shared constant, Program §10). Charge's `pricing.dnd-request` contract accepts the enumerated set **`DISC` (discharge), `GTOT` (gate out), `GTIN` (gate in)** — the start/end bounding events for the three MVP rule types (import demurrage: `DISC`→`GTOT`; import detention: `GTOT`→`GTIN` empty; export detention: `GTOT` empty→`GTIN` laden) — with `emptyIndicatorCode` (`EMPTY`/`LADEN`) distinguishing empty return from gate-in full. A change to the pinned version, or to the accepted code set, is a program-level decision reviewed by both owners, not a seam-local one.

## 7. Security

- Service-to-service: **JWT/RS256**, validated at Charge's edge against Keycloak keys (inherited Conformist pattern).
- Authorization: caller must hold the `pricing:invoke` capability per the `identity-service` role model.
- Correlation and a stable `bookingId` are required on every request for traceability (charges are money and dispute evidence — Program §6 audit mandate).

## 8. Contract testing (HTTP Pact)

- **Consumer (Booking)** writes consumer-driven Pact tests for each interaction (`pricing.request`/`pricing.result` and `pricing.dnd-request`/`pricing.dnd-result`) → pact file → Pact Broker.
- **Provider (Charge)** verifies the pact in its pipeline; a break fails Charge's build.
- **Pipeline gate:** contract tests run pre-deploy to staging (Enterprise §10).

```java
// Consumer (Booking) — Pact JVM skeleton
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "pricing-service", pactMethod = "pricingRequestPact")
class PricingRequestConsumerTest {

  @Pact(consumer = "booking-service")
  RequestResponsePact pricingRequestPact(PactDslWithProvider builder) {
    return builder
      .given("an active agreement exists for the party and trade lane")
      .uponReceiving("a booking-time pricing request")
        .method("POST").path("/pricing-requests")
        .headers("Content-Type", "application/vnd.api.v1+json")
        .body(/* minimal request the consumer depends on */ "{ }")
      .willRespondWith()
        .status(200)
        .body(/* only the fields Booking actually reads */ "{ }")
      .toPact();
  }

  @Test
  void bookingDependsOnItemisedResult(MockServer mock) { /* assert parsing */ }
}
```

```java
// Provider (Charge) — verification skeleton
@Provider("pricing-service")
@PactBroker
class PricingProviderVerificationTest {
  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  void verify(PactVerificationContext context) { context.verifyInteraction(); }

  @State("an active agreement exists for the party and trade lane")
  void seedAgreement() { /* provider state setup */ }
}
```

## 9. Observability

- `correlationId` propagated from `pricing.request` through `pricing.result` (and likewise across the D&D pair), inherited from the enterprise tracing standard (OpenTelemetry / W3C Trace Context).
- Seam metrics: request rate, p99 latency, timeout rate, circuit state, and **manual-fallback count** (both booking-time manual-pricing fallbacks and manual-D&D fallbacks).

## 10. Open items

- [ ] Confirm the p99 latency SLOs (800 ms booking-time / 1.5 s D&D) against real measurements at Milestone M1, and reconcile the booking-time budget with Booking's confirmation SLA once that SLA is set.
- [ ] Confirm the D&D idempotency-key composition (`bookingId + equipmentId + closingMovementEventId`) once the D&D-bounding-move recognition design is finalised in Booking's Construction phase.
- [x] **Confirmed:** the enumerated DCSA v2.2 move codes accepted on `pricing.dnd-request` are **`DISC` (discharge), `GTOT` (gate out), `GTIN` (gate in)** — the start/end bounding events for the three MVP rule types — paired with `emptyIndicatorCode` (`EMPTY` / `LADEN`) to distinguish empty return from gate-in full. See §2, §6, and the `DndPricingRequest` schema in Appendix A.

## 11. Sign-off

| Role | Name | Date |
|------|------|------|
| Consumer owner (Booking) | | |
| Provider owner (Charge) | | |

---

### Appendix A — OpenAPI skeleton (authoritative schema; lives in the provider repo)

```yaml
openapi: 3.1.0
info:
  title: Charge Pricing API
  version: "1.0.0"            # media-type carries the contract version
servers:
  - url: https://pricing-service.internal
paths:
  /pricing-requests:
    post:
      operationId: requestPricing          # contract: pricing.request / pricing.result
      parameters:
        - { in: header, name: Idempotency-Key, required: true, schema: { type: string } }
      requestBody:
        required: true
        content:
          application/vnd.api.v1+json:
            schema: { $ref: '#/components/schemas/PricingRequest' }
      responses:
        '200':
          content:
            application/vnd.api.v1+json:
              schema: { $ref: '#/components/schemas/PricingResult' }
        '422': { $ref: '#/components/responses/Error' }   # PRICING_VALIDATION / COMMODITY_NOT_ELIGIBLE
        '404': { $ref: '#/components/responses/Error' }   # NO_RATE
        '400': { $ref: '#/components/responses/Error' }   # PRICING_BAD_REQUEST
  /dnd-pricing-requests:
    post:
      operationId: requestDndPricing        # contract: pricing.dnd-request / pricing.dnd-result
      parameters:
        - { in: header, name: Idempotency-Key, required: true, schema: { type: string } }
      requestBody:
        required: true
        content:
          application/vnd.api.v1+json:
            schema: { $ref: '#/components/schemas/DndPricingRequest' }
      responses:
        '200':
          content:
            application/vnd.api.v1+json:
              schema: { $ref: '#/components/schemas/DndPricingResult' }
        '422': { $ref: '#/components/responses/Error' }
        '404': { $ref: '#/components/responses/Error' }
        '400': { $ref: '#/components/responses/Error' }
components:
  schemas:
    PricingRequest:
      type: object
      required: [bookingRef, pol, pod, tradeLane, equipmentType, partyId, commodityCode, dates, quantities]
      properties:
        bookingRef:      { type: string }
        tradeLane:       { type: string }
        pol:             { type: string }            # UN/LOCODE — port of loading (origin); keys export-side D&D rule resolution
        pod:             { type: string }            # UN/LOCODE — port of discharge (destination); keys import-side D&D rule resolution
        equipmentType:   { type: string }
        partyId:         { type: string }            # customer / party
        commodityCode:   { type: string }
        reeferIndicator: { type: boolean }
        dgIndicator:     { type: boolean }
        dates:           { type: object }            # define fields
        quantities:      { type: object }
    PricingResult:
      type: object
      required: [bookingRef, pricingBasis, pricingRef, charges, applicableDndRuleTypes]
      properties:
        bookingRef:   { type: string }
        pricingBasis: { type: string, enum: [AGREEMENT, TARIFF] }   # which basis pricing resolved against
        pricingRef:   { type: string }                              # agreement ref or tariff ref, per pricingBasis
        charges:
          type: array
          items:
            type: object
            properties:
              chargeCode: { type: string }
              category:   { type: string, enum: [FREIGHT, SURCHARGE, LOCAL] }
              amount:     { type: number }
              currency:   { type: string }
        applicableDndRuleTypes:                                     # booking-applicable rule types; trigger metadata only
          type: array
          items:
            type: object
            required: [ruleType, startMoveTypeCode, endMoveTypeCode]
            properties:
              ruleType:          { type: string, enum: [IMPORT_DEMURRAGE, IMPORT_DETENTION, EXPORT_DETENTION] }
              startMoveTypeCode: { type: string, enum: [DISC, GTOT, GTIN] }   # start bounding move (DCSA v2.2)
              startEmptyIndicatorCode: { type: string, enum: [EMPTY, LADEN] } # qualifies the start move — disambiguates GTOT-laden (import-detention start, at POD) from GTOT-empty (export-detention start, at POL)
              endMoveTypeCode:   { type: string, enum: [DISC, GTOT, GTIN] }   # end bounding move (DCSA v2.2)
              endEmptyIndicatorCode: { type: string, enum: [EMPTY, LADEN] }   # qualifies the end move where needed (name aligned with MovementEvent.emptyIndicatorCode)
              # NOTE: free time and daily rates are intentionally NOT exposed — they remain in Charge
    DndPricingRequest:
      type: object
      required: [bookingRef, equipmentId, dndRuleType, pricingBasis, pricingRef, startMovement, endMovement]
      properties:
        bookingRef:    { type: string }
        equipmentId:   { type: string }
        dndRuleType:   { type: string, enum: [IMPORT_DEMURRAGE, IMPORT_DETENTION, EXPORT_DETENTION] }  # Booking states which rule it recognised (from pricing.result.applicableDndRuleTypes); Charge validates against the start/end pair
        pricingBasis:  { type: string, enum: [AGREEMENT, TARIFF] }   # echoed from the pricing.result the booking was priced on
        pricingRef:    { type: string }                              # agreement ref or tariff ref, per pricingBasis
        startMovement: { $ref: '#/components/schemas/MovementEvent' } # bounding START move for the rule being priced
        endMovement:   { $ref: '#/components/schemas/MovementEvent' } # bounding END (closing) move that triggered this request
        # Charge needs both timestamps to compute chargeable days = end − start − free time (free time & rate stay in Charge)
    MovementEvent:
      type: object
      required: [moveTypeCode, eventDateTime]
      properties:
        moveTypeCode:       { type: string, enum: [DISC, GTOT, GTIN] }   # DCSA T&T v2.2 move code (accepted set)
        emptyIndicatorCode: { type: string, enum: [EMPTY, LADEN] }       # EMPTY / LADEN qualifier (distinguishes the GTOT/GTIN cases)
        eventDateTime:      { type: string, format: date-time }
    DndPricingResult:
      type: object
      required: [bookingRef, pricingBasis, pricingRef, dndRuleType, charges]
      properties:
        bookingRef:   { type: string }
        pricingBasis: { type: string, enum: [AGREEMENT, TARIFF] }
        pricingRef:   { type: string }                              # agreement ref or tariff ref, per pricingBasis
        dndRuleType:  { type: string, enum: [IMPORT_DEMURRAGE, IMPORT_DETENTION, EXPORT_DETENTION] }
        charges:
          type: array
          items:
            type: object
            properties:
              chargeCode: { type: string }
              amount:     { type: number }
              currency:   { type: string }
              chargeableDays: { type: integer }
  responses:
    Error:
      description: Standard error envelope (Enterprise §5)
      content:
        application/json:
          schema:
            type: object
            properties:
              code:          { type: string }        # PRICING_BAD_REQUEST | PRICING_VALIDATION | COMMODITY_NOT_ELIGIBLE | NO_RATE
              message:       { type: string }
              correlationId: { type: string }
```
