# Infrastructure Design Memory

## Interpretations

- 2026-07-05T19:31:00Z - The engine emitted infrastructure-design without a single `unit` field; produced per-unit artifacts for U01-U10.
- 2026-07-25T21:42:51Z - Treated local/on-prem Compose as the W2-03 release topology because project rules make live Compose the exit gate and no cloud production target is approved.

## Deviations

- 2026-07-05T19:31:00Z - Questions were answered from approved design artifacts and current local runtime constraints because the user asked to continue without repeated prompts.
- 2026-07-25T21:42:51Z - Added authoritative aggregate outputs at the stage root and retained per-unit artifacts as history; the directive again named no unit and the aggregate maps shared infrastructure across U01-U10.

## Tradeoffs

- 2026-07-05T19:31:00Z - Designed host-runtime first with Compose/cloud parity as a later hardening path; Docker remains blocked locally and must not be represented as passing.
- 2026-07-25T21:42:51Z - Rejected speculative AWS resources, caching, and sharding; prioritized durable local PostgreSQL, health gating, observable pricing, and CI/live evidence.

## Open questions

- 2026-07-05T19:31:00Z - Confirm AWS deployment target and production environment topology before Operation provisioning.
- 2026-07-25T21:42:51Z - Production orchestrator/region/RTO/RPO and jurisdiction-specific tariff-publication obligations remain unresolved and outside the W2-03 local release claim.
