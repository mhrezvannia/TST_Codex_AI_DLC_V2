<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). Fill each section; keep the headings. -->

# Intent Statement — W2-04 Container Journey & Track-Trace

## Context Pack (read before starting)

1. `docs/intents/00-INTENT-BACKLOG.md` — program DAG, Wave A ownership, merge order, serialized acceptance, and the historical W1 waiver.
2. `docs/aidlc-v2-slicing-playbook.md` — vertical-slice and observed-live Definition of Done rules.
3. `docs/intents/W2-04-container-journey-track-trace.md` — authoritative W2-04 statement and answered movement-capture decision.
4. `docs/enterprise-contracts/async-event-contract-containermovement-status.md` and `contracts/avro/containermovement.status.avsc` — producer-owned event meaning and executable wire shape.
5. `docs/program-vision-document.md` §4 — Container Movement ownership, lifecycle, consumers, and exclusions.
6. `docs/erp-business-ui-gap-analysis.md` Part 2 and Appendix — DCSA adoption priority and canonical field names.
7. `services/container-movement-service/` — existing W1 journey intake to refactor, especially `ContainerMovementApplicationService.consumeBookingConfirmed`, `ContainerJourney`, and the Kafka listener configuration.
8. `services/booking-service/` — existing `BookingApplicationService.consumeMovementStatus` projection and Booking detail status surface.
9. `artifacts/w1-01-live/w1-real-pass-20260720-verified/manifest.json` — separate observed live PASS for the adopted W1 seam.
10. `artifacts/w1-01-live/w1-test-acceptance-waiver-20260717/acceptance-waiver.md` and the original blocked manifest it references — historical test-project waiver retained explicitly; neither is rewritten as a real PASS.
11. `design-system/linercore/MASTER.md`, `design-system/linercore/SESSION-PROMPT.md`, and `design-system/linercore/pages/container-movement.md` when present — binding shared-shell and Container Movement page contract.

## Intent

Equipment-control operations gains one trustworthy, DCSA-coded container journey that begins when an existing confirmed booking arrives, distinguishes expected from actual moves, enforces the thin lifecycle, and makes the resulting progression visible both in Container Movement and on the related Booking. This closes the documented gap between DCSA-aware contracts and non-DCSA implementation while extending, not replacing, the real W1 booking-to-journey seam. The primary beneficiary is the equipment-control clerk; customer service is the secondary beneficiary that sees the same operational truth on Booking.

## Vertical Slice Definition

Drive one confirmed one-leg booking through the running system: the real `booking.confirmed` event opens or reconciles its container journey; routing derives expected LOAD at POL and DISC at POD; an equipment-control clerk records ACT-classified GTOT, LOAD, DISC, and GTIN movements; validation accepts the next legal move and rejects duplicates or out-of-sequence input with visible evidence; each accepted move changes lifecycle state and publishes a real `containermovement.status`; Booking consumes, deduplicates, projects, and renders the movement; the Container Movement detail page shows expected and actual milestones together.

- **Layers cut through:** shared-shell Container Movement UI · API · domain value objects and lifecycle rules · service-owned persistence · Kafka/Schema Registry contract seam · Booking consumer and detail projection · live evidence.
- **Thinnest viable form:** one booking, one assigned container, one routing leg, POL/POD expected moves, ACT classifier only, and journey codes GTOT, LOAD, DISC, GTIN plus returned-empty completion.
- **Explicitly deferred to later intents:** EDI movement ingestion (`P2-05`), public DCSA Track & Trace API (`P2-02`), multi-leg/transshipment routing (`P2-04`), fleet registry depth (`P3-03` where applicable), depot stock, condition/lease breadth, and M&R workflows.

## In Scope / Out of Scope

**In scope**

- Create or reconcile the journey from the adopted real `booking.confirmed` consumer.
- Derive and persist expected POL LOAD and POD DISC moves for the one-leg form.
- Represent DCSA equipment event code, ACT classifier, laden/empty indicator, UN/LOCODE, and ISO 6346 equipment reference as explicit domain language.
- Capture manual movements through the Container Movement API and shared-shell UI.
- Enforce Allocated → Gated-out → In-transit → Discharged → Returned-empty lifecycle progression and produce observable rejection evidence.
- Publish the producer-owned `containermovement.status` wire shape and prove Booking receipt, dedupe/stale handling, projection, and rendering.
- Deliver only Container Movement list/detail/timeline page composition and its page-specific design record.

**Out of scope**

- Terminal, depot, or partner EDI ingestion — `P2-05`.
- Public customer Track & Trace/Open Host Service — `P2-02`.
- Multi-leg and transshipment routing — `P2-04`.
- Fleet ownership/lease registry depth, depot inventory/stock, condition and lease movement breadth, M&R operations, and D&D calculation or move classification.
- Changes to the shared shell, shared tokens/primitives, or Booking's broad design-system migration, which remain W2-02/shared owners' responsibility.

## Actors & Journey

1. A booking-desk user confirms a one-leg booking with one equipment assignment; the established broker path emits `booking.confirmed`.
2. Container Movement consumes the event idempotently, validates route references, opens or reconciles one journey, and derives expected LOAD/DISC milestones.
3. An equipment-control clerk opens the canonical `/container-movement` route, finds the journey, reviews expected milestones, and records the next actual DCSA move.
4. The system validates code, classifier, container, location, uniqueness, and sequence; it preserves entered data and explains any rejection.
5. An accepted move advances lifecycle state, appears on the actual timeline, and emits `containermovement.status` with the originating correlation evidence.
6. Booking consumes and deduplicates the event, projects current progression, and presents it to a customer-service agent on Booking detail.
7. A release-review role observes the broker-to-database-to-Booking path, duplicate/out-of-sequence rejection, responsive UI evidence, and both audits on the isolated acceptance stack.

