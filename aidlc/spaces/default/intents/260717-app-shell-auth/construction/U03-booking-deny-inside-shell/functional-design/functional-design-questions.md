# Functional Design Questions - U03 Booking Deny

## Source Context

This questions file consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U03 covers `local.reference.admin` denied behavior inside the shell, real-subject deny evidence, fail-closed authorization, and accessible denied UI.

## Questions and Answers

1. Which subject proves the deny path?
   - A. `local.reference.admin` authenticated but without Booking permissions.
   - B. Anonymous user before login.
   - C. `local.booking.user` with Booking permissions.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-12 and U03 DoD.

2. Where should the deny decision be produced?
   - A. identity-service authorization via booking-service adapter.
   - B. Shell-only route filtering with no backend evidence.
   - C. Empty Booking response treated as denied.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-06 and ADR-005.

3. What user experience closes U03?
   - A. Access denied renders inside shell with request-access/back actions and correlation/decision reference.
   - B. Redirect to a blank standalone error page.
   - C. Show an empty Booking list.
   - X. Other (please specify)
   - `[Answer]:` A - required by FR-07, US-03, and `mockups.md`.

4. What frontend constraints apply?
   - A. Existing Next.js/React/TypeScript patterns; no Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
   - B. New client state library for denied routes.
   - C. New styling stack.
   - X. Other (please specify)
   - `[Answer]:` A - required by NFR-07 and U03 remediation in `unit-of-work.md`.

## Ambiguity Analysis

No blocking ambiguity remains. U03 intentionally proves authenticated unauthorized behavior, not anonymous redirect, create allow, sign-out, or route compatibility.
