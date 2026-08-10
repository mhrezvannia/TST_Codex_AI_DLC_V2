# Performance Test Instructions

## Applicable NFR scope

The U01/U02/U03 `code-generation-plan.md`, `code-summary.md`, and performance
designs require bounded local evidence, not production capacity claims. Measure
separate authorized, denied, degraded, accepted, duplicate, retry, database,
and UI populations. Report nearest-rank p95 and max; do not mix 409 conflict
latency into accepted-capture populations.

## Execution

After unit and live-integration prerequisites are green:

1. Run at least 20 samples per API/UI outcome with a monotonic observer.
2. Exercise ten concurrent capture contenders and the deterministic
   ten-delivery Booking ordering fixture.
3. Poll database and UI independently at 500 ms.
4. Require CMM PUBLISHED, Booking APPLIED, and UI convergence within the
   approved 30-second local observer bound.
5. Record p50, nearest-rank p95, max, throughput, error rate, retry timing,
   pool exhaustion, and final projection hash.

Use only the isolated `linercore-wave-a` stack after `demo:guard` succeeds.
If the stack cannot start, report performance as NOT RUN/BLOCKED; static test
duration is not a substitute for runtime latency evidence.

## Pass criteria

All approved local bounds must be met without stale-worker corruption,
duplicate projection advance, unbounded polling, or port 8088 interference.
No production SLA, autoscaling, backup, or disaster-recovery result is inferred.
