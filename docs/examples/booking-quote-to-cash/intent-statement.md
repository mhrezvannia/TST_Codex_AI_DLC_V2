<!-- WORKED EXAMPLE — a filled intent-statement using the binding template, populated with real LinerCore data. Copy into a new intent and refine. Open questions are genuine; answer before construction. -->

# Intent Statement — Booking Quote-to-Cash (thin vertical slice)

## Intent

A customer-service agent can take a single booking from request to confirmation and see the container journey open in response — the commercial spine of Journey 1 (Vision §3). This intent makes **one thin path work for real, end-to-end, across all four modules**, and becomes the reference pattern every later intent copies. It is explicitly *not* "build the Booking module."

## Vertical Slice Definition

A single booking flows: **UI create form → Booking API → domain → Postgres → live Reference-Data validation → live Charge pricing → confirm → real `booking.confirmed` event on the broker → CMM consumes it and opens a journey → `containermovement.status` event returns → Booking detail page renders the movement.**

- **Layers cut through:** UI · BFF/API · domain · persistence · sync Charge seam · async CMM event seam (both directions).
- **Thinnest viable form:** one routing leg (POL→POD, no transshipment), one equipment line (type × quantity=1, no container number yet), one currency (USD), FCL dry (no reefer/DG).
- **Explicitly deferred to later intents:** complete party/cargo/schedule/equipment-quantity capture (`W3-04 booking-request-completeness`), multi-leg/transshipment (`P2-04`), container-number assignment and reconfirmation (`W3-03 booking-amendments`), rolls/splits/cancellations, D&D + invoice (`dnd-pricing-and-invoice`), app shell/auth, and design-system foundation.

## In Scope / Out of Scope

- **In:** create/validate/price/confirm booking; DCSA-correct booking aggregate (routing[], equipment[]); real `booking.confirmed` and `containermovement.status` events; CMM journey open; Booking detail rendering movement status.
- **Out:** complete commercial request fields → `W3-04 booking-request-completeness`. D&D and invoicing → `dnd-pricing-and-invoice`. Auth/shell → `app-shell-and-auth`. Full design system → `design-system-foundation`. Amendments/container assignment → `W3-03`; multi-leg routing → `P2-04`.

## Actors & Journey

**Actor:** Customer-service agent (booking desk).
1. Create a draft booking (customer, one routing leg, one equipment line).
2. Validate it against live reference data (party, ports, equipment-type active).
3. Request pricing → Charge returns a quote (live sync call).
4. Confirm → booking becomes CONFIRMED.
5. System emits `booking.confirmed`; CMM opens a journey and emits a status event.
6. Agent opens the booking detail page and sees the journey/movement status.

## Cross-Module Seams (must be real)

| Seam | Contract | Style | Must fire for real |
|---|---|---|---|
| Booking → Charge (pricing) | `pricing.request` / `pricing.result` ([bilateral-contract-booking-charge-pricing.md](../../enterprise-contracts/bilateral-contract-booking-charge-pricing.md)) | Sync API | Real HTTP call to charge-agreement-service; no stub |
| Booking → CMM (confirm) | `booking.confirmed` ([async-event-contract-booking-confirmed.md](../../enterprise-contracts/async-event-contract-booking-confirmed.md)) | **Async event** | Real publish to the broker + real CMM consumer; **placeholder publisher does NOT satisfy DoD** |
| CMM → Booking (status) | `containermovement.status` ([async-event-contract-containermovement-status.md](../../enterprise-contracts/async-event-contract-containermovement-status.md)) | **Async event** | Real event back to Booking; deduped on envelope id |

## Standards Alignment

- Ports: **UN/LOCODE** (`loadUnLocode`, `dischargeUnLocode`), typed value object.
- Equipment type: **ISO 6346 / DCSA** `equipmentTypeCode` (fix the current `equipmentType`/`equipmentTypeId` split).
- Container number (when present later): **ISO 6346** `equipmentId`.
- Booking key: `carrierBookingReference` + `bookingRevision`.
- Move codes on the return event: **DCSA T&T v2.2** `equipmentEventTypeCode` (LOAD/DISC/GTIN/GTOT) + `eventClassifierCode` (PLN/EST/ACT).
- Commit: these names are used in the domain AND on the wire — zero divergence from the .avsc.

## Definition of Done (observed, not "tests pass")

On the **live Docker Compose stack** (Postgres + Kafka + Schema Registry + all services + UIs):
1. Drive create→validate→price→confirm through the running Booking UI/API.
2. Observe a `booking.confirmed` message **on the actual Kafka topic** (schema-registry validated), carrying `routing[]` + `equipment[]` with canonical names.
3. Observe CMM **consume** it and open a journey (row in CMM DB).
4. Observe a `containermovement.status` event return and the Booking **detail page** render the movement.
5. Restart services; verify persistence + idempotency (no dup journeys on redelivery).
6. **Exit gate:** `aidlc-audit` AND `erp-fidelity-audit` both green against this live run; evidence written to `artifacts/`.

## Dependencies

- Knowledge base: Booking + CMM ubiquitous language, context map, DCSA field dictionary (author in `knowledge/` first if absent).
- Reference sets seeded: party-customer, location (UN/LOCODE), equipment-type, currency — **and confirm Vessel/Voyage is seeded** (currently missing; may need a tiny `reference-data-seed` precursor). No dependency on parallel in-flight intents.

## Suggested Scope & Sizing

**Scope: `feature`** (needs the full arc but not enterprise-comprehensive depth; operation phase can follow when it graduates). Estimated **5–6 vertical units** (walking skeleton + create/read, validate-live, price-live, confirm+real-event, status-return+detail-render). See the companion `unit-of-work.md` example.

## Open Questions

1. Vessel/Voyage reference data is required to confirm a booking (vessel, voyage, ETD/ETA) but is not currently seeded. How do we handle it for this slice?
   - A. Add a minimal seeded Vessel/Voyage reference set as U01.5 of this intent (recommended — keeps the slice honest)
   - B. Stub voyage as a free-text field now, model it in a later `reference-data-completeness` intent
   - C. Pull from the external vessel-schedule source now (larger scope)
   - X. Other
   - `[Answer]:`A

2. For pricing in the thin slice, how real should Charge be?
   - A. Real sync call to charge-agreement-service returning a simple agreement-based quote (recommended)
   - B. Real call but a flat/fixed tariff until the `reference-data-completeness` intent adds tariffs/surcharges
   - C. Full tariff+surcharge model now
   - X. Other
   - `[Answer]:`A

3. Confirm the thinnest-viable form (one leg, one equipment line, USD, FCL dry).
   - A. Yes (recommended)
   - B. Include a transshipment leg from the start
   - C. Include reefer/DG indicators now
   - X. Other
   - `[Answer]:`A

4. This slice needs *somewhere* to click. Do we build it on the current per-app booking workbench, or wait for `app-shell-and-auth`?
   - A. Build on the current booking app now with a real list+detail route; migrate into the shell later (recommended — unblocks the vertical slice)
   - B. Sequence `app-shell-and-auth` first, then this slice inside the shell
   - X. Other
   - `[Answer]:`A
