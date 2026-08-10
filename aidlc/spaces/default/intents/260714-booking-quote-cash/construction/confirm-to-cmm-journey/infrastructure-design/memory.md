<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T09:30:00Z - W0 shared messaging owns generic transport; U04 supplies service contracts, persistence, configuration, and business handling only.

## Deviations

## Tradeoffs

- 2026-07-16T09:30:00Z - One immediate producer retry satisfies Kafka idempotence while the outbox remains sole durable retry scheduler.

## Open questions
