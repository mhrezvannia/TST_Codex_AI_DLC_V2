# Functional Design Questions - U04 Confirm to CMM Journey

## Q1. Initial Canonical Status Fact

U04 must enqueue one contract-valid `containermovement.status` event when CMM opens the journey, before a real movement has been captured. Which fact should represent that state?

A. Emit a planned load fact: `moveCode=LOAD`, `eventClassifierCode=PLN`, `derivedStatus=PLANNED`, `emptyIndicatorCode=LADEN`, `transshipment=false`, POL location, with confirmation time as the planned/received timestamp for the W1 fixture (Recommended)
B. Emit an actual load fact (`ACT`) even though no movement occurred
C. Do not enqueue any status until a later real movement, overriding the U04 acceptance criterion
X. Other (please specify)

[Answer]: A. Emit a planned load fact: `moveCode=LOAD`, `eventClassifierCode=PLN`, `derivedStatus=PLANNED`, `emptyIndicatorCode=LADEN`, `transshipment=false`, POL location, with confirmation time as the planned/received timestamp for the W1 fixture (Recommended)

## Q2. Higher Revision Container Identity

How should CMM handle a higher `bookingRevision` whose single W1 `equipmentId` differs from the existing journey's physical container?

A. Treat physical-container replacement as an unsupported W1 invariant violation and route it to DLT/manual correction; higher revisions may update route/equipment type only when `equipmentId` is unchanged (Recommended)
B. Mutate the existing journey's container reference in place
C. Retire the old journey and create a second journey automatically
X. Other (please specify)

[Answer]: A. Treat physical-container replacement as an unsupported W1 invariant violation and route it to DLT/manual correction; higher revisions may update route/equipment type only when `equipmentId` is unchanged (Recommended)

## Source Context

Questions refine U04 from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. Source verification covers the current synchronous `consumeBookingConfirmed`, flat event model, `ContainerJourney` reconciliation, `MovementStatusEventMapper`, old flat Avro resource, and the enterprise nested schema appendices.
