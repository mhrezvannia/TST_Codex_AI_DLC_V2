# Scalability Design - U03 Authorized Degraded Journey Access

## Inputs and Isolation Model

This design implements U03 `scalability-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. REST edges remain
stateless; authorization decisions are request-scoped and never cached.

## Ten-Request Matrix

The exact ten concurrent requests and their per-row HTTP, lookup, denial-audit,
and CMM-business-row effects are those specified in the NFR requirements. Each
uses a fresh subject/session and correlation; protected lookup occurs only after
read ALLOW. Denied/unavailable captures cannot consume connection pools or
create idempotency, movement, outbox, or Booking effects. No provider RPS,
horizontal-scaling, cache, or read-replica target is introduced.

