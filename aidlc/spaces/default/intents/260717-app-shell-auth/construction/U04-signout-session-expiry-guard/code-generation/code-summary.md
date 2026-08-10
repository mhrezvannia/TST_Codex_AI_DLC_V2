# Code Summary - U04 Sign-Out and Session Expiry Guard

## Scope Implemented

U04 adds the shell-visible sign-out path and pins session-expiry/stale-call behavior with tests. The implementation preserves the existing auth-owned `POST /api/auth/sign-out` endpoint as the only code path that clears `lc_session` and constructs the Keycloak logout redirect.

## Files Created

- `apps/shell/app/api/auth/sign-out/route.ts` - shell same-origin adapter that redirects browser `POST` requests to `/auth/api/auth/sign-out` without clearing cookies itself.
- `apps/shell/app/api/auth/sign-out/route.test.ts` - proves the shell adapter delegates and does not emit `Set-Cookie`.
- `apps/shell/app/ShellFrame.test.tsx` - proves the authenticated user menu renders a POST sign-out control.
- `apps/shell/app/signed-out/page.tsx` - root `/signed-out` page for the auth logout `post_logout_redirect_uri`.
- `apps/shell/app/signed-out/page.test.tsx` - proves signed-out state does not render stale identity or protected Booking content.

## Files Modified

- `apps/shell/app/ShellFrame.tsx` - added the keyboard-accessible user-menu sign-out form posting to `/api/auth/sign-out`.
- `apps/shell/app/shell.css` - added compact user identity, sign-out button, and signed-out page styling.
- `apps/shell/lib/shell-auth.test.ts` - added expired-session guard tests for `/` and `/booking`.
- `apps/auth/lib/auth-server.test.ts` - added sign-out route proof for Keycloak logout redirect and `lc_session` clear semantics.
- `apps/booking/lib/bookings.ts` - split stale BFF handling into no valid session (`401 AUTH_REQUIRED`) versus unusable actor (`403 BOOKING_ACTOR_REQUIRED`) before backend fetch.
- `apps/booking/lib/bookings.test.ts` - added no-session, expired-session, and blank-subject BFF no-fetch tests.

## Key Decisions

- The shell adapter uses a `307` redirect to `/auth/api/auth/sign-out` so the browser preserves the `POST` method and the auth app remains the owner of cookie clearing and Keycloak logout construction.
- `/signed-out` is implemented in the shell because the existing auth route calculates `post_logout_redirect_uri` as root `/signed-out` under the public origin, and Nginx routes root paths to `apps-shell`.
- Booking BFF now distinguishes no current session from malformed/authenticated context without a usable subject, matching U04's `AUTH_REQUIRED` and `BOOKING_ACTOR_REQUIRED` contracts.
- No protected shell or Booking path synthesizes `local-user`; local bypass remains limited to the pre-existing explicit local/test auth surface.

## Verification

| Result | Command |
| --- | --- |
| PASS - 12 tests | `yarn workspace @erp/app-auth test` |
| PASS | `yarn workspace @erp/app-auth typecheck` |
| PASS, Next deprecation/plugin warnings only | `yarn workspace @erp/app-auth lint` |
| PASS - 15 tests | `yarn workspace @erp/app-shell test` |
| PASS | `yarn workspace @erp/app-shell typecheck` |
| PASS, Next plugin warning only | `yarn workspace @erp/app-shell build` |
| PASS, Next deprecation/plugin warnings only | `yarn workspace @erp/app-shell lint` |
| PASS - 22 tests | `yarn workspace @erp/app-booking test` |
| PASS | `yarn workspace @erp/app-booking typecheck` |
| PASS, Next deprecation/plugin warnings only | `yarn workspace @erp/app-booking lint` |
| PASS - 16 backend tests | `mvn -pl booking-service/container -am "-Dtest=BookingApiControllerTest,BookingLocalAuthorizationTest,BookingLocalIdentityFilterTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` from `services/` |
| PASS | `docker compose config --quiet` |

## Deviations and Notes

- Code generation was completed inline because the configured `aidlc-developer-agent` subagent path remained unavailable earlier in this intent due model/thread-limit failures; this deviation is recorded in shared code-generation memory.
- Initial Maven attempts did not run tests because of PowerShell argument parsing and root-reactor path mistakes; the final quoted `services/` reactor command with `-am` passed.
- Live Compose/browser evidence was not run in this stage. Build and Test must still capture the actual `POST /api/auth/sign-out`, Keycloak logout redirect, browser cookie-clear observation, protected route reauth, stale Booking no-fetch/no-`local-user` evidence, and keep the W1 live-proof waiver explicit as BLOCKED at `compose-start`, not PASS.
