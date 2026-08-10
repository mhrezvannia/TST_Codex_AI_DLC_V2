# Domain Entities and Boundary Models - U02 Reference Data Operational Completion

## Source Alignment

This model refines U02 `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, while extending the approved U01 boundary models. The existing Reference service/domain model remains authoritative. U02 adds transient form, catalog, outcome, and reconciliation models only.

## Authority and Persistence Model

U02 creates no new business aggregate or persistence. The existing provider owns `ReferenceRecord`, stable identity, set, code, display name, status, version, audit actors/times, change reason, attributes, history, repository uniqueness, and outbox evidence. Identity owns policy decisions. W2-02 owns shell/session presentation and shared UI. The Reference BFF owns request-scoped adapters, its compile-time form catalog, and view models. The browser owns only transient interaction state.

## Existing Provider Entities

| Entity | Identity/attributes | Owner | U02 use |
| --- | --- | --- | --- |
| Reference set | provider path/code and event path | Reference service | Stable route and form-catalog scope |
| Reference record | ID, set, code, display name, status, version, audit metadata, reason, attribute map | Reference service | Authoritative read/create/update result |
| Reference change | record/version, operation, before/after evidence, actor/time/reason/correlation | Reference service | Ordered History VM |
| Policy decision | capability, resource, allowed/denied/unavailable | Identity | Current-request read/create/update boundary |

`ReferenceFormCatalogV1` is BFF implementation data and `ReferenceFieldCatalogV1` is provider implementation data. They expose no runtime schema API and share no cross-app import; one executable producer/consumer fixture proves exact equivalence.

## Transient Boundary Models

| Model | Key attributes | Owner/lifecycle |
| --- | --- | --- |
| `ReferenceRecordFormDefinitionVm` | setCode, `catalogVersion=V1`, ordered base/attribute fields, labels, control kind, required/length/pattern/option-source rules | BFF-derived from compile-time catalog after authorization |
| `ReferenceRecordDraft` | mode create/update, setCode, optional recordId, code, displayName, allow-listed attributes, reason, optional expectedVersion | Client transient for one focused task |
| `ReferenceDraftSnapshot` | authoritative values/version captured when edit opened | Server/BFF-to-client immutable comparison input |
| `FieldIssue` | stable field path, code, safe message | BFF/provider result; transient |
| `MutationAttempt` | command kind, stable target ID, pending flag, correlation/reference, submitted snapshot, startedAt | BFF/client transient; create target becomes provider record ID |
| `ReferenceMutationResult` | exact discriminated union defined below | BFF terminal command result |
| `ConflictContext` | expectedVersion, currentVersion, retained draft, current authoritative detail/reference | BFF/client reconciliation state |
| `AuthoritativePostCommandDetail` | provider-confirmed record detail and read timestamp | BFF result after accepted mutation plus `getRecord` |
| `SafeReturnContext` | validated relative list path and optional focus | Shared navigation policy |

## Reference-Specific Result Refinement

Application Design's generic `MutationResult<T>` cannot represent known acceptance without authoritative `T`. U02 therefore defines one concrete local union; it does not alter other domains:

| Discriminator | Required payload | HTTP |
| --- | --- | --- |
| `accepted-confirmed` | `value: ReferenceRecordDetailVm`, `recordId`, `version`, `reference` | 201 create / 200 update |
| `accepted-unconfirmed` | `recordId`, optional `persistedVersion`, `reference`, `recovery: REFETCH` | 202 |
| `validation` | stable `issues[]`, `reference` | 422 |
| `conflict` | `recordId`, `expectedVersion`, `currentVersion`, optional current summary, `reference` | 409 |
| `denied` | safe reason/reference, no capability detail | 403 |
| `not-found` | set/record identity, safe recovery target, `reference` | 404 |
| `unavailable-known` | `reference`, `retry: RESUBMIT`, boundary | 503 before dispatch; 502 for known provider protocol failure |
| `unavailable-unknown` | stable target ID, optional expectedVersion, `reference`, `recovery: REFETCH` | 503/504 |
| `unexpected` | `boundary: BFF | PROVIDER_PROTOCOL`, `reference` | 500 BFF / 502 provider protocol |

All Reference API routes and reducers switch exhaustively. `accepted-unconfirmed` never carries submitted draft values as provider truth. After provider acceptance, re-read `ok` yields confirmed; read denial, Identity/provider outage, or temporary absence yields unconfirmed; invalid internal query yields BFF unexpected; malformed provider response yields provider-protocol unexpected.

## Form Catalog Model

A V1 field definition contains a stable key, readable label, field group/order, control kind (`text`, `select`, `datetime`, or canonical `combobox`), required/discriminator rule, optional maximum length/pattern/format, normalization rule, and optional bounded existing record-list source. `catalogVersion` identifies build-time compatibility evidence and is not sent to the provider.

The exact attribute keys are: none for PARTY_CUSTOMER/REGION/CURRENCY/COMMODITY/EQUIPMENT_TYPE; `locationType,parentCountryId` for LOCATION; `originRegionId,destinationRegionId` for TRADE_LANE; `chargeFamily` for CHARGE_CODE; and `recordType,vesselName,vesselIMONumber,vesselId,carrierVoyageNumber,originLocationId,destinationLocationId,scheduledDeparture,scheduledArrival` for VESSEL_VOYAGE, discriminator-gated exactly as the business logic table states. Unknown attributes are rejected by BFF and provider. Fixture disagreement blocks release. Existing uncatalogued values render read-only and block edit rather than being dropped.

No field definition may contain styling tokens, shell decisions, actor identity, capability, record lifecycle commands, or browser-supplied provider version.

## Draft State Machine

`initializing -> ready-clean -> ready-dirty -> validating -> pending -> terminal`.

Terminal branches are accepted-confirmed, accepted-unconfirmed, validation, conflict, denied, not-found, unavailable-known, unavailable-unknown, and unexpected. Confirmed transitions to stable detail; unconfirmed transitions to re-read recovery; validation returns to dirty with issues; conflict retains draft plus current truth; unavailable-unknown requires verification. No terminal error clears the draft automatically.

Cancel from clean returns immediately. Cancel/navigation from dirty enters confirmation and either restores the task unchanged or discards and follows the safe target. A pending task rejects duplicate submit.

## Mutation State Transitions

Create starts with a BFF-generated UUID attempt ID and no browser-supplied version. The BFF's browser POST adapter alone invokes provider PUT-by-ID with `version=0`; that ID is the eventual provider record ID and exact recovery lookup. Update starts with exact record ID and positive `expectedVersion` from the authoritative snapshot. The BFF rejects missing/non-positive browser update version and never exposes create-on-update.

Conflict does not modify the draft or expected version. An explicit Review current action reauthorizes/read-fetches current detail and creates `ConflictContext`. Only a user-confirmed reapply produces a new draft snapshot/version and a new authorized submit.

Unknown outcome preserves stable target ID, submitted snapshot, and correlation/reference. Matching exact-ID content becomes confirmed success; different content becomes conflict/support and cannot be overwritten; terminal exact-ID 404 enables explicit same-ID create retry; indeterminate remains verification-required.

## Relationships and Invariants

1. One V1 form definition belongs to one verified set and must match the executable provider fixture.
2. One edit draft references one provider record and one expected version.
3. A draft may contain only V1 keys allowed for its set/discriminator; browser additions are rejected at the BFF and provider.
4. A policy decision authorizes one current request and cannot be stored with the draft as future authority.
5. Accepted mutation and authoritative detail are separate facts; confirmed success requires both.
6. Conflict contains retained intent plus current truth without merging them automatically.
7. Stale read value requires current authorization and provider source/time and cannot enable mutation.
8. Safe return affects navigation only; it does not select identity, capability, catalog, or version.
9. Validate/deactivate/reactivate have no active draft/action models in U02.
10. No UI model is persisted, shared across apps, or imported by another domain app.

## Validation Boundaries

The edge validates trust headers; the root/session boundary authenticates; Identity authorizes; the route parser validates identifiers/query/return context; the BFF catalog adapter validates command shape/unknown fields/version; the provider catalog rejects unknown keys before domain/cross-record validation; the repository enforces uniqueness/concurrency; the outcome adapter translates transport/domain results. A failure never borrows authority from a later boundary.

## View-State Derivation

Read page state derives exhaustively from `ReadResult<T>`. Form page state derives from catalog/read results plus transient draft state. Mutation disposition never becomes a provider record directly. `AuthoritativePostCommandDetail` is constructed only from `getRecord ok` after provider acceptance.

History is a scoped facet: its unavailable/partial result may coexist with an otherwise authoritative detail value. Stale is a provider-owned value plus evidence, not a browser cache flag.

## Ubiquitous Language

- **Authoritative detail**: a Reference record returned by `getRecord`, never a submitted draft projection.
- **Expected version**: the exact provider version captured when an edit draft is opened.
- **Form catalog V1**: synchronized BFF/provider compile-time allow-lists proven by an executable fixture, not a runtime schema API.
- **Attempt record ID**: BFF-generated UUID used as provider record ID for duplicate-safe create and exact recovery read.
- **Known no mutation**: failure evidence establishes that the provider did not accept the command.
- **Unknown outcome**: dispatch may have reached the provider, so neither success nor safe retry is established.
- **Reconciliation**: explicit comparison of retained user intent with a newly read provider version.

## Entities & Aggregates

The only business aggregate is the existing provider-owned `ReferenceRecord`; U02 does not create another aggregate. Catalog definitions are build-time BFF/provider implementation data. Draft, attempt, conflict, result, view-model, and safe-return types are request/session boundary models and have no separate repository lifecycle.

## Field-Level Schema (canonical names)

| Field | Type/value object | Canonical source name | Standard/owner | Notes |
| --- | --- | --- | --- | --- |
| Set identity | `ReferenceSetId` | route `set` / BFF `setCode` | Reference provider | Exact provider path code; never slugified |
| Record identity | `StableId` / provider `ReferenceId` | `id` / route `recordId` | Reference provider | BFF generates UUID before create dispatch; read-only on edit |
| Business code | trimmed string 2-32 | `code` | Reference provider/code-set owner | Required; provider uniqueness and set patterns apply |
| Display name | trimmed string 2-120 | `displayName` | Reference provider | Persistent labelled field |
| Status | `ReferenceStatus` | `status` | Reference provider | Read-only in U02; lifecycle controls blocked |
| Record version | positive integer | `version`; form `expectedVersion` | Reference provider | Exact optimistic-concurrency token |
| Created actor/time | `AuditActor`, `IsoInstant` | `createdBy`, `createdAt` | Reference provider | Read-only Summary/History evidence |
| Updated actor/time | `AuditActor`, `IsoInstant` | `updatedBy`, `updatedAt` | Reference provider | Read-only Summary/History evidence |
| Status-change actor/time | optional actor/instant | `statusChangedBy`, `statusChangedAt` | Reference provider | Read-only; no U02 lifecycle command |
| Change reason | optional trimmed string <=240 | provider `changeReason`; form `reason` | Current BFF/provider | Persistent labelled field |
| Set-specific fields | ordered typed values | V1 key encoded as `attributes[key]` | BFF/provider V1 catalogs | Individual labelled fields, never raw map editor |
| Catalog version | literal `V1` | form-definition metadata only | BFF/provider contract fixture | Never sent in mutation payload |
| Correlation evidence | `CorrelationId` | trusted correlation header / response reference | BFF/edge | Not browser-editable authority |

Actor, capability, lifecycle action, correlation authority, and arbitrary record version are not browser-editable fields. The provider persists set-specific values in the existing `Map<String,String> attributes`; U02 adds no alternate persistence representation.

## Contract Fidelity Check

- `ReferenceDataBff.createRecord` and `updateRecord` remain the browser-facing mutation seams from `component-methods.md`.
- U02 uses only existing provider record reads and PUT-by-ID mutation transport; it adds no provider schema route. Its exact local result union changes no other domain.
- Browser one-based pagination, exact capability names, safe-return grammar, current-request policy, and provider-owned persistence remain unchanged.
- Actual source gaps—hard-coded update version, arbitrary BFF/provider attributes, provider-allocated POST identity, and non-exhaustive result mapping—must be corrected together before live evidence; this design does not claim them as current behavior.
- Current provider `attributes: Map<String,String>` remains the persistence shape. U02 requires zero divergence between V1 catalogs/form VM/unknown-key validation without a universal provider-domain remodel.
- Existing provider PUT-by-ID `version=0` creates an absent record. U02 binds that behavior to browser POST and contract-tests matching, mismatch, absence, and race recovery.

## Invariants & Validation

All invariants in `Relationships and Invariants` apply. Structurally, route/BFF rejects unknown fields and invalid versions; semantically, provider applies its equivalent V1 allow-list plus domain/cross-record rules and repository uniqueness/concurrency. Failure at either boundary prevents persistence and cannot become accepted client state.

## Lifecycle / State

The draft and mutation lifecycle is initialize, edit, validate, pending, then one exhaustive terminal branch. Only accepted-confirmed transitions into stable detail success. Accepted-unconfirmed requires re-read; conflict requires explicit reconciliation; unknown outcome requires verification before retry.

## Open Questions

No user decision remains after `All A` and consolidated confirmation. Implementation must prove V1 fixture parity and stable-ID create recovery against current source; until executable tests and live evidence exist, those rows remain BLOCKED rather than inferred.

## Verification Mapping

Model tests prove V1 unknown-key rejection, stable field paths, version propagation, exhaustive disposition/view mapping, and draft transitions. Policy tests prove DENY/Identity outage make zero provider calls. Contract tests prove BFF/provider catalog fixture parity, browser POST to provider PUT-by-ID/version0, exact result/HTTP mapping, and post-acceptance re-read. Concurrency tests prove stale versions cannot overwrite and create retry cannot duplicate. Architecture tests prove no new route/persistence/cache/app import. Live evidence proves the same models through US-003-US-006; FR-001-FR-004, FR-009-FR-013, FR-015-FR-017, FR-019-FR-022; and NFR-001-NFR-005/NFR-009-NFR-012. NFR-006-NFR-008 are combined intent-exit verdicts.
