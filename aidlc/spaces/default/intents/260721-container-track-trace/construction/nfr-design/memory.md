# NFR Design Memory

## Interpretations

- 2026-07-22T05:55:00Z - U01 design uses existing indexed service-owned queries, fenced outbox retry, and explicit CMM/Booking adapter boundaries; no cache or new orchestration component is introduced.

## Deviations

- 2026-07-22T05:55:00Z - NFR design remains local-acceptance focused and does not add production autoscaling, rate-limit, or availability commitments.

## Tradeoffs

- 2026-07-22T05:55:00Z - Bounded pagination and connection pools were selected over cache/CDN complexity so evidence remains truthful on the isolated additive-migration stack.

## Open questions

- 2026-07-22T05:55:00Z - None for U01 NFR design; implementation must preserve the approved status contract and service-owned migration boundaries.
- 2026-07-22T06:10:00Z - U01 NFR Design independent review iteration 1 is READY; indexed bounded reads, fail-closed authorization, additive migrations, fenced relay, exact status contract, UI ownership, W1/demo/8088 safeguards, and scope limits were affirmed.
- 2026-07-22T06:25:00Z - U02 NFR Design selected atomic conflict evidence, event-targeted fenced retry seams, and receipt-plus-strongest-projection ordering; no cache, synchronous CMM query, or new orchestrator is introduced.
- 2026-07-22T06:40:00Z - U02 NFR Design review iteration 1 NOT-READY findings were remediated with executable controller/DB clocks and fences, deterministic ten-delivery evidence, named duplicate-delivery persistence, bounded security/redaction evidence, and preserved W1/demo/isolated-stack constraints.
- 2026-07-22T06:55:00Z - U02 NFR Design independent review iteration 2 is READY; all four findings were verified resolved and final sensors remain green.
- 2026-07-22T07:10:00Z - U03 NFR Design selected fail-closed Identity/last-known Reference Data handling, non-authoritative capability hints with POST reevaluation, and labeled last-known data with user-triggered Retry.
- 2026-07-22T07:25:00Z - U03 NFR Design independent review iteration 1 is READY; ordered authorization, degraded freshness, exact matrix, timing, redaction, UI ownership, W1/demo/isolated-stack boundaries were affirmed.
