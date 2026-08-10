# Domain Entities - U02 Booking Create Allow

## Source Context

This entity model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U02 adds no new Booking aggregate; it connects existing Booking create/detail entities to real-subject authorization and deterministic identity fixtures.

## Entity Catalog

| Entity / value object | Owner | Attributes | U02 role |
| --- | --- | --- | --- |
| BookingActor | Shell/BFF/booking-service boundary | subject id, display name if available, roles/permissions summary | Carries `local.booking.user` through create/detail requests. |
| BookingPermission | identity-service catalog | resource `booking`, action `read/create/confirm/validate/price` | Enables allow decisions for `booking-desk`. |
| BookingDeskRole | identity-service catalog | role id, permission grants | Grants Booking permissions to `local.booking.user`. |
| AuthorizationRequest | booking-service adapter | subject, resource, action, scope, caller, correlation id | Sent to identity-service before create/detail actions. |
| AuthorizationDecision | identity-service | allowed/denied, reason, correlation id, decision reference | Allows create or fails closed. |
| BookingDraft/CreateCommand | booking-service | Existing W1 create fields, actor, idempotency key | Existing create command with real actor. |
| BookingRecord | booking-service persistence | booking id/reference, status, route/equipment/customer data | Created and retrieved through existing W1 behavior. |
| U02EvidenceRecord | evidence harness | actor, action, decision, booking id, correlation id | Proves allow path. |

## Relationships

| Relationship | Cardinality | Rule |
| --- | --- | --- |
| BookingActor to BookingDeskRole | 1 to 1..n | `local.booking.user` must have Booking access. |
| BookingDeskRole to BookingPermission | 1 to many | Includes Booking read/create and any preserved W1 action permissions needed by the path. |
| BookingActor to AuthorizationRequest | 1 to many | Every protected create/detail call produces an authorization input. |
| AuthorizationDecision to BookingCreateCommand | 1 to 0..1 | Only allow decisions proceed to command execution. |
| BookingCreateCommand to BookingRecord | 1 to 1 on success | Existing Booking persistence creates the record. |
| BookingRecord to U02EvidenceRecord | 1 to 1..n | Evidence links created Booking to actor/decision/correlation. |

## State Model

| State | Meaning | Transition |
| --- | --- | --- |
| FixtureMissing | `local.booking.user` or Booking permission grants do not exist. | Add/verify seed or fixture before running U02 proof. |
| ActorReady | Shell session has `local.booking.user` subject. | Submit create form. |
| AuthorizationPending | booking-service has built identity authorization request. | identity-service returns allow/deny/error. |
| Authorized | identity-service allows `booking:create`. | Execute existing create command. |
| Created | Booking persistence commits record. | Load `/booking/[id]`. |
| DetailVerified | Created Booking renders inside shell. | Capture U02 evidence. |
| DeniedOrError | Actor missing or identity denies/errors. | Render fail-closed state; no create. |

## Invariants

- `AuthorizationDecision.allowed` must be true before a protected create command mutates Booking state.
- A blank or synthesized actor cannot produce `BookingCreateCommand`.
- `local.booking.user` allow changes must not grant Booking permissions to `local.reference.admin`.
- Existing Booking domain fields and state transitions remain owned by booking-service.
- U02 consumes W0-01, W0-02, W1-01, and W2-02 through stable interfaces only.
