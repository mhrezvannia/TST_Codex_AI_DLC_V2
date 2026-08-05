# Refined Mockup Questions - W1-01

## Q1 - Booking Detail Sections

Which detail-page section set should be implemented?

A. Overview, Routing, Equipment, Charges, Journey, Audit (recommended)
B. One continuous page without tabs
C. Overview, Commercial, Operations, Audit
X. Other (please specify)

`[Answer]:` A - Overview, Routing, Equipment, Charges, Journey, Audit.

## Q2 - Create Flow Pattern

How should the one-leg/one-equipment create flow be presented?

A. One grouped page with live comboboxes and a stable action bar (recommended)
B. Three-step wizard for customer, routing, and equipment
C. Inline drawer over the booking list
X. Other (please specify)

`[Answer]:` A - One grouped page with live comboboxes and a stable action bar.

## Q3 - Pending Status Refresh

How should Booking detail wait for the CMM return event?

A. Poll every second while focused for up to 30 seconds, announce success, then show manual Retry (recommended)
B. Poll every five seconds indefinitely while the page is open
C. Manual Refresh only
X. Other (please specify)

`[Answer]:` A - Poll every second while focused for up to 30 seconds, announce success, then show manual Retry.

## Fixed Design Inputs

- Booking-local `/bookings`, `/bookings/new`, `/bookings/{bookingId}` routes; no W2-01 shell implementation.
- Required ISO 6346 equipment ID in the W1 create flow.
- Compact W2-02 operational visual language through existing `@erp/ui` tokens/primitives.
- WCAG 2.1 AA, desktop/tablet/mobile no-overlap behavior, and 5-second p95 confirm-to-visible-status target.

## Upstream Sources

Questions refine `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`.
