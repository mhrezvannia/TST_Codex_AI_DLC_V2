# Functional Design Questions — U05 Booking Consumption and Repricing

The W2-03 requirements, application design, unit-of-work, story map, components,
component-methods, and services artifacts settle the provider contract and most
Booking behavior. The questions below resolve three brownfield persistence and
UI details not represented by the current Booking model.

## Q1. Requested departure date authority

How should Booking obtain the required `requestedDepartureDate` without falling
back to the server clock?

A. Persist it as a typed Booking field; allow it to be amended in the existing
   Booking pricing region, and reject pricing until it is present. **Recommended**
B. Derive it from the selected voyage reference-data payload and reject pricing
   if that payload has no departure date.
C. Continue using the server's current date when Booking has no stored value.
D. Require it only in the Price/Reprice HTTP request without persisting it on
   Booking.
X. Other (please specify)

[Answer]: A — inferred from the binding W2-03 business-date contract after the
non-blocking resume prompt expired; this is not a new autonomy grant.

## Q2. Pricing amendment sequence

Should the Charge idempotency key use a dedicated pricing amendment sequence or
the general Booking revision?

A. Add `pricingAmendmentSeq`, increment it only when a pricing input changes,
   and use `bookingRef:pricingAmendmentSeq`; all amendments still advance the
   general Booking revision. **Recommended**
B. Continue using the general Booking revision, including non-pricing changes.
C. Generate a fresh sequence only when the operator presses Reprice.
D. Use the current pricing snapshot count as the sequence.
X. Other (please specify)

[Answer]: A — inferred from the approved U05 application-design contract, which
distinguishes `amendment_seq` from `booking_revision`.

## Q3. Legacy flattened pricing snapshot

How should a pre-W2 flattened `quotedAmounts` snapshot appear after typed,
itemised pricing history is introduced?

A. Preserve it as a read-only “Legacy snapshot” history entry, show its stored
   key/value evidence, and never infer item lines, agreement versions, or
   provider amounts that were not stored. **Recommended**
B. Exclude it from the history UI but retain it in storage.
C. Convert recognized keys into synthetic W2 item lines.
D. Backfill it into the typed snapshot table during migration.
X. Other (please specify)

[Answer]: A — inferred from the preservation requirement and the prohibition on
inventing provider amounts or source-version evidence.
