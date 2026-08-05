# Code Generation Memory - returned-status-detail

## Interpretations

- 2026-07-16T14:59:05Z - Treated Booking returned status as a local projection concern, not a Booking aggregate mutation; the design requires the detail page to read Booking-owned projection state and avoid direct CMM reads.
- 2026-07-16T14:59:05Z - Treated the residual `/api/bookings/movement-status` endpoint as incompatible with the Kafka-only normal path; it was removed after the Kafka listener and mapper were in place.

## Deviations

- 2026-07-16T14:59:05Z - Reviewer subagent invocation is unavailable in this Codex surface; an inline review was performed and appended to `code-summary.md`.

## Tradeoffs

- 2026-07-16T14:59:05Z - Added bounded client polling in a small Booking detail component instead of introducing a server-push channel; this satisfies the unit's observation requirement without adding infrastructure outside the intent.
- 2026-07-16T14:59:05Z - Kept Kafka retry/DLT behavior at the current container default in this unit and recorded it as residual risk; changing retry policy globally would exceed the returned-status projection slice.

## Open Questions

- 2026-07-16T14:59:05Z - Confirm in the later build/test gate whether the live Compose run demonstrates `booking.confirmed` to CMM journey creation to `containermovement.status` to Booking projection in one browser-observable flow.
