# Technology Stack — TST_Codex_W2-03

## Languages and Runtimes

| Technology | Version | Use |
|---|---:|---|
| Java | 21 | Backend services and domain/application/adapters |
| TypeScript | 5.7.2 | Next.js apps, shared packages, tests, automation |
| JavaScript/Node.js | Node image 24-alpine | Seed, contract, quality, and acceptance tooling |
| SQL | PostgreSQL dialect | Service-owned schemas and migrations |
| YAML/JSON/Avro | Contract and runtime configuration | OpenAPI, AsyncAPI, Compose, schemas, catalog |

## Frontend Stack

| Technology | Version | Purpose |
|---|---:|---|
| Next.js | 15.1.3 | App Router applications and BFF routes |
| React / React DOM | 18.3.1 | Operational user interfaces |
| Yarn | 4.5.3 | Workspace package management (`nodeLinker: node-modules`) |
| Turborepo | 2.3.3 | Build/lint/typecheck/test orchestration |
| Axios | 1.7.9 | Shared HTTP API client |
| Zod | 3.24.1 | Runtime request/payload validation |
| TanStack React Query | 5.62.7 | Reference Data server state |
| Zustand | 5.0.2 | Reference Data local client state |
| ESLint | 9.17.0 | TypeScript/React linting |
| Vitest | 2.1.8 | TypeScript/React unit and component tests |
| Playwright | 1.61.1 | Browser evidence capability; no baseline config/spec found |

W2-03 must use the existing LinerCore design tokens/primitives and shared shell contract. It does not own the shared palette, typography, navigation, or `packages/ui` redesign.

## Backend Stack

| Technology | Version | Purpose |
|---|---:|---|
| Spring Boot | 3.3.7 | Service runtime and dependency management |
| Maven Compiler Plugin | 3.13.0 | Java compilation |
| Maven Surefire | 3.5.2 | Java test execution |
| JUnit Jupiter | 5.11.3 | Unit/integration testing |
| Spring JDBC | Spring Boot-managed | Repository adapters |
| Flyway | 10.10.0 | Booking database migrations |
| Spring Kafka | Spring Boot-managed | Event publication/consumption |
| Apache Avro | 1.11.4 | Event serialization |
| Confluent serializers | 7.7.1 platform line | Schema Registry integration |

Charge applies `charge-agreement-schema.sql` using Spring SQL initialization rather than Flyway. This differs from Booking’s versioned migration strategy and is a material schema-evolution consideration.

## Data, Messaging, and Identity

| Technology | Version | Purpose |
|---|---:|---|
| PostgreSQL | 15 image | Dedicated identity, reference, Charge, Booking, movement stores |
| Kafka / Schema Registry | Confluent 7.7.1 | Local event transport and schema registry |
| Keycloak | 24.0 | Local OIDC/identity provider |
| `jose` | Workspace dependency; exact version not established by scan | OIDC/JWT-related auth support |
| HMAC signed cookie helpers | Repository implementation | Shared `lc_session` application session |

Where the scan did not establish an exact managed-library version, this artifact does not infer one.

## Edge and Observability

| Technology | Version | Purpose |
|---|---:|---|
| nginx | 1.27 | Edge routing, default host port 8088 |
| Prometheus | 2.55.1 | Metrics collection |
| Grafana | 11.4.0 | Metrics visualization |
| Jaeger | 1.63.0 | Trace visualization |
| OpenTelemetry Collector | 0.114.0 | Telemetry collection/routing |
| Elasticsearch / Kibana | 8.16.1 / 8.16.1 | Local log/search tooling |

The presence of these services does not constitute verified live observability; Reverse Engineering was static-only.

## Build, Test, and Delivery Tooling

- Frontend root tasks: `build`, `lint`, `typecheck`, and `test`, orchestrated by Turborepo.
- Backend root: Maven reactor build/test under `services/pom.xml`.
- Contracts: repository Node scripts validate the catalog, OpenAPI/event artifacts, and provider fixtures.
- Local runtime: Docker Compose profiles `core`, `app`, `devtools`, `observability`, and `full`.
- Wave A: `scripts/wave-a-compose.mjs` fixes the isolated env/project conventions.
- Quality: `.github/workflows/quality-gates.yml` plus `scripts/run-quality-gates.mjs --all`.
- Evidence: prior-wave scripts, readiness/replay checks, `demo:guard`, AI-DLC audit, and ERP-fidelity audit.

## Version and Capability Gaps

- No committed quantitative coverage tool/threshold (JaCoCo/Istanbul/Sonar) was found.
- No Java Checkstyle/SpotBugs/PMD gate was found.
- Playwright is installed but not configured in the baseline.
- Charge lint/build are not included in the aggregate quality command.
- Docker/Compose runtime was not available to this static scan; versions above are manifest/image evidence, not observed running components.

