# API Documentation

## Canonical Booking BFF Surface

The canonical browser path reaches Booking through the authenticated shell and Booking BFF, not directly from a second standalone navigation system. Shell compatibility and proxy behavior are implemented in `apps/shell/lib/booking-client.ts` and `apps/shell/app/api/booking/`. Booking-side route handlers are:

| Method | Route | Responsibility | Evidence |
|---|---|---|---|
| GET | `/api/bookings` | List Bookings | `apps/booking/app/api/bookings/route.ts` |
| POST | `/api/bookings` | Create draft Booking | `apps/booking/app/api/bookings/route.ts` |
| GET | `/api/bookings/{bookingId}` | Read Booking detail | `apps/booking/app/api/bookings/[bookingId]/route.ts` |
| POST | `/api/bookings/{bookingId}/validate` | Validate draft | `apps/booking/app/api/bookings/[bookingId]/validate/route.ts` |
| POST | `/api/bookings/{bookingId}/price` | Request/apply pricing | `apps/booking/app/api/bookings/[bookingId]/price/route.ts` |
| POST | `/api/bookings/{bookingId}/confirm` | Confirm Booking | `apps/booking/app/api/bookings/[bookingId]/confirm/route.ts` |
| GET | `/api/reference-options` | Load reference options | `apps/booking/app/api/reference-options/route.ts` |

`apps/booking/lib/bookings.ts` is the central outbound adapter. It adds authenticated subject, correlation and idempotency metadata, enforces request limits and timeouts, and maps backend failures for the UI. W2-02 must retain these protections while changing presentation components.

## Booking Service API

`services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java` exposes the backend Booking lifecycle. The developer scan identified draft creation, list/detail, validate, price, pricing snapshot, confirm, amend, and reconfirm operations. Business orchestration is delegated to `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/BookingApplicationService.java` rather than being implemented in Next route handlers.

The confirm operation is the boundary to the asynchronous downstream journey. Booking state and its outbox event are committed in the Booking service; shared messaging under `services/platform-messaging/` publishes to Kafka; Container Movement Management consumes under `services/container-movement-service/`.

## Supporting Service APIs

- Identity authorization and role endpoints are implemented by `services/identity-service/container/src/main/java/com/linercore/platform/identity/container/api/IdentityAuthorizationController.java`.
- Reference-set CRUD, history, and lookup are implemented by `services/reference-data-service/container/src/main/java/com/linercore/platform/referencedata/container/api/ReferenceDataController.java`.
- Agreement lifecycle and active-agreement lookup are implemented by `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/ChargeAgreementApiController.java`.
- Pricing is exposed by `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/PricingApiController.java`.
- Container journey and movement operations are implemented by `services/container-movement-service/container/src/main/java/com/linercore/platform/containermovement/container/api/ContainerMovementApiController.java`.

Executable and documentary contracts under `contracts/` and the service controller tests remain the authority for exact wire schemas. W2-02 does not alter those public contract shapes.

## API Quality and Closure Risks

The existing BFF is a useful architectural control point, but `apps/booking/package.json` imports `@erp/auth` in code without declaring it as a package dependency. That dependency mismatch should be reconciled as part of build hygiene if still observed by the implementation stage. UI migration must not bypass `apps/booking/lib/bookings.ts` or move sensitive subject/idempotency logic into React components.

Live acceptance must exercise the real BFF/backend path for create, validate, price, and confirm and capture network/error evidence. A mocked component-only pass is insufficient. Historical W1 `BLOCKED` plus waiver evidence remains separate; new successful API evidence is additive and must not rewrite that record.
