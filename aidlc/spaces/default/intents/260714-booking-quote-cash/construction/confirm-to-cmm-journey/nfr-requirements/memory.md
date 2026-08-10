<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T07:22:00Z - Allocate at most two seconds p95 from confirm response to committed CMM journey/status outbox, preserving downstream/UI budget within five seconds.

## Deviations

## Tradeoffs

- 2026-07-16T07:22:00Z - Accept at-least-once transport and require exactly-once business effects instead of introducing distributed transactions.

## Open questions
