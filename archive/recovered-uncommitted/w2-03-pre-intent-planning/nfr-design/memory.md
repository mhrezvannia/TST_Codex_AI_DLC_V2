# NFR Design Memory

## Interpretations

- 2026-07-05T06:34:00Z - Treated nfr-design as aggregate per-unit output because the directive did not name one unit.
- 2026-07-25T21:27:42Z - Treated the user's explicit W2-03 resume target and `docs/intents/W2-03-charge-tariffs-and-agreements.md` as the current vertical-slice authority; the preserved record predates that statement and its agreement-only NFR files do not cover tariffs, surcharges, local charges, or rate-version quote reconstruction.

## Deviations

- 2026-07-05T06:34:00Z - Questions were answered from NFR requirements and functional design artifacts to continue without repeated prompts.
- 2026-07-25T21:27:42Z - Added authoritative aggregate NFR outputs at the stage root instead of rewriting sixty historical per-unit files; the engine directive did not name a unit and the aggregate explicitly maps all ten units.

## Tradeoffs

- 2026-07-05T06:34:00Z - Designed MVP-local patterns first and left production multi-AZ/outbox hardening to Operation stages.
- 2026-07-25T21:27:42Z - Avoided speculative caching, sharding, and public-cloud topology; W2-03 prioritizes correct immutable rate versions, indexed matching, transactional snapshots, and local Compose evidence.

## Open questions

- 2026-07-05T06:34:00Z - Confirm production topology and AWS account details before environment provisioning.
- 2026-07-25T21:27:42Z - The bilateral contract's 800 ms booking-time p99 remains provisional and must be reconciled with live measurements at acceptance.
