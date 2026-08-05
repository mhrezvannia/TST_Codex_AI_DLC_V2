# Code Generation Memory

## Interpretations

- 2026-07-18T00:00:00Z - Treat U01 as shell-first but not shell-only; the walking skeleton must add `apps/shell`, route it through local Nginx, and remove protected Booking read dependence on a synthesized `local-user` actor.
- 2026-07-18T00:00:00Z - Treat U02 as the first mutation slice: shell must expose `/booking/new` and `/booking/[id]`, but booking-service remains the mutation authority and identity-service must authorize `booking:create` for the real subject before persistence.
- 2026-07-18T00:00:00Z - Treat U03 as explicit denied-state mapping, not a hidden-route or empty-list implementation; `local.reference.admin` must authenticate, attempt Booking access, receive backend/identity denial, and see the denial inside shell chrome.
- 2026-07-18T00:00:00Z - Treat U04 as session lifecycle proof over existing auth ownership: shell may provide a same-origin adapter/user-menu control, but only `apps/auth` clears `lc_session` and builds the Keycloak logout redirect.
- 2026-07-18T00:00:00Z - Treat U05 as fixed route compatibility, not a migration: `/bookings*` redirects to canonical `/booking*` in shell before any Booking BFF/backend data load, and prior W0/W1/W2 work stays preserved.
- 2026-07-18T00:00:00Z - Treat U06 code generation as evidence packaging and validation, not final live acceptance; dry-run output must be BLOCKED until live Compose/browser proof and audits populate real subject/correlation evidence.

## Deviations

- 2026-07-18T00:00:00Z - The named `aidlc-developer-agent` subagent could not start because its fixed `openai.gpt-5.5` model is unavailable for this Codex account, and a worker retry was blocked by the active thread limit; implementation was completed inline under the same approved plan.
- 2026-07-18T00:00:00Z - The required architecture reviewer subagent could not start because the active thread limit was reached; review was performed inline and the limitation was recorded in the U01 code summary.
- 2026-07-18T00:00:00Z - U02 also ran inline because the session's subagent thread limit remained reached after the U01 subagent failure; the U02 code summary records this instead of claiming delegated execution.
- 2026-07-18T00:00:00Z - U03 also ran inline under the same subagent-limit constraint; denial handling was implemented as explicit shell UI over real backend 403 responses, not as navigation hiding or an empty list.
- 2026-07-18T00:00:00Z - U04 also ran inline under the same subagent-limit constraint; implementation and verification are recorded in the U04 code summary without claiming delegated execution or reviewer execution.
- 2026-07-18T00:00:00Z - U05 also ran inline under the same subagent-limit constraint; compatibility and preservation evidence are recorded in the U05 code summary without claiming delegated execution or reviewer execution.
- 2026-07-18T00:00:00Z - U06 also ran inline under the same subagent-limit constraint; evidence package tooling and tests are recorded in the U06 code summary without claiming delegated execution or reviewer execution.

## Tradeoffs

- 2026-07-18T00:00:00Z - Prefer shared auth/session helpers in `packages/auth` over importing `apps/auth/lib/auth-server` from `apps/shell`; this keeps the new shell and Booking BFF on a reusable workspace contract while preserving the existing auth app as the owner of sign-in/callback/session routes.
- 2026-07-18T00:00:00Z - Route the shell Booking page through the existing `apps-booking` BFF over `BOOKING_APP_URL` rather than calling booking-service directly from shell; this keeps U01 on the intended shell -> Booking BFF -> booking-service seam and avoids putting `BOOKING_SERVICE_TOKEN` into `apps/shell`.
- 2026-07-18T00:00:00Z - Reuse W1 Booking form validation and BFF DTO shape in shell through shared package extraction rather than duplicating form rules in `apps/shell`; this reduces drift for U02 create/detail behavior.
- 2026-07-18T00:00:00Z - Use a `307` shell sign-out adapter to `/auth/api/auth/sign-out` so the browser preserves `POST` and the auth app remains the sole cookie-clearing owner; add root `/signed-out` in shell because Nginx routes the auth route's public `post_logout_redirect_uri=/signed-out` to `apps-shell`.
- 2026-07-18T00:00:00Z - Implement `/bookings*` compatibility as shell-owned 308 redirects instead of Nginx rewrites or Booking BFF proxying; this keeps route compatibility observable and prevents compatibility URLs from bypassing shell auth/session/actor checks.
- 2026-07-18T00:00:00Z - Add W2-01 evidence package tooling as a local Node script, not a runtime service; it validates package shape and creates honest BLOCKED dry-run evidence while keeping W1's compose-start waiver distinct from W2-01 status.

## Open questions
