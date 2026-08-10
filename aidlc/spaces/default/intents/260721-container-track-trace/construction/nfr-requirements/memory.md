# NFR Requirements Memory

## Interpretations

- 2026-07-21T22:17:00Z - U01 NFR targets are isolated local acceptance thresholds, not production SLOs or SLAs; the approved 30-second broker-to-Booking target remains binding.

## Deviations

- 2026-07-21T22:17:00Z - No dedicated load-test dependency is introduced for the bounded 20-sample and 10-contender proof; existing acceptance tooling is sufficient for this intent.

## Tradeoffs

- 2026-07-21T22:17:00Z - Use p95 <= 2 seconds and max <= 5 seconds for healthy local APIs plus a 30-second restart-recovery budget, while explicitly declining unsupported production availability, capacity, backup, and DR claims.

## Open questions

- 2026-07-21T22:17:00Z - U01 recommended targets were confirmed without ambiguity; await independent review of metrics, security boundaries, reliability write sets, and tech-stack fidelity.
- 2026-07-21T22:30:00Z - U01 NFR review iteration 1 NOT-READY findings were remediated across all five artifacts: run-scoped GTOT sampling, monotonic DB/UI propagation measurement, separate intake/capture contender write sets, bounded DoS coverage, executable PENDING restart fencing, and declared-versus-resolved frontend versions are explicit for iteration 2.
- 2026-07-21T22:37:00Z - U01 NFR review iteration 2 is READY; all six iteration-1 findings are resolved, git diff check is clean, and local-only/W1-waiver/demo/isolated-stack boundaries remain intact.
- 2026-07-22T04:00:00Z - U02 confirmed local rejection p95/max targets, acceptance-only retry due within five seconds and applied within thirty, and an exact ten-delivery/nine-unique-receipt Booking ordering mix; production retry/throughput remain unspecified.
- 2026-07-22T04:35:00Z - U02 NFR review iteration 1 NOT-READY findings were remediated with four explicit API/UI rejection populations, event-targeted publisher and Booking-consumer fail-once seams, same-clock due evidence, one recovery observer, immutable original receipt dispositions plus duplicate delivery evidence, and a fully identified ten-delivery/nine-receipt fixture.
- 2026-07-22T05:05:00Z - U03 confirmed local authorization/degraded-read p95/max targets, fresh user-triggered Retry within thirty seconds, and ten concurrent mixed authorization requests; no production SLO, cache, or replay was added.
- 2026-07-22T05:25:00Z - U03 NFR review iteration 1 NOT-READY findings were remediated with an exact ten-request authorization matrix, explicit demo guard/8088 and single isolated-stack controls, and an explicit preserved W1 BLOCKED waiver.
- 2026-07-22T05:40:00Z - U03 final review findings were clarified: denial rows write one security audit but no CMM business row, and capture DENY performs the required fresh POST AuthorizationPort evaluation before any protected lookup.
- 2026-07-22T04:50:00Z - U02 NFR review iteration 2 final verdict is preserved as NOT-READY; post-review builder remediation replaces cross-clock comparisons with observed due predicates, defines the Booking retry fence, serializes mixed-partition deliveries by durable outcome, and aligns upstream receipt semantics with a named duplicate-delivery evidence operation. No third review will be run.
