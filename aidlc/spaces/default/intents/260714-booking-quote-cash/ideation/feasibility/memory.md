<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations

- 2026-07-15T07:52:34Z — Evaluate W1-01 against the canonical local Compose runtime first; cloud deployment is a later operation concern unless an existing requirement makes it a release blocker.

## Deviations

## Tradeoffs

- 2026-07-15T07:52:34Z — Prefer an explicit Kafka-only cutover for Booking-to-CMM confirmation over temporary dual delivery; dual delivery obscures idempotency defects and preserves the contract drift W1 is meant to remove.

## Open questions
