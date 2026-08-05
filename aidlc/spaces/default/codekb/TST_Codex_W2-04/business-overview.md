# Business Overview

## Business Domain and Purpose

LinerCore is an internal liner-shipping carrier ERP. The repository implements four explicit bounded contexts: Shared Platform, Charge Calculation and Customer Agreement, Customer Booking, and Container Movement Management (CMM). Shared Platform supplies identity, reference data, and event transport; the three business contexts own their data and communicate through HTTP contracts or asynchronous events rather than cross-database queries.

The active W2-04 slice concerns CMM's operational responsibility: open a container journey from a confirmed booking, derive the moves expected for a one-leg route, capture actual equipment movements with DCSA Track & Trace vocabulary, advance the container lifecycle, publish status facts, and let Booking present the resulting progression. The primary users are equipment-control operations clerks and customer-service users.

## Current Business Capabilities

| Capability | Current implementation | Principal evidence |
|---|---|---|
| Booking confirmation | Booking confirms a priced booking and creates a canonical `booking.confirmed` outbox fact. | `services/booking-service/domain-core/.../BookingEventMapper.java`, `contracts/avro/booking.confirmed.avsc` |
| Journey intake | CMM consumes the confirmation, authorizes the source, deduplicates, validates route locations, and creates or reconciles one journey. | `services/container-movement-service/messaging/.../KafkaBookingConfirmedListener.java`, `.../ContainerMovementApplicationService.java` |
| Journey reads | CMM exposes list, detail, and booking-to-journey lookup endpoints. | `services/container-movement-service/container/.../ContainerMovementApiController.java` |
| Movement capture | CMM accepts a generic movement event, validates container/location/time, persists it, and enqueues a status event. | `services/container-movement-service/application-service/.../ContainerMovementApplicationService.java` |
| Status return | CMM publishes `containermovement.status`; Booking consumes it into durable receipt and latest-status projection tables. | `.../MovementStatusEventMapper.java`, `.../KafkaContainerMovementEventPublisher.java`, `services/booking-service/.../KafkaContainerMovementStatusListener.java` |
| Booking display | Booking detail polls its own projection and shows pending, delayed, retry, and latest-status states. | `apps/booking/app/bookings/[bookingId]/JourneyStatusPanel.tsx` |

The current repository already proves the bidirectional asynchronous seam established by W1-01, but its CMM business model is generic. `ContainerJourney` derives `PLANNED_DEPARTURE`/`ESTIMATED_ARRIVAL`, accepts generic departure/arrival/delivery events, and uses `PLANNED`, `IN_TRANSIT`, `ARRIVED`, `DELIVERED`, and `EXCEPTION`. It does not yet model the W2-04 DCSA journey sequence `GTOT -> LOAD -> DISC -> GTIN` or the required lifecycle states `Allocated -> Gated-out -> In-transit -> Discharged -> Returned-empty`.

## W2-04 Business Delta

W2-04 must evolve the existing seams rather than replace them:

- derive one-leg expected `LOAD` at POL and `DISC` at POD from `booking.confirmed.routing`;
- capture ACT-classified DCSA equipment moves `GTOT`, `LOAD`, `DISC`, and `GTIN`, with sequence and empty/laden facts;
- reject duplicate and out-of-sequence commands observably while leaving journey, outbox, and Booking projection unchanged;
- publish every accepted move on `containermovement.status` and persist the Booking-side consumption result;
- add CMM-owned list/detail/timeline/capture pages inside the shared authenticated shell;
- show expected and actual movement history, not only the latest Booking projection.

This is the thinnest one-container, one-leg operational journey. It deliberately does not expand the business into EDI ingestion, a public DCSA API, multi-leg/transshipment routing, fleet registry depth, depot stock, leasing administration, or maintenance-and-repair workflows.

## Actors and Outcomes

| Actor | Goal | Observable outcome |
|---|---|---|
| Equipment-control operations clerk | Find a journey and record the next physical move. | The accepted DCSA move appears in the CMM timeline and advances lifecycle state. |
| Equipment-control operations clerk | Understand why a command failed. | Duplicate or sequence rejection has a stable reason/correlation and no hidden state change. |
| Customer-service user | Follow container progress from the booking. | Booking detail shows the consumed movement progression from Booking-owned persistence. |
| Release reviewer/auditor | Verify the seam is real and contract-true. | Broker, Schema Registry, both service databases, UI, and audit evidence correlate end to end. |

## Ownership and Scope Boundaries

CMM owns journeys, movement validation, lifecycle derivation, the CMM database, the CMM pages, and production of `containermovement.status`. Booking owns booking confirmation, assignment validation, event receipts/projections, and Booking detail. Shared Platform owns Kafka, Schema Registry, identity, reference data, and the manager demo topology. W2-02 owns `packages/ui`, shared tokens/primitives, and the global shell; W2-04 consumes those assets and records only Container Movement page additions.

Normal cross-module delivery is Kafka-only. Booking must not call CMM synchronously to deliver `booking.confirmed`, CMM must not call Booking synchronously to deliver movement status, and neither service may read the other's database.

## Acceptance and Evidence Constraints

Completion is an observed live vertical flow, not merely passing tests. The Wave A session must use `scripts/wave-a-compose.mjs` with Compose project `linercore-wave-a`, serialize access to that stack, and run `npm run demo:guard` before and after. The continuously available manager demo `linercore-shared-platform` at `127.0.0.1:8088` is protected.

Historical W1 evidence is intentionally non-destructive. The 2026-07-16 blocked live record and the 2026-07-17 test-acceptance waiver remain BLOCKED/waived evidence; they are not retroactively changed to PASS. A separate 2026-07-19/20 record reports a later real-stack PASS and adds chronology without rewriting the earlier records. W2-04 must produce its own broker-to-database-to-Booking proof, Playwright evidence, `aidlc-audit`, and `erp-fidelity-audit` results.
