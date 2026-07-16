<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-15T11:33:00Z — Treat W1 as an extension of the existing ports-and-adapters services and shared messaging foundation; Application Design adds consumer, pricing, projection, and frontend boundaries without introducing a new platform or cross-service database.
- 2026-07-15T12:11:06Z — Treat W0's registered flat Booking/CMM subjects as unreleased local candidates rather than released v1 history; W1 must export and retire those two disposable-local subjects before registering canonical version 1, while any non-local legacy fingerprint blocks deployment instead of being reset.

## Deviations

- 2026-07-15T12:11:06Z — Used an independent default reviewer after the named architecture-reviewer role failed to start because its pinned model is unsupported by the ChatGPT-backed Codex session; the fallback reviewer produced a NOT-READY verdict and six concrete blockers that were incorporated.
- 2026-07-15T14:13:38Z — Completed a user-selected inline final recovery review after both configured independent iterations ended NOT-READY; the artifact preserves both independent findings and labels the final READY verdict non-independent.

## Tradeoffs

- 2026-07-15T11:33:00Z — Prefer a direct transactional listener-to-application-service path over a second generic inbox relay; persisted event identity still provides dedupe while avoiding another scheduler and latency budget on the five-second round trip.
- 2026-07-15T12:11:06Z — Adopt Flyway baselines and additive W1 migrations in the three changed services; this adds migration tooling now but is necessary to preserve W0 data and produce ordered, repeatable upgrade evidence.

## Open questions

- 2026-07-15T11:33:00Z — Confirm consumer transactions, legacy HTTP retirement, projection ownership, pricing API ownership, contract cutover, and frontend/BFF boundaries.
