# Skill Matrix - Shared Platform Local Functionality

## Skill Coverage

This skill matrix consumes `scope-document`, `intent-backlog`, and `feasibility-assessment`. The matrix maps required skills to current coverage and remediation.

| Skill area | Needed for backlog units | Coverage | Gap | Remediation |
| --- | --- | --- | --- | --- |
| Java 21 / Spring Boot 3.3 | U03, U05, U08, U09, U10 | AI-assisted implementation knowledge available | Local Java/Maven runtime missing | Install Java 21 and Maven 3.9+ or run backend gates on provisioned runner. |
| Maven multi-module builds | U03, U10 | AI-assisted implementation knowledge available | Local `mvn` unavailable | Install Maven and document wrapper/runner path if present. |
| Next.js / BFF route handlers | U04, U06, U10 | Available | None blocking | Continue using Node/Yarn; replace static data with service clients. |
| Keycloak 24 / OAuth/OIDC | U04, U12 | Available for design and config | Realm/client/user bootstrap absent | Add deterministic local import/bootstrap and tests. |
| PostgreSQL persistence/migrations | U03, U05, U07 | Available | Runtime proof depends on Docker/Postgres | Add migrations/repositories and Compose-backed smoke evidence. |
| Kafka / Schema Registry / Avro | U08, U09 | Available for implementation guidance | Live broker proof depends on Docker | Wire producer/outbox and run once Docker is available. |
| Docker Compose and image packaging | U01, U02, U11 | Available | Docker daemon not running; Dockerfiles/build contexts missing | Add Dockerfiles/build contexts or dev profiles; start Docker runtime. |
| Contract testing | U09, U10 | Available | Needs live services for provider/message proof | Align OpenAPI/Avro/Pact checks after U03/U08. |
| Security/compliance | U04, U05, U10, U12 | Available via constraints | Evidence files and guardrails incomplete | Complete OWASP/API/CIS coverage and bypass safeguards. |
| Operations/runbook | U11 | Available | Runtime checks depend on services | Add health, smoke, log, and troubleshooting scripts. |

## Gap Analysis

The largest gaps are not conceptual staffing gaps; they are execution-environment and runtime-wiring gaps:

1. Java and Maven are unavailable locally, blocking backend compile/test feedback.
2. Docker daemon is unavailable, blocking Compose runtime proof.
3. Compose app image references are not backed by discovered Dockerfiles/build contexts.
4. BFF routes and UI currently rely on static/placeholder behavior for the main reference-data experience.
5. Keycloak bootstrap and live outbox publication are not yet demonstrated.

## Remediation Plan

| Remediation | Backlog link | Exit condition |
| --- | --- | --- |
| Install or provision Java 21 and Maven 3.9+ | U01, U03, U10 | `java -version` and `mvn -version` succeed in the chosen execution environment. |
| Start Docker runtime | U01, U02, U08, U11 | `docker info` and Compose runtime checks succeed. |
| Add Dockerfiles/build contexts/dev profiles | U02 | Compose resolves app/service images without prebuilt unknown local images. |
| Replace static BFF paths | U06 | UI mutation flows call backend APIs through BFF. |
| Add Keycloak bootstrap | U04 | Local realm/client/users/roles are repeatably created or imported. |
| Add contract/message checks | U09, U10 | Provider/message checks pass against live or testcontainer-backed services. |

## Skill Sufficiency Decision

Proceed with the AI-assisted local delivery cell. No external partner is required for this intent unless the local environment cannot provide Java/Maven/Docker or a self-hosted runner.
