<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-15T20:29:00Z - Treat reference validation as a typed aggregate decision over all canonical Booking references, not a sequence of indistinguishable boolean calls.

## Deviations

## Tradeoffs

- 2026-07-15T20:37:00Z - Perform provider evaluation outside the Booking transaction, then apply by expected revision/reference fingerprint; this avoids holding DB locks across HTTP while rejecting stale results.

## Open questions
