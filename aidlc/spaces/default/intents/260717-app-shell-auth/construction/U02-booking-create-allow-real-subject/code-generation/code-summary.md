# Code Summary - U02 Booking Create Allow

## Files Created

| Path | Purpose |
| --- | --- |
| `apps/shell/app/api/booking/bookings/route.ts` | Shell API route forwarding Booking create POSTs to the existing Booking BFF with cookie, idempotency, and correlation headers. |
| `apps/shell/app/api/booking/reference-options/route.ts` | Shell API route forwarding reference option requests to the existing Booking BFF. |
| `apps/shell/app/booking/new/page.tsx` | Protected shell `/booking/new` route. |
| `apps/shell/app/booking/new/BookingCreateForm.tsx` | Shell-mounted Booking create form using shared W1 validation semantics. |
| `apps/shell/app/booking/new/BookingCreateForm.test.tsx` | Shell create form tests for validation focus and canonical detail redirect. |
| `apps/shell/app/booking/[bookingId]/page.tsx` | Protected shell Booking detail route. |
| `packages/shared-types/src/index.test.ts` | Shared Booking draft validation and server-field mapping tests. |
| `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/integration/HttpIdentityAuthorizationAdapter.java` | HTTP `AuthorizationPort` adapter to identity-service. |
| `services/booking-service/container/src/test/java/com/linercore/platform/booking/container/integration/HttpIdentityAuthorizationAdapterTest.java` | Adapter allow/deny/error/fail-closed tests. |

## Files Modified

| Path | Change |
| --- | --- |
| `packages/shared-types/src/index.ts` | Added shared Booking draft field type, validation, and server-field mapping. |
| `packages/shared-types/package.json` | Added workspace-local test/lint/type-check dependencies and Vitest runner. |
| `apps/booking/package.json` | Added dependency on `@erp/shared-types`. |
| `apps/booking/lib/booking-form.ts` | Re-exported shared Booking draft validation and mapping to preserve existing imports. |
| `apps/shell/package.json` | Added dependency on `@erp/shared-types`. |
| `apps/shell/lib/booking-client.ts` | Added detail load and shell-to-Booking-BFF forwarding helper with cookie, idempotency, origin, and correlation propagation. |
| `apps/shell/lib/booking-client.test.ts` | Added detail and forwarding coverage. |
| `apps/shell/app/booking/page.tsx` | Added `New booking` entry point and canonical `/booking/[id]` list links. |
| `apps/shell/app/shell.css` | Added form, input, and action styles for shell create UI. |
| `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/BookingServiceConfiguration.java` | Wired Booking authorization to the HTTP identity adapter with bounded identity RestTemplate. |
| `services/booking-service/container/src/main/resources/application-local.yaml` | Added `booking.identity-service-url`. |
| `compose.yaml` | Added `IDENTITY_SERVICE_URL` and identity-service dependency to booking-service. |
| `services/identity-service/domain-core/src/main/java/com/linercore/platform/identity/domain/catalog/MvpAuthorizationCatalog.java` | Added Booking read/create permissions and grants to `booking-desk`. |
| `services/identity-service/domain-core/src/test/java/com/linercore/platform/identity/domain/catalog/AuthorizationPolicyEvaluatorTest.java` | Added Booking allow and reference-admin deny tests. |
| `services/identity-service/application-service/src/test/java/com/linercore/platform/identity/applicationservice/IdentityApplicationServiceTest.java` | Added service-level Booking allow/deny coverage. |
| `infrastructure/seeds/shared-platform-mvp-defaults.json` | Added deterministic `local.booking.user`, Booking read/create permissions, and booking-desk grants; preserved `local.reference.admin` without Booking permissions. |
| `apps/auth/lib/auth-server.ts` | Local booking subject summary now includes Booking read/create permissions. |
| `yarn.lock` | Updated workspace dependency metadata. |

## Key Decisions

- Shell create and detail routes remain shell-owned (`/booking/new`, `/booking/[id]`) while requests are forwarded through the existing Booking BFF, preserving the U01 seam and keeping service tokens out of shell.
- Booking form validation moved to `@erp/shared-types` and `apps/booking/lib/booking-form.ts` re-exports it, avoiding duplicate validation logic while preserving existing W1 imports.
- booking-service now authorizes through identity-service for Booking read/create using the existing `AuthorizationPort`; deny/error/malformed responses fail closed.
- Identity catalog/seed grants Booking permissions only through `booking-desk`/`local.booking.user`; `local.reference.admin` remains denied for U03.

## Test Coverage Summary

| Check | Result |
| --- | --- |
| `yarn workspace @erp/shared-types test` | PASS - 3 tests. |
| `yarn workspace @erp/shared-types typecheck` | PASS. |
| `yarn workspace @erp/shared-types lint` | PASS. |
| `yarn workspace @erp/app-booking test` | PASS - 19 tests. |
| `yarn workspace @erp/app-booking typecheck` | PASS. |
| `yarn workspace @erp/app-booking lint` | PASS; Next.js deprecation/plugin warnings only. |
| `yarn workspace @erp/app-shell test` | PASS - 10 tests. |
| `yarn workspace @erp/app-shell typecheck` | PASS. |
| `yarn workspace @erp/app-shell build` | PASS; Next.js emitted existing ESLint-plugin warning only. |
| `yarn workspace @erp/app-shell lint` | PASS; Next.js deprecation/plugin warnings only. |
| `yarn workspace @erp/auth test` | PASS - 11 tests. |
| `yarn workspace @erp/auth typecheck` | PASS. |
| `mvn -f services/pom.xml -pl identity-service/domain-core,identity-service/application-service,booking-service/container -am "-Dtest=AuthorizationPolicyEvaluatorTest,IdentityApplicationServiceTest,HttpIdentityAuthorizationAdapterTest,BookingApiControllerTest,BookingLocalIdentityFilterTest,BookingLocalAuthorizationTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` | PASS - targeted identity and booking authorization tests; reactor build success. |
| `docker compose config --quiet` | PASS. |

## Deviations From Plan

- U02 implementation ran inline because the named developer subagent remained unavailable in this session. This is recorded in `construction/code-generation/memory.md`.
- The adapter test covers identity server errors; true socket timeout behavior is represented by the same `RestClientException` fail-closed path rather than a wall-clock timeout test.

## Remaining Risks

- Live Compose/Nginx/Keycloak create/detail proof has not been run in this code-generation stage. Build and Test must verify `/booking/new` -> create -> `/booking/[id]` through Nginx with `local.booking.user`.
- The existing direct `apps-booking` UI still routes successful creates to `/bookings/[id]`; U05 owns compatibility redirects. Shell-created records already route to `/booking/[id]`.
- W1's live-proof waiver remains BLOCKED at `compose-start`; U02 did not rewrite prior W1 status.

## Review

Verdict: READY

Findings:

1. U02 implements the requested vertical allow path without broad redesign: shell create/detail UI, BFF forwarding, booking-service identity authorization, identity catalog/seed, and targeted tests.
2. Real-subject behavior is coherent. Shell and Booking BFF preserve the session cookie, booking-service authorizes the real actor through identity-service, and `local.reference.admin` remains denied for Booking.
3. Existing W1 Booking form semantics are preserved through shared validation extraction and re-export, not by replacing the current app behavior.
4. Prior-work boundaries are respected: no W0/W1/W2-02 rewrite, no cloud/runtime service addition, and W1 waiver remains BLOCKED.
5. Verification is adequate for code generation; remaining live proof is correctly deferred to Build and Test.

Required changes: none before the next code-generation unit.

