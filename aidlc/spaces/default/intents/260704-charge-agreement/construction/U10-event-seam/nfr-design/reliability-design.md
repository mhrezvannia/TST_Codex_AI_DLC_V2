# Reliability Design - U10

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Emit facts after successful application mutation. Local adapter records or ignores events explicitly; production outbox is deferred.

## Recovery

Do not claim durable event delivery until outbox/broker implementation exists.
