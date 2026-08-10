# Technology Stack

## Languages and Build Systems

| Area | Technology | Version / mode | Evidence |
|---|---|---|---|
| Backend | Java | 21 | Maven reactor/service configuration |
| Backend build | Apache Maven | Reactor build | `services/pom.xml` and module POMs |
| Frontend | TypeScript | 5.7.2 | Workspace dependency manifests |
| Frontend runtime | JavaScript/Node.js | Node-compatible Next.js runtime | Workspace/container configuration |
| Package manager | Yarn | 4.5.3 | Root workspace configuration |
| Task orchestration | Turbo | 2.3.3 | Root workspace configuration |

The workspace detector reported TypeScript/JavaScript and Yarn only, but the repository is materially hybrid: Java/Maven services are first-class build and deployment components.

## Backend Frameworks and Libraries

| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.3.7 | REST containers, dependency wiring, transactions, health, scheduling |
| Spring for Apache Kafka | managed by Spring Boot stack | Kafka consumers/producers and listener containers |
| Apache Avro | 1.11.4 | Registered event schemas and generic records |
| Confluent platform libraries | 7.7.1 | Schema Registry and Avro serializer integration |
| PostgreSQL | 15 | Service-owned persistence |
| Flyway | Spring-managed | Ordered Booking migrations; missing from CMM baseline |
| JUnit | 5.11.3 | Java unit/integration tests |

Backend source follows a hexagonal layering convention and keeps domain-core modules framework-free. `platform-messaging` provides the shared publisher and registrar used by business services.

## Frontend Frameworks and Libraries

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.1.3 | App Router applications and server/client composition |
| React | 18.3.1 | UI rendering |
| TypeScript | 5.7.2 | Strict frontend typing |
| `@erp/ui` (`packages/ui`) | workspace | Shared tokens and operational-console primitives |
| ESLint | 9.17.0 | Frontend linting |
| Vitest | 2.1.8 | Frontend/component tests |
| Playwright | 1.61.1 | Browser acceptance and screenshot evidence |

The binding UI contract additionally requires Tailwind plus `clsx`, shared `--erp-*` tokens, IBM Plex Sans system fallback, Lucide icons, light/dark themes, responsive checks at 375/768/1024/1440, and WCAG 2.1 AA behavior. W2-04 must not create a module-local visual system.

## Runtime and Infrastructure

| Technology | Role |
|---|---|
| Docker Compose | Local/on-prem integrated runtime and acceptance topology |
| Nginx | Canonical browser edge and module routing |
| Keycloak | Local identity provider for authenticated shell flows |
| Kafka | At-least-once cross-module event transport |
| Confluent Schema Registry | Avro subjects and BACKWARD compatibility |
| PostgreSQL 15 | Separate service databases |
| Elasticsearch/Kibana, Prometheus/Grafana, Jaeger, OpenTelemetry Collector | Existing local observability profile |

Wave A acceptance is orchestrated by `scripts/wave-a-compose.mjs` under project `linercore-wave-a`. The manager demo uses the separate `linercore-shared-platform` project and port `127.0.0.1:8088`; `npm run demo:guard` protects it.

## Contract and Standards Stack

- Avro schemas: `contracts/avro/` plus service-local resources.
- AsyncAPI: `contracts/asyncapi/`.
- OpenAPI: `contracts/openapi/` (no CMM OpenAPI observed).
- Message/HTTP Pact fixtures: `contracts/pact/`.
- DCSA T&T v2.2 equipment-event vocabulary is the W2-04 internal published language.
- UN/LOCODE identifies locations; ISO 6346 identifies equipment.
- Compatibility policy is Schema Registry BACKWARD.

The executable `containermovement.status` schema currently models most required DCSA-shaped fields as strings but omits `sequenceNumber`; actual domain code still uses generic movement enums. Standards presence in contracts must not be confused with standards implementation in code.

## Quality and Delivery Tooling

| Tooling | Current use / gap |
|---|---|
| Maven test lifecycle | Runs Java suites; no enforced JaCoCo threshold observed. |
| Yarn/Turbo tasks | Frontend lint, typecheck, test, and build. |
| Vitest | Booking UI component coverage, including `JourneyStatusPanel`. |
| Playwright | Installed but not run by current CI. |
| Contract catalog validator | Checks registered contract inventory/health. |
| `aidlc-audit` | Required exit audit; output contains leads requiring source confirmation. |
| `erp-fidelity-audit` | Required ERP/DCSA/UI fidelity audit. |
| Graphify | Persistent mixed code/document graph; current cross-service path is incomplete. |
| codebase-memory MCP | Exact code graph, architecture, route, symbol, and call-path discovery. |

## Stack Constraints for W2-04

W2-04 should remain within Java 21/Spring Boot/Maven, PostgreSQL, Kafka/Avro/SR, Next.js/React/strict TypeScript, and shared `@erp/ui`. Introducing EDI libraries, a public DCSA API framework, fleet/depot software, a second shell/component library, an alternative package manager, or a public-cloud dependency would broaden the approved scope.
