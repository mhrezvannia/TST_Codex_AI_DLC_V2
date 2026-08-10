# Technology Stack - LinerCore W1-01 Baseline

## Backend Stack

| Technology | Version or source | Use |
|---|---|---|
| Java | 21 | Service implementation |
| Spring Boot | 3.3.7 | Web, actuator, JDBC, configuration |
| Spring Transaction | Boot-managed | Application transaction boundaries |
| Spring Kafka | Boot-managed | Kafka producer integration |
| PostgreSQL driver | Boot-managed | JDBC persistence |
| Apache Avro | 1.11.4 | Event schema and GenericRecord |
| Confluent serializer and schema client | 7.7.1 | Broker serialization and registration |
| JUnit Jupiter | 5.11.3 | Java unit and integration-style tests |
| Maven Compiler | 3.13.0 | Java 21 compilation |
| Maven Surefire | 3.5.2 | Java test execution |

## Frontend Stack

| Technology | Version | Use |
|---|---|---|
| Node.js | Compose uses 24 Alpine | Tooling and Next.js runtime images |
| Yarn | 4.5.3 | Workspace package manager |
| Turbo | 2.3.3 | Monorepo task orchestration |
| Next.js | 15.1.3 | Operational web apps and BFF routes |
| React / React DOM | 18.3.1 | UI rendering |
| TypeScript | 5.7.2 | Application and package code |
| Vite | 5.4.11 | Test/build tooling dependency |
| Vitest | 2.1.8 | Frontend tests |
| Testing Library | React 16.0.1, DOM 10.4.1 | Component tests |
| ESLint | 9.17.0 | Static analysis |

## Infrastructure Stack

Compose defines PostgreSQL, Kafka, Confluent Schema Registry, Keycloak, nginx 1.27, Prometheus 2.55.1, Grafana 11.4.0, Jaeger 1.63.0, OpenTelemetry Collector 0.114.0, Elasticsearch 8.16.1, and Kibana 8.16.1. Images are pinned in `compose.yaml` except where environment substitution is intentional.

## Architecture and Contract Standards

The backend follows domain-centric ports and adapters with transactional outbox delivery. Contracts use OpenAPI for HTTP, AsyncAPI for channel documentation, and Avro for Kafka values. The W1 business vocabulary is intended to align with UN/LOCODE, ISO 6346/DCSA equipment type codes, and DCSA Track & Trace v2.2 movement event codes.

## Developer Tooling

PowerShell and Node scripts provide local orchestration. AI-DLC records delivery decisions and runs deterministic sensors. Graphify provides a code knowledge graph, but the checked-in graph predates the W0 Booking/CMM work and must be verified against current source for this intent.
