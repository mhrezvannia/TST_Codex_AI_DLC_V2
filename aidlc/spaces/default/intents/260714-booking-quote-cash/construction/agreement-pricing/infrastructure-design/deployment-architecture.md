# Deployment Architecture - U03 Agreement Pricing

## Compose Topology

Booking calls `charge-agreement-service:8084` over the isolated Compose bridge; the browser and Booking app cannot call Charge directly. Charge owns `linercore_pricing` and its PostgreSQL role, while Booking owns the persisted pricing/manual projection in `linercore_booking`. Neither service receives cross-database grants. Host PostgreSQL remains `${POSTGRES_HOST_PORT:-55432}:5432`; internal clients use `postgres:5432`.

Both Spring containers are stateless above their databases. Compose starts PostgreSQL health, guarded Flyway for each owner, Charge readiness, Booking readiness, Booking app, then nginx. Charge uses `local,kafka` only to preserve the existing service profile; U03 pricing itself is synchronous HTTP and adds no event topic.

## Compute and Resilience

Booking's Charge client uses a 2-second timeout, one retry only for timeout/503, five-call failure window, 30-second open breaker, one half-open probe, and bulkhead concurrency 10. Charge uses Hikari max 10 and bounded servlet concurrency; claim, calculation, and completion do not hold one transaction across the pricing engine or HTTP.

The acceptance envelope is >=100 agreements with <=100 terms, 1,000 measured requests at concurrency 10 within five minutes, body <=256 KiB, quantity/TEU <=1000, and <=100 terms/lines. One instance/service is the evidence baseline. Horizontal replicas require no sticky session because unique constraints, owner-token fencing, and immutable terminal results arbitrate races.

## Migration and Recovery

Charge disables SQL init and automatic baseline. Valid Flyway history is validated/migrated; empty schema runs V1/V2; non-empty no-history schema is explicitly baselined only after the exact checked-in Charge V1 catalog fingerprint matches. Unknown/partial catalogs abort before mutation and readiness.

The ten-second `IN_PROGRESS` lease and owner-token CAS recover crashed calculations. Same key/hash replays terminal output, a live lease gives bounded retry guidance, one contender may reclaim expiry, and stale completion cannot write. Pre-upgrade dump/hash defines host-loss recovery; restart tests preserve claims/results/manual cases without reset.

## Source Coverage

Deployment maps `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U03 `business-logic-model.md`.
