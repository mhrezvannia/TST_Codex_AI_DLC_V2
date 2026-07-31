# Code Structure

## Repository Organization

The root `package.json` defines Yarn 4.5.3 workspaces for `apps/*` and `packages/*`, with Turbo tasks for build, lint, typecheck, and test. Java services are aggregated by `services/pom.xml`. Integration configuration and ingress live under `infrastructure/`, executable verification under `scripts/`, contracts under `contracts/`, intent documentation under `docs/intents/`, and durable run evidence under `artifacts/`.

Primary frontend applications are `apps/auth`, `apps/shell`, `apps/booking`, `apps/reference-data`, and `apps/charge-agreements`. Shared frontend packages are `packages/ui`, `packages/auth`, `packages/api-core`, `packages/config`, `packages/shared-types`, `packages/transformers`, and `packages/utils`.

## Frontend Patterns

Next.js App Router structure is used across applications. The authenticated host is `apps/shell/app/`, with canonical Booking routes under `apps/shell/app/booking/` plus compatibility routes under `apps/shell/app/bookings/`. The shell-side client is `apps/shell/lib/booking-client.ts`. Booking's module pages and BFF routes are under `apps/booking/app/bookings/` and `apps/booking/app/api/bookings/`; transport behavior is centralized in `apps/booking/lib/bookings.ts` and form mapping in `apps/booking/lib/booking-form.ts`.

The UI package is concentrated in four source files: `packages/ui/src/index.tsx`, `packages/ui/src/primitives.tsx`, `packages/ui/src/interactive.tsx`, and `packages/ui/src/styles.ts`. Package tests include `packages/ui/src/interactive.test.tsx` and `packages/ui/src/contrast.test.ts`. Booking component tests sit alongside their components, for example `apps/booking/app/bookings/new/BookingCreateForm.test.tsx` and `apps/booking/app/bookings/[bookingId]/BookingValidationPanel.test.tsx`.

## Backend Patterns

The service tree includes `identity-service`, `reference-data-service`, `charge-agreement-service`, `booking-service`, `container-movement-service`, and shared `platform-messaging`. Business services use Maven submodules such as domain core, application service, data access, messaging, and Spring Boot container. Representative entry points are:

- `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/BookingApplicationService.java`;
- `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`;
- `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/PricingApiController.java`;
- `services/reference-data-service/container/src/main/java/com/linercore/platform/referencedata/container/api/ReferenceDataController.java`;
- `services/container-movement-service/container/src/main/java/com/linercore/platform/containermovement/container/api/ContainerMovementApiController.java`.

This structure preserves bounded contexts and service-owned persistence. Cross-service contracts must remain explicit rather than being replaced by shared database access or module imports.

## W2-02 Change and Evidence Surface

The closure-critical production surface is limited to `packages/ui/`, `apps/booking/`, and the canonical mounting seam in `apps/shell/`. Enforcement belongs in root lint/test configuration and purpose-built scripts rather than another style package. Live proof belongs under `artifacts/w2-02-live/` and should be driven by `scripts/wave-a-compose.mjs` with `scripts/demo-guard.mjs` protecting the manager demo.

Existing code outside this surface is context, not redesign scope. In particular, Booking service commands, event contracts, Container Movement consumers, and prior W0/W1/W2-01 work should be changed only if a directly observed closure defect requires it.
