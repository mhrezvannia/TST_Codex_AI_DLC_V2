# Infrastructure Services - U03

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Services

No direct services are allocated to U03. It defines ports for Postgres, identity, reference-data, and events.

## Boundaries

Adapters must own infrastructure clients; application-service remains infrastructure-agnostic.
