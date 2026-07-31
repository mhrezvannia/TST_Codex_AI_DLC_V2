# Security Design - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Boundary

This design applies U02 `security-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. Fresh Identity and
Reference Data checks precede capture claim; no UI hint authorizes a POST.

## Conflict Integrity and Evidence

Typed DCSA code, equipment, location, time, classifier, and idempotency
validation occurs before domain evaluation. Duplicate and out-of-sequence
responses expose only stable code, correlation, current/required-next evidence,
and preserved input. The accepted journey, movement, lifecycle, outbox, and
Booking effects remain unchanged; attempt/rejection/audit evidence is append-
only and redacts secrets/raw payloads.

## Abuse Controls

Payload/identifier bounds, paginated reads, dependency timeouts, and the
bounded duplicate/out-of-sequence and contender fixtures provide local STRIDE
DoS evidence. No production rate-limit or certification claim is introduced.

409 bodies, audit records, focused summaries, and retry/degraded UI states
redact tokens, provider URLs, raw event payloads, and stack traces; evidence
retains only stable codes, correlation, typed current/required-next fields, and
approved identifiers.
