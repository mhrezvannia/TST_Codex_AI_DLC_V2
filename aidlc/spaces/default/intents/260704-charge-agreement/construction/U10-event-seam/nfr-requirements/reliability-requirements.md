# Reliability Requirements - U10

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Reliability

Fact creation happens only after successful application mutation. Local no-op/in-memory adapters must be explicit.

## Recovery

Production outbox retry semantics are required for enterprise enablement and must not be silently claimed in MVP evidence.

## Enterprise Event Reliability

| Target | Requirement |
| --- | --- |
| Delivery durability | Production event publication uses a transactional outbox or equivalent durable handoff before acknowledging lifecycle mutation completion. |
| Retry window | Failed event dispatch retries for at least 24 hours with exponential backoff and dead-letter capture after retry exhaustion. |
| Recovery point | RPO for unpublished lifecycle events is 0 after the domain mutation commits. |
| Recovery time | RTO for replaying backlogged lifecycle events is 60 minutes after broker recovery for normal backlog volume. |
