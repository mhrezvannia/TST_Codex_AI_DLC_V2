# Intent Statement — P2-04 Multi-Leg / Transshipment Routing

> **Phase 2.** Answers provisional (recommended defaults) — reconfirm at Phase 2 start.

## Context Pack (read before starting)

1. `docs/enterprise-contracts/async-event-contract-booking-confirmed.md` §4 (full ordered `routing[]`; first leg load = POL, last leg discharge = POD, intermediate = transshipment/PTS)
2. `docs/erp-business-ui-gap-analysis.md` Part 1.1 (the routing model the aggregate must reach)
3. W1-01 (single-leg spine — this generalises it), W2-04 (CMM move derivation), W2-03 (per-leg pricing)

## Intent

A booking can carry a **multi-leg route with transshipment** (POL → transshipment port(s) → POD), priced across legs, confirmed, and turned by CMM into the correct expected moves at every port including transshipment discharge/load. This delivers the routing the domain and contract always specified but Phase 1 deferred to one leg. **Driver: Booking team (CMM + Charge contribute).**

## Vertical Slice Definition

One two-leg booking end-to-end: create a booking POL→PTS→POD (two legs, a voyage per leg) → priced across legs → confirmed → `booking.confirmed` carries the full `routing[]` → CMM derives moves at POL (load), PTS (discharge + load), POD (discharge) → status flows back per leg.

- **Layers cut:** UI routing builder → API → domain (routing[]) → pricing per leg → **event with full routing** → CMM multi-port derivation → UI.
- **Thinnest viable form:** exactly two legs / one transshipment port.
- **Deferred:** N-leg beyond two in the DoD (model supports N; test with 2), routing changes/rolls (separate).

## In Scope / Out of Scope

- **In:** routing-builder UI (add legs, pick UN/LOCODE ports + voyages), routing[] in the aggregate fully exercised, per-leg pricing, CMM transshipment-move derivation, per-leg status.
- **Out:** re-routing/rolls (Phase-2/3 amendment), stowage/scheduling (out of platform scope).

## Actors & Journey

Customer-service builds a routed booking with a transshipment; operations sees journeys and moves at every port; pricing reflects all legs.

## Cross-Module Seams (must be real)

`booking.confirmed` with full `routing[]` (real event); CMM consumes and derives POL/PTS/POD moves; `pricing.request` carries all legs; `containermovement.status` returns per-leg moves. Schema already supports routing[] — this makes the code fill it.

## Standards Alignment

DCSA routing/transport-plan shape; UN/LOCODE per leg; `voyageId`/`carrierVoyageNumber` per leg; `legSequence` 1-based.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) create a 2-leg booking via the routing builder; (2) price reflects both legs; (3) confirm → `booking.confirmed` on the topic carries both legs with correct load/discharge UN/LOCODEs + voyages; (4) CMM opens a journey with transshipment moves (discharge+load at PTS); (5) status events return per leg and render on the detail routing tab; (6) both audits green.

## Dependencies

W1-01, W2-04, W2-03. Best after W3-03 (amendment reconciliation) but not blocked by it.

## Suggested Scope & Sizing

`feature`. ~4 vertical units: (U01) routing[] aggregate + builder UI (2 legs); (U02) per-leg pricing; (U03) full-routing event + CMM transshipment derivation; (U04) per-leg status render.

## Open Questions

1. Leg cardinality for the DoD?
   - A. General N-leg model, demonstrated with 2 legs / one transshipment (recommended)
   - B. Hard-limit to 2 legs for now
   - X. Other
   - `[Answer]:` A *(provisional)*
