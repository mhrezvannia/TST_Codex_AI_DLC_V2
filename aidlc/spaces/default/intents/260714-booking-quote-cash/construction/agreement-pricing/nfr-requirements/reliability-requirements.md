# Reliability Requirements - U03 Agreement Pricing

## Idempotent Recovery

- Claim and completion are separate `REQUIRES_NEW` transactions; terminal state is immutable and completion is fenced by owner token.
- Ten-second lease permits one atomic takeover; stale owner writes zero rows and rereads the winner.
- Booking persists no orphanable pending aggregate state; crash before apply leaves validated/manual state and same-key retry replays Charge result.
- Terminal manual outcome and one Charge diagnostic commit atomically; transport/circuit failure creates only one Booking work item.

## Fault Containment

One retry applies only to timeout/503. The endpoint breaker opens after five failed operations and permits one half-open probe after 30 seconds. `NO_RATE`, validation, timeout/503 exhaustion, and circuit-open persist no partial quote and keep Confirm blocked. Restart/replay tests prove one claim/result/work item.

For local acceptance, pricing recovery after a crashed claim is <=lease expiry plus one retry. Within the existing PostgreSQL volume, committed claim/result transactions survive service restart and failed transactions leave zero partial effects. Host/volume loss and production availability are outside W1; restore RPO is the latest captured dump.

## Source Coverage

Scenarios prove U03 `business-logic-model.md`, `business-rules.md`, and reliability clauses in `requirements.md` using Spring transactions/PostgreSQL from `technology-stack.md`.
