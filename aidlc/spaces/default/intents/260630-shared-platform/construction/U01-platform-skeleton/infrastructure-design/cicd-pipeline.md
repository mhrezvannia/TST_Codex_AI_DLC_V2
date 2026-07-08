# CI/CD Pipeline - U01 Platform Skeleton

## Pipeline Goals

U01 defines root-level pipeline conventions and script aliases that later stages implement concretely. The pipeline runs on self-hosted/on-prem GitHub Actions runners for required gates and avoids public-cloud CI dependencies.

## Build Stages

| Stage | U01 convention |
|---|---|
| Backend setup | Java 21 and Maven. |
| Frontend setup | Yarn and Turborepo. |
| Contracts | OpenAPI, Avro, and fixture paths are predictable. |
| Containers | Image names and tags follow deterministic registry conventions. |

## Test Stages

The skeleton defines aliases for backend compile/test, frontend type/lint/test, contract validation, schema validation, seed validation, and smoke checks. Later U08 and build-and-test stages turn these aliases into merge-blocking gates.

## Deployment Stages

U01 supports local Compose deployment only. Staging and production descriptors are placeholders that must use Vault references for non-local secrets and image registry tags for traceability. Deployment strategy details such as rolling, blue-green, or canary are deferred.

## Rollback Strategy

The skeleton captures rollback prerequisites: deterministic image tags, versioned Compose descriptors, database migration boundaries, and smoke evidence. Concrete rollback automation is outside U01.

## Secrets in CI/CD

Local values may be development-only. Non-local pipeline configuration references Vault or approved secret paths. CI logs and artifacts must not print tokens, database passwords, broker credentials, Keycloak secrets, or observability credentials.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
