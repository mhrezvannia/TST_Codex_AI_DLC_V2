# Domain Entities - U01 Platform Skeleton

## Source Trace

These U01 structural entities are derived from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U01 has no business aggregate ownership. The entities below are platform skeleton/configuration structures that later units specialize.

## Workspace

Purpose: Root structure that groups backend services, frontend apps, shared packages, contracts, infrastructure, and documentation.

Attributes:

| Attribute | Description |
|---|---|
| `rootPath` | Workspace root. |
| `backendServices` | `reference-data-service`, `identity-service`. |
| `frontendApps` | `apps/auth`, `apps/reference-data`. |
| `sharedPackages` | Approved `@erp/*` package placeholders. |
| `contractsPath` | OpenAPI, Avro, Pact/message-pact artifacts. |
| `infrastructurePath` | Docker Compose, Nginx, Terraform/Ansible placeholders. |

Lifecycle:

```text
initialized -> validated -> extended by later units
```

## BackendServiceSkeleton

Purpose: Declares the mandated hexagonal module layout for a backend service.

Attributes:

| Attribute | Description |
|---|---|
| `serviceName` | `reference-data-service` or `identity-service`. |
| `javaTarget` | Java 21 target. |
| `springBootVersion` | Spring Boot 3.3.x. |
| `modules` | domain-core, application-service, application, dataaccess, messaging, published-language, container. |
| `dependencyRules` | Inward dependency constraints. |

Relationships:

- Belongs to Workspace.
- Later U02 and U03 fill in service-specific domain/application details.

## FrontendAppSkeleton

Purpose: Declares the Next.js App Router/BFF structure for a frontend app.

Attributes:

| Attribute | Description |
|---|---|
| `appName` | `apps/auth` or `apps/reference-data`. |
| `routesPath` | `app/` and `app/api/`. |
| `proxyPath` | `proxy.ts`. |
| `componentPaths` | components, providers, services, hooks, lib, schemas, transformers, constants. |
| `packageDependencies` | Approved `@erp/*` packages, React, Next.js, TanStack Query, Zustand, RHF/Zod, Tailwind. |

Relationships:

- Belongs to Workspace.
- Uses SharedPackage placeholders.
- Later U05 and U06 fill in app-specific screens and BFF handlers.

## SharedPackage

Purpose: Represents a shared frontend or platform package placeholder.

Attributes:

| Attribute | Description |
|---|---|
| `packageName` | `@erp/ui`, `@erp/api-core`, `@erp/auth`, `@erp/transformers`, `@erp/shared-types`, `@erp/config`, `@erp/utils`. |
| `classification` | Mandated or default per Enterprise Technical Environment v1.1. |
| `exports` | Placeholder public exports. |

Lifecycle:

```text
placeholder -> implemented by later shared-package work -> consumed by apps
```

## RuntimeServiceDefinition

Purpose: Represents a Docker Compose service definition.

Attributes:

| Attribute | Description |
|---|---|
| `name` | Postgres, Keycloak, Kafka, Schema Registry, backend service, frontend app, Nginx, or observability service. |
| `profile` | Core or optional profile. |
| `healthCheck` | Local readiness signal. |
| `dependsOn` | Compose runtime dependencies. |
| `ports` | Local development port mappings. |
| `secrets` | Local dev secret references or Vault placeholders. |

## PlatformConvention

Purpose: Captures a convention that later services/apps must follow.

Attributes:

| Attribute | Description |
|---|---|
| `name` | Correlation id, error envelope, health endpoint, logging fields, config naming, contract layout, CI scripts. |
| `scope` | Backend, frontend, infrastructure, contracts, or cross-cutting. |
| `requiredFields` | Required values or fields for the convention. |
| `validationMethod` | How later units or CI can check compliance. |

## Entity Interaction Pattern

```text
Workspace
  owns BackendServiceSkeleton[]
  owns FrontendAppSkeleton[]
  owns SharedPackage[]
  owns RuntimeServiceDefinition[]
  owns PlatformConvention[]
```

No U01 entity represents downstream business modules as runtime components.
