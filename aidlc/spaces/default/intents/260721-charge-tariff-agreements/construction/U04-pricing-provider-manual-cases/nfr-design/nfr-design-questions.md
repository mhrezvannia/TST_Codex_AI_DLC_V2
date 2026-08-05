# NFR Design Questions - U04 Pricing Provider and Manual Cases

## Resolution

No open design question requires a new user decision. The approved upstream
artifacts already fix separate measurements for each pricing outcome at 10
clients, 20 contention rounds, 100,000 receipts, 10,000 OPEN manual cases,
local RPO 0, recovery within 120 seconds, and use of the existing Charge,
PostgreSQL, and web stack.

## Applied sources

- `performance-requirements.md`
- `security-requirements.md`
- `scalability-requirements.md`
- `reliability-requirements.md`
- `tech-stack-decisions.md`
- `business-logic-model.md`

These inputs fully determine the five U04 NFR design artifacts.
