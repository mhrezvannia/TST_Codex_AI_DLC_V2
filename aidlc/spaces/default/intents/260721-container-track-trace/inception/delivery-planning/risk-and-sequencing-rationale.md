# Risk and Sequencing Rationale - W2-04 Container Journey & Track-Trace

## Source Alignment

The rationale weighs business and release outcomes in `requirements.md` and
`stories.md`, operational states in refined `mockups.md`, boundaries in
application `components.md`, unit size/DoDs in `unit-of-work.md`, hard edges in
`unit-of-work-dependency.md`, coverage in `unit-of-work-story-map.md`, and the
walking-skeleton/deployment rules in `team-practices.md`.

## Chosen Heuristic

Use a hybrid of Cockburn-style walking-skeleton-first and explicit risk/value
comparison. Do not manufacture numeric WSJF/CD3 precision because business
weights and cost-of-delay values were not supplied. The qualitative factors
are user/business value, time criticality, risk reduction, and relative size.

| Bolt | Value | Time criticality | Risk reduction | Size | Economic conclusion |
| --- | --- | --- | --- | --- | --- |
| B01 U01 | High | High | High | L | First and separately gated: it is both the hard prerequisite and the only real proof of the distributed spine/migration. |
| B02 U02 | High | High | High | L | Eligible after B01; completes the intent's core lifecycle and highest distributed-ordering risk. |
| B03 U03 | High | Medium | High | M | Eligible after B01; proves security/degradation independently of lifecycle depth and can progress beside B02. |

This is a transparent WSJF-style comparison, not a numeric score. B02 and B03
are not assigned a false total order: they are economically valuable independent
paths after B01, and the available mob capacity plus stack lock determines
their execution overlap without changing the DAG.

## Why B01 Is First

- Both U02 and U03 have hard dependencies on U01.
- PB-01 is the affirmed gated walking skeleton in `team-practices.md`.
- It attacks the highest compound risk: additive migration, real Kafka/schema,
  CMM atomicity, authorization, first status, Booking projection, and both UIs.
- A failed B01 falsifies the architecture before deeper lifecycle or outage
  work accumulates; a passed B01 creates reusable evidence and stable seams.

## Why B02 and B03 May Run in Parallel

U02 needs the U01 journey/capture/publication spine but not U03's dependency
failure policy. U03 needs a real U01 persisted/protected journey but not U02's
LOAD/DISC/GTIN depth. This matches the two outgoing DAG edges from U01.
Parallelism is limited to implementation and non-conflicting fast checks; one
live Compose controller serializes acceptance.

## Risk Register and Earliest Mitigations

| Risk | Likelihood | Impact | Earliest Bolt | Mitigation/evidence |
| --- | --- | --- | --- | --- |
| Avro/AsyncAPI/Pact compatibility or topic mapping drifts | Medium | Critical | B01 | Producer/consumer co-review, BACKWARD sequence default, real broker/registry proof. |
| Additive migration damages W1 data or outbox state | Medium | Critical | B01 | Sole migration owner, preserved-data backfill/restart/forward-repair proof, no destructive reset. |
| Accepted/rejected effects are not atomic | Medium | Critical | B01/B02 | Exact transaction-set tests plus DB/outbox/audit hashes around rejection and retries. |
| Outbox stale worker or consumer redelivery double-advances | Medium | High | B02 | Worker/token/version fencing, receipts/dispositions, restart/redelivery live proof. |
| UI implementation races W2-02 shared primitives | High | High | B01-B03/final | Own only CMM page composition, avoid `packages/ui`, W2-02-first merge, integration sync before final visual evidence. |
| Authorization caches or actor fallbacks bypass Identity | Medium | Critical | B03 | Exact catalog permissions, fresh authorization, fail-closed outage/direct API proof. |
| Reference Data outage either hides valid reads or permits writes | Medium | High | B03 | Authorized last-known persisted reads only; capture disabled and unchanged-state proof. |
| Concurrent Wave A sessions collide on Compose or port 8088 | High | Critical | Every live gate | Named stack reservation, `scripts/wave-a-compose.mjs`, demo guard before/after, one controller. |
| Historical W1 waiver is rewritten as PASS | Low | High | Final gate | Evidence/audit review preserves BLOCKED, waiver, and later PASS as distinct facts. |

## Merge and Acceptance Rationale

W2-04 may implement concurrently with the other Wave A sessions, but W2-02
merges first because it owns the UI foundation. W2-04 then synchronizes the
integration baseline before final visual/live acceptance; otherwise screenshots
would prove a stale shell/design system. W2-03 has no hard code dependency and
therefore remains informed rather than inserted into the Bolt DAG.

Final acceptance is serialized after all Bolts because it verifies their
combined intent-level contract and UI matrix. It is an Exit Gate, not a fourth
horizontal QA Bolt.

## Decision Record

- Selected: hybrid walking-skeleton-first plus qualitative risk/value comparison.
- Rejected: fabricated numeric WSJF without business weights.
- Rejected: all Bolts concurrent, because it violates the U01 hard prerequisite.
- Rejected: strictly sequential B02 then B03, because no hard or economic evidence requires that false ordering.
- Rejected: W2-02/W2-03 implementation ownership inside W2-04; bounded collaboration and contract review are sufficient.

