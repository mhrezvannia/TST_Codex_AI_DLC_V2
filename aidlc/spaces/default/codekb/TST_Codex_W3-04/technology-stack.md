# Technology Stack

## Frontend and Workspace Tooling

| Technology | Version | Use |
|---|---:|---|
| Yarn Berry | 4.5.3 | Workspace package manager for `apps/*` and `packages/*`. |
| Turbo | 2.3.3 | Workspace task graph and caching. |
| TypeScript | 5.7.2 | Strict ES2022 application/package code. |
| Node.js | 24 in CI | Frontend build/test runtime. |
| Next.js | 15.5.21 | App Router applications and BFF routes. |
| React | 18.3.1 | User interface runtime. |
| Zod | 3.24.1 | TypeScript runtime validation. |
| Vitest | 3.2.6 | Frontend/unit tests. |
| Playwright | 1.61.1 | Browser/end-to-end testing. |
| Axe | 4.10.2 | Accessibility checks. |
| ESLint | 9.17.0 | TypeScript/React linting. |
| typescript-eslint | 8.19.1 | Type-aware ESLint rules. |

The TypeScript configuration is strict and targets ES2022. Booking UI lint rules include `no-explicit-any` and a ban on hard-coded hex colors.

## Backend Stack

| Technology | Version | Use |
|---|---:|---|
| Java | 21 | Service implementation runtime/language. |
| Maven | 3.9.8 | Multi-module service build. |
| Spring Boot | 3.3.7 | Service containers, HTTP APIs, configuration, actuator. |
| Maven Compiler Plugin | 3.13.0 | Java compilation. |
| Maven Surefire Plugin | 3.5.2 | Java test execution. |
| Flyway | 10.10.0 | Database migrations. |
| Apache Avro | 1.11.4 | Event serialization/contracts. |
| Resilience4j | 2.2.0 | Synchronous integration resilience. |
| Micrometer/Prometheus | managed by Spring dependency set | Metrics instrumentation/export. |

## Data, Messaging, and Operations

| Technology | Version | Use |
|---|---:|---|
| PostgreSQL | 15 | Service-owned relational persistence and snapshots. |
| Confluent Platform | 7.7.1 | Kafka and Schema Registry in the Compose topology. |
| Kafka | Confluent 7.7.1 distribution | Booking/CMM and reference event transport. |
| Nginx | Compose-defined image | Edge reverse proxy and app routing. |
| Keycloak | Compose-defined image | Identity provider. |
| Prometheus/Grafana | Compose-defined images | Metrics and dashboards. |
| ELK | Compose-defined images | Centralized logging. |
| Jaeger/OpenTelemetry | Compose-defined images | Distributed tracing and telemetry collection. |

## Build and Deployment Model

CI uses self-hosted on-premise runners with Java 21 and Node 24. It runs Maven verification, frontend test/type/lint/build tasks, contract checks, Yarn high-severity audit, Compose static validation, readiness/evidence workflows, `aidlc-audit`, and `erp-fidelity-audit`. The platform is explicitly on-premise; this repository does not require AWS accounts, regions, credentials, or CDK for W3-04.

## Version and Runtime Caveats

Versions above are exact where supplied by the checked-in build scan. Compose image versions not enumerated by that scan are intentionally not inferred. Static configuration declares the stack, but no container health, database state, broker compatibility, or application runtime was verified during this reverse-engineering pass.
