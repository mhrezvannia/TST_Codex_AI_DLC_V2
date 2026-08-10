# Reliability Requirements - U02 Reference Validation

## State Safety

- Provider HTTP runs outside Booking transactions; result application atomically checks expected revision and reference fingerprint.
- Provider unavailable leaves status, revision, lifecycle, and last completed validation snapshot unchanged while recording safe attempt audit.
- Complete invalid results replace prior blocked detail atomically; equivalent retries do not duplicate lifecycle effects.
- Service restart during provider evaluation leaves no partial business state; explicit retry starts a fresh evaluation.

## Dependency Recovery

Timeout, connection, 429, 5xx, and contract errors are distinguishable metrics and UI outcomes. No automatic retry multiplies provider load; operator Retry is explicit. Booking detail remains queryable during Reference Data outage. Local recovery target after provider health restoration is one successful explicit retry; no production availability SLA is claimed.

## Source Coverage

Scenarios prove U02 `business-logic-model.md`, `business-rules.md`, and failure/restart clauses in `requirements.md` using the Spring/PostgreSQL stack in `technology-stack.md`.
