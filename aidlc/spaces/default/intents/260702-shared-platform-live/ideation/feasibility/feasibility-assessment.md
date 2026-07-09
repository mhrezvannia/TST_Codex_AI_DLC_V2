# Feasibility Assessment - Shared Platform Local Functionality

## Executive Assessment

This stage consumes `intent-statement`, `competitive-analysis`, `market-trends`, and `build-vs-buy`. The initiative is technically feasible and strategically necessary, but it has concrete prerequisites that must be resolved early in construction.

Verdict: **Feasible with prerequisite remediation**.

The target architecture is already defined by Enterprise Technical Environment v1.1 and Shared Platform Tech Env v0.2: on-premises microservices, Java/Spring Boot backend services, Next.js BFF apps, PostgreSQL, Keycloak, Kafka, Schema Registry, Docker Compose, self-hosted GitHub Actions, and no public cloud. The current codebase has much of the skeleton and validation surface, but lacks enough runtime wiring to be locally functional.

## Technical Viability

| Area | Feasibility | Evidence |
| --- | --- | --- |
| Frontend local runtime | High | Next.js apps have already run locally; auth bypass and reference-data UI are available. |
| Backend compile/test | Feasible but blocked locally | Java and Maven are required but not installed/on PATH on this machine. |
| Docker Compose runtime | Feasible but blocked locally | `docker compose config --quiet` passes; Docker daemon is not currently running. |
| Service image packaging | Needs work | `compose.yaml` references local images, but no Dockerfiles/build definitions are present in the repo scan. |
| Reference-data functionality | Feasible | Domain/application-service source, in-memory adapters, outbox seams, contracts, and UI placeholder exist; persistence/API/BFF wiring must be completed. |
| Auth functionality | Feasible | Keycloak, identity-service skeleton, auth BFF, local bypass, and authorization model source exist; real local Keycloak/identity flow must be wired. |
| Event bus/outbox | Feasible | Kafka/Schema Registry Compose services and Avro placeholders exist; producer registration and live publication verification need implementation. |
| CI quality gates | Feasible | Gate runner and GitHub Actions workflow exist; full pass requires Java/Maven runner and backend tests. |

## Platform Perspective

The AWS/platform support perspective resolves to **on-prem platform engineering**, not AWS service selection. Enterprise Technical Environment v1.1 states that cloud provider is none and Docker Compose is the default deployment model. Therefore:

- do not introduce AWS services, CDK, CloudFormation, managed RDS, MSK, or cloud IAM;
- keep local/on-prem topology aligned through Compose;
- use self-hosted GitHub Actions runners;
- use self-hosted registries such as Harbor/Nexus/Artifactory when artifact publishing becomes necessary;
- keep Terraform/Ansible as later environment-provisioning surfaces, not a blocker for local functional development.

## Compliance Feasibility

Compliance is feasible if the design keeps the documented controls:

| Control area | Feasibility note |
| --- | --- |
| PII | Party/Customer data is PII-bearing and must remain owned by `reference-data-service`; consumers should hold references, not copies of sensitive fields. |
| Identity | Keycloak authentication plus `identity-service` authorization is feasible; `AUTH_BYPASS=true` must remain opt-in and local-only. |
| BFF security | Browser-to-BFF-to-backend remains feasible; direct browser-to-service calls are prohibited. |
| Auditability | Correlation id propagation, structured logs, and outbox status must be made real in local flows. |
| Data residency | On-prem/no-public-cloud stance avoids cloud residency concerns, but primary/DR site remains a later organizational decision. |
| OWASP/CIS | Controls are feasible, but the Shared Platform `security/owasp-compliance.md` matrix is still a documented follow-up. |

## Key Feasibility Blockers

| Blocker | Type | Impact | Mitigation |
| --- | --- | --- | --- |
| Java 21 missing locally | Tooling | Backend compile/tests cannot run. | Install Java 21 and set PATH/JAVA_HOME. |
| Maven missing locally | Tooling | Backend quality gate fails. | Install Maven 3.9+ and verify `mvn -version`. |
| Docker daemon not running | Tooling | Full Compose stack cannot start. | Start Docker Desktop or approved Docker-compatible runtime. |
| No Dockerfiles/build definitions found | Packaging | Compose `apps` profile references images that may not exist. | Add service/app Dockerfiles or Compose build contexts during construction. |
| Static BFF placeholder data | Application | UI remains view-only/static. | Implement BFF clients to backend APIs and mutation flows. |
| Dry-run seed loader | Application | Local data not applied to live services. | Implement seed apply mode through service/admin APIs. |
| Keycloak realm/client/user bootstrap absent | Identity | Real local auth path incomplete. | Add deterministic Keycloak bootstrap/import for local realm and roles. |

## Recommended Feasibility Path

1. Establish local prerequisite baseline: Java 21, Maven, Docker runtime.
2. Add or confirm local image build strategy for backend services and Next apps.
3. Make backend services compile, test, and run.
4. Wire local Keycloak and identity authorization flow.
5. Wire reference-data BFF routes to backend APIs and enable authorized mutations.
6. Convert seed loader from dry-run-only to service-backed apply mode.
7. Verify outbox/status and Schema Registry behavior.
8. Run full quality gates locally or on the self-hosted CI runner.

## Feasibility Decision

Proceed. The initiative should not be expanded into Charge, Booking, or Container Movement until Shared Platform is demonstrably local-functional and integration-ready.
