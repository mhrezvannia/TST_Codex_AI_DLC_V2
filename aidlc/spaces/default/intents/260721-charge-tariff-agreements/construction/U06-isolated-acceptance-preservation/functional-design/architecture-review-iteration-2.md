# Architecture Review - U06 Functional Design - Iteration 2

## Verdict

**READY**

All iteration-one blockers are closed:

- Performance samples use fresh, unique valid
  `bookingRef:pricingAmendmentSeq` identities, distinct terminal receipts,
  `replayed=false`, per-request no-rate case cardinality, and a separate replay
  test excluded from latency measurements.
- Preservation is a closed five-item set: W0-01, W0-02, W1-01, W2-01, and
  W2-02. Unavailable validation becomes `BLOCKED`; the original W1 waiver
  remains separate and immutable.
- The security matrix covers human allowed/denied/spoofed behavior, missing
  service identity, missing permission, missing secret, and non-local bypass
  rejection. Observability evidence closes correlated logs, metric deltas,
  bounded labels, and redaction.
- Technical manifest `PASSED` is derived solely from observed technical
  evidence and only enables, never satisfies, the later human AI-DLC gate.

## Original constraint recheck

Manager port 8088 is guarded before/after and never mutated. All isolated
Compose lifecycle operations use `scripts/wave-a-compose.mjs` with
`linercore-wave-a`. Migration/backfill/restart/restore evidence is additive and
fail-closed. Live agreement, tariff, Reprice, and manual scenarios link API,
owner-local database, correlation, and Booking UI proof. Playwright covers the
required viewport/theme/accessibility/state matrix. Both audits require detector
and manual-review closure. U06 introduces no product deployable or shared-UI
redesign.

## Remaining findings

None.

Iteration one remains permanently **NOT-READY**. This READY verdict concerns
design implementability only and makes no advance claim that live acceptance
has passed.
