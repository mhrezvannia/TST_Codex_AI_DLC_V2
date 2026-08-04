# Intent Capture Questions — W3-04 Booking Request Completeness

## Established constraints

- Scope is FCL dry only; reefer and dangerous-goods capture remain deferred.
- A physical container assignment is not required when a booking request is created or initially confirmed; requested equipment is type × quantity.
- Reference values must come from the live Reference Data service, pricing must use the exact Booking → Pricing contract, and `booking.confirmed` must not fabricate an `equipmentId`.
- W3-04 is a vertical brownfield slice through the shared shell, Booking API/domain/persistence, Reference Data, Pricing, and the booking confirmation event.

## Pending decisions

1. Which field dictionary should W3-04 establish as the commercially usable FCL-dry baseline?
   - A. Booking party/customer reference, customer booking reference, shipper/consignee/notify references, cargo description, canonical commodity, package count/type, gross weight, and volume (recommended)
   - B. Pricing-minimum fields only
   - C. Option A plus shipping-instruction fields
   - X. Other
   - `[Answer]: A — Commercial baseline.`

2. How should requested and carrier-derived schedule fields behave?
   - A. Requested departure is editable; carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline are derived/read-only from the selected voyage and snapshotted on confirmation (recommended)
   - B. Capture requested departure plus ETD/ETA only; defer cutoff and documentation deadline
   - X. Other
   - `[Answer]: A — Full voyage snapshot.`

3. Which party-role fields must be complete before confirmation?
   - A. Booking party/customer and shipper are required; consignee and notify party are optional at booking-request time (recommended)
   - B. Booking party/customer, shipper, consignee, and notify party are all required
   - C. Only booking party/customer is required; all transport parties are optional
   - X. Other
   - `[Answer]: A — Core parties: booking party/customer and shipper required; consignee and notify party optional.`

4. Which cargo measurements must be complete before confirmation?
   - A. Cargo description, canonical commodity, package count/type, and gross weight are required; volume is optional, with explicit units and positive values (recommended)
   - B. All Option A fields plus volume are required
   - C. Only cargo description and canonical commodity are required; defer package and measurement completeness
   - X. Other
   - `[Answer]: A — Core cargo required; volume optional.`

5. What temporal representation should govern requested and carrier-derived dates?
   - A. Requested departure is a POL-local calendar date; ETD/ETA/cutoffs/deadlines are timezone-aware instants sourced from the selected voyage snapshot (recommended)
   - B. Every field is a UTC instant and localized only for display
   - C. Every field is a calendar date without time or zone
   - X. Other
   - `[Answer]: A — POL-local requested-departure date plus timezone-aware authoritative voyage instants.`

6. How should pre-W3-04 booking records enter the completeness model?
   - A. Upcast only fields supported by authoritative existing data; mark any remainder explicitly incomplete and require correction before confirmation (recommended)
   - B. Mark every legacy record incomplete until a user revalidates it
   - C. Exempt legacy records from the new confirmation completeness rules
   - X. Other
   - `[Answer]: A — Safe authoritative upcast; explicitly incomplete remainder must be corrected before confirmation.`

## Framing confirmations established by the approved backlog intent

7. What business problem is W3-04 solving?
   - A. The W1 walking-skeleton booking record is too thin for a commercially usable FCL-dry request and currently forces a premature physical container assignment (established)
   - B. The primary problem is multi-leg routing
   - C. The primary problem is reefer and dangerous-goods booking
   - X. Other
   - `[Answer]: A — Established by the W3-04 backlog statement and current-system evidence.`

8. Who is the target customer?
   - A. Booking-desk and customer-service users who create, validate, price, confirm, and reopen dry booking requests (established)
   - B. Vessel planners only
   - C. Finance users only
   - X. Other
   - `[Answer]: A — Established by the W3-04 Actors & Journey.`

9. What does success look like?
   - A. On the live stack, a quantity-greater-than-one request round-trips, validates, prices exactly, confirms without an `equipmentId`, publishes a schema-valid event, and renders complete shared-shell states with all audits green (established)
   - B. New fields render in a form, regardless of downstream behavior
   - C. Unit tests pass without live-stack evidence
   - X. Other
   - `[Answer]: A — Established by the W3-04 observed Definition of Done.`

10. Why is the initiative needed now?
    - A. Closed reference-data, shared-shell, live-spine, and quantity/date-aware pricing dependencies make the vertical completion slice ready, while the current thin model blocks commercial use and trustworthy downstream contracts (established)
    - B. A new regulatory deadline requires it
    - C. A new market segment requires reefer support immediately
    - X. Other
    - `[Answer]: A — Established by the program backlog and dependency outputs.`

## Ambiguity and contradiction analysis

- All `[Answer]:` tags are resolved; no unanswered Intent Capture decision remains.
- The current W2 create baseline requires a physical `equipmentId` and fixes quantity at `1`. W3-04 intentionally supersedes that creation rule: the request carries equipment type × quantity, and `equipmentId` remains absent until later assignment.
- The commercial field baseline does not expand `booking.confirmed` to include party PII or cargo data. Booking retains those facts; CMM receives only the contractually approved routing/equipment state.
- The full schedule snapshot remains compatible with live Reference Data ownership: requested departure is user intent, while voyage number, ETD/ETA, cargo cutoff, and documentation deadline are derived from the selected voyage and frozen for confirmation auditability.
- The safe-upcast choice forbids invented values. Any legacy fact not supported by authoritative stored data is visibly incomplete and blocks confirmation until corrected.
