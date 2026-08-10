# Security Design - U04 Pricing Provider and Manual Cases

## Trust boundary and authorization

Pricing accepts only a trusted service identity and authorizes existing resource
`charge-agreement`, action `price`. Browser sessions, default actors, display
names, and caller-selected identity headers are not promoted to service
identity. Authorization precedes receipt lookup, including replay.

Manual list/detail accepts an authenticated human session and requires exact
`charge-manual-cases:read` at BFF and service. Denial precedes repository access,
and the frontend never receives the pricing service credential.

## Protocol and input controls

Pricing accepts and emits exact `application/vnd.api.v1+json`. It rejects an
absent/mismatched key; the key equals `bookingRef:amendmentSeq`. Identifiers,
dates, quantities, booleans, and pages are bounded before persistence access.

Canonical JSON uses validated fields, stable order, and normalization before
SHA-256. Raw canonical request, hash, key, owner token, and commercial candidates
are not reflected in errors.

## Replay, ownership, and fencing

- Absent key inserts one IN_PROGRESS row with a fresh random owner token and a
  10-second lease calculated from PostgreSQL time; that token is the fence.
- Same hash under live lease returns 409 without the resolver.
- Different hash conflicts regardless of lease state.
- Expired same-hash takeover atomically replaces the owner token and lease from
  PostgreSQL time.
- Completion matches key, current owner token, and IN_PROGRESS; the replaced
  token makes a stale owner affect zero rows.
- Terminal replay reauthorizes and returns stored status and bytes without
  deserializing/re-serializing; content type is deterministically derived from
  terminal status and the fixed endpoint contract.

Owner tokens are cryptographically random, secret, and never logged or returned.

## Commercial data minimization

Candidate ports expose only fields needed by `business-logic-model.md`.
Agreement ambiguity stops tariff access. Tariff ambiguity precedence is BASE,
SURCHARGE, LOCAL. Linked-version corruption returns 503 rather than falling
through or disclosing identifiers.

Money uses `BigDecimal`, USD/PER_CONTAINER, scale 2, and `HALF_UP`. The result
contains the approved ordered lines, quantities, rates, totals, and attribution,
not repository rows, claims, hashes, owners, or inactive candidates.

## Manual-case access

The canonical OPEN key is derived internally from versioned, length-framed
pricing request ID and reason; callers cannot supply it. Create-or-get runs in
the fenced terminal transaction.

List/detail are immutable evidence views exposing approved identity, status,
reason/category, correlation/time, request summary, and attribution. Authorized
detail also exposes the canonical SHA-256 `requestHash` required by the
functional contract; list rows, logs, metrics, denials, and unrelated errors do
not expose it. Views expose no money edit, assignment, transition, owner token,
raw identity claim, or candidate dump. Detail uses the documented `?case=`
selector.

## Logging and error hygiene

Logs contain stable event, outcome, duration, and redacted correlation. They
omit payloads, booking/party/customer IDs, hashes, keys, case snapshots, owner
tokens, and authorization material. Metrics use fixed outcome/category labels.

Failures preserve approved 400/401/403/404/409/415/422/503 distinctions without
stack traces, SQL, schema, or extra candidate details. Malformed legacy terminal
rows fail closed with 503.

## Verification and traceability

Tests cover identity/action/media/key/hash, live/takeover/stale-owner races,
unauthorized replay/manual reads, integrity failure, and redaction. Query spies
prove denial precedes DB access and replay performs no candidate, calculation,
or case write.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