## Cross-Module Seams (must be real)

- **Booking → Container Movement:** `booking.confirmed`, governed by `contracts/avro/booking.confirmed.avsc` and its AsyncAPI/message-pact assets. The existing Kafka listener and transactional application boundary remain the normal path; no synchronous HTTP substitute or local-noop evidence counts.
- **Container Movement → Booking:** `containermovement.status`, governed by `contracts/avro/containermovement.status.avsc`, `contracts/asyncapi/container-movement-events.yaml`, and `docs/enterprise-contracts/async-event-contract-containermovement-status.md`. It is producer-owned by CMM; Booking conforms and co-signs any envelope/field change.
- **Container Movement → Shared Reference Data:** existing stable location/equipment references remain service-owned seams. This intent consumes them and does not duplicate master data.
- **UI integration:** Container Movement owns domain composition inside the canonical shared-shell route. W2-02 owns `packages/ui` and the shell; W2-04 synchronizes after W2-02 lands and does not redesign those surfaces.

## Standards Alignment

- DCSA Track & Trace v2.2 equipment-event vocabulary is the operational language: GTOT, LOAD, DISC, and GTIN for the thin slice; ACT is the only enabled classifier.
- DCSA canonical domain names include `equipmentEventTypeCode`, `eventClassifierCode`, and `emptyIndicatorCode`; the producer-owned v1 event contract exposes the equipment code as the `moveCode` wire field. Any envelope/field rename requires BACKWARD compatibility evidence and producer/consumer sign-off.
- UN/LOCODE identifies movement locations; ISO 6346 `equipmentReference` identifies the container.
- Status meaning is never conveyed by color alone in the UI; DCSA code and readable label remain visible together.

## Definition of Done (observed, not "tests pass")

On the isolated `linercore-wave-a` Compose project, with the manager demo at port 8088 protected and `npm run demo:guard` green before and after:

1. Confirm one booking and observe a real Schema-Registry-valid `booking.confirmed` on the broker create one persisted journey with POL LOAD and POD DISC expected moves.
2. Use the running Container Movement UI to capture GTOT → LOAD → DISC → GTIN/returned-empty ACT movements and observe each legal lifecycle transition in the database and timeline.
3. Observe every accepted movement as a real, DCSA-coded `containermovement.status` on the broker and as an applied Booking database projection rendered on Booking detail.
4. Re-submit a duplicate and attempt at least one out-of-sequence move; observe a stable rejection/dedupe response, audit evidence, and no incorrect lifecycle or Booking progression.
5. Provide Playwright evidence for populated, loading, empty, error/retry, denied, validation, success, keyboard-focus, light/dark, and 375/768/1024/1440 responsive states on the canonical shared-shell routes.
6. Run targeted quality/contract checks plus `aidlc-audit` and `erp-fidelity-audit`; both audits are green and ERP detector 4 reports DCSA present in code at the real seams.
7. Retain the historical W1 waiver and original BLOCKED manifest unchanged; the separate later W1 PASS and this intent's new evidence remain distinct records.

## Dependencies

- **Closed W0-01:** real Kafka, Schema Registry, shared outbox relay, scheduler, and safety foundation.
- **Closed W1-01:** real `booking.confirmed` consumption, journey opening, reverse status consumer/projection, and the separate 2026-07-20 live PASS. Its 2026-07-17 waiver remains historical evidence, not a substitute PASS.
- **Wave A synchronization:** W2-02 must merge first because it owns the shared UI primitives/master. W2-04 may progress independently on owned code and artifacts but synchronizes with integration before final visual/live acceptance. W2-03 remains a parallel, disjoint intent.
- **Acceptance serialization:** only one Wave A session may control the isolated live Compose acceptance stack at a time.

## Suggested Scope & Sizing

Use AI-DLC `feature` scope at Standard depth and Standard test strategy. The slice changes existing Java/Spring services, contracts, persistence, a Next.js module UI, and two live asynchronous seams; all lifecycle stages and explicit human gates are warranted, while enterprise-scale market, organization, and regulatory expansion is not. Plan roughly four vertical Units: (U01) journey creation plus expected moves; (U02) manual DCSA movement capture plus lifecycle/rejection; (U03) real status publication through Booking projection; (U04) Container Movement list/detail/timeline and full isolated acceptance.

## Open Questions

1. Confirm the manual movement-capture surface for this thin slice.
   - A. Container Movement shared-shell UI form plus API (recommended)
   - B. API only
   - X. Other (please specify)
   - `[Answer]:` A. Container Movement shared-shell UI form plus API — inherited from the authoritative W2-04 intent statement.

2. Confirm final visual/live acceptance timing relative to the Wave A design-system intent.
   - A. Synchronize after W2-02 merges, then run serialized isolated acceptance (recommended)
   - B. Accept final visuals before W2-02 merges
   - X. Other (please specify)
   - `[Answer]:` A. Synchronize after W2-02 merges, then run serialized isolated acceptance — supplied in the initiating request.
