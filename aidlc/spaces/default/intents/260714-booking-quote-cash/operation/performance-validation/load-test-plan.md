# Load Test Plan - W1-01

## Scope

The performance validation plan executes the W1 live acceptance harness against the full local Compose stack. It validates the workloads defined in `performance-requirements.md` and `scalability-requirements.md`, implemented by `performance-design.md` and `scalability-design.md`, and observed through `dashboards.md`.

## Workloads

| Workload | Warm-up | Measured samples | Concurrency | Time ceiling | Blocking target |
|---|---:|---:|---:|---:|---|
| Charge pricing | 100 | 1,000 valid-agreement requests | 10 | 5 minutes | nearest-rank p99 <=800 ms; zero measured errors |
| Booking to CMM returned status | 10 | 100 unique booking/container journeys | 5 | 10 minutes | confirm-to-visible-status nearest-rank p95 <=5 seconds; zero measured errors |

Every measured error remains in raw CSV/JSON evidence. Warm-up exclusion is by sample index, not by filtering successful requests after the fact.

## Environment Preconditions

1. Docker can pull all full-profile images, including observability images.
2. PostgreSQL uses host port `55432`, not `5432`.
3. `MESSAGING_REQUIRE_REAL=true`; noop messaging is rejected.
4. Kafka and Schema Registry are healthy and concrete publisher/registrar beans are active.
5. nginx exposes the Booking user path at `http://localhost:8088/bookings`.
6. The live acceptance run has a new run ID and retained evidence directory.

## Execution

```powershell
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

The performance section passes only when the final manifest is PASS and includes raw samples, parameter validation, resource metrics, topic/DB/UI identity cross-checks, and detector results.

## Bottleneck Checks

| Area | Metric |
|---|---|
| HTTP | p95/p99 latency, status outcome, error rate |
| PostgreSQL/Hikari | active connections, pool wait p95 <100 ms, max 10 connections per service |
| Kafka | consumer lag, topic/DLT counts, schema ID, offset evidence |
| Outbox | pending/stale `IN_PROGRESS`, retry count, lease age |
| JVM/runtime | RSS <=768 MiB, no OOM, no unexpected restart |
| UI | browser marks, visible returned status, overlap/accessibility gates |

## Source Coverage

This plan implements `performance-requirements.md`, `scalability-requirements.md`, `performance-design.md`, `scalability-design.md`, and the observable panels in `dashboards.md`.
