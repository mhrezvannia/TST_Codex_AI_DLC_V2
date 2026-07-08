# Business Rules - U01 Platform Skeleton

## Source Trace

These U01 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Structural Rules

BR-U01-001: The workspace must contain backend service folders for `reference-data-service` and `identity-service`.

BR-U01-002: Each backend service skeleton must follow the mandated hexagonal Maven module shape: `domain-core`, `application-service`, `application`, `dataaccess`, `messaging`, `published-language`, and `container`.

BR-U01-003: `domain-core` modules must not depend on Spring, JPA, Kafka, Jackson, Lombok, frontend packages, or adapter modules.

BR-U01-004: Adapter modules must depend inward on `application-service`; adapters must not depend on each other.

BR-U01-005: Published-language modules must not depend on service internals.

BR-U01-006: Frontend apps must use Next.js App Router structure and must not include a `pages/` app pattern.

BR-U01-007: `apps/auth` and `apps/reference-data` must be separate app folders.

BR-U01-008: Browser-facing backend access must go through BFF route handlers; direct browser-to-service calls are prohibited.

## Runtime Rules

BR-U01-009: Docker Compose must include local/on-prem baseline service definitions for PostgreSQL, Keycloak, Kafka, Schema Registry, backend services, frontend apps, and Nginx.

BR-U01-010: Optional observability services may be grouped behind profiles and must not block the core local smoke path.

BR-U01-011: No AWS/public-cloud, Kubernetes, Helm, npm, pnpm, Redux Toolkit, SWR, CSS Modules, Styled Components, Emotion, jQuery, or Moment.js dependencies may be introduced.

BR-U01-012: Local secrets may be used only for development. Staging/production descriptors must reference Vault or future approved secret paths.

## Convention Rules

BR-U01-013: Every inbound request path must support a correlation id. If absent, the platform generates one.

BR-U01-014: API error envelopes must include code, message, correlation id, timestamp, and optional details.

BR-U01-015: Structured logs must include timestamp, service, level, message, and correlationId.

BR-U01-016: Health responses must be consistent enough for smoke checks and future deployment gates.

BR-U01-017: Contract artifacts must have stable folders for OpenAPI, Avro schemas, and examples.

BR-U01-018: CI script names must be stable enough for later GitHub Actions workflows to call consistently.

## Validation Rules

BR-U01-019: Skeleton validation passes only when root build metadata can discover both backend services and both frontend apps.

BR-U01-020: Skeleton validation fails if domain-core imports framework namespaces.

BR-U01-021: Skeleton validation fails if frontend lockfiles other than `yarn.lock` are introduced.

BR-U01-022: Skeleton validation fails if downstream module runtime folders are created as part of this workflow.

## Scope Rules

BR-U01-023: U01 may create contract folders that future downstream modules can review, but it must not create Charge, Booking, or Container Movement runtime services, UIs, or implementation stubs.

BR-U01-024: U01 may create placeholders needed by later Shared Platform units, but detailed business rules for reference aggregates and authorization belong to U02 and U03.
