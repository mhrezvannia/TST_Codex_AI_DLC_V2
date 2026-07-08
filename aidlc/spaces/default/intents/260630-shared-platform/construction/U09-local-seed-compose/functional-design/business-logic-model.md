# Business Logic Model - U09 Local Seed Compose

## Source Trace

This U09 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

It covers US-010, US-013, US-021, and US-023. It supports FR-001 through FR-014 for canonical reference data, FR-028 through FR-031 for Keycloak and carrier roles, FR-067 style event contracts through the reference-change path, NFR-017 local reproducibility, and constraints C-002 through C-006 from `requirements.md`.

## Unit Purpose

U09 provides deterministic local environment support for Shared Platform development and tests. The unit does not own reference aggregate business behavior or authorization policy decisions; it supplies repeatable seed packs, an idempotent loader, and Docker Compose wiring so `reference-data-service`, `identity-service`, Keycloak 24, PostgreSQL, Kafka, Schema Registry, `apps/auth`, `apps/reference-data`, and Nginx can be exercised locally with canonical data.

The design keeps final business footprint decisions configurable. The exact MVP trade lanes, regions, ports, sites, and role-permission matrix remain upstream open questions, so U09 supplies replaceable defaults rather than embedding final commercial decisions.

## Local Startup Workflow

```text
Developer runs local startup command
  -> Docker Compose loads core profile
  -> PostgreSQL containers initialize and run migrations
  -> Keycloak imports local realm/client/users
  -> Kafka and Schema Registry become healthy
  -> identity-service and reference-data-service start
  -> seed loader waits for service health
  -> seed loader applies identity seed pack
  -> seed loader applies reference data seed pack
  -> smoke checks read seeded records through APIs
```

Decision points:

| Decision | Rule |
|---|---|
| Required dependency unhealthy? | Seed loader waits up to the configured timeout, then fails fast with service-specific diagnostics. |
| Migration incomplete? | Seed loader must not write directly around application migrations. |
| Seed record already exists with same seed version? | Treat as no-op and record skipped/current status. |
| Seed record exists with older seed version and same stable key? | Update allowed mutable fields through service/admin path or controlled migration path. |
| Seed record exists with conflicting immutable key data? | Fail the seed run and report the conflict. |
| Optional observability profile disabled? | Core seed and smoke checks continue; observability evidence is deferred to U10. |

## Seed Pack Loading Workflow

Seed packs are versioned data sets stored with the repo. Each pack declares:

| Field | Purpose |
|---|---|
| `seedPackId` | Stable identifier for the pack, for example `shared-platform-mvp-defaults`. |
| `seedVersion` | Monotonic semantic or date-based version. |
| `targetService` | `identity-service`, `reference-data-service`, or Keycloak import. |
| `records` | Deterministic records keyed by natural code and platform-owned id. |
| `dependencies` | Required parent records, such as Country before Port and Region before TradeLane. |
| `smokeTags` | Small subsets used by smoke checks. |

Processing sequence:

1. Parse seed pack manifests and validate schema before any write.
2. Order reference records by dependency: Party/Customer, Location/Country, Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, then TradeLane where Region dependencies exist.
3. Order identity records by Keycloak realm import, carrier roles, permissions, role-permission links, and local test-user assignments.
4. For each record, compute a stable seed fingerprint from immutable business key, mutable payload, and `seedVersion`.
5. Load via the approved service interface when that interface exists; for early local bootstrapping, use a controlled adapter path that enforces the same domain validation and audit/outbox semantics.
6. Persist seed run summary with counts for created, updated, skipped, and failed records.
7. Execute smoke reads through OpenAPI-backed provider/admin endpoints and authorization decision endpoints.

## Reference Data Seed Workflow

```text
Load reference seed pack
  -> validate all nine reference sets are present
  -> validate parent-child dependencies
  -> upsert deterministic records by stable business key
  -> apply active/inactive status
  -> persist audit metadata with seed actor
  -> enqueue outbox entries where event publication is enabled
  -> verify provider API reads active canonical records
```

The seed loader must cover all nine MVP reference sets from `requirements.md`: Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.

TradeLane records are modeled as configurable origin/destination Region pairs. The local defaults prove the shape of US-010 and US-021, but they do not assert the final approved commercial footprint.

## Identity and Keycloak Seed Workflow

```text
Load identity seed pack
  -> import local Keycloak realm/client/test users
  -> ensure identity-service role catalog exists
  -> ensure MVP carrier roles exist
  -> ensure permissions and role-permission links exist
  -> assign local test users to deterministic roles
  -> verify authorization API decisions for smoke scenarios
```

The role catalog covers pricing, sales, booking desk, equipment control, customer service, finance-read, reference admin, platform operator, and security admin roles. Permission names and assignments are versioned defaults because `requirements.md` leaves the final role-to-permission matrix open.

## Compose Health and Smoke Workflow

```text
docker compose up core services
  -> health checks converge
  -> seed loader completes
  -> smoke test authenticates or uses approved local token path
  -> smoke test reads seeded reference records
  -> smoke test performs one authorized reference admin path if enabled
  -> smoke test verifies outbox/event status visibility
```

Smoke checks must use service APIs and BFF paths rather than direct database reads, preserving the `services.md` guardrail that consumers integrate through APIs and events.

## Error Handling

| Failure | Behavior |
|---|---|
| Missing seed file | Fail before writes and name the missing pack. |
| Invalid seed schema | Fail before writes and print the validation path. |
| Dependency missing | Fail the dependent record and continue only if the pack marks it optional. |
| Duplicate natural key with incompatible immutable fields | Fail the run; do not silently mutate identity or reference meaning. |
| Service unavailable | Retry within timeout, then fail with endpoint and health details. |
| Kafka/SR unavailable during event-enabled seed | Mark event publication path failed; reference writes must not claim event smoke success. |

## Non-Goals

- No production seed values or final trade-footprint decisions.
- No custom authentication store.
- No direct browser-to-service calls.
- No public-cloud managed dependencies.
- No Charge, Booking, or Container Movement runtime code or test stubs.
