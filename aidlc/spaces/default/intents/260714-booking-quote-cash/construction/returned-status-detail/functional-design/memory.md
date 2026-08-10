<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-15T21:51:00Z - Use the approved lexicographic status ordering tuple and one-second bounded UI revalidation; these are direct consequences of the fixed p95 target and do not require another business decision.

## Deviations

## Tradeoffs

- 2026-07-15T21:51:00Z - Replace the Booking aggregate's generic movement attribute map with a dedicated projection, preserving append-only event facts and avoiding aggregate revision churn for read-model updates.

## Open questions
