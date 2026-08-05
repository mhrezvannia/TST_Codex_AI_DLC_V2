# Scalability Requirements - U07 Live Release Acceptance

## Acceptance Capacity

- The full Compose stack sustains pricing concurrency 10 and journey concurrency 5 with no errors, duplicate effects, unbounded lag, pool exhaustion, or DLT accumulation.
- Kafka topics use three partitions/listener concurrency three/relay batch 50; Hikari min 2/max 10/2 s timeout; outbound HTTP max ten; active pending UI pollers max 100; payload max 256 KiB.
- DLT capacity is at least 10,000 W1-sized records; local non-empty age >5 minutes or count >100 is a failed alert/gate.
- Pricing workload finishes <=5 minutes and journey workload <=10 minutes; source lag returns to zero <=30 seconds, pool wait p95 <100 ms, connections <=10/service, peak Java RSS <=768 MiB, and no OOM/restart.
- Representative data is 10,000 bookings, >=100 records per reference set, >=100 agreements with <=100 terms, routing <=8, equipment <=20, and charge lines <=100.
- Receipts/outbox metadata retain >=30 days, audit >=90 days, DLT exactly seven days, and migration history permanently; W1 does not implement purge.

## Reproducibility and Growth Signals

Evidence reports CPU/memory, DB connections/pool wait, broker/consumer lag, request rates, table/index counts, image IDs, and host constraints so results are comparable. The W1 workload is a release baseline, not a production capacity forecast; production sizing is deferred explicitly.

## Source Coverage

Capacity gates aggregate U07 `business-logic-model.md`, `business-rules.md`, and fixed workloads in `requirements.md` over `technology-stack.md`.
