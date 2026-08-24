# API Documentation

## Charge provider APIs

| Surface | Current operations/evidence | W3-01 implication |
|---|---|---|
| Charge agreements | `GET/POST /api/charge-agreements`, details, update, approve, suspend, expire, active lookup | Reuse versioned commercial authority; do not replace it |
| Rate authority | `GET/POST /api/charge-rates`, version update/approve/successor/history | Attach D&D terms to the approved W2-03 lineage |
| Pricing provider | `POST /pricing-requests` in `PricingApiController` | Preserve it and its `pricing.v1` shapes |
| Contract source | `contracts/openapi/pricing.v1.yaml` | Add the D&D operation/schemas backward-compatibly |
| BFF | `apps/charge-agreements` route handlers and policies | Add Charge-side maintenance/evaluation UX behind the existing authenticated shell |

`pricing.v1.yaml` already exposes `PricingResult.applicableDndRuleTypes`, proving that the W2-03 contract anticipates D&D applicability. The bilateral specification defines the future provider endpoint as `POST /dnd-pricing-requests` with `Idempotency-Key`, correlation information, pricing basis/ref, and start/end DCSA movement events.

## Consumer and integration APIs

Booking exposes booking lifecycle routes, including pricing snapshot operations. Its application layer contains `DndPricingPort.requestDndPricing(Booking, idempotencyKey, correlationId)` and maps a Charge response to a persisted observation or explicit manual/validation/denied/transient outcome. This code is preparatory; W3-02 remains responsible for the production Booking trigger.

Reference Data and Identity are synchronous dependencies for Charge. Kafka topics are used for platform events, but the bilateral D&D contract explicitly uses the synchronous Booking-to-Charge seam rather than a Charge D&D event.

