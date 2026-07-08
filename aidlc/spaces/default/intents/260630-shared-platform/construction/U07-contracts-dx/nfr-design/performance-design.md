# Performance Design - U07 Contracts DX

## Performance Goals

U07 keeps contract generation, validation, compatibility checks, example validation, fixture validation, and catalog rendering bounded for CI and review workflows. It does not own runtime API latency, downstream module execution, or U08 gate enforcement.

## Validation Pipeline

Contract publication validates OpenAPI, Avro schemas, examples, and fixtures before marking artifacts publishable. OpenAPI and Avro compatibility compare against previous accepted versions. Missing metadata, parser errors, invalid examples, and unavailable compatibility checks fail or mark status before freeze.

Validation work is organized by artifact path and version so changes can be checked incrementally where tooling supports it.

## Catalog Rendering

Read-only catalog views render artifact metadata, lifecycle status, compatibility status, example status, fixture status, findings, service/event filters, version filters, and status filters without requiring downstream runtime services. The catalog consumes stored artifacts and findings rather than calling future consumer systems.

## Measurement

Metrics and evidence record generation/validation duration, OpenAPI diff duration, Avro compatibility duration, example validation duration, fixture validation duration, and counts of compatible, incompatible, failed, unknown, and pending artifacts. Findings include artifact path and version.

## Freeze Behavior

Unknown compatibility blocks freeze immediately instead of causing later manual investigation. Freeze decisions use stored validation evidence and compatibility findings produced by the pipeline.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
