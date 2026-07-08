# Infrastructure Services - U07 Contracts DX

## Artifact Registry

The contract artifact registry tracks owner, version, lifecycle status, source service, compatibility status, path, and findings for OpenAPI contracts, Avro schemas, examples, and fixtures.

## Validators

OpenAPI validators check syntax, examples, and diffs. Avro validators check schemas and examples. Fixture validators bind Pact/message-pact expectations to operations or events.

## Schema Registry

Confluent Schema Registry compatibility checks validate event schema evolution against accepted baselines where configured.

## Catalog Views

`apps/reference-data` may display read-only catalog views filtered by service, event, version, status, and finding state.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
