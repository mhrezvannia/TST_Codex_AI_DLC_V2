<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-15T20:14:00Z - Treat U01 as an in-place canonical model migration, not a greenfield Booking rewrite; stable IDs, booking numbers, status/revision, lifecycle, pricing, and audit history must survive.

## Deviations

## Tradeoffs

- 2026-07-15T20:23:00Z - Keep one canonical Booking aggregate snapshot for brownfield compatibility while adding typed query/receipt/migration structures; public DTOs and business logic use typed routing/equipment, not JSON or legacy attributes.

## Open questions
