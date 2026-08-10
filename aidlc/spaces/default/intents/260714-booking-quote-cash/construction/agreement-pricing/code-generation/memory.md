# Code Generation Memory - Agreement Pricing

## Interpretations

- 2026-07-16T14:09:52.9663876Z - Treated Charge `NO_RATE` as the U03 no-authority contract reason; legacy `NO_ACTIVE_AGREEMENT` assertions were updated rather than preserving the old reason code.
- 2026-07-16T14:09:52.9663876Z - Treated `MANUAL_PRICING` as the durable Booking lifecycle state for reached-service manual/no-rate outcomes; old exception-state assertions were replaced with manual-pricing attribute assertions.

## Deviations

- 2026-07-16T14:09:52.9663876Z - Reviewer subagent execution was replaced by inline review because the configured reviewer model is unsupported in this environment.

## Tradeoffs

- 2026-07-16T14:09:52.9663876Z - Added backward-compatible `FREIGHT` defaults for newly introduced charge categories so old snapshots remain readable while the new contract field is available on new writes.
- 2026-07-16T14:09:52.9663876Z - Implemented the Booking price button through the existing BFF proxy rather than adding a direct browser integration, preserving service-token containment.

## Open Questions

- 2026-07-16T14:09:52.9663876Z - Confirm whether expired pricing lease takeover and fenced stale-owner completion should be fully implemented in this unit or in a follow-up hardening unit.
