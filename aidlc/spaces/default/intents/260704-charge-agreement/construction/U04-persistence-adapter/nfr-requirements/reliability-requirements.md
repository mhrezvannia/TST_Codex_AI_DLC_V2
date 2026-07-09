# Reliability Requirements - U04

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Reliability

Agreement header, terms, and activity are persisted atomically. Failed saves leave prior aggregate state intact.

## Recovery

Postgres remains the durable store; in-memory adapters are test/local-only and must be labelled accordingly.

## Enterprise Durability

| Target | Requirement |
| --- | --- |
| Availability | Persistence dependency supports the module availability target of 99.5% monthly for production. |
| Recovery point | RPO is 15 minutes for agreement, rate term, and activity data. |
| Recovery time | RTO is 60 minutes for database restore or failover. |
| Retention | Agreement and activity records are retained for 7 years unless a stricter customer or regulatory policy is configured. |
