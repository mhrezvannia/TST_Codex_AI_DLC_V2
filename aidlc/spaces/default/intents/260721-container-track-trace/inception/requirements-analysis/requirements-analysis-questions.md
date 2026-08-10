# Requirements Analysis Questions - W2-04

## Q1. Status-event sequence compatibility

- A. Add an optional/defaulted non-negative `sequenceNumber` to the producer-
  owned v1 Avro/AsyncAPI/Pact contract and Booking projection, with BACKWARD
  compatibility and producer/consumer co-sign (recommended)
- B. Keep the wire contract unchanged and infer sequence only from movement code
  and occurrence time
- C. Introduce a breaking v2 event immediately
- X. Other (please specify)
- `[Answer]:` A. Add a defaulted non-negative `sequenceNumber` to v1 with BACKWARD compatibility and co-sign.

## Q2. Booking confirmation channel naming

- A. Preserve physical topic `booking.events` and make the logical
  `booking.confirmed` envelope/channel mapping explicit in contracts and
  evidence (recommended)
- B. Rename the physical Kafka topic to `booking.confirmed` in W2-04
- C. Add a second topic and dual-publish indefinitely
- X. Other (please specify)
- `[Answer]:` A. Preserve `booking.events` and make the logical envelope mapping explicit.

## Q3. Manual duplicate response

- A. Return stable HTTP 409 `DUPLICATE_MOVEMENT` with the original movement
  reference/correlation while keeping journey, outbox, and Booking unchanged;
  broker replays remain successful idempotent dedupe (recommended)
- B. Return HTTP 200 with the current journey for manual duplicates
- C. Accept and append another movement
- X. Other (please specify)
- `[Answer]:` A. Return HTTP 409 `DUPLICATE_MOVEMENT` with original evidence and unchanged state.

## Q4. Booking projection depth

- A. Keep Booking's latest per-container movement projection plus durable event
  receipts/sequence; the complete expected/actual history remains CMM-owned
  (recommended)
- B. Duplicate the complete CMM movement timeline into Booking
- C. Make Booking query the CMM database directly
- X. Other (please specify)
- `[Answer]:` A. Keep Booking's latest projection plus durable receipts and sequence.

## Q5. Observable propagation target

- A. Require an accepted movement to appear in the Booking projection/UI within
  30 seconds on the healthy isolated local stack, with pending then applied
  states observable (recommended)
- B. Require 5 seconds
- C. Define no measurable propagation target
- X. Other (please specify)
- `[Answer]:` A. Require Booking projection/UI within 30 seconds on the healthy isolated stack.

## Q6. Capture authorization

- A. Reuse authenticated identity seams with separate read and capture
  permissions; unauthorized capture is 403 and produces no movement/outbox
  state (recommended)
- B. Allow any authenticated user to capture movements
- C. Retain actor query/body values as authorization
- X. Other (please specify)
- `[Answer]:` A. Reuse identity with separate read and capture permissions.

## Upstream sources

These questions reconcile `intent-statement.md`, `scope-document.md`,
`business-overview.md`, `architecture.md`, `code-structure.md`, and
`team-practices.md`.
