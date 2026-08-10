# Intent Statement — P2-05 Operational Movement Ingestion (CODECO/COARRI EDI)

> **Phase 2.** Answers provisional (recommended defaults) — reconfirm at Phase 2 start.

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §3 (Terminals/depots EDI row), §5 `movement.ingest.edi` + Context Map (Terminals/depots → CMM = **Anti-Corruption Layer**)
2. `docs/enterprise-contracts/async-event-contract-containermovement-status.md` (DCSA move codes the ACL maps to)
3. W2-04 outputs (journey/movement model + validation), W2-04 manual capture (this automates it)

## Intent

Container movements can arrive **automatically from terminals and depots** via EDI (UN/EDIFACT CODECO gate moves, COARRI load/discharge) instead of only manual capture: an ACL translates each message into a validated canonical DCSA movement on the right journey, which then flows to Booking as usual. **Driver: CMM team.**

## Vertical Slice Definition

One inbound EDI movement end-to-end: a sample CODECO/COARRI message lands → **ACL** maps it to a canonical DCSA move (`equipmentEventTypeCode`, classifier, empty/laden) → matched to the journey by `equipmentReference` → validated/sequenced → journey updated → `containermovement.status` to Booking.

- **Layers cut:** external ingest → ACL/mapping → CMM validation → journey update → **status event** → Booking.
- **Thinnest viable form:** CODECO gate-out + COARRI discharge, file/queue drop, one terminal profile.
- **Deferred:** live VAN/AS2 transport, the full CODECO/COARRI message surface, reconciliation of conflicting sources.

## In Scope / Out of Scope

- **In:** ACL parser + DCSA mapping, journey matching by container number, existing validation/sequencing reused, reject/hold for unmatched or malformed messages, dedupe across manual+EDI sources.
- **Out:** the transport layer (simulated), booking intake EDI (P2-01).

## Actors & Journey

A terminal's system reports a gate-out; the movement appears on the right journey without a clerk typing it; an unmatched message is held for review, not dropped.

## Cross-Module Seams (must be real)

`movement.ingest.edi` via ACL (Vision §5); downstream reuses W2-04's `containermovement.status` real event to Booking unchanged. Mapping doc frozen with sign-off.

## Standards Alignment

UN/EDIFACT **CODECO/COARRI** inbound → mapped to **DCSA** move vocabulary; messy external codes never leak past the ACL (the "movements arrive messy" defence).

## Definition of Done (observed, not "tests pass")

On live Compose: (1) drop a CODECO gate-out → the move appears on the matching journey, DCSA-coded; (2) drop a COARRI discharge → likewise; (3) `containermovement.status` fires to Booking for each; (4) an unmatched-container message is held with a coded reason (no phantom journey); (5) the same move from manual + EDI does not double-count (dedupe); (6) both audits green.

## Dependencies

W2-04. Independent of other Phase-2 intents.

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) ACL parse+map CODECO→canonical move on journey; (U02) COARRI + status event out; (U03) unmatched/dedupe/hold handling.

## Open Questions

1. Message source for this slice?
   - A. File/queue drop with the **real** ACL mapping (recommended — proves mapping, defers transport)
   - B. Live VAN/AS2 now
   - X. Other
   - `[Answer]:` A *(provisional)*
