# Monitoring Design - UOW-07 Outbox Publication Status

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Signals

- Outbox pending/retrying/failed/published counts.
- Publish batch duration.
- Schema Registry failures.
- Kafka publish failures.
- Broker metadata on success.

## Alerts

Local readiness fails when events remain failed or broker/schema services are unavailable for required smoke.

