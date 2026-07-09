# Security Design - U10

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Published-language facts contain IDs, statuses, actor, timestamps, and correlation IDs only.

## Boundary

No domain-core dependency on Kafka, schema registry, or messaging framework.
