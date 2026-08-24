# U01 PB-01 Request Spine - Functional Design Questions

## Context and Authority

These questions apply only to `U01-pb01-request-spine`. They consume the approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and the binding Refined Mockups artifacts. The user confirmed B01 readiness on 2026-08-10.

UI authority is, in order: approved W3-04 scope and requirements; security, accessibility, and technical standards; LinerCore `MASTER.md` and executable `@erp/ui`; approved W3-04 Refined Mockups; then advisory UI/UX Pro Max output. Booking owns the workflow and page composition inside the canonical shell. W3-04 does not edit `packages/ui`, create a local theme or primitive, or introduce a second Booking UI.

The UI/UX Pro Max data-dense form, focus, submit-feedback, linked-error, keyboard, reduced-motion, and responsive recommendations are retained. Its Enterprise Gateway, hero, sales CTA, logo carousel, replacement blue/amber palette, Fira fonts, remote font import, and spinner-led loading recommendations are rejected because they conflict with LinerCore.

Codebase graph evidence confirms the current seams that U01 must extend rather than replace: shell `forwardToBookingBff` and `loadShellBooking`; `POST /api/bookings` plus `POST /api/bookings/drafts`; `BookingApiController.createDraft`; `BookingApplicationService.createDraft`; `JdbcBookingRepository.save/findById`; and canonical shell routes `/booking/new` and `/booking/{bookingId}`.

## Questions

### Q1. Which create endpoint is canonical for U01 while the existing legacy create route remains in the codebase?

- A. Make shell `POST /api/booking/bookings/drafts` to Booking `POST /api/bookings/drafts` the only new W3-04 implementation path; keep existing `POST /api/bookings` as an unchanged compatibility surface until U08 convergence (recommended)
- B. Implement identical W3-04 behavior independently in both create endpoints
- C. Remove the existing `POST /api/bookings` route during U01
- X. Other (please specify)

[Answer]: A - shell POST /api/booking/bookings/drafts to Booking POST /api/bookings/drafts is the only new W3-04 create path; existing POST /api/bookings remains unchanged until U08 convergence.

### Q2. How should U01 introduce the approved request persistence shape without taking U04 migration work early?

- A. Write new U01 records through the additive current snapshot/projection shape needed by W3-04, while leaving pre-W3 upcast, corpus backfill, ledger, restart, and correction behavior to U04 (recommended)
- B. Store U01 facts only in the legacy attributes map and defer the typed/current writer to U04
- C. Implement the complete pre-W3 migration and backfill in U01
- X. Other (please specify)

[Answer]: A - new U01 records use the additive current snapshot/projection writer; pre-W3 upcast, backfill, ledger, restart, and correction remain U04.

### Q3. Where should the boundary fall between U01's real voyage seam and U03's complete schedule behavior?

- A. U01 persists a route-compatible selected voyage with the full available confirmation-grade snapshot and permits a truthfully incomplete draft when schedule facts are absent; U03 later adds the complete provenance, variance, stale/partial/incompatible classification, and full recovery matrix (recommended)
- B. U01 rejects draft save unless every carrier schedule fact is present
- C. U01 implements all U03 schedule states and recovery behavior immediately
- X. Other (please specify)

[Answer]: A - U01 persists the available authoritative route-compatible selected-voyage snapshot and permits truthful incompleteness; U03 owns the full schedule classification, variance, provenance, and recovery matrix.

### Q4. What should happen in the shell immediately after the 2.5-second create boundary produces an unknown outcome?

- A. Preserve the form and operation UUID, show the approved `#save-status` outcome-unknown state, and require explicit non-mutating Refresh against `GET /api/bookings/operations/{operationId}`; never blind-resubmit or generate a new identity (recommended)
- B. Poll operation status continuously until a terminal outcome with no explicit operator action
- C. Automatically resubmit the create command with a new operation identity
- X. Other (please specify)

[Answer]: A - preserve the form and request UUID when the save outcome is unknown; expose #save-status with an explicit non-mutating Refresh status action, and never blindly resubmit or create a new identity.

### Q5. After an authoritative create succeeds or a status Refresh discovers the committed result, where should the operator land?

- A. Navigate to canonical `/booking/{bookingId}?tab=overview` with a one-time created/saved status announcement and stable focus target; reopening later uses the same route without the transient announcement (recommended)
- B. Stay on `/booking/new` and replace the form in place with read-only content
- C. Navigate to the legacy `/bookings/{bookingId}` composition
- X. Other (please specify)

[Answer]: A - navigate to /booking/{bookingId}?tab=overview after success, announce the saved or created status once, and move focus predictably on the canonical booking-detail route.

## Ambiguity Check

All five `[Answer]:` tags are complete and the consolidated decisions were approved by the user. No vague answer, contradiction, or missing detail remains for U01 artifact generation. The accepted design introduces no second UI, copied provider authority, local shared primitive, destructive migration, blind retry, fabricated schedule fact, or weaker live evidence.
