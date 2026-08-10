<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T07:10:00Z - Bound Reference Data fan-out and latency without introducing an authoritative Booking-side cache.

## Deviations

## Tradeoffs

- 2026-07-16T07:10:00Z - Prefer complete aggregate validation with bounded concurrency over fail-fast calls; deterministic diagnostics justify modest extra provider work.

## Open questions
