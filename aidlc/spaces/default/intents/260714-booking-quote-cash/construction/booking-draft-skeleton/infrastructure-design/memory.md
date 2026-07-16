<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T09:00:00Z - Infrastructure Design maps W1 to the existing local Compose stack; cloud production resources remain outside this intent.

## Deviations

## Tradeoffs

- 2026-07-16T09:00:00Z - Reuse one PostgreSQL container with isolated service databases/roles instead of provisioning per-service containers for the local proof.

## Open questions
