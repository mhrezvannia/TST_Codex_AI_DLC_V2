<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T09:40:00Z - The browser observes returned status only through Booking's persisted projection and BFF detail endpoint.

## Deviations

## Tradeoffs

- 2026-07-16T09:40:00Z - One-row monotonic projection avoids CMM read fan-out and distributed ordering infrastructure.

## Open questions
