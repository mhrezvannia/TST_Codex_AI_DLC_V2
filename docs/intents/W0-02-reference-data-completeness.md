# Intent Statement — W0-02 Reference-Data Completeness

## Intent

Every canonical reference entity the Vision names (§4, Shared Platform row) exists, is seeded, and is servable: **Vessel/Voyage/Sailing, Equipment-type, Charge-code** join the existing sets (customer, location, region, currency, commodity, trade-lane) — so downstream intents stop validating against reference sets that don't exist. **Driver: Shared Platform team.**

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §4 (canonical data ownership table)
2. `docs/shared-platform-module-vision.md` (reference-data feature areas)
3. `docs/erp-business-ui-gap-analysis.md` Part 1.3 (what's missing and why it bites)
4. `infrastructure/seeds/shared-platform-mvp-defaults.json` (current seed shape)
5. `contracts/openapi/reference-data-service.yaml`

## Vertical Slice Definition

For each new reference set: schema → seed → repository → API (`/reference-sets/{set}/records`) → visible in the reference-data UI → validatable by a consumer (`activeReference` call succeeds). End-to-end per set, observed live.

- **Thinnest viable form:** Vessel/Voyage as a *static seeded* set (one vessel, two voyages with ETD/ETA on the one MVP trade lane) — the external schedule-source ACL is **not** built here.
- **Deferred:** external vessel-schedule ingestion (ACL — Phase 2/3), capacity/allocation numbers on voyages (W1-01 consumes voyage identity only; capacity modeling arrives with booking-capacity work).

## In Scope / Out of Scope

- **In:** `vessel-voyage`, `equipment-type` (ISO 6346 codes: 22G1, 42G1, 45G1…), `charge-code` sets — modeled, seeded, exposed, rendered in the reference-data workbench, change-history + outbox events like existing sets.
- **Out:** Region/trade-lane redesign; tariffs (Charge-owned → W2-03); schedule-source integration.

## Actors & Journey

Reference-data admin seeds/maintains the sets; Booking (W1-01) validates voyage + equipment-type; Charge (W2-03) references charge-codes.

## Cross-Module Seams (must be real)

`reference-sets` OHS API consumed live by booking-service's `HttpReferenceValidationAdapter`; `referencedata.*.changed` events flow via W0-01's foundation once it lands (parallel-safe: enqueue side exists already).

## Standards Alignment

Ports remain UN/LOCODE; equipment-type codes are **ISO 6346** size/type codes; voyage carries `carrierVoyageNumber` (DCSA OVS naming); currency ISO 4217.

## Definition of Done (observed, not "tests pass")

On live Compose: seed apply is idempotent; `GET /reference-sets/vessel-voyage/records` returns the seeded voyages; the reference-data UI lists all three new sets; a booking-service `activeReference("vessel-voyage", …)` live call succeeds for a seeded id and fails for an unknown one; `erp-fidelity-audit` shows Vessel/Voyage no longer missing.

## Dependencies

None (root). Parallel with W0-01. W1-01 needs only the *minimal* voyage seed, which it also carries internally (per its answered Q1-A) — coordinate to avoid double-seeding: W0-02 owns the canonical seed; W1-01 consumes it if closed, else seeds minimally and reconciles.

## Suggested Scope & Sizing

`feature`, light. ~3 vertical units: (U01) equipment-type set end-to-end; (U02) charge-code set; (U03) vessel-voyage set (schema is richer: vessel, voyage, legs, ETD/ETA).

## Open Questions

1. Does a voyage in the seed carry port-call legs (needed later for multi-leg routing) or just origin/destination + ETD/ETA?
   - A. Just origin/destination + ETD/ETA now; legs added when multi-leg intent arrives (recommended)
   - B. Full port-call rotation now
   - X. Other
   - `[Answer]:` A — voyage seed carries origin/destination + ETD/ETA only; port-call legs added when the multi-leg intent arrives.
