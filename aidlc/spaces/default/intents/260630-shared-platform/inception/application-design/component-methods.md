# Component Methods - Shared Platform MVP

## Source Trace

This method-level design traces to `requirements.md`, `stories.md`, `team-practices.md`, and `application-design-questions.md`. Brownfield `architecture.md` and `component-inventory.md` inputs are not applicable for this greenfield design.

## Method Conventions

- Method signatures are conceptual and will be refined into Java interfaces, OpenAPI operations, and TypeScript service functions during Functional Design and Code Generation.
- Backend domain/application methods use hexagonal ports.
- REST APIs use standard error envelopes, media-type versioning, kebab-case URLs, camelCase JSON, and correlation id propagation.
- Errors distinguish validation, authorization, not found, conflict, external dependency, and publication/status failures.

## `reference-data-service` Application Ports

### Command Ports

| Method | Input | Output | Purpose | Errors |
|---|---|---|---|---|
| `createReferenceRecord(command)` | `CreateReferenceRecordCommand` | `ReferenceRecordResult` | Create a record for one of the nine reference sets. | Validation, duplicate key, authorization. |
| `updateReferenceRecord(command)` | `UpdateReferenceRecordCommand` | `ReferenceRecordResult` | Update editable fields and enforce aggregate invariants. | Validation, conflict, not found, authorization. |
| `deactivateReferenceRecord(command)` | `ChangeReferenceStatusCommand` | `ReferenceRecordResult` | Mark a record inactive while preserving historical readability. | Not found, already inactive, authorization. |
| `reactivateReferenceRecord(command)` | `ChangeReferenceStatusCommand` | `ReferenceRecordResult` | Reactivate a record after validation. | Validation, not found, conflict, authorization. |
| `validateReferenceRecord(command)` | `ValidateReferenceRecordCommand` | `ValidationResult` | Validate draft data without committing. | Validation only; transport errors separately. |
| `publishPendingReferenceEvents(command)` | `PublishOutboxBatchCommand` | `PublishBatchResult` | Publish due outbox records to Kafka. | Schema, broker, serialization, retryable failure. |

### Query Ports

| Method | Input | Output | Purpose | Errors |
|---|---|---|---|---|
| `getReferenceRecord(query)` | `GetReferenceRecordQuery` | `ReferenceRecordView` | Return one record by set and id. | Not found, authorization. |
| `searchReferenceRecords(query)` | `SearchReferenceRecordsQuery` | `Page<ReferenceRecordSummary>` | Search/list with filters, sorting, pagination. | Validation, authorization. |
| `getChangeHistory(query)` | `ChangeHistoryQuery` | `Page<ReferenceChangeView>` | Return audit/change history. | Not found, authorization. |
| `getEventPublicationStatus(query)` | `EventStatusQuery` | `EventPublicationStatusView` | Return pending/published/failed/stale status. | Not found, unavailable, authorization. |
| `getContractCatalog(query)` | `ContractCatalogQuery` | `ContractCatalogView` | Return OpenAPI/Avro contract metadata for UI/DX. | Unavailable, authorization. |

### Domain Services

| Method | Purpose |
|---|---|
| `assertReferenceInvariant(record)` | Applies per-reference-set invariant checks. |
| `assertLocationHierarchy(countryId, portId)` | Prevents orphan Port and MVP re-parenting violations. |
| `assertTradeLaneRegions(originRegionId, destinationRegionId)` | Ensures TradeLane references valid active Regions. |
| `buildReferenceChangedEvent(record, operation, correlationId)` | Creates typed domain event before outbox persistence. |
| `classifyReferenceData(record)` | Applies Public/Internal/Confidential/Restricted classification hints. |

## `identity-service` Application Ports

### Authorization Ports

| Method | Input | Output | Purpose | Errors |
|---|---|---|---|---|
| `evaluateAuthorization(command)` | `AuthorizationDecisionCommand` | `AuthorizationDecision` | Decide if a subject may perform an action on a resource. | Token invalid, dependency unavailable, fail-closed denial. |
| `getEffectivePermissions(query)` | `EffectivePermissionsQuery` | `EffectivePermissionsView` | Return roles and permissions for session/UI display. | Not found, authorization. |
| `listRoles(query)` | `RoleCatalogQuery` | `RoleCatalogView` | Return MVP role catalog. | Authorization. |
| `assignRole(command)` | `AssignRoleCommand` | `RoleAssignmentResult` | Assign a role to a subject. | Validation, conflict, authorization. |
| `revokeRole(command)` | `RevokeRoleCommand` | `RoleAssignmentResult` | Revoke a role from a subject. | Not found, authorization. |
| `getRoleAudit(query)` | `RoleAuditQuery` | `Page<RoleAuditView>` | Return immutable role/permission audit history. | Authorization. |

