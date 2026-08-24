# Business Overview

## Business Domain and Purpose

LinerCore is an on-premise liner-shipping operations platform. This repository implements booking request capture, reference-data stewardship, charge agreement pricing, container-movement orchestration, identity/access boundaries, and a shared operational web shell. The W3-04 focus is Booking Request Completeness: ensure an operator can capture an authoritative commercial request, validate it against governed reference data, obtain exact pricing, confirm it, and hand a compatible event to Container Movement Management (CMM).

The primary business transaction is a booking lifecycle from draft through validation, pricing, confirmation, amendment, and reconfirmation. Booking owns the transaction and immutable pricing snapshot; Reference Data supplies governed party, location, voyage, equipment, commodity, and trade-lane facts; Charge Agreement owns pricing; CMM begins execution after `booking.confirmed`.

## Business Capabilities

| Capability | Current implementation | W3-04 significance |
|---|---|---|
| Booking capture | `apps/booking`, the Booking area in `apps/shell`, and `services/booking-service` | Two user flows currently collect only a reduced request and both require a physical equipment ID. |
| Booking lifecycle | Draft/create, read/list, validate, price, confirm, amend, reconfirm | The lifecycle exists end to end in static code, but completeness and executable contracts are not yet aligned. |
| Reference governance | `services/reference-data-service` and `apps/reference-data` | Customer, location, voyage, and equipment sets are exposed to Booking; commodity and party-role coverage is incomplete. |
| Pricing | Booking pricing input plus `services/charge-agreement-service` | Pricing uses canonical fingerprints and immutable snapshots, but absent trade-lane/commodity values fall back to unsafe business defaults. |
| Movement initiation | `booking.confirmed` consumed by `services/container-movement-service` | CMM currently rejects the valid future case where an equipment assignment has no physical ISO 6346 ID. |
| Identity and operational shell | `services/identity-service`, `apps/auth`, `apps/shell`, `packages/auth`, `packages/ui` | Provides session, authorization, shared shell, and design-system boundaries. |
| Operations | `compose.yaml`, Nginx, PostgreSQL, Kafka/Schema Registry, observability stack | The checked-in topology declares 24 services; its live health was not evaluated by this scan. |

## W3-04 Completeness Gap

The domain aggregate at `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/Booking.java` has identity, number, revision, status, customer, one route, one `EquipmentAssignment`, pricing, exceptions, movement state, lifecycle state, and untyped attributes. It does not have first-class fields for customer booking reference, shipper, consignee, notify party, cargo description, package count/type, gross weight, or volume. Commodity code and requested departure date are stored in attributes rather than explicit types.

`EquipmentAssignment.java`, both `BookingCreateForm.tsx` implementations, and the CMM `BookingConfirmedEvent.EquipmentAssignment` enforce a physical equipment ID and quantity one. That contradicts the W3-04 commercial-booking model, where an operator can request an equipment type and quantity before a physical container is assigned. Reference voyage data lacks cargo cutoff and documentation deadline, and Booking's HTTP reference adapter omits even scheduled departure/arrival from voyage options. These are cross-component contract gaps, not isolated form defects.

## Business Risks and Outcomes

- Incomplete fields can produce bookings that are syntactically valid but commercially unusable.
- Defaults `NA-EU` and `commodity-general` in `PricingInput.java` can produce a deterministic yet business-incorrect price request.
- Runtime topic `booking.events` differs from Enterprise/AsyncAPI name `booking.confirmed`, weakening operational and contract traceability.
- Duplicate `/booking` and `/bookings` experiences can diverge; one sends requested departure and the other does not.
- Legacy snapshot upcast is safe only when authoritative route, voyage, equipment type, and physical equipment data exist; otherwise the record must remain explicitly incomplete.

The intended outcome is an authoritative FCL-dry booking request whose required fields are first-class, whose schedule snapshot is traceable, whose price uses exact inputs, and whose confirmation remains consumable by CMM before physical equipment assignment.

## Evidence Boundary

This overview is based on checked-in source, contracts, configuration, migrations, and static test inventory at commit `92603accbc07896da682d23e146adc46d52464d1`. No tests, containers, migrations, Kafka flows, browser journeys, audits, performance checks, accessibility checks, or live acceptance scenarios were run during reverse engineering.
