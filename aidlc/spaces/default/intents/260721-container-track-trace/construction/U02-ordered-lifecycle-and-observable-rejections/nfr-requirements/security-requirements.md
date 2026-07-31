# Security Requirements - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

These controls specialize U02 `business-logic-model.md` and
`business-rules.md`, implement `requirements.md` security/observability rules,
and stay within the Identity/Spring/PostgreSQL/Kafka/Next.js seams in
`technology-stack.md`. U01 authentication/authorization and redaction controls
remain binding.

## Authorization and Trust Boundaries

- Every capture re-evaluates the verified subject for exact
  `container-movement:capture-movement`; request actor/source fields, prior GET
  hints, and disabled UI are not authority.
- Reference Data invalid/inactive input is a 400 validation outcome; provider
  unavailability is a redacted retryable dependency outcome. Neither reaches
  idempotency or writes capture business evidence.
- Duplicate/out-of-sequence 409s disclose only safe current/required-next,
  reason, correlation, and optional original evidence already authorized for
  the journey. Raw broker records, SQL, tokens, provider bodies, worker IDs, and
  internal hosts remain collapsed/redacted.
- Booking consumers validate schema/event identity and assignment before
  applying projection; invalid/unassigned input completes a durable REJECTED
  receipt without leaking CMM data or calling CMM.

## Integrity, Abuse, and STRIDE Controls

| Threat | Required control and evidence |
| --- | --- |
| spoofing/elevation | fresh application authorization, service identity, direct read-only POST denial |
| tampering/replay | typed DCSA values, request fingerprint, unique event/occurrence/request/sequence constraints, immutable dispositions |
| repudiation | actor/source/action/target/time/correlation and exact accepted/rejected/receipt disposition evidence |
| information disclosure | consistent safe response union, permission-aware original evidence, redacted audit disclosure |
| denial of service | bounded identifier/payload/form lengths, bounded page/batch size, dependency timeouts, 20-rejection and 10-record no-exhaustion proofs |
| stale-worker mutation | conditional event+IN_PROGRESS+worker+token+version completion and expired-lease fence |

No production rate-limit, volumetric-attack protection, certification, or
compliance framework is claimed by these bounded local controls.

## Audit and Data Protection

Each authorized business conflict commits only its permitted attempt/rejection/
audit/request-disposition set. Validation/dependency failures do not masquerade
as denial or conflict. Logs/evidence use stable identifiers and correlation but
exclude secrets and raw payloads. Operational identifiers remain internal;
subject-linked audit evidence is confidential and inherits existing retention,
encryption, and access policy without inventing new values.

## Verification

Tests must prove same/conflicting-key behavior, concurrent loser immutability,
wrong-next unchanged hashes, field/reference redaction, consumer assignment and
ordering, stale-worker fencing, accessible focused summaries, and historical W1
waiver/BLOCKED preservation.

