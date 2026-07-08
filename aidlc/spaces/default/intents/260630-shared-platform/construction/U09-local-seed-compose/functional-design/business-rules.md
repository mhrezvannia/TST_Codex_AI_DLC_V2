# Business Rules - U09 Local Seed Compose

## Source Trace

These U09 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Seed Pack Rules

BR-U09-001: Seed packs must be versioned and committed with the repository.

BR-U09-002: Every seed record must have a deterministic business key and a stable platform-owned identifier or identifier derivation rule.

BR-U09-003: Seed loading must be idempotent. Re-running the same seed pack against an already-current environment must not create duplicates or mutate immutable business meaning.

BR-U09-004: The seed pack must include all nine MVP reference sets: Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.

BR-U09-005: Region and TradeLane seed values must remain configurable. Defaults may prove the platform behavior, but final trade-footprint decisions must not be hard-coded.

BR-U09-006: Seed data for Party/Customer and authorization-related records must be treated as Confidential or Restricted where the fields carry PII, commercial sensitivity, or access-control sensitivity.

BR-U09-007: Local seed users must be fictional, clearly marked as local-only, and must not contain real customer, employee, or production credentials.

## Reference Data Rules

BR-U09-008: Location/Port seeds must preserve Country before Port dependency ordering and must reject orphan ports.

BR-U09-009: TradeLane seeds must reference existing Region records for both origin and destination.

BR-U09-010: Currency seeds must include USD as the MVP operating currency while preserving later multi-currency extension.

BR-U09-011: Seeded reference records must support active/inactive status and audit metadata consistently with normal reference records.

BR-U09-012: Seeded writes that exercise reference-change behavior must use deterministic seed actor and correlation metadata.

BR-U09-013: Seeded reference changes that claim event smoke coverage must create outbox/event status evidence compatible with the `reference-data-service` publication model.

## Identity and Authorization Rules

BR-U09-014: Keycloak remains the authentication provider. U09 must not introduce a custom password store or unmanaged identity library.

BR-U09-015: The identity seed pack must include the nine MVP carrier roles: pricing, sales, booking desk, equipment control, customer service, finance-read, reference admin, platform operator, and security admin.

BR-U09-016: Role-permission mappings are seed defaults until the final matrix is approved. They must be easy to replace without changing the application schema.

BR-U09-017: The default authenticated local user must receive no administrative permission unless the seed pack explicitly assigns a test role.

BR-U09-018: Local admin seed users must exist only for development and smoke-check scenarios.

## Compose and Runtime Rules

BR-U09-019: Docker Compose must use local/on-prem services only. AWS/public-cloud services, Kubernetes, and cloud-managed dependencies are prohibited for this unit.

BR-U09-020: Core local Compose must include PostgreSQL, Keycloak 24, Kafka, Confluent Schema Registry, `identity-service`, `reference-data-service`, `apps/auth`, `apps/reference-data`, Nginx, and the seed loader where the service implementations exist.

BR-U09-021: Required services must declare health checks that the seed loader can wait on.

BR-U09-022: Optional observability services may be behind a Compose profile and must not block core seed smoke checks.

BR-U09-023: Local secrets may use development-only values. Staging and production descriptors must use Vault or approved secret paths.

BR-U09-024: Browser-facing frontend routes must go through BFF route handlers and Nginx. U09 must not require browser clients to call backend services directly.

## Validation Rules

BR-U09-025: Seed validation must fail before writes when a seed pack omits a required reference set.

BR-U09-026: Seed validation must fail before writes when parent records are missing or ordered incorrectly.

BR-U09-027: Seed validation must fail when duplicate natural keys map to different immutable meanings.

BR-U09-028: Smoke checks must read seeded records through provider/admin APIs and authorization APIs, not by querying service databases directly.

BR-U09-029: A successful seed run must produce a summary containing pack id, seed version, created count, updated count, skipped count, failed count, and correlation id.

BR-U09-030: Running the seed loader twice must produce zero duplicate records and an expected skipped/current count on the second run.
