# Skill Matrix - LinerCore Enterprise

## Source Context

This skill matrix consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/feasibility-assessment.md`

## Skill Coverage Matrix

| Skill | Required Level | Current Evidence | Gap | Remediation |
|-------|----------------|------------------|-----|-------------|
| Liner shipping domain | High | Program documents define domain | Named SMEs unknown | Assign pricing, booking, equipment SMEs |
| DDD/service boundaries | High | Enterprise docs and existing services | Needs enterprise-wide consistency | Architecture lead and reviews |
| Java/Spring backend | High | Existing backend services visible in graph | Booking/CMM build capacity unknown | Assign backend module owners |
| TypeScript/Next.js frontend | High | Existing `apps/reference-data`; Claude UI export | Full UI capacity unknown | Assign frontend lead and module UI owners |
| PostgreSQL/data ownership | High | Existing services and local DB requirement | Per-service migrations/users pending | Platform + module engineers |
| Kafka/Schema Registry | High | Required by contracts/platform | Runtime/integration maturity unknown | Platform specialist, contract tests |
| Keycloak/OIDC/JWT | High | Enterprise standard | Full integration maturity unknown | Security + platform specialist |
| OpenAPI/Pact | High | Contract requirement | Needs executable artifacts | Quality enablement and module ownership |
| Avro/AsyncAPI/message-pact | High | Contract requirement | Needs executable artifacts | Platform + quality specialists |
| DCSA movement semantics | Medium-High | CMM scope requires DCSA v2.2 | Specialist not named | Identify DCSA/EDI advisor |
| Docker Compose local runtime | High | Explicit scope gate | Full profile not proven | Platform/runtime owner |
| Observability/SRE | High | Operation in scope | Dashboards/SLOs/runbooks pending | Ops/SRE specialist |
| Security/compliance | High | Enterprise controls in scope | Data residency/trade footprint open | Security/compliance reviews |
| E2E/performance testing | High | Completion criteria require tests | Automation ownership unknown | QA automation lead |
| Delivery coordination | High | Multi-workstream dependency chain | Child-intent strategy open | Delivery lead |

## Workstream Skill Needs

| Workstream | Required Skills | Specialist Need |
|------------|-----------------|-----------------|
| Shared Platform | Java, Spring, PostgreSQL, Keycloak, Kafka, Schema Registry, Docker, observability, security | Kafka/SR and identity specialist |
| Charge & Agreement | Java, DDD, pricing/domain modeling, REST/OpenAPI, resilience, audit, tests | Pricing/D&D domain specialist |
| Booking | Java, workflow/state machines, contract clients, event consumers, exception handling, UI integration | Booking SME |
| CMM | Java, event consumption/publication, DCSA validation, dedupe/ordering, journey state | DCSA/EDI specialist |
| Frontend | TypeScript, Next.js, BFF route handlers, UX implementation, accessibility, auth integration | UX lead familiar with Claude export |
| Runtime/Operation | Docker Compose, migrations/seeds, CI/CD, logs/metrics/traces, runbooks, incident process | SRE/DevOps lead |

## Skill Gap Priorities

1. Contract testing and schema compatibility expertise.
2. Full local runtime/platform ownership.
3. Booking/CMM domain and state-machine expertise.
4. D&D commercial rules and edge-case testing expertise.
5. UI normalization from Claude prototype to real requirements.
6. Security/compliance evidence planning.

## Onboarding Checklist

- Read `scope-document.md` and `intent-backlog.md`.
- Read `feasibility-assessment.md` and `constraint-register.md`.
- Review `docs/program-vision-document.md`, `docs/program-execution-plan.md`, `docs/enterprise-technical-environment.md`.
- Review enterprise contracts under `docs/enterprise-contracts/`.
- Review `docs/enterprise-gap-summary.md` and Graphify caveats.
- Run targeted `graphify query` or `graphify explain` before broad code/design decisions.
- Review old MVP baseline but do not modify `aidlc/spaces/default/intents/260630-shared-platform`.
- Confirm local tooling: Java, Node/Yarn, Docker, Graphify, and test runners.
