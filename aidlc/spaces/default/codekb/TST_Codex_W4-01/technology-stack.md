# Technology Stack — TST_Codex_W4-01

## Runtime and application frameworks

| Layer | Technology | Verified version | Purpose |
|---|---|---:|---|
| Backend language | Java | 21 | Service/domain implementation |
| Backend framework | Spring Boot | 3.3.7 | REST, configuration, runtime containers |
| Frontend framework | Next.js | 15.5.21 | App Router applications and BFF route handlers |
| UI library | React | 18.3.1 | Component rendering |
| Frontend language | TypeScript | 5.7.2 | Strict typed apps and packages |
| Persistence | PostgreSQL | Version not retained in scan | Service-owned relational databases |
| Messaging | Spring Kafka | Version managed by build | Producer/consumer integration |
| Schema format | Apache Avro | 1.11.4 | Published event contracts |
| Schema registry | Confluent Platform | 7.7.1 | Avro schema registration/compatibility |

## Build, workspace, and quality tooling

| Tool | Verified version | Role |
|---|---:|---|
| Yarn workspaces | Manifest-defined | JavaScript/TypeScript workspace management |
| Turbo | 2.3.3 | Workspace task orchestration and caching |
| Maven reactor | Wrapper/parent managed | Multi-module Java builds |
| ESLint | 9.17 | Flat-config linting |
| typescript-eslint | 8.19.1 | TypeScript lint rules |
| Vitest | 3.2.6 at root | Frontend/unit testing |
| Playwright | 1.61.1 | Browser/E2E testing |
| JUnit | 5.11.3 | Java unit/integration testing |
| Testing Library | Manifest-defined | React behavior/component tests |
| axe-core | Manifest-defined | Accessibility checks |
| Zod | 3.24.1 | Runtime TypeScript validation |
| TanStack Query | 5.62.7 in Reference Data | Server-state/query management |
| Zustand | 5.0.2 in Reference Data | Focused client state |

## Architectural platform

- Local/integration topology is described by `compose.yaml` and guarded Wave A/demo/readiness/seed/smoke/live scripts.
- Kafka, Avro, and Schema Registry provide asynchronous cross-service contracts.
- PostgreSQL databases are service owned; Flyway/additive migration evidence exists in service code and tests.
- `@erp/ui` is the shared presentation platform. Auth, API core, shared types, transformers, utilities, and config are internal workspace libraries.

Inference: the stack is deliberately portable and local-Compose oriented. Static evidence does not justify claims about a public-cloud runtime, production orchestration platform, autoscaling, managed database, or production observability service.

## Version and compatibility risks

- `packages/ui` declares Vitest `^2.1.8` while the root uses 3.2.6; workspace resolution and test behavior need explicit verification.
- Next.js 15 removed/de-emphasized older `next lint` flows; any scripts relying on it require compatibility checking against the actual manifest commands.
- Spring-managed transitive versions were not exhaustively resolved from the Maven effective POM.
- PostgreSQL, Kafka broker, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan and should not be inferred.

## Evidence limitations

Versions above are manifest/build-scan evidence. No dependency installation, effective-POM export, lockfile audit, container image inspection, or runtime version command was executed. “Manifest-defined” means the dependency was found but an exact stable version was not included in the supplied scan.
