# Practices Discovery Evidence - Charge & Customer Agreement

## Sources Scanned

| Source | Evidence |
| --- | --- |
| `aidlc/spaces/default/codekb/TST_Codex/code-structure.md` | Confirms backend service module layout, frontend workspaces, tests, contracts, and scripts. |
| `aidlc/spaces/default/codekb/TST_Codex/technology-stack.md` | Confirms Java 21, Spring Boot, Maven, Next.js, React, TypeScript, Yarn, Vitest, OpenAPI, Avro, Docker Compose. |
| `aidlc/spaces/default/codekb/TST_Codex/dependencies.md` | Confirms Postgres, Keycloak, Kafka, Schema Registry, Docker risks, and shared package dependencies. |
| `aidlc/spaces/default/codekb/TST_Codex/code-quality-assessment.md` | Confirms existing test surfaces, CI quality gates, local readiness, and Docker/Compose debt. |
| `aidlc/spaces/default/codekb/TST_Codex/architecture.md` | Confirms hexagonal backend, BFF facade, contracts, and host-runtime architecture. |
| `aidlc/spaces/default/codekb/TST_Codex/business-overview.md` | Confirms Shared Platform as upstream foundation for Charge Agreement. |
| `.github/workflows/quality-gates.yml` | Confirms self-hosted on-prem quality gate workflow. |
| `aidlc/spaces/default/memory/project.md` | Confirms remembered roadmap order and existing forbidden/mandated practices. |

## Pipeline / Deployment Findings

| Practice area | Finding |
| --- | --- |
| Branching | Trunk-based development with short-lived branches is already affirmed in project memory. |
| CI | GitHub Actions runs quality gate aggregation and readiness evidence on self-hosted on-prem Linux runners. |
| Deployment | Local/staging readiness is based on host-runtime/Compose evidence; production remains manual approval. |
| Runtime risk | Docker Desktop is unhealthy locally, so host-runtime evidence must remain separate from Compose parity. |

## Quality Findings

| Practice area | Finding |
| --- | --- |
| Backend tests | Existing services have JUnit domain/application tests; Charge Agreement should mirror this. |
| Frontend tests | Existing apps use Vitest and Testing Library style tests; Charge Agreement should mirror this. |
| Contract tests | OpenAPI/Avro/Pact verification scripts exist and should be extended for new APIs/events. |
| Readiness | Local readiness can pass in host-runtime mode with optional infra warnings. |

## Developer / Architecture Findings

| Practice area | Finding |
| --- | --- |
| Backend style | Repeated Java/Spring hexagonal Maven module layout. |
| Frontend style | Next.js App Router, TypeScript strict, BFF route handlers, shared `@erp/*` packages. |
| Integration style | BFF/service-client layer normalizes upstream service calls and correlation IDs. |
| Domain boundary | Shared Platform services should be consumed by business modules, not expanded with business-module behavior. |

## DevSecOps Findings

| Practice area | Finding |
| --- | --- |
| Auth bypass | Local auth bypass exists and must remain non-production only. |
| Data classification | Commercial agreement/customer data should be treated as internal/confidential. |
| Evidence | Blockers such as Docker/Kafka/Schema Registry/Keycloak must be reported honestly. |
| Audit | Agreement approval/status changes require traceable metadata from the first slice. |

## Gaps Asked or Inferred

No additional human staffing questions were needed. The only unresolved operational gap is whether Docker recovery is mandatory before Operation completion; for construction, host-runtime remains sufficient.
