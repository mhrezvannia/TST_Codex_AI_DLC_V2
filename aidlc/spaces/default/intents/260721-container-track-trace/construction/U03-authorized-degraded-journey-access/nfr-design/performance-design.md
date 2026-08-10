# Performance Design - U03 Authorized Degraded Journey Access

## Inputs and Targets

This design implements U03 `performance-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. Each authorized,
denied, Identity-unavailable, and last-known outcome uses the specified separate
20-sample API/UI populations, monotonic clocks, nearest-rank p95, and bounded
30-second fresh-Retry observer.

## Query and Dependency Budget

Authorization is evaluated in the application use case before indexed list,
detail, or booking-reference lookup. Reference Data calls have explicit
timeouts; last-known reads reuse only persisted journey facts and never cache
authority. Read DTOs are bounded/paginated and capability hints are computed
after read ALLOW without authorizing POST. `npm run demo:guard` runs pre/post
isolated `linercore-wave-a` acceptance with one live stack protecting 8088.

## Review Iteration 1

**Verdict: READY**

1. Two ordered fresh calls use the existing singular `AuthorizationPort.evaluate`
   (read first, optional capture capability hint only after read ALLOW), while
   every POST independently re-evaluates capture authorization. Identity fails
   closed; authorized Reference Data outages expose only persisted last-known
   facts with capture disabled and no cached authority.
2. The exact ten-row concurrent matrix is executable with HTTP/safe envelopes,
   lookup ordering, denial-audit deltas, and the distinction between zero CMM
   business rows and the single audit row for real DENY. Capture DENY still
   performs mandatory authorization and skips protected lookup/idempotency.
3. Evidence is bounded to separate 20-sample API/UI populations, nearest-rank
   p95/max, and fresh Retry polling at 500 ms with a 30-second convergence bound;
   DTOs are redacted and paginated. UI scope is Container Movement only, W1 is
   explicitly BLOCKED/waived, and demo port 8088 is protected by pre/post
   `demo:guard` with one isolated Compose stack.
