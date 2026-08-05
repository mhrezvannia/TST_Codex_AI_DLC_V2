# Frontend Components - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

This UI design implements U02 in `unit-of-work.md` and
`unit-of-work-story-map.md`, FR-04 through FR-13 in `requirements.md`, and the
`components.md`, `component-methods.md`, and `services.md` API/result contracts.

## Component Evolution

U02 extends the U01 CMM detail route and `CaptureMovementPanel`; it creates no
new shell or shared package. `MovementTimeline` renders only expected and
accepted GTOT/LOAD/DISC/GTIN items. Rejection evidence stays in
`CaptureOutcomeSummary` and the collapsed audit surface. Booking's existing latest
panel renders sequence/lifecycle/location and durable pending/applied/retry/
degraded presentation only.

## Capture Result Model

The client consumes a tagged response union:

- accepted: required journey, movement, publication `pending|published`, and
  correlation;
- validation: required field errors, summary, correlation, and preserved input;
- duplicate: required `DUPLICATE_MOVEMENT`, reason, correlation, current
  lifecycle, required next, and preserved input; original movement/rejection is
  optional;
- sequence conflict: required `OUT_OF_SEQUENCE_MOVEMENT`, current lifecycle,
  required next, correlation, and preserved input;
- denied: required 403 code, correlation, and preserved input;
- dependency unavailable: required retryable dependency code, correlation,
  retry guidance, and preserved input.

Draft form state is local and preserved for every non-accepted result. Accepted
responses revalidate server reads. Duplicate/sequence responses focus the
summary, announce through live-region semantics, identify recovery, and do not
optimistically alter lifecycle.

## Validation and Interaction

Operator fields support only GTOT/LOAD/DISC/GTIN and ACT; empty indicator is
constrained by code. The operator enters code, equipment, location, occurred
time, and empty state. The BFF adds authenticated source `container-service`,
correlation ID, and an idempotency key stable across an uncorrected retry and
replaced only after correction.
Client checks mirror obvious shape constraints, while server/reference/domain
results remain authoritative. Correcting one field leaves unaffected values.

## Timeline and Booking Presentation

Timeline ordering uses movement sequence and separates expected from actual;
rejection evidence is not a timeline item. Audit IDs remain collapsed.
Booking displays latest-only applied code/classifier/lifecycle/equipment/
location/occurred time and canonical CMM resolver link. Its state comes only
from Booking-owned receipt processing, latest projection, and consumer-health
records: PROCESSING=pending, APPLIED+matching projection=applied,
RETRYABLE=delayed/retry, and unhealthy/permanent failure=degraded. Receipt
dispositions are evidence, not a duplicated timeline; pre-receipt publication
pending is shown only by CMM.

## Operational States and Accessibility

Pending disables repeat submit and announces progress. Success moves focus to
updated lifecycle/next action. Validation and 409 states use top summary plus
field/next-action links, retain values, and use text/icon semantics rather than
color. Accepted replay refreshes CMM state. Rejected replay/key conflict retains
values and requires a new key only after correction. Sequence conflict
highlights the required next move. Booking status updates only asynchronously
through Booking's service/UI; CMM capture never synchronously refreshes it.
Long IDs wrap; keyboard/read order stays header -> summary -> timeline ->
capture -> related Booking link. Responsive/theme proof remains at the intent
Exit Gate using existing shared tokens.

## API Integration

- `GET /api/container-movement/journeys/{journeyId}` for refreshed timeline.
- `POST /api/container-movement/journeys/{journeyId}/movements` for typed capture results.
- Booking consumes its owned latest projection API; no browser-to-Kafka or synchronous status query exists.
