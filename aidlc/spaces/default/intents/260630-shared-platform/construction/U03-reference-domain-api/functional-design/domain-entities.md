# Domain Entities - U03 Reference Domain and Provider/Admin APIs

## Source Trace

These U03 domain entities derive from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Shared Value Objects

| Value object | Purpose |
|---|---|
| `ReferenceId` | Stable platform-owned identifier. |
| `ReferenceCode` | Human/business code unique within a reference set. |
| `ReferenceStatus` | Active or inactive. |
| `ReferenceVersion` | Optimistic concurrency version. |
| `CorrelationId` | Cross-service trace id. |
| `AuditActor` | Subject/user metadata for changes. |
| `ChangeReason` | Optional administrative reason or note. |
| `Classification` | Public, Internal, Confidential, or Restricted. |

## ReferenceRecord Base Contract

Purpose: Common shape for all reference aggregates without erasing aggregate-specific rules.

Attributes:

| Attribute | Description |
|---|---|
| `id` | Stable `ReferenceId`. |
| `code` | Unique set-local business code. |
| `displayName` | Human-readable name. |
| `status` | Active/inactive state. |
| `version` | Optimistic concurrency version. |
| `createdBy` | Creating actor. |
| `createdAt` | Creation timestamp. |
| `updatedBy` | Last updating actor. |
| `updatedAt` | Last update timestamp. |
| `statusChangedBy` | Actor for last status transition. |
| `statusChangedAt` | Last status transition timestamp. |
| `changeReason` | Optional reason supplied by admin. |

## PartyCustomer

Purpose: Generic party plus roles model for carrier-maintained customer/party references.

Attributes:

| Attribute | Description |
|---|---|
| `partyId` | Stable reference id. |
| `partyCode` | Unique party/customer code. |
| `legalName` | Legal or official name. |
| `displayName` | Display/search name. |
| `partyRoles` | Roles such as customer/shipper/BCO for MVP. |
| `contactSummary` | Optional internal contact summary. |
| `classification` | Confidential/Restricted where PII or commercial sensitivity applies. |

Relationships:

- May be referenced by future downstream modules through id/code only.
- Must not create customer-facing identity.

## Location

Purpose: MVP Country to Port structural containment.

Attributes:

| Attribute | Description |
|---|---|
| `locationId` | Stable reference id. |
| `locationCode` | Country code or UN/LOCODE-style port code. |
| `locationType` | `COUNTRY` or `PORT` in MVP. |
| `name` | Location display name. |
| `parentCountryId` | Required for Port, absent for Country. |
| `unLocode` | Port code where applicable. |
| `status` | Active/inactive. |

Rules:

- Country has no parent.
- Port has exactly one active Country parent.
- Port re-parenting is prohibited.
- Terminal/facility nodes are deferred.

## Region

Purpose: Flat grouping layer assigned over locations and used by TradeLane.

Attributes:

| Attribute | Description |
|---|---|
| `regionId` | Stable reference id. |
| `regionCode` | Unique region code. |
| `name` | Region name. |
| `assignedLocationIds` | Locations included in the region grouping. |
| `status` | Active/inactive. |

Rules:

- No nested region tree in MVP.
- Multi-dimensional regions are deferred.

## Voyage

Purpose: Manually maintained voyage schedule and nominal capacity reference.

Attributes:

| Attribute | Description |
|---|---|
| `voyageId` | Stable reference id. |
| `voyageNumber` | Unique voyage identifier. |
| `vesselNameOrCode` | Manual vessel reference for MVP. |
| `departurePortId` | Optional Location/Port reference. |
| `arrivalPortId` | Optional Location/Port reference. |
| `scheduledDeparture` | Manual schedule timestamp/date. |
| `scheduledArrival` | Manual schedule timestamp/date. |
| `nominalCapacity` | Optional nominal capacity reference value. |
| `status` | Active/inactive. |

Exclusions:

- No capacity allocation/consumption.
- No external vessel feed integration.

## Currency

Purpose: Currency reference with USD active for MVP.

Attributes:

| Attribute | Description |
|---|---|
| `currencyId` | Stable reference id. |
| `isoCode` | ISO-style currency code. |
| `name` | Currency name. |
| `minorUnit` | Decimal/minor unit precision. |
| `isMvpDefault` | USD true for MVP seed. |
| `status` | Active/inactive. |

## ChargeCode

Purpose: Canonical charge-code reference for later charge modules.

Attributes:

| Attribute | Description |
|---|---|
| `chargeCodeId` | Stable reference id. |
| `code` | Unique charge code. |
| `name` | Display name. |
| `description` | Optional description. |
| `classification` | Optional classification/grouping. |
| `status` | Active/inactive. |

## EquipmentType

Purpose: Canonical equipment type reference.

Attributes:

| Attribute | Description |
|---|---|
| `equipmentTypeId` | Stable reference id. |
| `code` | Unique equipment code. |
| `name` | Display name. |
| `isoSizeType` | Optional ISO size/type code. |
| `description` | Optional description. |
| `status` | Active/inactive. |

## Commodity

Purpose: Flat commodity code list for MVP.

Attributes:

| Attribute | Description |
|---|---|
| `commodityId` | Stable reference id. |
| `commodityCode` | Unique commodity code. |
| `name` | Commodity name. |
| `description` | Optional description. |
| `hazardousFlag` | Optional flag for later operational use. |
| `status` | Active/inactive. |

## TradeLane

Purpose: Configurable origin/destination Region pair.

Attributes:

| Attribute | Description |
|---|---|
| `tradeLaneId` | Stable reference id. |
| `tradeLaneCode` | Unique lane code. |
| `name` | Display name. |
| `originRegionId` | Active origin Region. |
| `destinationRegionId` | Active destination Region. |
| `description` | Optional description. |
| `status` | Active/inactive. |

Rules:

- Origin and destination must reference active Regions.
- Exact MVP lanes are seed/configuration data, not hard-coded domain logic.

## ReferenceChange

Purpose: Change history and domain fact source for U04.

Attributes:

| Attribute | Description |
|---|---|
| `changeId` | Stable change id. |
| `referenceSet` | Set name. |
| `recordId` | Changed record id. |
| `operation` | Created, updated, deactivated, reactivated. |
| `beforeSummary` | Safe summary before change. |
| `afterSummary` | Safe summary after change. |
| `changedBy` | Actor. |
| `changedAt` | Timestamp. |
| `reason` | Optional reason. |
| `correlationId` | Platform correlation id. |

## Entity Interaction Pattern

```text
ReferenceRecord base contract
  specialized by PartyCustomer, Location, Region, Voyage, Currency,
  ChargeCode, EquipmentType, Commodity, TradeLane

Location(country)
  owns structural child Location(port)

Region
  groups Location[]

TradeLane
  references origin Region
  references destination Region

Mutation of any aggregate
  creates ReferenceChange
  creates ReferenceChangedFact for U04
```

## Excluded Entities

U03 does not model downstream module runtime entities, local consumer replicas, Kafka outbox rows, Schema Registry subjects, frontend form state, or customer-facing identity.
