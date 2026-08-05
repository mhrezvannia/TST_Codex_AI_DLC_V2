# Scalability Design - U02 Reference Validation

## Bounded Scaling

Stateless Booking instances each use one managed 10-thread/20-queue executor, a fair outbound semaphore cap of ten with 25 ms acquisition, per-request submission cap four, Hikari max ten, limits 8 legs/20 equipment/45 lookups, and 256 KiB body. Work is submitted in bounded batches so one request cannot occupy the entire queue. Nginx may scale instances, but aggregate provider load is observed before adding replicas.

Reference Data pages/queries are indexed by set/code/status and bounded. Executor rejection or semaphore timeout fails fast as typed overload instead of adding work. Metrics expose active/queued calls, permits, rejection, amplification, 429/timeout, DB/HTTP pool wait, RSS, and per-set latency; acceptance uses >=100 records/set and fixed workload/thresholds.

## Source Coverage

Design realizes `scalability-requirements.md` and integrates `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U02 `business-logic-model.md`.
