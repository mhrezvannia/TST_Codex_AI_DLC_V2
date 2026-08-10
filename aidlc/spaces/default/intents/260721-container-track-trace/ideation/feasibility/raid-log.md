# RAID Log - W2-04 Container Journey and Track-Trace

## Basis and scoring

This log traces to `intent-statement.md`, `competitive-analysis.md`,
`market-trends.md`, and `build-vs-buy.md`. Likelihood and impact use ordinal
**Low / Medium / High** values because the stage has no supplied production
volumes, budget, or schedule. Owners are accountable roles, not invented people.

## Risks

| ID | Risk | Likelihood | Impact | Treatment and exit evidence | Owner role |
|---|---|---:|---:|---|---|
| R-01 | Duplicate, stale, or out-of-sequence delivery advances lifecycle or Booking incorrectly | Medium | High | Enforce aggregate sequence rules and stable idempotency at both consumers; prove unchanged state and observable audit outcomes | CMM lead + Booking reviewer |
| R-02 | Business state commits without a recoverable status event, or retry publishes a double transition | Medium | High | Keep movement, state, audit, and outbox effects atomic; test retry/restart and observe broker/database results | CMM lead |
| R-03 | Rich DCSA domain naming drifts from the frozen producer-owned v1 wire contract | Medium | High | Separate domain values from wire mapping; run schema compatibility, serde, pact, and producer/consumer review | Contract owners |
| R-04 | W2-04 UI evidence is invalidated by W2-02 shared-shell changes | High until merge | Medium | Limit edits to owned pages, synchronize after W2-02, then repeat final responsive/visual acceptance | UI owner |
| R-05 | Concurrent Wave A acceptance contaminates data, ports, or screenshots | Medium | High | Serialize stack control, use `linercore-wave-a`, retain commands/timestamps, and run demo guards before/after | Release reviewer |
| R-06 | Branch synchronization overwrites or regresses prior merged intents | Medium | High | Follow backlog ownership, inspect integration diff, rerun cross-module contracts, and avoid broad rewrites | Intent driver |
| R-07 | Historical W1 waiver is mistaken for observed PASS evidence | Low | High | Keep waiver/BLOCKED files immutable and cite the separate verified W1 PASS plus new W2-04 evidence | Release reviewer |
| R-08 | Audit or UI exposes more actor/correlation data than operators need | Medium | Medium | Keep transport detail collapsed, minimize identifiers, enforce roles, and redact secrets from evidence | Compliance reviewer |

## Assumptions

| ID | Assumption | Validation / response if false | Owner role |
|---|---|---|---|
| A-01 | The adopted W0/W1 broker, schema, outbox, database, and reverse projection foundations remain reproducible on the isolated stack | Run baseline and contract checks before changes; treat failures as baseline issues, not W2-04 PASS | Intent driver |
| A-02 | Acceptance can create one confirmed booking with an assigned ISO 6346 container and valid one-leg POL/POD references | Prove through the live UI/API seed path; if absent, resolve only the minimum fixture/path without broadening domain scope | Quality reviewer |
| A-03 | Existing authenticated roles can distinguish equipment-control capture, Booking read, denied access, and release review | Inspect current role policy during reverse engineering; add only owned permissions if a gap exists | Security reviewer |
| A-04 | No payment-card, health, or special-category personal data is introduced by this journey | Reclassify and perform a focused privacy/compliance assessment if data fields change | Compliance reviewer |
| A-05 | Current repository skills cover Java/Spring, Kafka/Avro, PostgreSQL, Next.js/TypeScript, Playwright, and Compose | Use stage planning to expose an actual capability gap; do not infer new headcount or procurement | Delivery owner |

## Issues

| ID | Current issue | Impact | Resolution / evidence | Owner role |
|---|---|---|---|---|
| I-01 | W2-02 is an external merge dependency for final visual acceptance | Final screenshots and responsive proof cannot yet be authoritative | Synchronize with the integration branch after W2-02 merges, inspect conflicts, and rerun UI plus live acceptance | Intent driver |
| I-02 | Retention duration and privacy-response policy for actor/audit records are not supplied | Cannot make a durable compliance-retention claim | Carry as a measurable NFR input; apply current organization policy when identified | Compliance reviewer |

## Dependencies

| ID | Dependency | Needed for | Readiness condition | Owner role |
|---|---|---|---|---|
| D-01 | W0-01 broker, Schema Registry, outbox relay, scheduler, safety foundation | Both real asynchronous seams | Baseline health and contract tests pass | Platform owner |
| D-02 | W1-01 confirmed-booking consumer, journey persistence, reverse status projection, and separate real PASS | Brownfield starting seam | Existing path remains green; waiver history remains unchanged | CMM + Booking owners |
| D-03 | W2-02 shared UI primitives/master | Final Container Movement page composition and visual proof | Merge to integration, then W2-04 synchronization completes | W2-02 / W2-04 owners |
| D-04 | Producer-owned Avro, AsyncAPI, enterprise contract, and consumer pacts | Contract-safe status publication | All artifacts agree and compatibility gates pass | Contract owners |
| D-05 | `scripts/wave-a-compose.mjs`, `linercore-wave-a`, port 8088 demo guard, and serialized acceptance slot | Live acceptance | Slot acquired; pre-guard green; exact project is healthy | Release reviewer |
| D-06 | `ui-ux-pro-max`, LinerCore master/session prompt, and Container Movement page record | UI design and implementation | Skill guidance applied subject to the operational-console contract | UI owner |

## Review cadence

Review this RAID log at scope approval, after reverse engineering, before W2-02
synchronization, and immediately before live acceptance. Any High-impact risk
without a named role and observable treatment blocks the affected gate; it does
not justify silently reducing the Definition of Done.
