# Technology Stack - TST_Codex

## Backend Stack

| Technology | Version/source | Usage |
|------------|----------------|-------|
| Java | 21 | Backend services |
| Spring Boot | 3.3.7 | Service container/API runtime |
| Maven | multi-module build | Backend build and tests |
| JUnit Jupiter | 5.11.3 | Java unit/controller tests |
| Maven Surefire | 3.5.2 | Java test execution |
| Maven Compiler Plugin | 3.13.0 | Java compilation with release 21 |

Backend services currently use in-memory adapters for data access in scanned modules. PostgreSQL exists in Compose but production-grade persistence wiring is not yet visible in the service source scan.

## Frontend Stack

| Technology | Version/source | Usage |
|------------|----------------|-------|
| Yarn | 4.5.3 | Workspace package manager |
| Turbo | 2.3.3 | Monorepo task orchestration |
| TypeScript | 5.7.2 | Frontend/shared packages |
| Next.js | 15.1.3 | Frontend apps |
| React | 18.3.1 | UI runtime |
| React DOM | 18.3.1 | UI rendering |
| Vite/Vitest | Vite 5.4.11, Vitest 2.1.8 | Test runner and tooling |
| React Testing Library | 16.0.1 | Component tests |
| jsdom | 25.0.1 | Browser-like test environment |
| ESLint | 9.17.0 | TS/JS linting |
| Zod | 3.24.1 | Validation/schema utilities |
| Axios | 1.7.9 | API client in `@erp/api-core` |
| TanStack React Query | 5.62.7 | Reference data app data fetching |
| Zustand | 5.0.2 | Reference data app local state |

## Infrastructure Stack

| Technology | Version/source | Usage |
|------------|----------------|-------|
| Docker Compose | `compose.yaml` | Local runtime |
| PostgreSQL | 15 | Local database container |
| Keycloak | 24.0 | Local identity provider |
| Kafka | Confluent CP Kafka 7.7.1 | Local event broker |
| Schema Registry | Confluent CP Schema Registry 7.7.1 | Local schema registry |
| nginx | 1.27 | Reverse proxy |
| Prometheus | 2.55.1 | Metrics |
| Grafana | 11.4.0 | Dashboards |
| Jaeger | 1.63.0 | Tracing |
| OpenTelemetry Collector | 0.114.0 | Telemetry pipeline |
| Elasticsearch | 8.16.1 | Logs/search foundation |
| Kibana | 8.16.1 | Log UI foundation |

## Contracts and Quality Stack

| Technology/artifact | Usage |
|---------------------|-------|
| OpenAPI YAML | Identity, reference data, charge agreement contracts |
| Avro `.avsc` | Reference-data changed event schemas |
| Pact/message fixtures | Local fixture-based contract validation |
| GitHub Actions | `quality-gates.yml` |
| Graphify | Persistent graph/report for code and document understanding |
| AI-DLC | Lifecycle orchestration, artifacts, state, sensors |

## Stack Gaps for Enterprise Target

- No executable AsyncAPI files for Booking/CMM enterprise events.
- No real Schema Registry compatibility execution evidence beyond pending catalog status.
- No Booking/CMM service technology modules yet.
- No full enterprise Compose profile.
- No production-grade persistence/migration stack was found in service code.
- No explicit resilience library or circuit-breaker implementation was found for pricing integrations.
