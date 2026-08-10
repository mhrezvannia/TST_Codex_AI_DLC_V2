# Intent Statement — P2-02 DCSA Track & Trace Public API

> **Phase 2.** Answers provisional (recommended defaults) — reconfirm at Phase 2 start.

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §3 (DCSA T&T consumers row), §5 `tracktrace.dcsa` contract + Context Map (CMM → Customers = **Open Host Service + DCSA Published Language**)
2. `docs/enterprise-contracts/async-event-contract-containermovement-status.md` (the internal DCSA-coded event this API exposes)
3. W2-04 outputs (the DCSA journey/movement model)
4. DCSA Track & Trace API spec (external standard — target the published OpenAPI)

## Intent

External customers, BCOs, and visibility providers can track a shipment/container through a **standards-based public API** — DCSA Track & Trace conformant — exposing the movements CMM already records, with authorization so each caller sees only what they're entitled to. **Driver: CMM team.**

## Vertical Slice Definition

One external query end-to-end: an authorized external caller requests events for a `carrierBookingReference` / `equipmentReference` → the API returns **DCSA-conformant** T&T events (transport + equipment events, PLN/EST/ACT classified) → a subscription (thin) pushes a new event when a move is recorded.

- **Layers cut:** public API (OHS) → authorization → CMM query → DCSA response mapping.
- **Thinnest viable form:** pull API for equipment events on one shipment; subscription is a thin webhook proof.
- **Deferred:** full DCSA API surface, rate limiting/quotas, partner API-key management at scale, EST/PLN predictive events.

## In Scope / Out of Scope

- **In:** DCSA-conformant read API (OpenAPI), authorization/scoping per caller, DCSA response mapping from the internal model, a minimal subscription/webhook, no-PII exposure per the contract's security note.
- **Out:** predictive ETA events (P3 candidate), the internal movement capture (W2-04/P2-05).

## Actors & Journey

A customer's visibility system queries "where is my container" and gets DCSA events; on a new discharge, the subscription notifies them — no bespoke integration per customer.

## Cross-Module Seams (must be real)

`tracktrace.dcsa` as an **Open Host Service** (Vision §5) — external, DCSA Published Language. Internally reads CMM's journey/movement store; exposes nothing that isn't already a validated movement.

## Standards Alignment

**DCSA Track & Trace v2.2/3.0** API + event model (`equipmentEventTypeCode`, `eventClassifierCode`, `transportEventTypeCode`, UN/LOCODE, ISO 6346); the API *is* the standard, not a custom shape.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) an authorized `GET` for a tracked container returns DCSA-conformant events matching the recorded movements; (2) an unauthorized caller is scoped out (cannot see another customer's shipment); (3) subscribe → record a new move (W2-04 path) → webhook fires with a conformant event; (4) response carries no PII beyond the shipment references; (5) both audits green + response validated against the DCSA schema.

## Dependencies

W2-04 (DCSA journey/movement model). Independent of other Phase-2 intents.

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) DCSA read API + response mapping live; (U02) authorization/scoping; (U03) subscription/webhook.

## Open Questions

1. Delivery model for this slice?
   - A. Pull (read) API first; thin subscription as a proof (recommended)
   - B. Push subscriptions first
   - C. Both fully now
   - X. Other
   - `[Answer]:` A *(provisional)*
