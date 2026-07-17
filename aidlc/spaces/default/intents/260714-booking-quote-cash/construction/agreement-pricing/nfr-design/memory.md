<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T08:14:00Z - Keep retry/breaker at the Booking HTTP adapter and claim fencing inside Charge transaction services.

## Deviations

## Tradeoffs

- 2026-07-16T08:14:00Z - Reject caching prices/agreements in Booking; replay persisted Charge results instead.

## Open questions
