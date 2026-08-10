# Technology Stack

## Application stack

| Layer | Technology and version evidence | Use |
|---|---|---|
| Backend | Java 21; Spring Boot 3.3.7; Maven | layered service modules and HTTP APIs |
| Backend testing | JUnit Jupiter 5.11.3; Maven Surefire 3.5.2 | service/unit and contract-adjacent tests |
| Frontend | TypeScript 5.7.2; React 18.3.1; Next.js 15.5.21 | Charge operational UI/BFF |
| Frontend testing | Vitest 3.2.6; Testing Library; Playwright 1.61.1; axe-core/playwright 4.10.2 | unit, accessibility and E2E checks |
| Monorepo | Yarn 4.5.3; Turborepo 2.3.3 | app/package workspaces and task execution |

## Platform stack

PostgreSQL 15 provides logical service databases. Kafka 7.7.1 and Schema Registry 7.7.1 support asynchronous integration. Keycloak 24 provides local identity; Nginx 1.27 fronts the Compose apps. Optional observability includes OpenTelemetry Collector 0.114.0, Prometheus 2.55.1, Grafana 11.4.0 and Jaeger 1.63.0.

W3-01 should extend the existing Java/Next.js stack. No new service, framework, database, or external calendar provider is required for the MVP.

