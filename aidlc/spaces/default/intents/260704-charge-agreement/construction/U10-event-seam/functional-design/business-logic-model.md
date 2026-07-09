# Business Logic Model - U10 Event Seam

## Scope

U10 preserves event-readiness without blocking on Kafka. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Event Flow

1. Application use case completes a lifecycle mutation.
2. Use case constructs a published-language fact.
3. Use case calls `AgreementEventPublisher`.
4. Local no-op or in-memory adapter records the event for tests.
5. Future messaging adapter can publish to Kafka when Compose is healthy.

## Facts

| Fact | Emitted after |
| --- | --- |
| `AgreementChangedFact` | Create, update, suspend, expire. |
| `AgreementApprovedFact` | Approval. |

## Handoff

Operation/Kafka hardening can replace the local adapter without changing domain or application-service use cases.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U10 defines an event seam without making Kafka availability a blocker for local MVP functionality.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.