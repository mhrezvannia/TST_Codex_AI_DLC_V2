# NFR Requirements Questions - U03 Authorized Degraded Journey Access

U03 inherits U01's local API p95/max convention, 30-second bounded recovery
observer, isolated-stack protection, and no-production-SLO boundary. These
questions specialize `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md` only where U03 adds fresh
authorization, fail-closed Identity behavior, and authorized last-known reads.

## Q1. Authorization and degraded-read latency

What local acceptance target should fresh ALLOW, DENY, Identity-unavailable,
and authorized Reference Data-degraded reads meet?

- A. For 20 run-scoped requests per outcome after one excluded warm-up, require p95 <= 2 seconds and max <= 5 seconds from submit to the complete safe API result; measure focused UI outcomes separately to the same target and keep every class distinct. (recommended)
- B. Record timings without a pass/fail target.
- C. Define a production authorization/dependency latency SLO.
- X. Other (please specify)

[Answer]: 20 per outcome, p95 2s/max 5s (Recommended)

## Q2. Dependency recovery

What bounded recovery proof should follow an injected Identity or Reference Data
outage without caching authority or replaying capture?

- A. After dependency health is restored, require a user-triggered Retry to perform fresh authorization and reference checks and show a fresh authorized result within 30 seconds; no capture is queued or automatically resubmitted. (recommended)
- B. Prove eventual recovery with no time bound.
- C. Add automatic cached authorization and movement replay during outages.
- X. Other (please specify)

[Answer]: Fresh Retry within 30s (Recommended)

## Q3. Authorization isolation contention

What bounded mixed-request set should prove authorization-first ordering and
zero unauthorized disclosure/effects without making a production throughput
claim?

- A. Run 10 concurrent requests for one protected journey: authorized reads, read DENYs, Identity outages, Reference Data-degraded reads, capture DENYs, and dependency-unavailable captures; require exact response/write sets, no protected lookup before read ALLOW, and no unauthorized capture effect. (recommended)
- B. Exercise each outcome only once and sequentially.
- C. Add sustained authorization-provider load and horizontal-scaling targets.
- X. Other (please specify)

[Answer]: 10 concurrent mixed requests (Recommended)
