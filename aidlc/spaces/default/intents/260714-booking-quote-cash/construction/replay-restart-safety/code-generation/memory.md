# Code Generation Memory - replay-restart-safety

## Interpretations

- 2026-07-16T15:07:28Z - Treated Charge pricing request rows as the durable lease authority; no process-local owner state is trusted for replay or restart decisions.
- 2026-07-16T15:07:28Z - Treated live Compose replay/restart execution as acceptance evidence for the next unit, while this code-generation unit must provide the executable harness and dry-run evidence shape.

## Deviations

- 2026-07-16T15:07:28Z - Reviewer subagent invocation is unavailable in this Codex surface; an inline review was performed and appended to `code-summary.md`.

## Tradeoffs

- 2026-07-16T15:07:28Z - Added repository-level CAS methods rather than a separate `PricingClaimService`; this preserves the current application-service structure while enforcing the same owner-fencing behavior required by the design.
- 2026-07-16T15:07:28Z - Kept the replay/restart harness as a Node script using existing Docker/HTTP controls instead of adding a new long-running operator service.

## Open Questions

- 2026-07-16T15:07:28Z - During `live-release-acceptance`, capture actual Kafka topic coordinates and feed them through the replay/restart harness so it moves from planned evidence to live pass evidence.