### Keycloak Adapter Ports

| Method | Input | Output | Purpose | Errors |
|---|---|---|---|---|
| `resolveSubject(token)` | JWT/access token reference | `AuthenticatedSubject` | Validate/translate Keycloak token claims. | Invalid token, expired token, JWKS unavailable. |
| `getProviderMetadata()` | none | `OidcProviderMetadata` | Resolve OIDC/JWKS endpoints and issuer. | Provider unavailable. |

## `apps/auth` BFF and Client Methods

| Method | Layer | Purpose |
|---|---|---|
| `startSignIn()` | BFF route handler | Build Keycloak authorization redirect. |
| `handleAuthCallback(request)` | BFF route handler | Validate callback, establish HttpOnly-cookie session. |
| `signOut(request)` | BFF route handler | Clear session and invoke Keycloak logout path. |
| `getSession()` | BFF route handler / client hook | Return safe session summary and roles. |
| `requestAccess(payload)` | BFF route handler | Capture or route request-access details. |
| `renderAccessDenied(context)` | UI component | Display denied state with correlation id and actions. |

Error handling:

- Never expose tokens to browser JavaScript.
- Auth failures return safe, user-readable messages.
- Authorization failures include correlation id for support.

## `apps/reference-data` BFF and Client Methods

| Method | Layer | Purpose |
|---|---|---|
| `listReferenceSets()` | Client service | Return nine set descriptors. |
| `searchReferenceRecords(set, filters, page)` | BFF/client service | Call provider API and return table/card models. |
| `getReferenceRecord(set, id)` | BFF/client service | Return detail model. |
| `validateReferenceDraft(set, draft)` | BFF/client service | Run service validation and return field errors. |
| `createReferenceRecord(set, draft)` | BFF/client service | Create record through admin API. |
| `updateReferenceRecord(set, id, draft)` | BFF/client service | Update record through admin API. |
| `deactivateReferenceRecord(set, id, reason)` | BFF/client service | Deactivate record through admin API. |
| `reactivateReferenceRecord(set, id, reason)` | BFF/client service | Reactivate record through admin API. |
| `getEventStatus(eventOrRecordId)` | BFF/client service | Return event/outbox/freshness status. |
| `getContractCatalog()` | BFF/client service | Return OpenAPI, authz API, Avro, examples, compatibility metadata. |

UI error handling:

- Preserve draft values after validation/network failures.
- Map field errors through React Hook Form and Zod.
- Show read-only state when authorization denies mutation.
- Announce dynamic validation/event statuses through live regions.

## Messaging Methods

| Method | Component | Purpose |
|---|---|---|
| `enqueueReferenceChangedEvent(domainEvent)` | Reference Application Service | Persist outbox item in same transaction as reference change. |
| `claimDueOutboxBatch(limit)` | Reference Data Access Adapter | Claim publishable outbox items. |
| `serializeReferenceEvent(outboxItem)` | Reference Messaging Adapter | Map domain event to Avro envelope and payload. |
| `publishReferenceEvent(avroMessage)` | Kafka Producer Adapter | Publish to topic with schema registry validation. |
| `markPublished(outboxItem, brokerMetadata)` | Reference Application Service | Store published status and broker metadata. |
| `markFailed(outboxItem, failure)` | Reference Application Service | Store retry/failure details for operator visibility. |

## Contract Surfaces

| Contract | Producer | Consumer |
|---|---|---|
| Reference Admin OpenAPI | `reference-data-service` | `apps/reference-data` BFF |
| Reference Provider OpenAPI | `reference-data-service` | Future downstream consumers, contract tests |
| Identity Authorization OpenAPI | `identity-service` | Backend services and frontend BFFs |
| Reference Changed Avro Schemas | `reference-data-service` | Future downstream consumers, message-pact tests |
