# Dependencies — TST_Codex_W2-03

## Internal Service Dependencies

| Consumer | Provider | Mechanism | Purpose |
|---|---|---|---|
| Booking service | Charge Agreement service | HTTP `/pricing-requests` | Automatic pricing/manual outcome |
| Booking service | Identity service | Internal HTTP | Authorization/effective actor permissions |
| Booking service | Reference Data service | Internal HTTP/events | Booking reference validation and controlled identifiers |
| Booking service | Container Movement service | HTTP/events | Post-confirmation journey/movement integration |
| Charge Agreement service | Identity service | Internal port/HTTP adapter | Charge action authorization |
| Charge Agreement service | Reference Data service | Internal port/HTTP/events | Validate parties, locations, equipment, charge codes, currency, lanes |
| Container Movement service | Booking service | HTTP/events | Create/associate journeys with Bookings |
| Container Movement service | Reference Data service | Internal HTTP/events | Movement reference validation |
| Business services | `platform-messaging` | Maven module dependency | Kafka/Avro/Schema Registry support |

The codebase-memory graph’s strongest business boundaries align with Reference Data, Booking, Charge, and Container Movement. These are architectural seams, not evidence that every possible graph edge is a live runtime call.

## Frontend and BFF Dependencies

- `apps/auth`, `apps/shell`, and domain BFFs depend on `packages/auth` for session and actor handling.
- Applications consume `packages/ui` for shared LinerCore primitives; W2-03 may reuse but not redesign it.
- Apps depend on workspace packages with `workspace:*` and build independently under Turborepo.
- Booking BFF routes call the Booking service; the Booking service, not browser code, calls Charge pricing.
- The Charge app baseline calls only health/module-info. Intended CRUD/rate BFFs should depend on existing auth and controlled Reference Data seams.
- nginx and/or the shell provides edge mounting. The baseline has no explicit `/charge-agreements` route, so the exact minimal integration dependency remains unresolved.

## Charge-to-Booking Pricing Dependency

Baseline flow:

1. Booking application calls its `PricingPort`.
2. `ChargePricingPortAdapter` calls `HttpChargePricingClient`.
3. The client posts to Charge `/pricing-requests` with actor, idempotency, and correlation metadata.
4. Charge returns a partial line contract or an HTTP-mapped manual outcome.
5. Booking maps the result into its aggregate snapshot/status.

This dependency is already the correct seam. W2-03 should evolve it compatibly to retain basis, quantity, rate, amount, currency, and authority/version. A second direct UI-to-Charge pricing path would split Booking transaction ownership and is outside the intended slice.

## Data and Contract Dependencies

- Each business service owns its PostgreSQL schema; direct cross-service database access is not the integration model.
- Charge persistence depends on Spring JDBC and SQL initialization; Booking persistence depends on Spring JDBC plus Flyway.
- Synchronous interfaces are documented under `contracts/openapi` and verified through catalog/provider scripts.
- Asynchronous interfaces use AsyncAPI/Avro and Kafka topics for Booking, Reference Data, Charge agreement, and movement events.
- Contract fixtures establish Booking↔Charge and other consumer/provider expectations.
- `pricing.v1.yaml` and `charge-agreements.yaml` currently conflict on pricing paths; consumers need a single documented authority before W2-03 changes land.

## External Runtime Dependencies

| Dependency | Version observed | Consumers/use |
|---|---:|---|
| PostgreSQL | 15 | Service-owned durable state |
| Keycloak | 24.0 | OIDC authentication and identity integration |
| Kafka/Schema Registry | Confluent 7.7.1 | Business events and schema registry |
| nginx | 1.27 | Edge routing on port 8088 |
| Prometheus/Grafana | 2.55.1 / 11.4.0 | Metrics and dashboards |
| Jaeger/OTel Collector | 1.63.0 / 0.114.0 | Distributed tracing/telemetry |
| Elasticsearch/Kibana | 8.16.1 | Local log/search tooling |

Local Compose credentials/tokens are development defaults. Production secret resolution is outside this scan; profile separation must not be weakened.

## Build-Time Dependencies

- Yarn 4.5.3 and Turborepo 2.3.3 orchestrate the TypeScript workspace.
- TypeScript 5.7.2, Next.js 15.1.3, React 18.3.1, ESLint 9.17.0, Vitest 2.1.8, and Playwright 1.61.1 support frontend development and verification.
- Java 21, Maven, Spring Boot 3.3.7, Maven Compiler 3.13.0, Surefire 3.5.2, and JUnit Jupiter 5.11.3 support backend development and verification.
- Spring Kafka, Avro 1.11.4, and Confluent serializers support messaging.
- Axios 1.7.9, Zod 3.24.1, React Query 5.62.7, and Zustand 5.0.2 are focused client dependencies.

## Runtime and Acceptance Dependencies

- Required W2-03 acceptance wrapper: `scripts/wave-a-compose.mjs`.
- Required isolated Compose project: `linercore-wave-a` using `infrastructure/env/wave-a.env.example`.
- Protected external local dependency: manager demo on port 8088, guarded before and after by `npm run demo:guard`.
- Required evidence consumers: live pricing proof, Booking-visible breakdown, Playwright UI evidence, `aidlc-audit`, and `erp-fidelity-audit`.

The Reverse Engineering scan did not run Docker or validate any live dependency. Earlier subprocess access was blocked by sandbox `EPERM`; this remains a release-evidence dependency, not a PASS.

## Dependency Risks

- Wall-clock pricing (`LocalDate.now()`) and silent fallback lane/commodity values can make Charge selection non-deterministic or incorrect.
- The partial Charge response causes a lossy dependency: Booking cannot retain what Charge calculated internally.
- Schemaless Booking snapshot encoding couples UI interpretation to string key conventions.
- Divergent OpenAPI paths can cause a consumer to implement against the wrong authority.
- Unsupported default outbox methods can defer adapter-wiring failures until runtime.
- Adding a Charge edge route can regress shell/auth/Booking/Reference Data routing if not protected by tests.
- A schema change spanning Charge and Booking needs compatibility sequencing; an inseparable big-bang release would increase risk.

## Intended Dependency Changes

The intended W2-03 delta is limited to extending existing dependencies: typed/versioned Charge persistence, canonical pricing contract, Booking adapter/snapshot, Charge-owned BFF/pages, and a minimal stable edge mount. It does not transfer ownership of shared UI/shell or introduce direct cross-database coupling.

