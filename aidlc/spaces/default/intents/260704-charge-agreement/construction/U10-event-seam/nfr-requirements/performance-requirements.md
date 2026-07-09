# Performance Requirements - U10

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

| Target | Requirement |
| --- | --- |
| Local event construction | Event fact construction adds no more than 10 ms p95 to approve, reject, activate, and expire use-case tests. |
| Publisher port call | In-memory or no-op publisher completes within 20 ms p95 and records correlation ID, aggregate ID, event type, and occurred-at timestamp. |
| Broker readiness boundary | Live broker throughput is not claimed until Kafka health is green; production target is at least 100 agreement lifecycle events per minute with p95 publish latency under 250 ms after broker enablement. |

## Validation

Unit tests verify fact construction and publisher port calls.
