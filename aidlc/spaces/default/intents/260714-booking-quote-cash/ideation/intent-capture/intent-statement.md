# Intent Statement - W1-01 Booking Quote-to-Cash

## Context Pack (read before starting)

1. `docs/intents/00-INTENT-BACKLOG.md` - program DAG, ownership, dependency, exit, and merge protocol.
2. `docs/aidlc-v2-slicing-playbook.md` - vertical-intent and vertical-unit rules.
3. `docs/examples/booking-quote-to-cash/intent-statement.md` - answered worked example and agreed thin-slice boundary.
4. `docs/program-vision-document.md` - Journey 1 business outcome, bounded contexts, and ownership.
5. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md` - live synchronous Booking-to-Charge pricing behavior.
6. `docs/enterprise-contracts/async-event-contract-booking-confirmed.md` - producer-owned Booking-to-CMM event contract.
7. `docs/enterprise-contracts/async-event-contract-containermovement-status.md` - producer-owned CMM-to-Booking event contract.
8. `docs/codex-review-findings.md`, `docs/erp-business-ui-gap-analysis.md`, and `docs/erp-workflow-map.md` - verified runtime, domain, field-name, and UI gaps.
9. `docs/intents/W0-01-platform-eventing-foundation.md`, `artifacts/w0-01-live/README.md`, and `artifacts/w0-01-live/assertions.json` - closed eventing prerequisite and real broker proof.
10. `docs/intents/W0-02-reference-data-completeness.md` and `artifacts/w0-02-live/live-proof-summary.json` - closed reference-data prerequisite and canonical seeded sets.
11. Booking entry points: `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/BookingApplicationService.java`, `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`, and the HTTP integration adapters under the same container module.
12. Charge and CMM entry points: `services/charge-agreement-service/application-service/src/main/java/com/linercore/platform/chargeagreement/applicationservice/ChargeAgreementApplicationService.java`, `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/ChargeAgreementApiController.java`, `services/container-movement-service/application-service/src/main/java/com/linercore/platform/containermovement/applicationservice/ContainerMovementApplicationService.java`, and `services/container-movement-service/container/src/main/java/com/linercore/platform/containermovement/container/api/ContainerMovementApiController.java`.
13. Wire and UI entry points: `services/booking-service/messaging/src/main/resources/avro/booking.confirmed.avsc`, `services/container-movement-service/messaging/src/main/resources/avro/containermovement.status.avsc`, `apps/booking/app/BookingWorkbench.tsx`, and `compose.yaml`.

## Intent

A booking-desk agent can create, validate, price, and confirm one booking and then see the CMM journey status on the booking detail view. The complete journey crosses the real Reference Data, Charge, Booking, Kafka/Schema Registry, and CMM boundaries without manual re-keying or request-path delivery shortcuts. This is the thin commercial spine that later booking amendment, track-and-trace, D&D, and operations intents extend.

## Vertical Slice Definition

A single booking flows through: Booking UI create action -> Booking API and domain -> Booking Postgres -> live Reference Data validation -> live Charge pricing -> transactional confirmation and outbox -> real `booking.confirmed` Kafka event -> CMM consumer and journey persistence -> real `containermovement.status` Kafka event -> Booking status projection -> Booking detail rendering.

- **Layers cut through:** UI, API, domain, persistence, synchronous Reference Data and Charge seams, shared outbox relay, Kafka and Schema Registry, CMM consumer, return event, and Booking read model.
- **Thinnest viable form:** one direct POL-to-POD routing leg, one dry FCL equipment line with quantity one, USD pricing, no physical container number required at initial confirmation.
- **Explicitly deferred to later intents:** app shell and authentication (`W2-01`), full shared design-system migration (`W2-02`), full tariffs and agreements (`W2-03`), operational track-and-trace breadth (`W2-04`), D&D pricing and invoicing (`W3-01` and `W3-02`), amendments and re-confirmation (`W3-03`), multi-leg routing (`P2-04`), and reefer/DG parameters (`P2-06`).

## In Scope / Out of Scope

**In scope**

- Model one Booking aggregate with contract-true `carrierBookingReference`, `bookingRevision`, `routing[]`, and `equipment[]` concepts.
- Validate customer, locations, vessel/voyage, equipment type, commodity, and currency against live canonical Reference Data where the thin request requires them.
- Request and persist one real Charge quote through the frozen synchronous pricing contract.
- Confirm atomically with its outbox record and publish the contract-exact `booking.confirmed` event through the W0 shared relay.
- Consume `booking.confirmed` in CMM idempotently, open or upsert the journey, and emit `containermovement.status` through the real relay.
- Consume the return status in Booking with envelope-id dedupe and stale-event protection.
- Provide a real Booking list-to-detail path that renders booking summary, routing, equipment, pricing, lifecycle state, and linked movement status with loading, empty, error, and not-found states.
- Remove the Booking-to-CMM synchronous confirmation delivery path from the live journey; Kafka is the authoritative seam.

**Out of scope**

- Authentication, global shell, and removal of development-only `local-user` behavior; owned by `W2-01`.
- Full visual-system migration; owned by `W2-02`.
- Multi-leg or transshipment routing; owned by `P2-04`.
- Booking rolls, splits, cancellation, and general amendment workflows; owned by `W3-03` and `P2-03`.
- D&D rules, D&D pricing, and invoice emission; owned by `W3-01` and `W3-02`.
- External DCSA Open Host Service and operational EDI ingestion; owned by `W2-04`, `P2-02`, and `P2-05`.
- Detailed reefer and dangerous-goods parameters; owned by `P2-06`.

## Actors & Journey

**Primary actor:** booking-desk or customer-service agent.

1. The agent creates a draft booking with a customer, one routing leg, one vessel/voyage, one equipment line, commodity, dates, and USD currency.
2. Booking validates every canonical reference against the live Reference Data service.
3. Booking sends a real pricing request to Charge and stores the returned quote and pricing basis.
4. The agent confirms the priced booking.
5. Booking commits the state transition and outbox record atomically, and the W0 relay publishes `booking.confirmed` to Kafka using the registered schema.
6. CMM consumes the event, dedupes it, opens or upserts the journey, and emits `containermovement.status` through its outbox and relay.
7. Booking consumes the return event, updates its status projection idempotently, and preserves event ordering rules.
8. The agent opens the Booking detail page and sees the persisted booking, routing, equipment, quote, confirmation state, and CMM journey status.

## Cross-Module Seams (must be real)

| Seam | Governing contract | Runtime style | Required proof |
|---|---|---|---|
| Booking -> Reference Data | canonical set APIs from W0-02 | Synchronous HTTP | Live validation of the selected customer, locations, voyage, equipment type, commodity, and currency |
| Booking -> Charge | `pricing.request` / `pricing.result` | Synchronous HTTP | Real call to Charge with persisted quote result; no booking-side price stub |
| Booking -> CMM | `booking.confirmed` | Async Kafka + Avro + Schema Registry | Contract-exact event on `booking.confirmed`, consumed by CMM; no synchronous confirmation delivery |
| CMM -> Booking | `containermovement.status` | Async Kafka + Avro + Schema Registry | Contract-exact return event consumed and projected by Booking with envelope-id dedupe |

## Standards Alignment

- Booking identity uses `carrierBookingReference` with monotonic `bookingRevision`; wire mappings must not silently rename the contract fields.
- Routing uses ordered legs with `legSequence`, `loadUnLocode`, `dischargeUnLocode`, and the voyage reference required by the authoritative `.avsc`.
- Equipment uses `equipmentTypeCode`, `quantity`, and nullable `equipmentId`; `equipmentId` is ISO 6346 when present.
- Location values use UN/LOCODE and equipment types use the canonical ISO/DCSA codes supplied by Reference Data.
- Movement status uses the exact authoritative schema names, including DCSA T&T v2.2 move and classifier vocabulary where present in the contract.
- Domain, persistence, API mapping, event mapping, and UI labels must remain traceable to these published names; adapter DTO differences require explicit mappings and tests.

## Definition of Done (observed, not "tests pass")

On the live Docker Compose stack, using a non-default PostgreSQL host port because port 5432 is reserved:

1. Create one booking, validate it against live Reference Data, obtain a real Charge quote, and confirm it through the running Booking UI/API.
2. Verify Booking state and its outbox record were committed atomically and the request path did not deliver confirmation to CMM over synchronous HTTP.
3. Observe a Schema Registry-valid `booking.confirmed` record on the real topic with contract-exact routing and equipment fields.
4. Observe CMM consume it and persist exactly one journey for the booking revision.
5. Observe a Schema Registry-valid `containermovement.status` record return on the real topic and Booking persist/project it.
6. Open the Booking detail route in a browser and verify the correct booking, route, equipment, price, confirmation state, and CMM status render across loading, populated, and error/not-found states.
7. Restart the services and redeliver both event types; verify persistence survives and no duplicate journey or duplicate Booking status projection is created.
8. Run service tests, contract/serde tests, frontend tests, typecheck/lint, and the repository quality gates with no regressions.
9. Run `.claude/skills/aidlc-audit` and `.claude/skills/erp-fidelity-audit`; both detectors must be green against the live evidence.
10. Commit machine-readable and human-readable evidence under `artifacts/w1-01-live/`; only then is W1-01 eligible to merge.

## Dependencies

- **W0-01 Platform eventing foundation - closed.** The shared Kafka publisher, Schema Registry adapter, scheduled outbox relay, profiles, schemas, and live proof are present under `artifacts/w0-01-live/`.
- **W0-02 Reference-data completeness - closed.** Vessel/voyage, equipment type, and charge code are seeded and proven live under `artifacts/w0-02-live/`.
- The three enterprise contracts listed in the Context Pack are frozen inputs for this intent. Contract changes require producer and consumer ownership review rather than unilateral edits by the Booking driver.
- No in-flight intent is required to close W1-01. App shell, design system, broader Charge modeling, and broader CMM tracking remain explicitly deferred.

## Suggested Scope & Sizing

Use AI-DLC scope `feature` at Standard depth. The work is a brownfield, cross-module vertical feature that needs the full design-to-operation arc, but it is intentionally thinner than an enterprise program. Plan approximately six vertical units: contract-true booking model, create/read detail, live validation, live pricing, confirm/event/CMM journey, and status-return/detail proof. Each unit must carry its domain, persistence, API, UI, and test work needed for an observable increment.

## Open Questions

All Intent Capture questions are resolved in `intent-capture-questions.md`.

1. Confirm the business outcome.
   - A. Real booking spine across all required modules (selected)
   - X. Other
   - `[Answer]:` A
2. Confirm the thin booking shape.
   - A. One leg, one dry FCL equipment line, quantity one, USD (selected)
   - X. Other
   - `[Answer]:` A
3. Confirm the exit evidence.
   - A. Live journey, restart/redelivery idempotency, quality gates, and both audits (selected)
   - X. Other
   - `[Answer]:` A
