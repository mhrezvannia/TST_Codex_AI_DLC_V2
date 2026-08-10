# Reliability Design - U03 Agreement Pricing

## Claim and Completion

`PricingClaimService` is a separate proxied bean so claim/complete `REQUIRES_NEW` commits are real. Claim insert/live replay/conflict/expired CAS are single SQL outcomes. `complete(PricingTerminalOutcome)` updates only current owner/status/lease and writes result or manual case atomically; zero-row completion rereads winner.

Booking persists no pending state before HTTP. Same-key retry after crash replays terminal Charge result; live claim returns lease-bounded retry guidance. Timeout/503/breaker maps one Booking work item, while reached manual maps Charge diagnostic plus linked Booking work. Health exposes DB/config and breaker metrics; restart tests cover each crash point.

Charge disables automatic baseline-on-migrate. Before any Flyway action, its service-owned migration strategy accepts existing valid history, an empty schema, or a non-empty no-history schema that exactly matches the checked-in Charge V1 catalog fingerprint; every unknown or partial catalog aborts startup before baseline or migration.

## Source Coverage

Design implements `reliability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and U03 `business-logic-model.md`.
