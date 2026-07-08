# Domain Entities - U09 Local Seed Compose

## Source Trace

These U09 entities are derived from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U09 does not create new customer-facing business aggregates. It defines local-environment and seed-management entities that feed existing `reference-data-service`, `identity-service`, Keycloak, Kafka, Schema Registry, and frontend/BFF surfaces.

## SeedPack

Purpose: Versioned manifest describing one deterministic seed data set.

Attributes:

| Attribute | Description |
|---|---|
| `seedPackId` | Stable pack identifier. |
| `seedVersion` | Monotonic seed version. |
| `environmentScope` | `local`, `test`, or approved non-production scope. |
| `targetServices` | Services or platform components loaded by the pack. |
| `records` | Ordered seed record declarations. |
| `smokeTags` | Named subsets used by smoke checks. |
| `classification` | Data sensitivity classification for the pack. |

Lifecycle:

```text
drafted -> validated -> applied -> superseded
```

Relationships:

- Contains SeedRecord entries.
- Produces SeedRun records.
- Feeds `reference-data-service`, `identity-service`, and Keycloak local import.

## SeedRecord

Purpose: One deterministic data item in a seed pack.

Attributes:

| Attribute | Description |
|---|---|
| `recordType` | Reference set, role, permission, user, client, or relation type. |
| `stableKey` | Natural key used to detect existing records. |
| `platformId` | Stable platform-owned id or deterministic id derivation input. |
| `payload` | Record fields validated by service/domain rules. |
| `dependencies` | Other seed records required before this one. |
| `fingerprint` | Hash over immutable key, mutable payload, and seed version. |
| `status` | Active/inactive where applicable. |

Lifecycle:

```text
declared -> validated -> created
declared -> validated -> already-current
declared -> validated -> updated
declared -> conflict-detected
```

## ReferenceSeedSet

Purpose: Groups reference records for the nine MVP canonical sets.

Attributes:

| Attribute | Description |
|---|---|
| `setName` | Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, or TradeLane. |
| `records` | SeedRecord entries for the set. |
| `dependencyOrder` | Required ordering rules such as Country before Port. |
| `eventEnabled` | Whether smoke seeding exercises outbox/event publication. |
| `configurableFields` | Fields intentionally left replaceable, such as trade lane footprint. |

Relationships:

- Belongs to SeedPack.
- Maps to `reference-data-service` aggregate/API behavior from `components.md` and `component-methods.md`.
- Can create outbox/event status evidence through the service's messaging adapter.

## IdentitySeedSet

Purpose: Groups local authorization roles, permissions, role mappings, and test users.

Attributes:

| Attribute | Description |
|---|---|
| `roleCatalog` | MVP carrier roles. |
| `permissionCatalog` | Replaceable default permissions. |
| `rolePermissionLinks` | Versioned role-to-permission defaults. |
| `localUsers` | Fictional local users for development and smoke checks. |
| `keycloakRealmImport` | Realm/client/user import references. |

Relationships:

- Belongs to SeedPack.
- Feeds Keycloak 24 authentication setup and `identity-service` authorization domain.
- Supports smoke authorization decisions for `apps/auth` and `apps/reference-data`.

## SeedRun

Purpose: Execution record for one seed loader invocation.

Attributes:

| Attribute | Description |
|---|---|
| `seedRunId` | Unique invocation id. |
| `seedPackId` | Applied seed pack. |
| `seedVersion` | Applied seed version. |
| `startedAt` | Start timestamp. |
| `completedAt` | Completion timestamp when available. |
| `correlationId` | Correlation id propagated to logs, audit, and events. |
| `createdCount` | Number of created records. |
| `updatedCount` | Number of updated records. |
| `skippedCount` | Number of already-current records. |
| `failedCount` | Number of failed records. |
| `status` | Succeeded, failed, or partial-failed. |

Lifecycle:

```text
started -> validating -> applying -> verifying -> succeeded
started -> validating -> failed
started -> applying -> partial-failed
```

## ComposeRuntimeProfile

Purpose: Defines the local Docker Compose runtime shape used by this unit.

Attributes:

| Attribute | Description |
|---|---|
| `profileName` | Core or optional profile name. |
| `services` | Compose services participating in the profile. |
| `healthChecks` | Readiness signals consumed by dependencies and seed loader. |
| `ports` | Local port mappings. |
| `networks` | Local internal network definitions. |
| `volumes` | Local data volumes. |
| `secretSources` | Development-only secrets or Vault placeholders. |

Relationships:

- Contains RuntimeServiceDefinition entries from U01.
- Hosts platform components listed in `services.md`.
- Provides endpoints consumed by SeedLoader and smoke checks.

## SeedLoader

Purpose: Local command/container that validates and applies seed packs.

Attributes:

| Attribute | Description |
|---|---|
| `loaderName` | Seed loader command or container name. |
| `inputPacks` | Seed packs to apply. |
| `targetEndpoints` | Service/admin endpoints or approved local adapter endpoints. |
| `retryPolicy` | Health wait and retry configuration. |
| `dryRunMode` | Optional validation-only mode. |
| `summaryOutput` | JSON or log summary path. |

Relationships:

- Reads SeedPack.
- Writes SeedRun.
- Calls `identity-service`, `reference-data-service`, and Keycloak import/admin paths.
- Verifies Kafka/SR readiness when event-enabled seeds are used.

## Entity Interaction Pattern

```text
ComposeRuntimeProfile
  hosts platform services
  exposes service health
  enables SeedLoader

SeedLoader
  reads SeedPack
  applies ReferenceSeedSet and IdentitySeedSet
  records SeedRun
  triggers smoke checks

ReferenceSeedSet
  feeds reference-data-service
  may enqueue outbox and Kafka events

IdentitySeedSet
  feeds Keycloak and identity-service
  supports BFF authorization smoke scenarios
```

## Non-Owned Entities

U09 references but does not own the core reference aggregates, authorization aggregates, frontend route components, outbox records, or Avro event schemas. Those remain owned by U02, U03, U04, U05, U06, and U07 according to `unit-of-work.md` and `unit-of-work-story-map.md`.
