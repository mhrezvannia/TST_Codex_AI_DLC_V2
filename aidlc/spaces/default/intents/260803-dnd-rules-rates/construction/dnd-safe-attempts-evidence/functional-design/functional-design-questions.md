# Functional Design Questions - dnd-safe-attempts-evidence

The approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md` resolve the architecture and observable behavior. These questions confirm disposition and audit failure semantics.

## Q1. Transport, identity and business-error precedence

Which precedence should the endpoint implement?

A. Preserve the documented servlet flow: spoof rejection, trusted service identity, correlation, controller media/idempotency/body validation, application authorization, receipt disposition, exact evidence/rate, semantic validation, unavailability, success
B. Parse and validate the body before the security filter
C. Return one generic 400 for authentication, authorization and validation
D. Authorize only after calculation
E. Let database exceptions determine public error precedence
X. Other (please specify)

[Answer]: A

## Q2. Durable attempt evidence and no disclosure

How should unresolved attempts and audit-store failures behave?

A. Persist bounded disposition-specific evidence with nullable terms/source ids and authorised indexed lookup; denied queries reveal no count/identity; application audit failure maps to `503`, while filter rejection retains its required status with bounded high-severity fallback logging
B. Require a terms id on every attempt row
C. Store raw payloads and service tokens for troubleshooting
D. Return attempt counts to denied users without details
E. Ignore audit-write failures and report the business outcome as successful
X. Other (please specify)

[Answer]: A

## Ambiguity check

The selected answers must preserve exact FR-06 status/code behavior, no failed/partial/duplicate result, owner fencing, retrievable null-terms evidence and no-disclosure authorization.

## Consolidated answer set

- U01 Q1 A - generic all-three-type foundation with one representative live walking-skeleton demo.
- U01 Q2 A - consume merged W2-02 shared primitives and keep unmet evidence BLOCKED; no local fork.
- U02 Q1 A - Draft-only mutation, immutable locked approval and one linked successor Draft.
- U02 Q2 A - owner-fenced Standard claim release, winner reclassification and byte-identical replay.
- U03 Q1 A - incomplete or mismatched historical evidence is `404 NO_RATE`; never reconstruct or reselect.
- U03 Q2 A - exact provider/detail evidence with no calculation-preview action.
- U04 Q1 A - preserve the documented servlet, transport, authorization and business-error precedence.
- U04 Q2 A - bounded nullable attempt evidence, no-disclosure queries and fail-closed audit behavior.

No answer is vague, contradictory, conditional or missing. The set preserves the approved Requirements, Application Design, four-unit topology, W2-03 contract, LinerCore authority and external W2-02 ownership.
