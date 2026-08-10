# Memory - Functional Design

## Interpretations

- 2026-07-18T00:00:00Z - The unresolved Construction gate was classified as walking skeleton `on`; team and project practices both require the first Bolt to prove a minimal shell/auth/Booking vertical path before wider work.
- 2026-07-18T00:00:00Z - The resolved directive targets only `U01-walking-skeleton-shell-login-booking-read`, so this stage writes U01 artifacts rather than all six units.
- 2026-07-18T00:00:00Z - After U01, the engine continues the same `functional-design` stage per unit; U02 is treated as a second per-unit design pass with the same upstream artifacts and no human gate.
- 2026-07-18T00:00:00Z - U03 functional design is prepared as the denied-path complement to U02; it must preserve `local.reference.admin` without Booking permissions and keep denied UI inside the shell.
- 2026-07-18T00:00:00Z - U04 functional design treats sign-out as a security boundary, not a UI-only action; stale shell and Booking calls must fail before any backend fallback can synthesize `local-user`.
- 2026-07-18T00:00:00Z - U05 functional design treats route compatibility and prior-work preservation as live behavior plus diff evidence, not a license to revalidate or rewrite prior intents.
- 2026-07-18T00:00:00Z - U06 functional design packages acceptance evidence only after U02-U05 are demonstrable; it must report W2-01 runtime blockers honestly and keep the W1 waiver separate.

## Deviations

- 2026-07-18T00:00:00Z - Functional-design questions are answered from approved prior artifacts because no genuine new ambiguity remains for U01; Construction questions are exceptional and should not reopen settled route/auth decisions.
- 2026-07-18T00:00:00Z - U04 review iteration 1 returned NOT-READY for missing concrete sign-out and BFF guard contracts; the design was patched with `POST /api/auth/sign-out`, `lc_session` deletion semantics, `proxyBooking`/`loadBookings`/`loadBooking` guard insertion points, and missing-actor response/evidence contracts.
- 2026-07-18T00:00:00Z - U06 review iteration 1 returned NOT-READY for loose evidence package shape, weak sign-out subject proof, and missing NFR-07 traceability; the design was patched with exact artifact names, required schemas, command result fields, blocker fields, sign-out subject/correlation evidence, and NFR-07 traceability.

## Tradeoffs

- 2026-07-18T00:00:00Z - U01 intentionally limits Booking behavior to one read path. Create, deny, sign-out, compatibility, and final audit are deferred to later Bolts so the walking skeleton proves the risky seam first.

## Open questions

- 2026-07-18T00:00:00Z - Code generation should verify whether the shell wrapper can call existing `safeSessionSummary` directly or needs a narrow adapter to suppress protected-path `local-user` creation.
