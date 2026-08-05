# Security Design - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Authorization

This design applies `security-requirements.md`, `business-logic-model.md`, and
`tech-stack-decisions.md`. REST authenticates and maps the verified subject;
application use cases perform fresh `container-movement:read` or
`container-movement:capture-movement` authorization before protected lookup or
idempotency. UI controls are never authority.

## Protection and Evidence

Typed validation rejects malformed envelope, DCSA code, ISO-6346, route,
location, time, and identifier inputs before domain effects. Error envelopes
redact tokens, provider details, raw payloads, and stack traces. CMM audit rows
capture actor, correlation, decision, and outcome; logs and traces use stable
IDs without sensitive payloads. Existing transport/database encryption and
secret handling remain authoritative; no new provider or cache is added.

## Bounded Abuse Controls

Payload and identifier lengths, pagination, dependency timeouts, and concurrent
contender bounds are enforced locally. This is acceptance evidence, not a
production rate-limit or certification claim.

