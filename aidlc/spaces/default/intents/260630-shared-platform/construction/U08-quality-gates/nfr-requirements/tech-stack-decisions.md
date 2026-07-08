# Tech Stack Decisions - U08 Quality Gates

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines GitHub Actions quality-gate behavior for backend, frontend, contracts, schemas, seeds, smoke, and evidence. `business-rules.md` mandates self-hosted GitHub Actions, Java 21/Maven, Yarn/Turborepo, OpenAPI, Pact/message-pact, Avro/Schema Registry, and merge blocking. `requirements.md` fixes C-003 through C-006 and NFR-004.

## Decision Summary

U08 uses self-hosted GitHub Actions runners and the mandated backend/frontend/contract toolchains to enforce merge-blocking quality gates.

## Stack Decisions

| Concern | Selection | Rationale |
|---|---|---|
| CI platform | GitHub Actions self-hosted runners | Required on-prem runner profile. |
| Backend | Java 21, Maven | Mandated backend build/test conventions. |
| Frontend | Yarn and Turborepo | Mandated frontend workspace conventions. |
| API contracts | OpenAPI validation and diff | Required sync API gate. |
| API/message fixtures | Pact/message-pact or equivalent | Required contract testing gate. |
| Event schemas | Avro 1.11 and Schema Registry compatibility | Required event compatibility gate. |
| Evidence | CI artifacts/log paths with gate metadata | Required for review/audit. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Public-cloud CI runners | Violates on-prem constraint. |
| Advisory-only gates | Violates merge-blocking NFR. |
| Aggregate-only coverage | Backend services each target 85 percent line coverage. |
| Manual compatibility review only | Required gates must be automated and reproducible. |
| npm/pnpm frontend workflows | Prohibited by project rules. |

## Implementation Guidance for Later Units

- Build-and-test stage should implement these gates as concrete workflow files/scripts.
- U10 should expose gate/smoke evidence in deployment readiness.
- U07 supplies the contract evidence U08 gates.

