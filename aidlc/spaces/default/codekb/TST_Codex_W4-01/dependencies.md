# Dependencies — TST_Codex_W4-01

## Internal dependency topology

| Consumer | Provider | Interaction | Architectural meaning |
|---|---|---|---|
| Auth and domain BFFs | Identity service | HTTP authorization/session context | Central authorization boundary |
| Booking service | Reference Data service | Synchronous reference-option reads | Reference is upstream supplier |
| Booking service | Charge Agreement service | Synchronous pricing request/lookup | Charge owns pricing authority |
| Booking service | Kafka/Avro | Publishes `booking.confirmed`; consumes movement status | Async integration boundary |
| Container Movement service | Kafka/Avro | Consumes booking confirmation; publishes status | Event-driven journey lifecycle |
| Booking UI | Booking service | BFF/HTTP | Booking list/detail/actions and projection |
| Reference UI | Reference service | BFF/HTTP | Reference workbench operations |
| Charge UI | Charge service | BFF/HTTP | Agreement/rate/manual-case administration |
| All frontend apps | `@erp/ui`, auth, config and typed packages | Workspace imports | Shared shell/design/contract kernel |
| Java services | Platform messaging | Maven dependency/adapter | Shared Kafka, Avro, schema, relay behavior |

The intended dependency direction is domain core → nothing external; application services → domain plus ports; adapters/container → application, frameworks, data, and messaging. Code graph fan metrics indicate Booking and Charge are cross-context hotspots, but raw counts include tests and artifacts and must not be treated as runtime call volume.

## External dependencies

| Dependency family | Examples | Risk/control |
|---|---|---|
| Java runtime/framework | Java 21, Spring Boot 3.3.7, Spring Kafka | Central Maven version management and service tests |
| Data | PostgreSQL, JDBC, Flyway | Service ownership and additive migrations; live upgrade not rerun |
| Messaging | Kafka, Avro 1.11.4, Confluent 7.7.1 | Schema contracts, idempotency/outbox evidence; broker failure behavior needs runtime proof |
| Web | Next.js 15.5.21, React 18.3.1, TypeScript 5.7.2 | Strict types, lint, builds, browser tests |
| UI/data state | `@erp/ui`, Zod, TanStack Query, Zustand | Shared UI authority and runtime validation |
| Quality | JUnit, Vitest, Playwright, Testing Library, axe | Layered automated evidence; no measured coverage snapshot |

## Dependency governance gaps

- No concrete OpenAPI artifact was found for REST dependency governance.
- SAST, dependency-vulnerability scanning, secret scanning, automated dependency updates, SBOM generation, image scanning, and signing were not evidenced; CI must not be described as security-complete.
- Root Vitest 3.2.6 and `packages/ui` Vitest `^2.1.8` may resolve differently across workspaces.
- Exact lockfile immutability, Maven effective dependency tree, and transitive CVE status were not evaluated.
- Exact Nginx upstream/location dependencies were not opened, so externally reachable route composition remains unverified.

## Change impact for W4-01

Reference, Charge, and Container Movement list/detail uplift crosses shell navigation, auth/session propagation, BFF contracts, shared UI primitives, and three service APIs. The safest boundary-preserving path is additive route composition using existing APIs and shared packages. A shared shell or `packages/ui` change can affect all frontend applications; domain-specific views should remain owned by their domain app. Container Movement requires a new frontend composition seam but not a new backend service or shared database.

## Limitations

Dependency relationships are based on source imports, indexed HTTP/async edges, manifests, and the supplied developer scan. No package installation, Maven dependency tree, container startup, network trace, or production telemetry was performed. External services not represented in the repository may therefore be missing.
