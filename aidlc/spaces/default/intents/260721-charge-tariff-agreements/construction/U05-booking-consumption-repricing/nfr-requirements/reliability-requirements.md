# Reliability Requirements - U05 Booking Consumption and Repricing

## Objectives and transaction boundary

U05 requires RPO 0 for committed Booking revision/pricing sequence/fingerprint/
status/current pointer, immutable typed snapshots, manual/error evidence, local
PRICE receipt payload/status/owner/fence/lease/retry times, and audit. From a
normal isolated restart with healthy dependencies, readiness plus an exact lost-
response replay and current/20-history read completes within 120 seconds. These
are local objectives, not a production availability SLO.

Capture/claim and completion are separate public transactional beans. The Charge
HTTP call occurs between them with no Booking DB transaction. Completion locks
and revalidates Booking markers and receipt fence, then commits aggregate,
snapshot/evidence, audit, and local terminal/RETRYABLE receipt atomically.

## State, idempotency, and race outcomes

- same local key/hash/live lease is exact 409 `PRICING_IN_PROGRESS` with bounded
  guidance; different identity/body/operation is 409 `IDEMPOTENCY_CONFLICT`;
- expired/due RETRYABLE takeover increments the fence. Stale CAS returns exact
  internal `BookingPricingReceiptTransition.FENCE_REJECTED`, writes nothing,
  and maps to current in-progress/retry evidence or terminal replay;
- identical snapshot collision is no-op replay; divergent bytes for the same
  identity are 409 `PRICING_SNAPSHOT_CONFLICT` with old state unchanged;
- revision/sequence/fingerprint mismatch after the remote call is exact 409
  `BOOKING_CHANGED`, no append/current-pointer change, and atomic RETRYABLE local
  evidence for the frozen attempt;
- no-rate/authority ambiguity is a completed manual-required Booking outcome;
  timeout/503/circuit is retryable Booking-local outage evidence; neither has a
  current total and only Charge terminal authority may supply a case ID.

RETRYABLE due policy is exact and permits only a deliberate authenticated
command—never a background/automatic provider call:

- exhausted timeout or 503 stores `nextAttemptAt = completedAt + 1 second`;
  before due, replay the stored 200 manual-outage Booking outcome; at/after due,
  an explicit identical command may claim a higher fence;
- provider `PRICING_IN_PROGRESS` stores the normalized 1-30 second provider due
  time; before due, replay exact 409 plus that remaining bounded `Retry-After`;
- open circuit stores its exact one-probe eligibility instant; before due,
  replay the stored 200 circuit-open Booking outcome; only the admitted explicit
  half-open command may reclaim;
- provider denied and malformed provider response each store
  `nextAttemptAt = completedAt + 30 seconds`; before due, replay the exact stored
  502 code/evidence, and at/after due an explicit identical command may take a
  higher fence after authorization/provider correction;
- `BOOKING_CHANGED` caused by changed pricing sequence or fingerprint stores
  RETRYABLE evidence with `nextAttemptAt = NULL` and recovery
  `NEW_PRICING_SEQUENCE_REQUIRED`. Its frozen old key is never reclaimable and
  always replays exact 409; the current aggregate uses its new sequence,
  fingerprint, body, and derived key;
- `BOOKING_CHANGED` caused only by changed general revision, with pricing
  sequence and fingerprint unchanged, stores RETRYABLE evidence with
  `nextAttemptAt = completedAt` and recovery `REVISION_REFRESH_REQUIRED`.
  An explicit same-key/body command may immediately claim a higher fence,
  re-freeze current revision, obtain Charge's existing terminal replay, and
  complete only after the unchanged pricing markers are revalidated. The commit
  preserves all newer non-pricing aggregate fields and appends exactly once.

The 20-round matrix proves every exact result, one append/current pointer, and
no partial state. Confirmation/reconfirmation never calls Charge and cannot pass
unless the current priced markers match current input.

## Failure and recovery matrix

