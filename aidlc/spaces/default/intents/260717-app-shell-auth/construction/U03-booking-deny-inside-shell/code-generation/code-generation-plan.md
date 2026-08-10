# Code Generation Plan - U03 Booking Deny Inside Shell

## Unit Scope

U03 proves an authenticated subject without Booking permissions, `local.reference.admin`, reaches the shell and receives an explicit access-denied state for Booking. It builds on U01 session/actor propagation and U02 identity authorization, and it must not hide the route, return an empty success, or fall back to `local-user`.

Traceability: US-02 and US-03; FR-06, FR-07, FR-12; NFR-02, NFR-04, NFR-07, NFR-09.

## Plan Steps

- [x] Step 1: Deny fixture preservation checks. Confirm identity catalog/seed still grants Booking read/create only to `booking-desk`/`local.booking.user` and not to `local.reference.admin`; add or update tests if coverage is missing. Traceability: FR-12; NFR-03, NFR-06.
- [x] Step 2: Local auth subject selection. Extend the local-only auth bypass/sign-in helper so live proof can request `local.reference.admin` deterministically without changing the default `local.booking.user` allow-path subject. Add tests proving subject selection is local/profile-gated and still does not expose tokens. Traceability: FR-02, FR-03, FR-12; NFR-01.
- [x] Step 3: Shell denied view model/component. Add an in-shell access-denied component for authenticated-but-unauthorized Booking responses with breadcrumbs, active Booking navigation, subject text, resource/action, correlation id, request-access link, and safe back/home actions. Include `data-testid` attributes and keyboard-accessible controls. Traceability: FR-07; NFR-04, NFR-07, NFR-09.
- [x] Step 4: Shell Booking route deny mapping. Change shell `/booking`, `/booking/new`, and `/booking/[id]` data/action paths so 403 Booking BFF/backend responses render or return the denied state rather than fake empty lists or generic unavailable states. Traceability: US-02, US-03; FR-06, FR-07; NFR-02.
- [x] Step 5: BFF/backend deny response preservation. Ensure Booking BFF preserves 403 status, safe message/code, and correlation id from booking-service/identity denial; no retry or fallback actor is introduced. Add tests for 403 mapping if not already covered. Traceability: FR-05, FR-06, FR-10; NFR-03, NFR-04.
- [x] Step 6: Shell tests. Add tests for authenticated denied `/booking` rendering, denied create/detail states where practical, request-access link construction, and no empty-list success for denied responses. Traceability: FR-07; NFR-07, NFR-09.
- [x] Step 7: Verification commands. Run focused shell/Booking/auth/identity/booking-service tests, type-checks, lint, shell build, and `docker compose config --quiet`. Document exact results. Traceability: stage sensors and U03 DoD.
- [x] Step 8: Code summary. Write `code-summary.md` listing files changed, decisions, test coverage, deviations, and live-proof risks. Traceability: stage output contract.

## Non-Goals

- Do not implement U04 sign-out/session expiry guard, U05 route compatibility redirects, or U06 final detector/audit packaging.
- Do not grant Booking permissions to `local.reference.admin`.
- Do not replace backend authorization with shell-only role checks.
- Do not rewrite W1's live-proof waiver from BLOCKED at `compose-start` into PASS.

## Planned Verification

| Check | Command |
| --- | --- |
| Auth local subject tests | `yarn workspace @erp/app-auth test` or targeted auth tests if package script permits |
| Shell tests/type/build/lint | `yarn workspace @erp/app-shell test`, `typecheck`, `build`, `lint` |
| Booking BFF tests/type/lint | `yarn workspace @erp/app-booking test`, `typecheck`, `lint` |
| Identity deny fixture tests | Targeted Maven identity authorization tests |
| Booking service deny tests | Targeted Maven booking authorization/controller tests |
| Compose validation | `docker compose config --quiet` |
