# NFR Design Memory

## Interpretations

- 2026-07-21T19:12:00Z — Located NFR patterns on existing UI, shell, adapter, BFF/service, gate, wrapper, and evidence components; the stage’s generic AWS pattern catalog does not override the approved local-only scope.
- 2026-07-21T19:16:00Z — Treated state/theme/viewport scale as one implementation plus an evidence matrix, not duplicated route/component trees.

## Deviations

- 2026-07-21T19:14:00Z — Omitted generic caches, circuit breakers, automatic retries, bulkheads, failover, backups, autoscaling, and AWS services because no approved NFR or measured bottleneck requires them.

## Tradeoffs

- 2026-07-21T19:13:00Z — Chose explicit user retry over automatic retry to preserve command idempotency and avoid duplicate lifecycle effects.
- 2026-07-21T19:15:00Z — Kept the accessibility/state harness external to production routes; this increases test-helper responsibility but prevents debug modes from entering the application.

## Open questions

- 2026-07-21T19:17:00Z — No unresolved pattern or topology question remains after all five design decisions selected option A.

