# Architecture Review - U04 NFR Requirements - Iteration 2

## Verdict

**READY**

All iteration-one blockers are closed:

- Agreement success has four exact 25-call fresh/non-replay subtypes, each with
  an independent p99 gate;
- stale completion is exact `CompletionResult.FENCE_REJECTED`, rolls back any
  stale case/snapshot, maps to 409 while the winner is active, and byte-replays
  the winner after terminal completion;
- restart/restore hashes normalize and include `owner_token`/`lease_until`, with
  expired IN_PROGRESS takeover evidence;
- every 200 response passes the complete ordered money/itemisation oracle while
  retained evidence uses redacted booleans and canonical hashes.

## Remaining findings

None. The corrections preserve trusted authorization before replay, atomic
MANUAL/case completion, transient versus manual separation, local 100k/10k
capacity, stack fidelity, upstream trace, and U04 ownership boundaries.
Iteration one remains permanently **NOT-READY**; this READY verdict does not
claim live acceptance has already run.
