# Business Rules - U10 Event Seam

## Event Rules

| ID | Rule | Source |
| --- | --- | --- |
| U10-R1 | Event publication is a port, not a direct domain dependency. | `components.md` |
| U10-R2 | Domain-core remains framework and messaging free. | `team-practices.md` |
| U10-R3 | Live Kafka is optional until Docker/Compose is healthy. | `services.md`, `requirements.md` NFR-6 |
| U10-R4 | Event facts include agreement ID, status, timestamp, actor, and correlation ID where available. | `requirements.md` NFR-2, NFR-5 |

## Failure Rules

For the MVP seam, event adapter failure should be visible in logs/tests. Production policy for transactional outbox is deferred to later hardening.

## Compatibility Rules

Published-language facts should avoid leaking persistence entities or UI view models.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.