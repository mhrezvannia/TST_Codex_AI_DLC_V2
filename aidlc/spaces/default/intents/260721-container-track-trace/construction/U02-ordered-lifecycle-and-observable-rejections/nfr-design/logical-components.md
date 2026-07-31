# Logical Components - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Component Inventory

This inventory bridges U02 `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

| Component | Owner | Failure domain | Responsibility |
|---|---|---|---|
| Capture boundary/policy | CMM | REST/application | Fresh auth/reference checks and typed conflict response |
| Journey aggregate/repository | CMM | PostgreSQL transaction | Lock, transition, accepted/rejection write sets |
| Outbox relay/fence | CMM | Worker/Kafka producer | Event-targeted retry and worker/token/version fence |
| Status topic/schema | Platform | Kafka | Ordered `containermovement.status` transport |
| Booking consumer/receipt | Booking | Consumer/DB | PROCESSING/retry, unique receipt, DUPLICATE/STALE classification |
| Latest projection/health | Booking | Booking read model | Strongest status and consumer-owned UI provenance |
| CMM conflict UI | CMM-owned frontend | Browser/edge | Focused 409 summary, preserved input, no optimistic lifecycle |

No EDI/public DCSA API, fleet/depot/M&R, shared shell, `packages/ui`, or new
orchestration service is introduced. W1 remains BLOCKED/waived; demo guard and
isolated stack controls remain mandatory.

