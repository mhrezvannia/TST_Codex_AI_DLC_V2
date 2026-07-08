<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z - chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-06-30T14:01:00Z - Rough Mockups should cover two internal apps, `apps/reference-data` and `apps/auth`, rather than downstream commercial module screens.

## Deviations
<!-- example: 2026-05-29T10:14:32Z - skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z - picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-06-30T14:01:00Z - Using ASCII low-fidelity wireframes rather than visual assets because AI-DLC Rough Mockups asks for markdown wireframes and the deliverable is a decision artifact, not implementation UI.

## Open questions
<!-- example: 2026-05-29T10:14:32Z - confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-06-30T14:01:00Z - Confirm later whether `apps/auth` is a standalone sign-on app only or also owns permission-review screens.