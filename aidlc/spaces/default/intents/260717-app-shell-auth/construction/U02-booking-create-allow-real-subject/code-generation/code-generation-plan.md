# Code Generation Plan - U02 Booking Create Allow

## Unit Scope

U02 extends the U01 shell/auth walking skeleton with the first real mutation: `local.booking.user` creates a Booking from shell `/booking/new`, booking-service authorizes the real subject through identity-service, persists through existing W1 create behavior, and the created Booking is retrievable at shell `/booking/[id]`.

Traceability: US-02 and US-04; FR-04, FR-05, FR-06, FR-10, FR-12; NFR-03, NFR-04, NFR-06, NFR-07.

## Plan Steps

- [x] Step 1: Shared Booking form/model extraction. Move reusable Booking draft field validation and server-field mapping from `apps/booking/lib/booking-form.ts` into a workspace-safe shared module or package used by both `apps/booking` and `apps/shell`; keep existing W1 validation semantics unchanged. Add tests for the shared validation/mapping contract. Traceability: US-04; FR-04; NFR-06, NFR-07.
- [x] Step 2: Shell create UI. Add protected shell route `/booking/new` using the U01 session guard and shell chrome; reuse the W1 create form behavior, reference option loading, idempotency-key handling, accessible error summary, and `data-testid` attributes. Submit to a shell-owned API/BFF route or the existing Booking BFF with the session cookie preserved. Traceability: US-02, US-04; FR-04, FR-05; NFR-03, NFR-07, NFR-09.
- [x] Step 3: Shell detail UI. Add protected shell route `/booking/[id]` that loads the created Booking detail through the existing Booking BFF with the session cookie and correlation id, renders key W1 detail semantics inside shell chrome, and displays create-success state when redirected from `/booking/new`. Traceability: US-04; FR-04, FR-05, FR-10; NFR-04, NFR-06.
- [x] Step 4: Booking BFF create/detail compatibility. Ensure `apps/booking` API routes for create and detail derive the actor from `lc_session`, require idempotency for create, propagate correlation and actor to booking-service, and route successful shell create results to canonical `/booking/[id]` rather than legacy `/bookings/[id]` when used from shell. Add focused tests for create actor propagation, idempotency, and missing actor fail-closed. Traceability: US-02, US-04; FR-05, FR-10; NFR-03, NFR-04.
- [x] Step 5: booking-service identity authorization adapter. Add an HTTP implementation of `AuthorizationPort` that calls identity-service `POST /internal/identity/authorize` with subject token/reference from `X-LinerCore-Actor-Id`, resource `booking`, action `create`/`read`, caller `booking-service`, and correlation id. Wire it in local Compose/profile with bounded connect/read timeout and fail-closed behavior for deny, timeout, malformed response, and service error. Traceability: US-02; FR-06, FR-10, FR-12; NFR-02, NFR-04.
- [x] Step 6: Identity catalog and local fixture. Extend the identity catalog/seed data so `booking-desk` grants Booking `read` and `create` permissions, add deterministic `local.booking.user` to Keycloak/identity seeds, and preserve `local.reference.admin` without Booking permissions for U03. Add tests proving `local.booking.user` allows booking read/create and `local.reference.admin` denies Booking. Traceability: FR-06, FR-12; NFR-03, NFR-06.
- [x] Step 7: Backend authorization tests. Add booking-service adapter tests for allow, deny, timeout/error, malformed response, and correlation propagation; add or update application/container tests proving create does not persist when authorization fails. Traceability: US-02; FR-06; NFR-02, NFR-04.
- [x] Step 8: Shell tests. Add tests for `/booking/new` protected guard behavior through helper seams, form submit path preserving idempotency/cookie/correlation, create success redirect to `/booking/[id]`, and detail load error handling. Traceability: US-02, US-04; FR-04, FR-05; NFR-07, NFR-09.
- [x] Step 9: Compose/config validation. Add `IDENTITY_SERVICE_URL` and any timeout config required by booking-service; preserve existing local Compose/Nginx topology and no new runtime service. Validate `docker compose config --quiet`. Traceability: FR-10, FR-12; NFR-08.
- [x] Step 10: Verification commands. Run focused tests and checks: shared frontend validation tests, `@erp/app-booking` tests/type-check/lint, `@erp/app-shell` tests/type-check/build/lint, identity-service authorization tests, booking-service targeted tests, and Compose config validation. Document exact results. Traceability: stage sensors and U02 DoD.
- [x] Step 11: Code summary. Write `code-summary.md` listing files changed, key decisions, test coverage, deviations, and remaining live-proof risks. Traceability: stage output contract.

## Non-Goals

- Do not implement U03 deny UI as the user-facing final state except for tests/seeds that preserve the deny fixture.
- Do not implement U04 sign-out/session expiry proof, U05 `/bookings*` compatibility redirects, or U06 final live detector/audit packaging.
- Do not introduce a new auth service, authorization service, database, queue, cache, cloud resource, CDN, or frontend state library.
- Do not rewrite W1's live-proof waiver from BLOCKED at `compose-start` into PASS.

## Planned Verification

| Check | Command |
| --- | --- |
| Shared/auth tests | `yarn workspace @erp/auth test` and any new shared Booking form package tests |
| Booking BFF tests | `yarn workspace @erp/app-booking test` |
| Shell tests | `yarn workspace @erp/app-shell test` |
| Frontend type/lint/build | `yarn workspace @erp/app-booking typecheck`, `yarn workspace @erp/app-shell typecheck`, `yarn workspace @erp/app-shell build`, lint scripts |
| Identity authorization tests | Targeted Maven tests for identity catalog/application authorization |
| Booking authorization tests | Targeted Maven tests for booking identity adapter/controller/application behavior |
| Compose validation | `docker compose config --quiet` |
