# Application Design Memory

## Interpretations

- 2026-07-09T09:47:46+03:30 - Treated Application Design as required because Booking, CMM, pricing/D&D, full UI, contracts, and local runtime require new components and service-layer design.
- 2026-07-09T09:47:46+03:30 - Interpreted Charge Calculation and Customer Agreement as one Charge Service capability that extends the existing charge-agreement foundation rather than creating a premature second pricing service.
- 2026-07-09T09:47:46+03:30 - Interpreted the frontend target as one integrated enterprise web shell that can reuse existing apps/packages without letting UI own business rules.

## Deviations

- 2026-07-09T09:47:46+03:30 - Answered application-design planning questions from approved requirements, stories, refined mockups, and practices rather than stopping for another interview; the choices are captured in `application-design-questions.md` and remain reviewable at the approval gate.
- 2026-07-09T09:55:39+03:30 - The configured `aidlc-architecture-reviewer-agent` failed to start because `openai.gpt-5.4` is not supported with the current Codex account. Per prior review-stage handling, performed an inline architecture review and appended the verdict to `components.md`.

## Tradeoffs

- 2026-07-09T09:47:46+03:30 - Chose synchronous HTTP for Booking-to-Charge pricing because confirmation needs immediate pricing state, while keeping Booking/CMM lifecycle updates asynchronous for decoupling and event evidence.
- 2026-07-09T09:47:46+03:30 - Chose one local PostgreSQL container with separate logical databases/users rather than one DB container per service to preserve ownership while keeping Windows local runtime practical.

## Open questions

- 2026-07-09T09:47:46+03:30 - Delivery Planning must decide whether existing `apps/auth`, `apps/reference-data`, and `apps/charge-agreements` become module dev apps or are migrated into the new enterprise web app.
- 2026-07-09T09:47:46+03:30 - Functional Design must finalize exact API paths, schema fields, event subject names, database models, and state transition rules.
