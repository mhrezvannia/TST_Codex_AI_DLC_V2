# Scalability Design - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Boundary

This design implements `scalability-requirements.md`, `business-logic-model.md`,
and `tech-stack-decisions.md` without adding a production capacity claim.

## Distribution and Contention

CMM and Booking remain independently deployable service boundaries. Kafka is the
durable asynchronous boundary; CMM publishes only committed outbox rows and
Booking consumes idempotently. PostgreSQL uses indexed stable booking/equipment
identity and row-level locking for the bounded same-intake and same-capture
10-contender probes. Connection pools and bounded relay batches prevent one
request class from exhausting shared resources.

## Growth Boundary

The design is stateless at REST edges and supports ordinary service replicas,
but no sharding, cache, read replica, autoscaling threshold, sustained RPS, or
multi-container capacity target is introduced for U01.

