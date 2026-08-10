# Reliability Requirements - U03 Authorized Degraded Journey Access

## Source Alignment

These requirements specialize U03 `business-logic-model.md` and
`business-rules.md`, preserve `requirements.md` failure semantics, and use the
existing `technology-stack.md` transaction/dependency boundaries.

## Fail-Closed and Fresh Retry

Identity unavailability never discloses newly requested protected data and
never writes a CMM business row. Reference Data unavailability on an authorized
GET serves only persisted last-known facts with explicit dependency and checked
time; on capture it fails before idempotency. Retry is a new request with fresh
Identity and Reference Data evaluations, never automatic capture replay.

For each injected outage fixture, one single controller starts recovery timing
after dependency readiness is observed; API and UI independently converge to a
fresh authorized result within 30 seconds at 500 ms polling. No authorization
decision is cached. A real DENY writes exactly one complete denial audit; passive
capability hints and dependency outages write no CMM database row.

## Evidence and Non-Claims

Correlate subject, resource/action, decision, dependency state, response code,
audit, row-count deltas, and UI freshness. No uptime, backup, HA, DR, or RPO/RTO
claim is introduced.

