# Competitive Analysis - Shared Platform Local Functionality

## Context

This analysis consumes `ideation/intent-capture/intent-statement.md`. The initiative is not to sell a standalone Shared Platform product. It is to make the existing LinerCore Shared Platform scaffold locally functional and integration-ready so the next modules can be built without placeholder debt.

## Alternatives Compared

| Alternative | Strengths | Weaknesses | Fit for this intent |
| --- | --- | --- | --- |
| Continue with current scaffold only | Already exists; low immediate cost; validates structure. | UI remains read-only, auth is bypass/placeholder, BFFs do not call backend, backend services are not runnable locally. | Poor. It blocks downstream module work. |
| Buy a full commercial carrier platform | May provide mature booking/pricing/movement capabilities. | Conflicts with the greenfield LinerCore build, module ownership, on-prem standards, and AI-DLC per-module roadmap. | Poor for this intent. |
| Build every platform capability from scratch | Maximum control. | Wastes effort on commodity auth, broker, registry, CI, and runtime plumbing. | Poor. Overbuilds non-differentiating infrastructure. |
| Adopt commodity platform components and build LinerCore-specific seams | Uses mature tools for auth, messaging, contracts, CI, local runtime; focuses effort on reference data, authorization model, BFF integration, seed execution, and outbox behavior. | Requires disciplined integration and local runtime setup. | Best fit. |

## Competitive / Substitute Landscape

| Capability | Market substitute | Recommendation |
| --- | --- | --- |
| Authentication / OIDC | Keycloak and other IdPs | Use Keycloak as already mandated; do not hand-build authentication. |
| Authorization / carrier role model | Generic IAM products | Build `identity-service` authorization because carrier roles and module permissions are domain-specific. |
| Event transport | Kafka-compatible platforms | Use self-managed Kafka and Schema Registry per Enterprise Tech-Env; build outbox and event contracts. |
| Contract testing | Pact, Schema Registry compatibility gates | Adopt these tools; do not replace them with prose-only contract reviews. |
| Local runtime | Docker Compose | Use Compose for local/on-prem parity at this stage. |
| CI | GitHub Actions self-hosted runners | Keep the existing GitHub Actions quality-gate workflow and make it fully runnable. |
| Artifact registries | Harbor, Nexus, Artifactory | Use whichever self-hosted registry is selected by the target environment; do not invent an artifact store. |

## Positioning

The Shared Platform should position itself internally as an enabling foundation:

| Dimension | Desired position |
| --- | --- |
| Differentiation | Carrier-specific canonical reference data, identity authorization, event contracts, and integration readiness. |
| Commodity adoption | Keycloak, Kafka, Schema Registry, Pact, Docker Compose, GitHub Actions, and self-hosted registries. |
| Audience | Platform team, reference-data admins, Security/IT, and downstream Charge/Booking/Container teams. |

## External References

- DCSA Open Track & Trace: https://dcsa.org/standards/open-track-trace/
- Keycloak project/docs: https://www.keycloak.org/
- Confluent Schema Registry documentation: https://docs.confluent.io/platform/current/schema-registry/
- Pact documentation: https://docs.pact.io/
- Docker Compose documentation: https://docs.docker.com/compose/
- GitHub Actions self-hosted runners: https://docs.github.com/actions/hosting-your-own-runners
- Harbor registry: https://goharbor.io/
- Sonatype Nexus Repository: https://www.sonatype.com/products/sonatype-nexus-repository
