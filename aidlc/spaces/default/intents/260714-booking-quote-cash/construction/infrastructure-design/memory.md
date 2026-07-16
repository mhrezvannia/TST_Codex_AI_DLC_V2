<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T10:05:00Z - Infrastructure Design extends the existing local Compose stack and W0 messaging module; it does not introduce cloud resources or a second platform.
- 2026-07-16T10:05:00Z - Shared physical services never weaken service-local database, migration, outbox, receipt, DLT, and business ownership.

## Deviations

## Tradeoffs

- 2026-07-16T10:05:00Z - One deterministic local instance per service proves the fixed W1 envelope; replica/autoscaling decisions require later capacity evidence.
- 2026-07-16T10:05:00Z - Release evidence uses an external signature plus Git finalization rather than treating workspace permissions as immutable storage.

## Open questions
