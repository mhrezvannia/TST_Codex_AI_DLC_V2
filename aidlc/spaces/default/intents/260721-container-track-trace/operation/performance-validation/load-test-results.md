# W2-04 Load Test Results

## Verdict and Upstream Trace

**Verdict: NOT RUN / NOT VALIDATED / HOLD.**

The required populations from `performance-requirements` and
`scalability-requirements`, the observer model from `performance-design`, the
contention/ordering behavior from `scalability-design`, and telemetry required
by `dashboards` were not executed against an immutable deployed candidate.

## Safe Harness Checks Executed

Observed on 2026-07-28:

| Check | Result |
|---|---|
| `node --check scripts/w2-04-live-acceptance.mjs` | PASS |
| `node --test scripts/w2-04-live-acceptance.test.mjs` | PASS: 1 test |
| `node --check scripts/w2-04-playwright.mjs` | PASS |
| `npm run demo:guard` | PASS: 15 containers/services; routes 200/308/301/301 |
| Prometheus on port 9090 | Unreachable |
| Jaeger on port 16686 | Unreachable |

The driver regression proves lifecycle-driver mechanics against a mock
provider. It is not live performance evidence.

## Driver Coverage Gap

The current lifecycle driver times six mixed requests: one wrong-next 409, four
accepted movements, and one duplicate 409. It then calculates one combined
p50/p95/max summary.

That summary cannot validate the approved populations because:

- sample count is six, not 20 per class;
- accepted and rejected outcomes are mixed;
- list/detail/booking-reference GET populations are absent;
- direct API and Playwright rejection populations are not separated;
- authorization/degradation populations are absent;
- intake/capture ten-contender proofs are absent;
- the deterministic ten-delivery Booking fixture is absent;
- publisher/consumer recovery endpoints are not timed separately;
- resource and `dashboards` evidence is unavailable.

The 500 ms polling cadence and 30-second timeout are implemented, but the
driver does not emit the required per-movement DB/UI propagation durations.

## Live Environment Observation

During this stage a `linercore-wave-a` project appeared, apparently under
another concurrent session. Core services were running while seed-loader,
nginx, shell, and Booking app remained in `Created` state at the snapshot.

This session did not start, stop, alter, clean, or test that project. The
single-controller rule forbids adopting an unowned partial stack. Its presence
is environment context, not a test result.

## Required Population Results

| Test family | Required population | Actual | Status |
|---|---|---|---|
| U01 GET latency | 3 x 20 plus warm-ups | None | BLOCKED |
| U01 GTOT latency | 20 unique fixtures plus warm-up | None | BLOCKED |
| U01 propagation | 20 independent DB/UI observations | None | BLOCKED |
| U01 intake contention | 10 contenders | None | BLOCKED |
| U01 capture contention | 10 contenders | None | BLOCKED |
| U02 API rejection | duplicate 20; wrong-next 20 | None | BLOCKED |
| U02 UI rejection | duplicate 20; wrong-next 20 | None | BLOCKED |
| U02 healthy/retry recovery | accepted movements plus publisher and consumer fixtures | None | BLOCKED |
| U02 ordering | exact ten deliveries/nine receipts | None | BLOCKED |
| U03 API outcomes | 4 x 20 | None | BLOCKED |
| U03 UI outcomes | 4 x 20 | None | BLOCKED |
| U03 recovery | independent API/UI <= 30 s | None | BLOCKED |
| U03 isolation | exact ten-request concurrent matrix | None | BLOCKED |

## Latency, Throughput, Error, and Resource Results

No valid p50, p95, max, throughput, error-rate, CPU, memory, database-pool,
Kafka-lag, or saturation result exists for the required live populations.
No production RPS, concurrent-user, capacity, autoscaling, cost, spike, soak,
or growth claim is made.

## Bottleneck Analysis

No measured bottleneck can be identified without a deployed candidate and live
telemetry. The design seams requiring observation are fresh authorization,
Reference Data calls, indexed/locked database work, outbox relay, Kafka,
Booking consumer fencing, projection writes, and UI polling/rendering.

## Release Decision

Performance remains release-blocking. Passing syntax and mock regression checks
do not clear any NFR. W1 remains `BLOCKED_WAIVED`.

