# Security Design - U03 Authorized Degraded Journey Access

## Inputs and Fail-Closed Flow

This design applies U03 `security-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. A verified subject
and fresh singular `AuthorizationPort.evaluate` read decision precede every
protected repository lookup. Identity DENY returns 403 with one safe denial
audit; Identity unavailability returns 503 with no protected data or CMM row.

Reference Data outage after authorized read produces only truthful persisted
last-known facts with capture disabled; capture outage returns typed 503 before
idempotency. Every POST reevaluates capture permission regardless of UI hint.
Error/audit/UI evidence redacts tokens, provider URLs, raw payloads, and stack
traces. Payload/identifier limits, pagination, timeouts, and the exact ten-row
matrix bound local abuse evidence without a production rate-limit claim.

