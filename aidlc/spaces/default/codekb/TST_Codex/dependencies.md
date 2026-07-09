# Dependencies - TST_Codex

## Build Dependencies

Backend:

- `services/pom.xml` aggregates `identity-service`, `reference-data-service`, and `charge-agreement-service`.
- Service modules follow Maven submodule layouts and inherit Java/Spring/JUnit versions from the root services POM.

Frontend:

- Root `package.json` uses Yarn workspaces for `apps/*` and `packages/*`.
- Turbo coordinates `build`, `lint`, `typecheck`, and `test`.
- TypeScript path aliases map `@erp/*` package names to `packages/*/src`.

## Frontend Package Dependencies

| App/package | Key dependencies |
|-------------|------------------|
| `apps/auth` | `@erp/api-core`, `@erp/auth`, `@erp/config`, `@erp/shared-types`, `@erp/ui`, Next, React, Zod |
| `apps/reference-data` | shared `@erp/*`, TanStack React Query, Zustand, Next, React, Zod |
| `apps/charge-agreements` | shared `@erp/*`, Next, React, Zod, testing libraries |
| `packages/api-core` | Axios |
| `packages/ui` | React peer dependency |

## Runtime Dependencies

Compose runtime dependencies:

- `identity-service` depends on PostgreSQL and Keycloak.
- `reference-data-service` depends on PostgreSQL, Kafka, and Schema Registry.
- `apps-auth` depends on identity-service.
- `apps-reference-data` depends on reference-data-service and identity-service.
- `nginx` depends on auth and reference-data apps.
- Observability services include Prometheus, Grafana, Jaeger, OTel Collector, Elasticsearch, and Kibana.

Current Compose does not include `charge-agreement-service`, `apps-charge-agreements`, Booking, or CMM.

## Internal Service Dependencies

Observed ports and adapters:

| Service | Depends on ports/adapters |
|---------|---------------------------|
| Identity | `SubjectResolverPort`, `RoleAssignmentRepository`, `AuthorizationAuditRepository` |
| Reference Data | `ReferenceRepository`, `ReferenceChangeRepository`, `OutboxRepository`, `AuthorizationClientPort`, `ReferenceEventPublisherPort`, `SchemaRegistryPort`, `IdGenerator` |
| Charge Agreement | `AgreementRepository`, `AuthorizationPort`, `ReferenceValidationPort`, `AgreementEventPublisherPort`, `IdGenerator` |

Graphify path between `ReferenceDataApplicationService` and `ChargeAgreementApplicationService` found only an indirect ambiguous path through inferred/common methods, not a direct integration. This supports treating them as separate modules with explicit future API/event seams.

## Contract Dependencies

Current executable-ish contracts:

- Identity OpenAPI and provider fixture.
- Reference Data OpenAPI, Avro reference-data changed events, provider/message fixtures.
- Charge Agreements OpenAPI.

Enterprise contract dependencies required but not implemented:

- Booking to CMM: `booking.confirmed`.
- CMM to Booking: `containermovement.status`.
- Booking to Charge: `pricing.request`, `pricing.result`, `pricing.dnd-request`, `pricing.dnd-result`.

## Tooling Dependencies

Scripts depend on Node and local Docker runtime:

- prerequisite check;
- seed loading;
- contract catalog validation;
- provider verification;
- local readiness;
- quality gates;
- skeleton validation;
- local and observability smoke tests.

Graphify requires no LLM key for `update` and `query` over the existing graph, but semantic extraction/labeling commands may require configured provider keys.

## Dependency Risks

- Local runtime has infrastructure dependencies but incomplete app/service coverage for enterprise target.
- Shared Platform event publication uses placeholder Kafka/SR adapters and pending compatibility status.
- No Booking/CMM module dependencies exist because modules are absent.
- Charge Agreement has reference validation and authorization ports but no real cross-service client implementation was verified.
- Future enterprise delivery must prevent direct database dependencies between services.
