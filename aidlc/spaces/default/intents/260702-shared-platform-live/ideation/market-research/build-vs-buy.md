# Build vs Buy Assessment - Shared Platform Local Functionality

## Context

This assessment consumes `ideation/intent-capture/intent-statement.md`. The goal is to make Shared Platform locally functional and integration-ready, not to acquire a full commercial carrier platform.

## Decision Matrix

| Capability | Build | Buy / Adopt | Recommendation |
| --- | --- | --- | --- |
| Authentication provider | High risk, low differentiation. | Keycloak is already mandated. | Adopt Keycloak. |
| Authorization model | Carrier roles and module permissions are domain-specific. | Generic IAM cannot encode all LinerCore decisions without custom logic. | Build in `identity-service`. |
| Reference-data service | Canonical ownership and validation are LinerCore-specific. | Generic MDM tools would add integration and customization overhead. | Build. |
| Event broker | Commodity infrastructure. | Kafka and Schema Registry are mandated. | Adopt self-managed Kafka and Schema Registry. |
| Outbox/event publication behavior | Must align with service transactions and reference events. | Generic tools still need service-specific integration. | Build using mandated patterns. |
| Contract testing | Tooling is commodity. | Pact and Schema Registry compatibility are mature choices. | Adopt tooling, write project contracts. |
| Local runtime | Commodity. | Docker Compose is mandated. | Adopt and complete Compose wiring. |
| CI runner and quality gates | Runner platform is commodity; gate definitions are project-specific. | GitHub Actions self-hosted runners are mandated. | Adopt GitHub Actions; build project gate runner/config. |
| Artifact repository | Commodity. | Harbor/Nexus/Artifactory are suitable self-hosted options. | Adopt selected self-hosted registry; defer final choice if environment is not provisioned. |

## Recommendation

Use a hybrid strategy:

1. Adopt commodity platform components: Keycloak, Kafka, Schema Registry, Docker Compose, GitHub Actions self-hosted runners, Pact, and the selected self-hosted artifact registry.
2. Build LinerCore-specific capabilities: `reference-data-service`, `identity-service` authorization, BFF integration, seed execution, outbox/status flows, and contract/provider tests.
3. Avoid building Charge, Booking, or Container Movement in this intent. Those remain the remembered follow-on sequence after Shared Platform is functional.

## Buy / Adopt Guardrails

| Guardrail | Reason |
| --- | --- |
| No public cloud services | Enterprise Tech-Env mandates on-prem operation. |
| No replacement for Keycloak without waiver | Authentication standard is fixed. |
| No shared databases between modules | Service ownership is a mandated architecture rule. |
| No browser-direct backend calls | BFF pattern is mandated. |
| No proprietary contract format replacing OpenAPI/Avro/Pact | Standards keep downstream modules independently buildable. |

## Market Size / Audience

External market sizing is not applicable. The serviceable audience is internal:

| Audience | Value |
| --- | --- |
| Reference-data admins | Functional maintenance of canonical data. |
| Security / IT | Realistic local authz/auth flow. |
| Downstream module teams | Stable contracts and local service endpoints. |
| Program sponsor | Confidence that the foundation is ready before building business modules. |

## External References

- Keycloak: https://www.keycloak.org/
- Apache Kafka: https://kafka.apache.org/
- Confluent Schema Registry: https://docs.confluent.io/platform/current/schema-registry/
- Pact: https://docs.pact.io/
- Docker Compose: https://docs.docker.com/compose/
- GitHub Actions self-hosted runners: https://docs.github.com/actions/hosting-your-own-runners
- Harbor: https://goharbor.io/
- Nexus Repository: https://www.sonatype.com/products/sonatype-nexus-repository
