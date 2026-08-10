# Market Trends — W3-04 Booking Request Completeness

## Purpose and Upstream Intent

This report interprets current external signals for the approved W3-04 `intent-statement.md`. It distinguishes trends that shape the dry-booking baseline from adjacent developments that should remain outside this intent.

## Trend 1 — Standardized API Booking Lifecycles

DCSA Booking 2.0 standardizes booking request, update, confirmation, amendment, decline, and cancellation exchanges and publishes OpenAPI-oriented implementation guidance. Its stated purpose is more consistent, less error-prone information exchange between shipping participants. The implication for W3-04 is to freeze DCSA-aligned terms and typed boundaries now, while implementing only the approved create/validate/price/confirm slice. [DCSA Booking 2.0 introduction](https://dcsa.org/standards/booking/documentation-booking-2/booking-2-introduction) and [technical implementation guidelines](https://developer.dcsa.org/booking-technical-implementation-guidelines).

## Trend 2 — Quote, Sailing, Schedule, and Booking Converge

Carrier portals increasingly present one journey from shipment facts to available departures, rates, schedule breakdowns, and booking submission. Maersk’s current flow starts with origin/destination, commodity, equipment, contract owner, and dates before vessel selection; Hapag-Lloyd promotes rapid spot rates and confirmation for multiple containers. The W3-04 implication is that schedule and pricing provenance belong in the core request experience, not in hidden downstream processing. [Maersk new-booking flow](https://www.maersk.com/support/faqs/2025/09/05/how-do-i-make-a-new-booking) and [Hapag-Lloyd Quick Quotes Spot](https://www.hapag-lloyd.com/en/online-business/quotation/quick-quotes-spot.html).

## Trend 3 — Structured Quantity, Commodity, and Weight Are Table Stakes

Official Maersk and CMA CGM guidance requires or prominently captures commodity, container type/size, quantity, weight, and departure/location information. This validates a structured commercial baseline and makes a fixed quantity of one or a pricing-minimum-only record commercially weak. It does not require W3-04 to pull reefer, DG, OOG, shipping-instruction, or customs-document depth into the dry baseline. [Maersk mandatory booking information](https://www.maersk.com/de-de/support/faqs/mandatory-booking-information) and [CMA CGM Click & Book guide](https://www.cma-cgm.com/assets/public/documents/Click%20%26%20Book%20guide%202024.pdf).

## Trend 4 — Connected Platforms Compete on Exception Handling and Audit

CargoWise presents schedules, rates, eBookings, tracking, direct carrier connections, automated exception alerts, reduced rekeying, and transaction audit trails as an integrated ocean workflow. SAP’s current ocean-booking app supports FCL/LCL bookings, search/filter/edit, charge calculation, planned/actual times, and UN/LOCODE locations. The inference for W3-04 is that failure recovery, explicit incompleteness, and traceable schedule/pricing bases materially affect operational credibility. [CargoWise Ocean](https://www.cargowise.com/solutions/cargowise-forwarding/ocean/) and [SAP Manage Ocean Freight Bookings](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/9386c8070e854c5cb4ceff469cd8c28e.html).

## Trend 5 — Electronic Freight Data and Data Governance Are Tightening

The EU eFTI framework is moving authorities toward acceptance of electronic freight information through certified platforms, with full application scheduled for 9 July 2027. Although W3-04 is not an eFTI implementation and ocean is not the regulation page’s primary listed mode, the direction reinforces machine-readable, controlled, auditable freight data rather than free-text duplication. Separately, GDPR Article 5 requires personal data minimisation and accuracy, supporting W3-04’s decision to keep party PII within Booking and avoid widening `booking.confirmed` without purpose. [European Commission eFTI overview](https://transport.ec.europa.eu/transport-themes/logistics-and-multimodal-transport/efti-regulation_en) and [GDPR Article 5](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679).

## Trend 6 — Cargo Weight Must Preserve Lifecycle Semantics

IMO’s SOLAS VGM rule makes verified gross mass a condition for loading a packed container and assigns responsibility to the shipper, but verification occurs in the physical packed-container lifecycle. W3-04 should capture the commercially required cargo gross weight with explicit units while not mislabeling it as VGM or requiring a physical container assignment at booking-request time. [IMO verified gross mass guidance](https://www.imo.org/en/ourwork/safety/pages/verification-of-the-gross-mass.aspx).

## Table Stakes for W3-04

- Canonical origin/destination, customer/party, commodity, equipment type, quantity, weight, and requested departure.
- Available voyage selection and visible carrier-derived schedule facts.
- Reviewable pricing and schedule basis before confirmation.
- Saved request/detail continuity and correction without data loss.
- Consistent booking lifecycle identifiers and states.
- Responsive, accessible, authenticated operation for the primary internal audience.

## Defensible Differentiators

- Exact fact continuity across all LinerCore seams, including quantity-aware live pricing and minimal confirmation events.
- Proven absence—not placeholder generation—of `equipmentId` until allocation.
- Explicit provenance for requested versus carrier-derived schedule facts.
- Safe authoritative legacy upcast with visible incompleteness rather than fabricated defaults.
- Operational recovery states and live audit evidence as part of Definition of Done.

## Adjacent Trends Kept Out of Scope

- DCSA amendment/cancellation breadth, shipping instructions, and eBL workflows.
- Reefer, dangerous goods, OOG, multi-leg/transshipment, capacity allocation, and physical equipment assignment.
- External shipper self-service and cross-carrier marketplace behavior.
- eFTI platform certification or regulatory submission workflows.

These may inform later intents but do not alter the approved W3-04 boundary.

