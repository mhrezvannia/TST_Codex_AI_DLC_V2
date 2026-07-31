# NFR Requirements Questions - U01 PB-01 Journey-to-Booking Walking Skeleton

The binding `requirements.md`, U01 `business-logic-model.md` and
`business-rules.md`, and brownfield `technology-stack.md` already fix the
30-second propagation target, additive migration, fail-closed authorization,
WCAG/responsive evidence, isolated stack, and approved technologies. These
questions quantify only the remaining local acceptance boundaries; they create
no production SLA or public-cloud commitment.

## Q1. Healthy local API responsiveness

What measurable response target should the isolated Compose acceptance use for
the U01 list, detail, booking lookup, and GTOT acknowledgement paths?

- A. Under a single-operator acceptance workload, require p95 <= 2 seconds and max <= 5 seconds across 20 representative requests per route; keep the already-approved broker-to-Booking applied target <= 30 seconds. (recommended)
- B. Measure timings for evidence but set no pass/fail latency target beyond the 30-second propagation requirement.
- C. Define a production-grade latency and throughput SLO now.
- X. Other (please specify)

[Answer]: A - p95 2s, max 5s (Recommended)

## Q2. Concurrency and scale boundary

What load must U01 prove without inventing a production traffic forecast?

- A. Prove one confirmed booking/container walking skeleton plus 10 concurrent replay/idempotency contenders for the same event/request identity; exactly one winner and no duplicate plan, transition, or outbox effect. Record observed timings/resources without asserting production RPS. (recommended)
- B. Exercise only sequential happy-path and replay requests.
- C. Add a sustained multi-container load test and horizontal-scaling target.
- X. Other (please specify)

[Answer]: A - Ten contenders (Recommended)

## Q3. Restart recovery and durability

What local reliability target should bind the pending outbox/restart proof?

- A. An accepted transaction has zero committed-state loss; after one CMM restart with a pending row, relay recovery publishes and Booking applies within 30 seconds, with one logical movement/projection despite allowed broker redelivery. No production availability, backup RTO, or DR claim is added. (recommended)
- B. Prove recovery eventually with no bounded time target.
- C. Add production HA, backup RPO/RTO, and disaster-recovery requirements now.
- X. Other (please specify)

[Answer]: A - Recover within 30s (Recommended)
