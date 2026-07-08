# Deployment Architecture - U07 Contracts DX

## Compute Model

U07 uses validation runners and artifact-controlled contract storage. It does not deploy downstream consumer stubs, a public developer portal, or a custom operations/catalog service.

## Network Topology

Validation runners may reach local Schema Registry for compatibility checks. Read-only catalog views are served through `apps/reference-data` BFF/UI paths when enabled. No database contracts or direct runtime consumer access is exposed.

## Storage Strategy

OpenAPI, Avro, examples, fixtures, findings, and freeze records are stored in repository paths and CI artifacts. Version-control history remains the system of record for contract changes.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Validate artifacts and examples against local tools/SR where available. |
| CI | Produce compatibility evidence and freeze status artifacts. |
| Non-local | Read-only catalog display only; no editable production contract UI. |

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
