# Code Summary - U01 Booking Draft Skeleton

## Delivered

- Replaced the flat Booking draft shape with canonical `routing[]` and `equipment[]` value objects, W1 shipment defaults, ISO 6346 validation, lifecycle facts, and explicit `legacyIncomplete` recovery behavior.
- Added transactional request receipts with normalized SHA-256 equality, same-request replay, changed-payload conflict, JDBC search/detail persistence, and canonical snapshot version 2 writes/upcasts.
- Adopted Flyway 10.10.0 with byte-identical legacy V1 and additive V2 migrations. A fail-closed strategy handles empty, known-history, exact-legacy, and unknown/partial catalogs.
- Added canonical create/list/detail HTTP DTOs, required local identity/correlation/idempotency, JSON/body limits, constant-time token verification, and non-local fail-closed startup.
- Replaced `BookingWorkbench` with stable `/bookings`, `/bookings/new`, `/bookings/[bookingId]`, and BFF routes. The BFF owns service identity, token, correlation, timeouts, same-origin checks, bounded JSON commands, and safe error mapping.
- Updated local Compose wiring for PostgreSQL host port 55432, app port 3001, health checks, bounded resources, and log rotation.

## Main Files

- Domain/application: `services/booking-service/domain-core/**`, `services/booking-service/application-service/**`.
- Persistence/migrations: `services/booking-service/dataaccess/**`, `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/BookingFlywayMigrationStrategy.java`.
- API/security: `BookingApiController.java`, `BookingLocalIdentityFilter.java`, `BookingServiceConfiguration.java`, and `application-local.yaml`.
- Frontend: `apps/booking/app/**`, `apps/booking/lib/**`, `apps/booking/tsconfig.json`, and `apps/booking/package.json`.
- Runtime: `compose.yaml` and `infrastructure/env/local.env.example`.

## Verification

- Backend: the default `mvn -o -pl booking-service/container -am test` passed with 54 tests executed and one unrelated opt-in Reference Data live test skipped. The three U01 Flyway tests auto-detected PostgreSQL 15 on host port 55432 and executed without extra properties.
- Frontend: typecheck, ESLint, eight Vitest tests across helpers and the create-form component, and optimized Next production build passed; all seven expected routes were emitted.
- Live Compose: create/replay/conflict/list/detail passed, one booking/receipt/audit committed, service restart preserved the booking and Flyway checksums, and both `booking-service` and `apps-booking` reported healthy.
- User route: `http://127.0.0.1:3001/bookings` returned 200 and rendered the persisted canonical booking.
- Hygiene: `docker compose config --quiet`, `git diff --check`, `aidlc-audit` detectors, and `erp-fidelity-audit` detectors completed. Detector leads were triaged as test doubles, W0 guarded messaging, or U04-owned legacy event fields; no U01 production blocker was found.

## Deviations and Deferrals

- Docker container egress to the npm registry timed out. The normal Dockerfile remains unchanged; the live image overlays the verified host `.next` production build onto the existing dependency image. This needs a normal image rebuild when Docker npm access is restored.
- The in-app browser backend was unavailable after resume, so no fresh screenshot artifact was captured. HTTP rendering, responsive CSS, type/lint tests, host production build, and Compose page rendering passed.
- U01 intentionally leaves live Reference Data validation, pricing, Booking event-contract changes, Booking-to-CMM HTTP removal, status projection, resilience, and final release evidence to U02-U07.

## Evidence

See `artifacts/w1-01/u01-live-proof.md`.

## Review

Status: NOT-READY

### Validation Run

- `mvn --% -o -f services/booking-service/pom.xml -pl container -am -Dtest=BookingApplicationServiceTest,BookingSnapshotCodecTest,BookingApiControllerTest,BookingLocalIdentityFilterTest,BookingFlywayMigrationStrategyLiveTest -Dsurefire.failIfNoSpecifiedTests=false -DfailIfNoTests=false test` passed for Booking application/dataaccess/API/filter tests; the three Flyway live tests were skipped because `booking.integration.jdbc-url` was not set.
- `yarn --cwd apps/booking test` passed with 5 frontend tests.
- `docker compose ps` showed `booking-service` and `apps-booking` healthy on July 16, 2026.
- Read-only live checks against `http://127.0.0.1:3001/api/bookings?page=0&size=1` and `http://127.0.0.1:3001/bookings/5ebb0b2e-b387-4a8d-a09e-15daf29632a2` returned current Booking data and HTTP 200.

### Findings

1. High - The claimed local authorization boundary is not implemented; the service only checks for a nonblank subject, so any caller that gets through the shared token filter can perform every Booking action. `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/BookingServiceConfiguration.java:79-82` wires `AuthorizationPort` as `subjectId != null && !subjectId.isBlank()`, while `BookingApplicationService.requireAllowed(...)` in `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/BookingApplicationService.java:316-321` trusts that port for `create`, `read`, `validate`, `confirm`, and pricing actions. That does not satisfy the security design's per-role/per-action boundary, and the current tests only cover token/header presence, not authorization decisions.

2. High - The legacy snapshot upcaster does not perform the documented safe canonical mapping; it downgrades every V1 row to `legacyIncomplete` with empty `routing` and `equipment`, even when enough legacy data exists to populate canonical fields. `services/booking-service/dataaccess/src/main/java/com/linercore/platform/booking/dataaccess/jdbc/BookingSnapshotCodec.java:38-45` copies legacy fields into `attributes` and always calls `Booking.legacyIncomplete(...)`; there is no branch that builds canonical `RoutingLeg` or `EquipmentAssignment`. The committed test in `services/booking-service/dataaccess/src/test/java/com/linercore/platform/booking/dataaccess/jdbc/BookingSnapshotCodecTest.java:33-46` codifies this reduced behavior, so the mismatch is structural rather than accidental. This breaks the migration/design promise that readable complete legacy rows are upcast into canonical arrays and only truly incomplete rows stay quarantined.

