<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-07-21T13:23:30Z — used stable list, create/edit, and detail routes for agreements and rate entries instead of extending the current single workbench; repeated operational records need shareable URLs, browser history, focused states, and reliable return-to-list behavior.
- 2026-07-21T13:31:00Z — made rate approval explicit as Draft to immutable Approved while treating Scheduled, Effective, and Expired as derived window labels; the approved intent requires a changed rate version to be approved but does not justify a larger publication workflow.
- 2026-07-21T13:31:00Z — modeled POL THC as origin-port plus equipment applicability rather than a lane; the W2-03 local-charge example is explicitly POL-local while OFR and BAF use the trade-lane pair.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-07-21T13:23:30Z — rejected ui-ux-pro-max marketing gateway, new palette/fonts, spinners, generic bulk edit, and dashboard-card recommendations; the binding LinerCore master requires a quiet shared-shell workbench, existing tokens/typography, skeletons, and bounded Charge ownership.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-07-21T13:23:30Z — unified BASE, SURCHARGE, and LOCAL entries in one filterable rate-management route while keeping their category semantics visible; three duplicate page systems add navigation and maintenance cost without user value in the thin slice.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-07-21T13:23:30Z — Application Design must reconcile the current root-only Charge workbench with the stable child routes and confirm the minimum existing Booking pricing-panel changes needed to render provenance without shifting Booking page ownership.
