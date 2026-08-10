# Functional Design Questions - U02 Booking Create Allow

## Source Context

This questions file consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U02 covers the create/detail allow path for `local.booking.user` through shell, Booking BFF, booking-service, identity-service, persistence, and evidence.

## Questions and Answers

1. Where should the allow-path identity decision happen?
   - A. booking-service authorization adapter calls identity-service `/internal/identity/authorize`.
   - B. Shell checks roles locally and skips backend authorization.
   - C. Booking BFF hardcodes allow for local users.
   - X. Other (please specify)
   - `[Answer]:` A - fixed by ADR-005 and `component-methods.md`.

2. Which deterministic allow subject closes U02?
   - A. `local.booking.user` with `booking-desk` access and Booking permissions.
   - B. Existing `local-user` bypass.
   - C. Any arbitrary Keycloak user without seed evidence.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-12 and U02 DoD.

3. Which Booking behavior is in U02 scope?
   - A. Create a Booking and retrieve `/booking/[id]` inside shell while preserving W1 behavior.
   - B. Full Booking workflow completion and all downstream modules.
   - C. Read-only list proof only.
   - X. Other (please specify)
   - `[Answer]:` A - U02 owns create/detail allow; confirm/validate/price mappings are designed but only exercised if preserved W1 behavior exposes them in this path.

4. How should identity or actor failures behave?
   - A. Fail closed with deny/error evidence and no fallback to `local-user`.
   - B. Retry with `local-user`.
   - C. Allow create but mark audit unknown.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-05, FR-06, NFR-02, and NFR-03.

## Ambiguity Analysis

No blocking ambiguity remains. Construction must still choose the exact file location for the `local.booking.user` fixture, but U02 requires the fixture and permissions to exist before the Bolt closes.
