# Infrastructure Design Questions - U07 Contracts DX

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U07-contracts-dx`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Use repository/artifact-controlled contract directories and validation runners. Optional catalog views are read-only inside `apps/reference-data`; no new public developer portal or downstream runtime service is deployed.

### Q2. Compute/storage/networking

[Answer]: Store OpenAPI, Avro, examples, fixtures, findings, and freeze records in version-controlled paths and CI artifacts. Use Schema Registry compatibility checks where configured.

### Q3. Monitoring approach

[Answer]: Track validation duration, compatibility duration, artifact status counts, failed/unknown findings, and catalog rendering status.

### Q4. CI/CD pipeline

[Answer]: Run OpenAPI validation/diff, Avro validation, Schema Registry compatibility, example validation, Pact/message-pact fixture validation, scope guard, and freeze evidence generation.

### Q5. Secrets management

[Answer]: Contract examples cannot include secrets, tokens, production identifiers, unsafe PII, database schemas, or stack traces. Schema Registry credentials use Vault references outside local.

### Q6. Scaling policy

[Answer]: Scale by artifact metadata, filters, version history, and incremental validation, not by deploying a runtime catalog platform.

## Ambiguity Analysis

No blocking ambiguity remains. Concrete CI workflow implementation belongs to U08/build-and-test.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