3. Medium - The UI/BFF flow loses required state and error fidelity from the approved design. The list page links to detail without preserving the active filters (`apps/booking/app/bookings/page.tsx:33-36`), and the detail page always links back to bare `/bookings` (`apps/booking/app/bookings/[bookingId]/page.tsx:13`), so the "preserve filter parameters in the back link" requirement is not met. Separately, the BFF returns normalized `fields` data (`apps/booking/lib/bookings.ts:87-93`), but the create form discards it and collapses every server failure into `errors.form` (`apps/booking/app/bookings/new/BookingCreateForm.tsx:32-35`), which means field-addressable backend validation cannot surface at the right controls.

4. Medium - The migration and live-evidence claims are not reproducible from the committed default automated suite. The Flyway proof tests are gated by an opt-in system property in `services/booking-service/container/src/test/java/com/linercore/platform/booking/container/BookingFlywayMigrationStrategyLiveTest.java:27-33`, which is why all three migration tests skipped in the current rerun. The frontend suite is also limited to helper-level tests (`apps/booking/lib/bookings.test.ts`, `apps/booking/lib/booking-form.test.ts`) and does not exercise the page components that own filter persistence, created-navigation, or unavailable/not-found rendering. The live stack is up and read paths work, but the committed regression net is materially weaker than the design and summary claim.

## Review Resolution - Iteration 1

1. Added `BookingLocalAuthorization` with explicit subject/resource/action grants, fixed service-to-actor mappings in `BookingLocalIdentityFilter`, and positive/negative authorization and spoofed-actor tests.
2. Added guarded legacy canonicalization when valid UN/LOCODE, voyage, equipment type, and ISO 6346 identity all exist. Incomplete rows remain quarantined; a new codec test covers complete canonical upcast without retaining known legacy aliases.
3. Added safe filtered-list return URLs, detail back-link preservation, canonical server-field mapping, a linked/focusable error summary, and helper/component tests.
4. Made the migration suite auto-detect the standard local PostgreSQL URL so the default Maven command runs it whenever Compose is present. Added a `BookingCreateForm` component test; the default run now executes all three migration tests and eight frontend tests.

## Review - Iteration 2

Status: NOT-READY

### Validation Run

- `mvn --% -o -f services/booking-service/pom.xml -pl container -am -Dtest=BookingApplicationServiceTest,BookingSnapshotCodecTest,BookingApiControllerTest,BookingLocalAuthorizationTest,BookingLocalIdentityFilterTest,BookingFlywayMigrationStrategyLiveTest -Dsurefire.failIfNoSpecifiedTests=false -DfailIfNoTests=false test` passed on July 16, 2026. It executed the application, codec, API, local-authorization, local-identity, and all three live Flyway tests against PostgreSQL on `127.0.0.1:55432`.
- `yarn --cwd apps/booking test`, `yarn --cwd apps/booking typecheck`, and `yarn --cwd apps/booking lint` passed on July 16, 2026.
- `docker compose ps` showed `booking-service` and `apps-booking` healthy on July 16, 2026.
- A live invalid create against `http://127.0.0.1:3001/api/bookings` returned HTTP 400 with body `{"code":"bad_request","message":"load and discharge UN/LOCODE must differ","fields":[]...}`, confirming the current server error contract.

### Findings

1. High - Iteration-1 finding 3 is only partially fixed: the UI can map canonical field paths, but the backend still never emits them, so real server-side validation failures collapse back to form-level errors instead of field-addressable recovery. `BookingApiController.badRequest(...)` and `error(...)` always return `fields: []` in `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`, while the design requires `400 BOOKING_VALIDATION` with field paths for malformed/cardinality-invalid input and the UI depends on those paths in `apps/booking/lib/booking-form.ts` and `apps/booking/app/bookings/new/BookingCreateForm.tsx`. The running stack confirms the mismatch: an invalid create on July 16, 2026 returned HTTP 400 with `fields: []`. Until the API surfaces canonical paths such as `routing[0].dischargeUnLocode` and `equipment[0].equipmentId`, the approved end-to-end validation/error contract is not actually implemented.

## Review Resolution - Iteration 2

1. Added canonical validation-field mapping to `BookingApiController`, including the reviewed `routing[0].dischargeUnLocode` path, and extended the UI mapping for route/equipment root and quantity errors.
2. Added controller and frontend regression assertions for the exact contract paths. The full backend reactor passed 54 tests with zero failures/errors and one unrelated Reference Data live test skipped; all eight frontend tests, typecheck, lint, and the production build passed.
3. Rebuilt and recreated `booking-service` and `apps-booking` on the Compose stack. Both became healthy, and a live invalid BFF create returned HTTP 400 with `code: BOOKING_VALIDATION` and `fields: ["routing[0].dischargeUnLocode"]`. A subsequent valid create/read succeeded for booking `d0b33ea0-b0d3-4f12-9701-8e7a559363a9`.
4. This resolution was completed after the configured two reviewer iterations were exhausted; the original review verdict is retained above and the closing evidence is recorded in `artifacts/w1-01/u01-live-proof.md`.