| Failure/outcome | Required state | Recovery |
| --- | --- | --- |
| missing date/invalid Booking input | 422 before local claim/Charge | amend persisted input |
| human action denied | 403; no Booking/provider mutation | correct grant |
| Charge service denied | 502 provider denied, RETRYABLE due in 30 seconds; no snapshot/manual relabel | correct service grant, then explicit higher-fence retry at/after due |
| healthy W2 success | one immutable typed snapshot/current pointer/audit/COMPLETED receipt | identical lost-response retry assembles current view |
| complete legacy success | embedded legacy evidence, `LEGACY_PRICED`, no typed row | existing legacy replay/confirmation markers |
| no-rate/authority ambiguity | atomic manual-required evidence/COMPLETED receipt, no snapshot/total | correct authority/input then explicit new-sequence Reprice |
| timeout/503/circuit | atomic local outage evidence/RETRYABLE receipt, no Charge case/total; timeout/503 due in one second, circuit due at exact probe eligibility | explicit retry at/after due |
| provider in progress | RETRYABLE until normalized due time; 409/guidance | higher-fence same body/key after due |
| malformed/partial provider | 502 invalid, RETRYABLE due in 30 seconds, no append/manual relabel | provider correction, explicit higher-fence retry at/after due |
| pricing input changes during call | 409 changed; no append; RETRYABLE with NULL due/non-reclaimable old key | Price/Reprice under new sequence/fingerprint/key |
| only general revision changes during call | 409 changed; no append; RETRYABLE immediately due with unchanged sequence/fingerprint | explicit same-key higher-fence retry, Charge terminal replay, commit against refreshed revision while preserving non-pricing state |
| process stop before local completion | claim IN_PROGRESS or provider terminal only; no partial Booking write | expired local takeover; Charge same-key replay |
| process/response loss after completion | one complete Booking state/snapshot/audit/receipt | authorized local receipt replay/current view |
| DB unavailable/transaction fault | absent claim or wholly committed local transaction; readiness false | reconnect/restart and canonical hashes |

## Restart, restore, and compatibility

Before/after two bounded restarts, compare counts and canonical hashes for
Booking pricing fields, typed snapshot canonical bytes and identities, manual/
error evidence, audit, and PRICE receipt schema payload/status/response revision/
correlation/owner/fence/lease/next-attempt/completion fields. Nullable values use
explicit markers and timestamps normalize to UTC; raw owner tokens are not
printed. Expired IN_PROGRESS and due RETRYABLE fixtures prove legal higher-fence
takeover while terminal receipts remain immutable.

U06 restores into a new isolated Booking database, verifies Flyway history,
legacy flattened rows, new typed snapshots/history, receipts/evidence/audit and
old/new API reads, then performs lost-response replay and guarded confirmation.
Applied migrations are never edited; recovery uses verified restore or later
ordered forward repair.

Legacy flattened entries stay readable and are never synthesized into W2 lines.
Complete all-legacy provider success uses the unchanged legacy path; partial W2
enrichment is always malformed. Non-pricing revisions preserve current price
markers and replay assembles the current Booking view without rolling back newer
movement/non-pricing state.

## Readiness and observability

Readiness is false for migration/catalog/DB failure, required non-local human or
Booking-to-Charge service credentials/bypass misconfiguration, or missing
authoritative receipt/snapshot wiring. Circuit state reset on restart is expected
and recorded, not represented as distributed durability.

Metrics cover local and end-to-end latency, outcomes, Price/Reprice, basis,
manual reason/ownership, replay/retry/in-progress/conflict/changed/fence/circuit,
snapshot append, and pool/transaction failure with bounded labels. One
correlation joins browser/BFF, Booking authorization/receipt, Charge request/
receipt/sources, Booking completion/snapshot/evidence/audit, and response.

## Upstream coverage

Fault injection, two-context race tests, deterministic resilience clocks,
restart/hash/capacity checks, legacy codecs, provider/consumer contracts, and U06
restore are blocking. This artifact consumes `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and `technology-stack.md`.
