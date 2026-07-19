# Code Generation Plan - U04 Sign-Out and Session Expiry Guard

## Unit Scope

U04 proves the shell terminates the server-recognized session through the existing auth-owned sign-out path and that protected shell/Booking paths require authentication again after sign-out or expiry. Stale Booking calls must fail closed before booking-service and must not proceed as `local-user`.

Traceability: US-01 and US-03; FR-03, FR-05, FR-08, FR-11; NFR-02, NFR-03, NFR-05, NFR-07, NFR-09.

## Plan Steps

- [x] Step 1: Existing sign-out contract verification. Add/confirm auth route tests for `POST /api/auth/sign-out` proving `303` Keycloak logout redirect, `post_logout_redirect_uri=/signed-out`, and `lc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`. Traceability: SIGNOUT-01, SIGNOUT-02, SIGNOUT-04; FR-03, FR-08.
- [x] Step 2: Shell sign-out adapter. Add a same-origin shell API route or server action that delegates `POST /api/auth/sign-out` to the existing auth app endpoint without introducing a second session-clearing implementation. Traceability: SIGNOUT-01; NFR-03.
- [x] Step 3: Shell user menu sign-out control. Render a keyboard-accessible sign-out form/button in `ShellFrame` with stable `data-testid` attributes and no raw token/session serialization. Traceability: UI-01, UI-03; NFR-07, NFR-09.
- [x] Step 4: Protected route expiry guard tests. Extend shell session tests to prove expired cookies and blank actors redirect to auth-required state for `/` and `/booking`. Traceability: SIGNOUT-03, STALE-01; FR-08, FR-11.
- [x] Step 5: Stale Booking call fail-closed tests. Extend shell/Booking BFF tests to prove absent or expired `lc_session` returns `401 AUTH_REQUIRED` before backend fetch, preserving correlation id and never synthesizing `local-user`. Traceability: STALE-02, STALE-04; FR-05, FR-11; NFR-03.
- [x] Step 6: UI/state tests. Add component/route-level tests proving the user menu includes sign-out and signed-out/auth-required states do not show stale identity or protected Booking data. Traceability: UI-01, UI-02; NFR-07, NFR-09.
- [x] Step 7: Verification commands. Run focused auth, shell, Booking BFF, and backend safety-net tests plus type-check, lint/build where touched, and `docker compose config --quiet`. Traceability: stage sensors and U04 DoD.
- [x] Step 8: Code summary. Write `code-summary.md` listing files changed, implementation decisions, test results, deviations, and live-proof handoff notes. Traceability: stage output contract.

## Non-Goals

- Do not add a parallel auth service or client-only logout.
- Do not add Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, Moment.js, or any new runtime service.
- Do not relax booking-service blank-actor hardening or introduce any `local-user` fallback on protected shell/Booking paths.
- Do not implement U05 route compatibility redirects or U06 final audit packaging.
- Do not rewrite W1's live-proof waiver from BLOCKED at `compose-start` into PASS.

## Planned Verification

| Check | Command |
| --- | --- |
| Auth sign-out/session tests | `yarn workspace @erp/app-auth test` |
| Shell session/UI/BFF tests | `yarn workspace @erp/app-shell test` |
| Shell type/build/lint | `yarn workspace @erp/app-shell typecheck`, `build`, `lint` |
| Booking BFF stale actor tests | `yarn workspace @erp/app-booking test`, `typecheck`, `lint` |
| Booking service blank actor safety net | Targeted Maven booking controller/authorization tests |
| Compose validation | `docker compose config --quiet` |
