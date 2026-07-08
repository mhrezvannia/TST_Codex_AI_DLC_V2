# Business Logic Model - U03 Reference Domain and Provider/Admin APIs

## Source Trace

This U03 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Unit Purpose

U03 implements the `reference-data-service` domain model, validation, persistence boundary, provider APIs, and admin APIs for the nine Shared Platform MVP reference sets:

- Party/Customer
- Location/Port
- Region
- Voyage
- Currency
- ChargeCode
- EquipmentType
- Commodity
- TradeLane

U03 owns canonical reference state and synchronous REST/OpenAPI behavior. U04 owns transactional outbox publication and Kafka/Schema Registry event delivery, although U03 must produce domain change facts that U04 can persist and publish.

## Admin Lifecycle Workflow

```text
Receive admin command
  -> require authenticated caller context and correlation id
  -> call identity-service authorization API for protected mutation
  -> validate reference set, command shape, business key, and relationships
  -> load existing aggregate where needed
  -> enforce aggregate-specific invariants
  -> apply create/update/deactivate/reactivate operation
  -> persist aggregate and audit metadata in reference-data-service datastore
  -> produce reference-domain change fact for U04 outbox enqueueing
  -> return reference result with status, version, validation/audit summary, and correlation id
```

Mutation commands:

| Command | Applies to | Main checks |
|---|---|---|
| `createReferenceRecord` | All nine sets | Required fields, unique business key, valid relationships, authorization. |
| `updateReferenceRecord` | All nine sets | Version conflict, immutable field protection, aggregate invariants, authorization. |
| `deactivateReferenceRecord` | All nine sets | Existing active record, historical readability, optional reason, authorization. |
| `reactivateReferenceRecord` | All nine sets | Existing inactive record, relationships still valid/active, authorization. |
| `validateReferenceRecord` | All nine sets | Same validation as create/update without persistence or event generation. |

## Provider Read Workflow

```text
Receive provider query
  -> require caller context and correlation id
  -> authorize read through identity-service where required
  -> validate set name, filters, page, sort, and includeInactive flag
  -> query owned PostgreSQL datastore through repository ports
  -> map aggregate to provider DTO
  -> return stable id, code, display name, status, version, and type-specific fields
```

Provider reads are the canonical integration path for future modules and Shared Platform apps. Consumers must not read the database directly.

## Search and Filter Workflow

```text
Receive search query
  -> normalize text search and filters
  -> apply active-only default
  -> enforce deterministic sort
  -> page results
  -> return ReferenceRecordSummary page
```

Default behavior:

- Active records only unless `includeInactive=true`.
- Deterministic sort by domain display order, then code/name, then stable id.
- Text search matches safe fields such as code, name, display name, voyage number, UN/LOCODE, or description depending on set.

## Aggregate Invariant Workflows

### Party/Customer

```text
Validate party
  -> require party code and display/legal name
  -> require at least one party role when used as customer
  -> classify PII/commercial sensitivity
  -> prevent duplicate active party code
```

### Location/Port

```text
Validate location
  -> country nodes may be created without parent
  -> port nodes must reference exactly one active country parent
  -> reject orphan ports
  -> reject re-parenting of an existing port
  -> defer terminal/facility nodes
```

### Region

```text
Validate region
  -> require flat region code/name
  -> allow assignments over active locations
  -> prevent multi-level/multi-dimensional region structure in MVP
```

### Voyage

```text
Validate voyage
  -> require voyage identifier and schedule window
  -> allow manual nominal capacity
  -> reject external-feed-only fields as required inputs
  -> keep allocation/consumption out of platform scope
```

### Currency

```text
Validate currency
  -> require ISO-style code
  -> seed/support USD as MVP active currency
  -> preserve precision/minor-unit attributes for future expansion
  -> keep exchange-rate management out of MVP
```

### ChargeCode, EquipmentType, Commodity

```text
Validate simple code set
  -> require unique code and display name
  -> allow description/classification fields
  -> support active/inactive lifecycle and search
```

Commodity is flat at MVP; hierarchical commodity/HS alignment is deferred.

### TradeLane

```text
Validate trade lane
  -> require unique lane code/name
  -> require active origin Region
  -> require active destination Region
  -> reject same-origin/destination only where business rules configure it
  -> do not hard-code a single trade or geography
```

## Change History Workflow

```text
Mutation succeeds
  -> capture actor, operation, timestamp, before/after summary, reason, record id, version, correlation id
  -> persist reference change history
  -> expose recent change history through authorized query
```

Change history is distinct from Kafka publication status. U04 adds outbox status and broker metadata.

## Domain Change Fact Workflow

```text
Aggregate mutation succeeds
  -> create ReferenceChangedFact
  -> include reference set, entity id, business key, operation, changed fields, version, occurredAt, correlationId
  -> hand off to application service boundary for U04 outbox enqueueing
```

U03 defines the fact shape; U04 owns durable outbox, Avro schema mapping, Kafka publication, retry, and status projection.

## API Surface Workflow

Admin APIs:

```text
POST /reference-sets/{set}/records
PUT /reference-sets/{set}/records/{id}
POST /reference-sets/{set}/records/{id}/deactivate
POST /reference-sets/{set}/records/{id}/reactivate
POST /reference-sets/{set}/records/validate
GET /reference-sets/{set}/records/{id}/history
```

Provider APIs:

```text
GET /reference-sets
GET /reference-sets/{set}/records
GET /reference-sets/{set}/records/{id}
```

All APIs use media-type versioning, camelCase JSON, standard error envelopes, and correlation id propagation.

## Walking Skeleton Support

U03 supports the gated walking skeleton by implementing one thin reference path:

- Create or seed one Region and one TradeLane or simpler active reference record.
- Authorize an admin mutation through U02.
- Persist the record with audit metadata.
- Return the record through provider read API.
- Emit a domain change fact for U04 to attach to outbox publication.

## Non-Goals

- No Kafka publication implementation; that belongs to U04.
- No frontend admin workspace implementation; that belongs to U06.
- No seed-data finalization; that belongs to U09.
- No Charge, Booking, or Container Movement runtime implementation.
- No shared database access for consumers.
