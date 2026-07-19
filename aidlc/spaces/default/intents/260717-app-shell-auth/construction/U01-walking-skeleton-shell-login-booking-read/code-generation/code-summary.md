# Code Summary - U01 Walking Skeleton

## Files Created

| Path | Purpose |
| --- | --- |
| `apps/shell/package.json` | New `@erp/app-shell` workspace with Next.js, TypeScript, Vitest, lint, type-check, and build scripts. |
| `apps/shell/tsconfig.json` | Shell TypeScript configuration matching existing Next app workspaces. |
| `apps/shell/next-env.d.ts` | Next.js TypeScript ambient references. |
| `apps/shell/app/layout.tsx` | Shell App Router root layout and metadata. |
| `apps/shell/app/ShellFrame.tsx` | Shared shell chrome with top bar, navigation, breadcrumbs, and user menu surface. |
| `apps/shell/app/page.tsx` | Protected shell landing page. |
| `apps/shell/app/booking/page.tsx` | Protected read-only Booking page mounted at `/booking`. |
| `apps/shell/app/api/health/route.ts` | Auth-independent shell container health endpoint. |
| `apps/shell/app/shell.css` | Global shell layout and responsive styles. |
| `apps/shell/lib/shell-auth.ts` | Server-side shell session guard and auth redirect helper. |
| `apps/shell/lib/booking-client.ts` | Shell-to-Booking-BFF client preserving cookie and correlation id. |
| `apps/shell/lib/shell-auth.test.ts` | Shell route guard and actor extraction tests. |
| `apps/shell/lib/booking-client.test.ts` | Shell Booking BFF forwarding tests. |

## Files Modified

| Path | Change |
| --- | --- |
| `packages/auth/src/index.ts` | Added shared session cookie decode, expiry check, safe summary, and actor extraction helpers. |
| `packages/auth/src/index.test.ts` | Added tests for safe session decoding, expired-session rejection, unauthenticated summary, and actor extraction. |
| `packages/auth/package.json` | Declared missing test/lint/type-check dependencies and aligned Vitest command with workspace pattern. |
| `apps/auth/lib/auth-server.ts` | Local auth sessions can create `local.booking.user` with Booking read permission; default local subject is configurable by `AUTH_LOCAL_SUBJECT_ID`. |
| `apps/auth/app/api/auth/sign-in/route.ts` | Local auth bypass now mints the configured local subject instead of hardcoded `local-user`. |
| `apps/auth/app/api/auth/callback/route.ts` | Local callback session now mints the configured local subject instead of hardcoded `local-user`. |
| `apps/booking/lib/bookings.ts` | Booking BFF headers now require a session-derived actor; missing actors fail before backend fetch. |
| `apps/booking/lib/bookings.test.ts` | Added actor propagation and no-fetch-on-missing-actor coverage. |
| `apps/booking/app/bookings/page.tsx` | Existing Booking list page derives actor from `lc_session` before loading data. |
| `apps/booking/app/bookings/[bookingId]/page.tsx` | Existing Booking detail page derives actor from `lc_session` before loading data. |
| `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java` | Backend read/command actor resolver now rejects blank actors instead of falling back to `local-user`. |
| `services/booking-service/container/src/test/java/com/linercore/platform/booking/container/api/BookingApiControllerTest.java` | Added read-path blank actor rejection coverage. |
| `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/BookingLocalIdentityFilter.java` | Allows `local.booking.user` for local `booking-bff` service identity while preserving existing `local-user` fixture. |
| `services/booking-service/container/src/test/java/com/linercore/platform/booking/container/BookingLocalIdentityFilterTest.java` | Added `local.booking.user` acceptance coverage. |
| `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/BookingLocalAuthorization.java` | Grants local Booking actions to `local.booking.user` for U01/U02 local proof. |
| `services/booking-service/container/src/test/java/com/linercore/platform/booking/container/BookingLocalAuthorizationTest.java` | Added local Booking user authorization coverage. |
| `compose.yaml` | Added `apps-shell`, `AUTH_LOCAL_SUBJECT_ID`, auth callback URL through Nginx, shell healthcheck, and Nginx dependency. |
| `infrastructure/nginx/default.conf` | Routes `/` and `/booking*` to shell; preserves `/auth/`, `/reference-data/`, and `/health`; forwards host/proto/correlation headers. |
| `yarn.lock` | Updated Yarn workspace lock metadata for `@erp/app-shell` and auth package manifest changes. |

