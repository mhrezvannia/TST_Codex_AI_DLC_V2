# Reliability Design - U04

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Save header, terms, and activity in one transaction. Replace term rows atomically from the aggregate state.

## Recovery

Database outage becomes service-unavailable through the API layer.
