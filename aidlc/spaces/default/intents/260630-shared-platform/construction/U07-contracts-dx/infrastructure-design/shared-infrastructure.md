# Shared Infrastructure - U07 Contracts DX

## Shared Dependencies

U07 uses repository/artifact storage, CI runners, Confluent Schema Registry compatibility, optional `apps/reference-data` read-only views, and U08 gate enforcement.

## Access Boundaries

Contract views are read-only and authorized. U07 does not expose databases, service credentials, runtime consumer access, public external developer portal behavior, or editable production contract source.

## Cross-Unit Contracts

U03 and U02 supply OpenAPI surfaces. U04 supplies Avro event schemas. U06 may display catalog views. U08 enforces the evidence. U10 may surface status but does not own contracts.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