## Key Decisions

- `apps/shell` calls the existing `apps-booking` BFF via `BOOKING_APP_URL` rather than calling booking-service directly. This preserves the intended shell -> Booking BFF -> booking-service seam and keeps `BOOKING_SERVICE_TOKEN` out of shell.
- Shared session helpers live in `packages/auth`, not in an app-private module, so shell and Booking BFF use the same `lc_session` decode and actor extraction rules.
- U01 leaves Booking create, deny UI, sign-out/expiry, `/bookings*` compatibility redirects, and final detector packaging to later units.
- Existing local `local-user` fixtures remain for prior W1-local tests, but mounted shell/Booking runtime paths no longer synthesize `local-user`.

## Test Coverage Summary

| Check | Result |
| --- | --- |
| `yarn workspace @erp/auth test` | PASS - 11 tests. |
| `yarn workspace @erp/auth typecheck` | PASS. |
| `yarn workspace @erp/auth lint` | PASS. |
| `yarn workspace @erp/app-booking test` | PASS - 19 tests. |
| `yarn workspace @erp/app-booking typecheck` | PASS. |
| `yarn workspace @erp/app-booking lint` | PASS. |
| `yarn workspace @erp/app-shell test` | PASS - 6 tests. |
| `yarn workspace @erp/app-shell typecheck` | PASS. |
| `yarn workspace @erp/app-shell build` | PASS; Next.js emitted the existing ESLint-plugin warning only. |
| `yarn workspace @erp/app-shell lint` | PASS; Next.js emitted deprecation/plugin warnings only. |
| `mvn -f services/pom.xml -pl booking-service/container -am "-Dtest=BookingApiControllerTest,BookingLocalIdentityFilterTest,BookingLocalAuthorizationTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` | PASS - 16 targeted booking-container tests; reactor build success. |
| `docker compose config --quiet` | PASS. |

## Deviations From Plan

- The named `aidlc-developer-agent` could not start because its configured `openai.gpt-5.5` model is unavailable for this Codex account, and a worker retry was blocked by the active thread limit. The approved plan was implemented inline.
- The required architecture reviewer subagent could not start because the active thread limit was reached. Review was performed inline and this limitation is preserved explicitly.
- Step 7 named `BOOKING_SERVICE_URL`/`BOOKING_SERVICE_TOKEN` for shell only if shell hosted BFF logic. The implemented shell calls `apps-booking` through `BOOKING_APP_URL`, so shell does not receive the Booking service token.

## Remaining Risks

- Live Compose/Nginx/Keycloak proof has not been run in this code-generation stage. U01 Build and Test must exercise the browser path through Nginx and capture evidence.
- The auth app still contains explicit local/test bypass support; that is intentional and profile-gated, but detector 6d must confirm mounted shell/Booking paths do not depend on `local-user`.
- W1's live-proof waiver remains a BLOCKED `compose-start` waiver and was not rewritten as a PASS.

## Review

Verdict: READY

Findings:

1. U01 stays vertical and scoped. The implementation adds `apps/shell`, Nginx/Compose routing, existing auth reuse, shell-to-Booking-BFF forwarding, BFF actor propagation, and booking-service actor rejection without expanding into create, deny, sign-out, route compatibility, or final audit packaging.
2. The protected Booking path no longer synthesizes `local-user`. `apps/booking` requires a session-derived actor before fetch, `serviceHeaders` requires a non-blank actor, and booking-service rejects blank actor values. Existing `local-user` references remain only in auth bypass and legacy/local test fixtures.
3. Prior-work boundaries are preserved. `/auth/`, `/reference-data/`, `/health`, existing Booking direct app routes, and W1 local fixtures remain in place. W1's live-proof waiver is still documented as BLOCKED, not PASS.
4. Verification is adequate for code generation. Shared auth, Booking BFF, shell tests, shell build/type-check/lint, Booking type-check/lint, auth type-check/lint, targeted backend actor tests, and Compose config validation passed.
5. Remaining live-proof work is correctly deferred to Build and Test/U06. No Compose browser evidence is claimed in this stage.

Required changes: none before the next code-generation unit.
