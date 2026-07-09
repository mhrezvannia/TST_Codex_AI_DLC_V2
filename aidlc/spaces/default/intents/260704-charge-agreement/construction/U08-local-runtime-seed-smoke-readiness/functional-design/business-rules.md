# Business Rules - U08 Local Runtime, Seed, Smoke, Readiness

## Evidence Rules

| ID | Rule | Source |
| --- | --- | --- |
| U08-R1 | Host-runtime success cannot be reported as Docker/Compose success. | `requirements.md` NFR-6 |
| U08-R2 | Smoke checks must include at least one agreement lifecycle or lookup behavior. | `requirements.md` FR-6.3 |
| U08-R3 | Seed data must use Shared Platform reference IDs. | `requirements.md` FR-5.1 |
| U08-R4 | Runtime scripts must use non-conflicting documented ports. | `services.md` |

## Failure Rules

1. Missing Charge Agreement backend fails readiness.
2. Missing UI fails readiness.
3. Docker/Kafka/Keycloak failures are recorded as blocked optional checks unless the current mode claims Compose parity.

## Reporting Rules

Evidence should include timestamp, checked URL, status, and blocker category.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.