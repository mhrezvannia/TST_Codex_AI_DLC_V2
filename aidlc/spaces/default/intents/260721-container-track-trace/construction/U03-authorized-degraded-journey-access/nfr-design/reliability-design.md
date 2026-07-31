# Reliability Design - U03 Authorized Degraded Journey Access

## Inputs and Recovery

This design implements U03 `reliability-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. Identity failures
fail closed and Reference Data failures distinguish authorized last-known GET
from capture 503 before idempotency. No authorization result is cached.

User-triggered Retry starts fresh Identity and Reference Data evaluations. A
single controller observes dependency readiness, then independently polls API
freshness and focused UI freshness every 500 ms; both converge within 30 seconds.
Previously rendered content is visibly stale/inert during Identity failure, and
no movement is queued or automatically replayed. Real DENY writes exactly one
security audit; passive hints and outages write no CMM business row.

