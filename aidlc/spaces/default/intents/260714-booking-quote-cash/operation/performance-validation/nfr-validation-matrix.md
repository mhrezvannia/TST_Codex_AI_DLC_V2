# NFR Validation Matrix - W1-01

## Matrix

| NFR | Target | Evidence | Status | Notes |
|---|---|---|---|---|
| Pricing latency | nearest-rank p99 <=800 ms over 1,000 measured requests at concurrency 10 | Not produced | BLOCKED | Requires successful full Compose start and workload phase. |
| Pricing throughput | workload completes <=5 minutes with zero measured errors | Not produced | BLOCKED | Dry-run planned, real run blocked. |
| Booking/CMM round trip | nearest-rank p95 <=5 seconds over 100 measured journeys at concurrency 5 | Not produced | BLOCKED | nginx user path and full journey must run. |
| Journey throughput | workload completes <=10 minutes with zero measured errors | Not produced | BLOCKED | Fresh run did not reach journey phase. |
| Event lag | source lag returns to zero <=30 seconds | Not produced | BLOCKED | Requires Kafka/outbox observers during workload. |
| Hikari pool | pool wait p95 <100 ms and <=10 connections per service | Not produced | BLOCKED | Requires metrics during workload. |
| JVM memory | peak Java RSS <=768 MiB, no OOM or unexpected restart | Not produced | BLOCKED | Requires Docker stats during workload. |
| DLT correctness | happy-path DLT count zero; DLT age/count thresholds respected | Not produced | BLOCKED | Requires topic observers during workload. |
| Dashboard coverage | Prometheus/Grafana source includes W1 Booking, CMM, and Charge panels | `dashboards.md`; Grafana JSON validation | PASS for source config | Runtime dashboard not proven until observability containers start. |
| Acceptance preflight | ports, real messaging, and local prerequisites pass | `node scripts/w1-live-acceptance.mjs --preflight` | PASS | Does not replace workload execution. |

## Release Verdict

Performance validation is BLOCKED, not failed by measured latency. No performance PASS can be claimed until a fresh full-stack live acceptance run reaches and passes the workload phases.

## Next Validation Run

1. Fix Docker access or cache the required observability images.
2. Run `node scripts/w1-live-acceptance.mjs --run-id <new-id>`.
3. Confirm manifest PASS and inspect raw samples for pricing, journey, lag, pool wait, RSS, DLT, and detector gates.
4. Update this matrix with actual values from the retained evidence.

## Source Coverage

The matrix directly validates `performance-requirements.md`, `scalability-requirements.md`, `performance-design.md`, `scalability-design.md`, and the dashboard coverage in `dashboards.md`.
