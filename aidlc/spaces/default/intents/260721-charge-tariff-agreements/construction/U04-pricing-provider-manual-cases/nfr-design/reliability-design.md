# Reliability Design - U04 Pricing Provider and Manual Cases

## Reliability model

PostgreSQL is the local system of record for receipts and cases. A terminal 200,
404, or 422 is acknowledged only after exact status, bytes, request hash,
correlation, time, current owner-token fence, and optional case commit. Content type
is deterministically derived from stored status and the fixed endpoint contract;
it is not a separately mutable persisted value. Acknowledged terminal receipts
therefore have local RPO 0.

Liveness is local. Readiness requires the expected catalog/schema, PostgreSQL,
usable receipt/case repositories, and approved dependency posture.

## Claim and takeover state machine

| Existing state | Condition | Result |
| --- | --- | --- |
| absent | n/a | insert IN_PROGRESS, fresh random owner-token fence, lease `CURRENT_TIMESTAMP + 10s` |
| IN_PROGRESS | same hash, live | 409; no resolver |
| IN_PROGRESS | different hash | conflict |
| IN_PROGRESS | same hash, expired | conditional fresh owner-token replacement and lease from PostgreSQL time |
| terminal | same hash | reauthorize; replay stored status/bytes and derived content type |
| terminal | different hash | conflict |

Completion compares key, current owner token, and IN_PROGRESS. A stale owner cannot
commit; it rereads only to return an exact winner or typed in-progress result.

## Atomic terminal outcomes

One read-only `REPEATABLE READ` transaction supplies a coherent candidate
snapshot; its first candidate query is the pricing linearization point.
Agreement precedes tariff inside that snapshot. Success is serialized once and
stored as exact 200 bytes without a case. No-rate/ambiguity derive the approved
subtype, then canonical OPEN-case create-or-get and receipt completion occur in
the same fenced transaction. The candidate snapshot closes before rendering and
writer completion; a takeover starts a fresh complete snapshot.

The key is `manual:v1` plus length-framed pricing request ID and reason. A
matching legacy winner is reused without rewriting its evidence.

## Failure behavior

- Pre-resolution validation/auth/hash failures create no terminal receipt.
- Failed claim insert is reread/classified, never blindly retried.
- Dependency/integrity failure leaves the claim recoverable after lease expiry.
- Failure before commit exposes no acknowledged terminal response.
- Commit success followed by response loss reconciles through exact replay.
- Whole requests are not automatically retried.
- Legacy terminal rows missing exact bytes/status/request/case fail with 503;
  content type remains derivable from a valid stored terminal status.

## Restart and recovery

IN_PROGRESS owner, normalized lease, and fence survive restart. Live claims
remain protected; expired claims can be taken over. Terminal results replay
without recalculation.

Within 120 seconds of local Compose restart, readiness is true, one authorized
replay is byte-identical, and one authorized manual detail returns persisted
evidence. U06 owns restore mechanics; U04 supplies durable schema and probes.

## Observability and reconciliation

Metrics distinguish inserted claim, live owner, hash conflict, takeover,
completion, stale-owner rejection, case create/reuse, replay, malformed legacy row, and
readiness cause. Logs retain only redacted correlation/outcomes.

Offline reconciliation compares terminal receipt case references with canonical
cases and detects expired IN_PROGRESS rows without overwriting acknowledged
bytes.

## Verification and traceability

Two contexts run 20 rounds of live-owner, takeover, different-hash, and case
races. Faults are injected before/after claim, selection, case insert,
serialization, commit, and response. Restart proves RPO 0 and <=120 seconds;
replay proves no bypass, resolver, re-render, or case write.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
