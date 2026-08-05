# Reliability Requirements - U04 Pricing Provider and Manual Cases

## Objectives and exact state

U04 requires RPO 0 for every committed W2 terminal receipt byte snapshot,
status/code/schema, pricingRequestId, request hash, correlation, first terminal
time, fence state, and optional canonical OPEN case identity/evidence. From a
normal isolated-stack restart with healthy dependencies, readiness plus one
exact terminal replay and one authorized manual-case detail read completes
within 120 seconds. This is local acceptance, not a production SLO.

The proof runs over at least 100,000 terminal receipts and 10,000 OPEN cases and
consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and
`technology-stack.md`. U01 owns V4 migration; U04 validates runtime semantics.

## Claim, completion, and replay

Absent key creates one ten-second `IN_PROGRESS` lease/fence. Same hash/live lease
is exact 409 `PRICING_IN_PROGRESS`; different hash is 409
`IDEMPOTENCY_CONFLICT`; one expired lease can be taken over. Only the current
owner's conditional completion may write terminal state.

PRICED serializes one exact public 200 body and atomically stores it with no case.
NO_RATE/ambiguity uses one transaction to create/get the canonical OPEN case,
serialize the exact 404/422 public envelope, and fence-complete MANUAL. Any
insert/lookup/serialization/completion failure rolls back terminal/case changes;
the claim becomes recoverable only after its lease expires.

Every terminal retry first passes the same trusted service authorization; replay
never bypasses identity. After authorization it reads stored status/body and
derives only content type by status. It does not recalculate, query candidates,
regenerate correlation/time, mutate the case, or add headers. A
complete pre-V4 legacy terminal may use the isolated compatibility decoder;
malformed/incomplete legacy data is 503, never fabricated W2 evidence.

## Failure and recovery matrix

| Failure/outcome | Required state | Recovery |
| --- | --- | --- |
| malformed/key/date/caller validation | 400/422 before claim; no case/receipt | correct request/new deliberate attempt |
| exact service DENY | 403 before candidates/claim | correct service permission |
| Identity/reference transport/malformed | typed 503; no case/terminal | restore dependency, explicit retry |
| no authority | committed 404 NO_RATE bytes plus exactly one OPEN case | identical retry byte-replays same case |
| authority ambiguity | committed 422 PRICING_VALIDATION/exact reason plus one case | identical retry byte-replays; no tariff/partial money |
| same key/different hash | 409 conflict; existing row unchanged | new amendment/key or original body |
| same hash/live owner | 409 in-progress plus positive Retry-After; no second resolver | retry after guidance |
| owner crash before terminal | IN_PROGRESS only; no partial case/terminal | one expired-lease takeover owner |
| old owner completes after takeover while winner remains IN_PROGRESS | repository returns `CompletionResult.FENCE_REJECTED`; stale transaction rolls back case/snapshot; public result is 409 `PRICING_IN_PROGRESS` with current positive `Retry-After` | retry only after guidance |
| old owner completes after takeover after winner is terminal | repository returns `CompletionResult.FENCE_REJECTED`; stale transaction writes nothing; public result is exact winner status/body/content type/correlation/time/case | byte/hash comparison; never overwrite |
| process/response loss after terminal commit | one exact terminal/case remains | identical retry replays bytes |
| DB unavailable/transaction fault | absent claim or wholly committed terminal set; readiness false | reconnect/restart and hash/count proof |
| legacy canonical case winner exists | reuse unchanged nullable evidence; no duplicate/synthesis | display `legacyEvidence=true` honestly |

No unavailable/circuit/denied/caller-error state is converted into NO_RATE or a
manual case. No Charge outcome emits `MANUAL_PRICING_REQUIRED`; Booking owns that
projection. No successful result can omit a line/source or contain partial money.

## Restart, restore, and integrity evidence

Before/after two bounded restarts, evidence compares counts and canonical hashes
of pricing receipt keys/hashes/status/codes/response bytes/correlation/times and
manual case keys/status/reasons/request linkage/evidence fields plus Flyway
history. The receipt hash also includes normalized `owner_token` and
`lease_until` for every row: exact UTF-8 token bytes and UTC instant (or explicit
NULL marker), status, and started/completed time. Raw owner tokens are never
printed in evidence. Terminal rows retain the schema's stored owner/lease values;
IN_PROGRESS rows retain exact active/expired ownership until a legitimate
takeover changes both atomically. It replays sampled 200/404/422 rows byte-for-
byte and checks zero new candidate/case writes. Expired IN_PROGRESS fixtures
prove one takeover, exact owner/lease replacement, and fenced old-owner rejection
after restart.

U06 backup/restore targets a new isolated database, validates exact legacy and
W2 catalog/checksums/counts/hashes including normalized receipt ownership/fence/
lease state, replays old/new terminals, reads backfilled
and W2 cases, and starts the service. Applied migrations are never edited;
defects use verified restore or later ordered forward repair.

## Readiness and observability

Readiness is false for migration/catalog/DB failure, required non-local service
identity/secret/bypass misconfiguration, or missing authoritative repository
wiring. Liveness does not call dependencies and is not pricing proof.

Metrics cover latency, terminal outcome, basis, bounded manual reason, replay,
conflict, in-progress, takeover/fence rejection, pool and transaction failure.
One correlation joins service authorization, request/receipt, authority/source
selection, terminal response, optional case, and Booking handoff. Metric labels
remain bounded and all logs/traces/evidence pass the security redaction contract.

## Validation and upstream coverage

Blocking tests include fault injection at every transaction boundary, the 20+
round claim/takeover/hash/case matrix, two-context PostgreSQL execution,
byte/media replay, old receipt/backfill fixtures, restart/hash/capacity evidence,
and U06 restore. This artifact explicitly consumes `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and `technology-stack.md`.
