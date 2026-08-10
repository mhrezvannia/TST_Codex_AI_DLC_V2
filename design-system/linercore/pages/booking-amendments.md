# Booking Amendments Page Contract

## Authority and routes

W3-03 extends the established Booking list/detail design and the approved W3-04
Booking Request Completeness field baseline. W3-04 owns the canonical request
fields and create/detail composition; W3-03 owns amendment, commercial re-gating,
revision increment, and reconfirmation. CMM reconciliation is downstream
evidence, not an editable Booking form section.

| Route/surface | Purpose |
|---|---|
| `/booking/[bookingId]` | Expose permitted Amend action, current revision, propagation state, and amendment history |
| `/booking/[bookingId]/amend` | Edit the allowed equipment fields, review changes, and reconfirm |

## Task flow

1. Start Amend from a confirmed Booking detail action rail.
2. Edit equipment quantity or assign a validated ISO 6346 container number.
3. Validate on blur while preserving entered values.
4. Review an explicit current-versus-proposed change set and repricing outcome.
5. Confirm reconfirmation with current revision and expected next revision.
6. Show Booking revision/event success separately from downstream CMM applied,
   delayed, failed, stale-replay-ignored, or degraded evidence.

Routing changes, cancellation, split, roll, and amendment fees are absent rather
than disabled promises.

## Page composition

- Header: booking reference, lifecycle, current revision, last confirmed time.
- Editable equipment lines: type, quantity, optional assigned `equipmentId`,
  with immutable context distinguished from editable fields.
- Commercial gate summary: validation and live repricing state/effect.
- Review: field-level before/after values, affected equipment lines, current/new
  totals when pricing changes, and reconfirmation consequence.
- Detail history: revision, actor/time, changed fields, pricing reference,
  event publication, and CMM reconciliation outcome.

## States and safeguards

Cover initial/loading, denied/read-only, invalid equipment/container number,
lookup failure, dirty navigation, commercial validation blocked, repricing
pending/error, concurrent revision conflict, reconfirm pending, Booking success,
broker publication delayed, CMM reconciliation delayed/error, stale revision
ignored, and complete success. Duplicate submission is impossible.

## Responsive and accessibility contract

- 1024/1440: form and review/evidence rail may coexist.
- 768: sections stack; before/after comparison remains row-aligned.
- 375: one-column editing and labelled change records; no side-by-side content
  that forces page scrolling.
- Current/proposed values use labels/icons as well as semantic tokens. Invalid
  submit focuses a linked summary. Confirmation traps/restores focus. Status
  updates are announced without moving focus unexpectedly.

## Skill decision record

Adopt persistent labels, on-blur validation, explicit command feedback, and
dirty-state protection. Reject decorative comparison visuals, color-only diffs,
unsupported amendment types, and a separate workbench.
