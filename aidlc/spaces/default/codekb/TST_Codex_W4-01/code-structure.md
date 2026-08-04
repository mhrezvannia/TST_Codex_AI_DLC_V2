# Code Structure — TST_Codex_W4-01

## Repository organization

| Area | Purpose |
|---|---|
| `apps/auth` | Authentication gateway, session, callback, sign-in/out, access-denied, and health routes |
| `apps/shell` | Canonical authenticated shell and current Booking route composition |
| `apps/booking` | Booking list/detail/create, pricing/actions, and journey projection |
| `apps/reference-data` | Reference Data workbench and BFF/service clients |
| `apps/charge-agreements` | Agreement, rate, and manual-pricing administration; standalone route set |
| `packages/*` | Shared UI, auth, API core, types, transformers, utilities, and configuration |
| `services/*-service` | Java bounded-context services |
| `services/platform-messaging` | Shared Kafka, Avro, Schema Registry, publisher, and relay infrastructure |
| `tests`, `tools`, `scripts` | Cross-cutting contract, live, audit, performance, security, rollback, and acceptance tooling |

Verified file counts from the code index include 521 Java files, 188 TypeScript files, 59 YAML files, 13 SQL files, and 142 route nodes. The graph also indexes tests, documentation, and generated/design artifacts, so node totals are not equivalent to production code size.

## Backend module pattern

The Maven reactor organizes each service around ports and adapters:

- `domain-core`: entities, value objects, aggregates, domain rules, and domain events; intended to remain framework-free.
- `application-service`: use cases, commands/queries, ports, and transaction orchestration.
- `application`, `dataaccess`, `messaging`, or `published-language`: optional adapters and wire/persistence models, depending on the service.
- `container`: Spring Boot assembly, REST controllers, configuration, and runtime resources.

Verified patterns include repositories per service boundary, controller-to-application-service delegation, immutable typed identifiers/value objects, explicit statuses, correlation metadata, outbox publication, and Avro record mappers. The exact module set varies by service and should not be normalized mechanically.

## Frontend module pattern

Frontend applications use Next.js App Router conventions: `app/` routes and layouts, route handlers as BFF endpoints, feature components, and `lib/` service/config helpers. Shared concerns are imported from workspace packages rather than copied locally. TypeScript is strict, React components consume `@erp/ui`, and server-side route handlers mediate auth and backend calls.

Current structural seams:

- Booking has stable shell-mounted list, create, and detail routes.
- Reference Data has a root workbench component but no indexed `app/[id]` list/detail pair.
- Charge Agreements has richer route coverage but overlapping root and nested agreement-detail shapes.
- Container Movement has backend/service/contracts but no `apps/container-movement` directory.

## Code patterns and classification

| Pattern | Evidence | Assessment |
|---|---|---|
| Bounded contexts | Separate service directories, models, and databases | Healthy boundary |
| Ports and adapters | Domain/application/adapter/container modules | Healthy; preserve during uplift |
| BFF composition | Next route handlers and service clients | Useful auth/translation seam |
| Published language | Avro schemas, examples, Pact catalogs | Strong async/contract seam; REST OpenAPI gap remains |
| Shared UI ownership | All apps consume `@erp/ui` | Healthy; avoid domain forks |
| Event projection | Booking consumes movement status and renders journey state | Healthy integration seam, runtime not re-proven |

## Limitations

This classification is based on indexed source and the supplied scan. It does not certify every file, generated source, Maven profile, Next.js build output, Nginx mapping, or runtime classpath. The index freshness and package fan metrics were not independently validated, and absent files/routes mean “not found in bounded discovery,” not guaranteed nonexistence outside the repository snapshot.
