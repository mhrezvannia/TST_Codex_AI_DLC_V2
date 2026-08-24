# Business Logic Model - U02 Reference Data Operational Completion

## Source Alignment

This design implements U02 from `unit-of-work.md`, its US-003 through US-006 assignments in `unit-of-work-story-map.md`, and `requirements.md`. It refines the approved boundaries in `components.md`, public seams in `component-methods.md`, and deployment/ownership model in `services.md`, while consuming the approved U01 Functional Design. Binding UI authority remains the W4 requirements, LinerCore MASTER, Reference page contract, and approved Reference uplift. No new service, database, cache, shell, theme, or shared-component fork is introduced.

## Brownfield Baseline and Required Corrections

The indexed source confirms that Reference create and update API routes, provider POST/PUT endpoints, provider validation, versioned records, and a provider re-read method already exist. It also confirms implementation gaps that U02 must correct:

- the current BFF mutation client sends update requests with a hard-coded `version=1` rather than the version read with the draft;
- the current client submits empty attributes and treats a list reload as sufficient success evidence;
- current route responses collapse transport failures and do not expose the complete approved mutation disposition set;
- provider validation contains hard-coded set-specific rules, while the BFF accepts arbitrary string attributes; U02 must align both implementations through one executable V1 contract fixture and reject unknown keys without inventing a runtime schema API;
- the current root workbench co-locates list, detail, and form behavior instead of the approved stable routes.

These are brownfield correction points, not authorization to change provider ownership or add speculative capabilities.

## Completed Read Workflow

U02 retains the U01 request pipeline: authenticated session, current-request `reference-data:read` decision, strict path/query parsing, and only then provider access. U02 completes the behavior for set list, set-scoped record list, stable detail, Attributes, and History.

1. Parse only the approved route and query keys. Browser pages are one-based; sizes are 25, 50, or 100; the BFF alone converts to provider zero-based pages.
2. Reauthorize every request. DENY and Identity unavailable terminate before Reference provider access.
3. Request the exact provider resource and translate it into labelled view models.
4. Map `ok`, `invalid-query`, `not-found`, `denied`, authorized `stale`, and `unavailable` exhaustively.
5. Keep History failure scoped to the History panel when Summary and Attributes remain trustworthy.
6. Preserve normalized URL, selected tab, safe return context, and invoking-row focus through retry and refresh.

True empty means the provider returned no records for the set. Filtered empty is used only when `includeInactive` is the active supported filter and the provider response establishes the distinction. Search, selectable sort, and client filtering remain absent.

## Reference Form Catalog Workflow

U02 adds no provider field-schema endpoint and no mutation `schemaVersion`. The Reference BFF owns a compile-time `ReferenceFormCatalogV1` used only to derive ordered, labelled form fields and to reject unknown browser keys. The Reference provider owns an equivalent `ReferenceFieldCatalogV1` used to reject unknown attribute keys before its existing domain validation. Both implementations are held to one versioned producer/consumer fixture containing the exact set, key, requiredness, scalar format, discriminator, and canonical-option source. Fixture disagreement is a contract-test failure and blocks release; it is not reconciled at runtime and it creates no app-to-app import.

Base fields preserve the current BFF contract: `code` is trimmed and 2-32 characters, `displayName` is trimmed and 2-120 characters, `reason` is optional, trimmed, and at most 240 characters, and status is not an editable U02 lifecycle control. The V1 attribute allow-list is exact:

| Set | Allowed attributes and constraints | Existing option/read source |
| --- | --- | --- |
| `PARTY_CUSTOMER`, `REGION`, `CURRENCY`, `COMMODITY`, `EQUIPMENT_TYPE` | none; `EQUIPMENT_TYPE.code` must match `\\d{2}[A-Z]\\d` | none |
| `LOCATION` | `locationType` optional string; `parentCountryId` required and non-blank when `locationType=PORT` | no new source; stable-ID text until a country contract exists |
| `TRADE_LANE` | required `originRegionId`, `destinationRegionId`; both must reference active REGION records | existing REGION record-list read, bounded selector |
| `CHARGE_CODE` | required non-blank `chargeFamily`; code must match `[A-Z0-9]{3,8}` | no new source; labelled text |
| `VESSEL_VOYAGE` (`recordType=VESSEL`) | required discriminator `recordType=VESSEL`, `vesselName`, seven-digit checksum-valid `vesselIMONumber`; code equals IMO number | no new source |
| `VESSEL_VOYAGE` (`recordType=VOYAGE`) | required discriminator `recordType=VOYAGE`, `vesselId`, `carrierVoyageNumber`, `originLocationId`, `destinationLocationId`, ISO-8601 `scheduledDeparture`, ISO-8601 `scheduledArrival`; code equals voyage number; arrival after departure; locations differ | existing active VESSEL_VOYAGE and LOCATION record-list reads, filtered/verified by the BFF |

The existing provider validator remains authoritative for uniqueness, related-record activity, IMO checksum, and vessel/voyage cross-field rules. Client validation improves feedback only. An existing record containing a key outside V1 remains readable with the extra attribute labelled read-only; edit is unavailable with a precise catalog-coverage reason so no value is silently dropped. Extending fields requires an explicit V2 fixture and synchronized producer/consumer change, not browser inference.

## Canonical Create Workflow

1. Load `/reference-data/[setCode]/new` with current session and validated same-module return context.
2. Authorize `reference-data:create`; DENY renders read-only/denied behavior and makes zero provider mutation calls. Identity outage is retryable unavailable.
3. Load the BFF-owned V1 form definition for the verified set. Build an empty transient draft with no inferred defaults except the explicit VESSEL/VOYAGE discriminator selected by the user.
4. On submit, block duplicate activation, set pending state, and retain Cancel when safe.
5. Normalize allowed strings, reject unknown fields, validate base fields and attributes, and link every issue to a persistent label.
6. Reauthorize `reference-data:create` for this command. Browser actor/capability fields are ignored or rejected.
7. Generate a UUID `attemptRecordId` in the BFF and send the create adapter request to the existing provider `PUT /reference-sets/{set}/records/{attemptRecordId}?version=0` with the normal provider command and trusted correlation evidence. Browser-facing semantics remain POST; browser update can never supply version zero.
8. If accepted, call `getRecord(set, attemptRecordId)`. Only an `ok` authoritative re-read produces confirmed success and stable-detail navigation.
9. Announce success, navigate to the canonical detail, focus its heading/status, and retain the validated list return context.

If provider acceptance is known but the authoritative re-read fails, the UI reports `Saved; confirmation unavailable`, retains the stable record ID/reference when safe, and offers re-read. It never renders submitted input as provider truth.

## Canonical Update Workflow

1. Load `/reference-data/[setCode]/[recordId]/edit` by stable identifiers and current-request read/update decisions.
2. Obtain authoritative record detail and the BFF V1 form definition. Seed the transient draft only when every persisted attribute is catalogued, and retain the exact provider `version` as `expectedVersion`.
3. On submit, validate, block duplicates, reauthorize `reference-data:update`, and send the real `expectedVersion`; no constant or browser-generated version is allowed.
4. The provider compares its current version atomically. A match applies validated changes, increments the provider version, writes history/outbox evidence, and returns the saved record identity.
5. The BFF performs an authoritative `getRecord` re-read. Only that value feeds stable detail success.

An update to a missing record returns `not-found`; it must not create through the update route. The provider's existing `expectedVersion=0` create-with-ID behavior is not exposed by W4 browser update and is rejected at the BFF contract boundary.

## Conflict and Reconciliation Workflow

On version mismatch, map the provider response to `conflict` with current version, safe reference, and current record summary where available. The form retains all user-entered values, moves focus to the conflict heading, and offers two explicit choices:

- Review current: authoritative re-read into a comparison view while retaining the draft separately.
- Discard draft: replace the form with current provider truth after confirmation when dirty.

Reapply means the user reviews current truth, explicitly chooses values, receives the new version, and submits a new command that reauthorizes. There is no silent overwrite, automatic retry, automatic merge, or auto-submit.

## Mutation Outcome Decision Model

U02 uses one concrete Reference-local discriminated union rather than extending an upstream accepted branch that requires `value:T`. This does not migrate another domain's result contract.

| Disposition | Meaning | UI/recovery | Retry rule |
| --- | --- | --- | --- |
| `accepted-confirmed` | Provider accepted and `getRecord` returned authoritative detail | HTTP 201 create / 200 update; detail value, recordId, version, reference | Not applicable |
| `accepted-unconfirmed` | Provider acceptance is known but confirmation read is denied/unavailable/not-yet-visible | HTTP 202; recordId, optional persistedVersion, reference, recovery=`REFETCH`; never includes submitted draft as truth | Reauthorize and re-read only |
| `validation` | Command rejected with field/general issues | Retain draft; summary and linked fields | User correction; new authorization on submit |
| `conflict` | Expected version no longer current | Retain draft; show current truth/reconcile | Explicit reapply only |
| `denied` | Current command authorization denied | Retain draft but remove command; concise reason | No automatic retry |
| `not-found` | Target disappeared or set/record identity invalid | Retain safe draft evidence; canonical set/list action | Re-read/navigate; never create implicitly |
| `unavailable-known` | Evidence proves Identity/provider did not accept the command | HTTP 503 for Identity/provider unavailable before dispatch, 502 for known provider rejection/protocol failure; reference, retry=`RESUBMIT` | User-triggered retry, reauthorize |
| `unavailable-unknown` | Timeout/disconnect after dispatch | HTTP 503/504; create attemptRecordId or update recordId+expectedVersion, reference, recovery=`REFETCH` | Mandatory exact-ID re-read before any retry |
| `unexpected` | BFF invariant failure or malformed/unmapped provider response | HTTP 500 with boundary=`BFF`; HTTP 502 with boundary=`PROVIDER_PROTOCOL`; safe reference | No blind replay |

Duplicate submission while pending is ignored at the client boundary and never creates a second provider request.

## Unknown-Outcome Recovery Algorithm

1. Freeze the submitted draft, stable target identity, and safe correlation/reference. Create always has its BFF-generated `attemptRecordId` before dispatch.
2. Announce that the result is unknown, not failed or successful.
3. Reauthorize read, then fetch the exact record ID: `attemptRecordId` for create, existing record ID for update.
4. For create, canonicalize the command using the V1 fixture and compare all persisted command fields. A matching record is observed success. A same-ID record with different content is `conflict`/support evidence and must never be overwritten. A provider conflict after a same-ID race always triggers the same exact-ID re-read.
5. For update, compare authoritative version/content with the pre-command snapshot and submitted intent. If the mutation is observed, return `accepted-confirmed` from the re-read value.
6. Only an authoritative 404 obtained after the original provider request is terminal establishes create absence. Then an explicit Retry may reuse the same attempt ID and `version=0`, after new authorization and validation. ID uniqueness makes the retry duplicate-safe.
7. If still indeterminate, keep mutation disabled and surface support/reference guidance.

Post-acceptance `getRecord ok` maps to `accepted-confirmed`. Read denial, Identity outage, provider unavailability, or a temporarily absent record maps to `accepted-unconfirmed`/202 with `REFETCH`; it never renders provider truth. Invalid internal query construction maps to `unexpected`/500. A malformed provider response maps to `unexpected`/502. Tests cover accepted-but-unconfirmed recovery, same-ID matching content, same-ID different content, terminal absence, and conflict/race re-read.

## Degraded and Stale Read Workflow

Authorization is always fresh. Last-known data may render only when the owning Reference provider returns the value with `dataUpdatedAt` and source/dependency evidence. All mutation commands are absent or disabled with a precise freshness reason. Retry repeats session/policy/provider reads.

Identity outage returns retryable unavailable/HTTP 503 with zero provider calls. Provider outage without trustworthy provider-returned last-known data renders provider error. Browser memory, fixtures, local storage, and stale authorization are never fallback truth.

## Data Transformations

- Route parser: raw path/query -> validated stable identifiers and normalized one-based query.
- Catalog adapter: BFF `ReferenceFormCatalogV1` -> ordered labelled form definition; producer/consumer fixture drift and uncatalogued persisted keys fail closed for edit.
- Draft normalizer: labelled form values -> allow-listed provider command; no actor/capability/status injection.
- Issue mapper: BFF/provider codes -> stable `FieldIssue` entries plus safe form-level message.
- Record adapter: provider record/history -> labelled detail/attributes/history view models.
- Outcome reducer: policy, transport, provider, and re-read results -> one terminal mutation disposition.
- Safe return policy: validated Reference-relative list context -> detail/form navigation and focus restoration.

## Scenario and Requirement Coverage

| Scenario | Story/requirements | Required proof |
| --- | --- | --- |
| Complete list/detail/history | US-003, US-004; FR-001, FR-002, FR-003, FR-009, FR-010, FR-011, FR-015, FR-016, FR-017 | Provider fixtures, allowed/invalid query, stable route, tabs, partial History |
| Create and update | US-005; FR-004, FR-012, FR-013 | Action-specific ALLOW, stable create ID, real update version, persisted re-read |
| Validation/unknown attributes | US-005; FR-013; NFR-004 | BFF/provider V1-fixture rejection, linked errors, uncatalogued-record edit block |
| Version conflict | US-005; FR-011; NFR-005 | Retained draft, authoritative reconcile, no overwrite |
| Read-only/denied/Identity outage | US-005, US-006; FR-012, FR-020 | Commands absent, zero provider call on policy failure |
| Provider outage/stale/partial | US-006; FR-019, FR-020, FR-021 | Source/time, mutation disabled, scoped retry |
| Unknown mutation outcome | US-005, US-006; FR-011, FR-013 | Stable attempt ID, exact-ID re-read, duplicate-safe retry |
| Shared shell/navigation | US-003 to US-006; FR-022 | One W2-02 PlatformShell, shared tokens and `@erp/ui` |
| Unit quality contribution | NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-009, NFR-010, NFR-011, NFR-012 | Five widths/two themes, route+BFF sample, a11y, observability, live stack |
| Intent-exit quality verdict | NFR-006, NFR-007, NFR-008 | Manager guards, audit/security/Compose evidence combined at intent exit |

## Completion Boundary

U02 closes only on the running `linercore-wave-a` stack with persisted provider fixtures and real Identity decisions. Evidence must cover complete reads, create/update, schema validation, duplicate submit, version conflict, denied/read-only, Identity outage, provider outage with and without trustworthy stale truth, partial History, unknown outcome, authoritative recovery, and safe return/focus. Route/BFF samples use the approved warmed ten-user method and thresholds. Validate, deactivate, and reactivate remain absent and BLOCKED; mockups, source inspection, or unit tests alone are not PASS.

## Review Resolution - Iteration 1

- Replaced unrecoverable provider-generated-ID create with browser POST -> BFF-generated UUID -> existing provider PUT-by-ID `version=0`, including exact-ID read, terminal-absence retry, same-ID mismatch, and race handling.
- Removed the unsupported field-schema endpoint and mutation schema version. Added exact V1 BFF/provider catalogs governed by one executable contract fixture, with source-aligned per-set keys and compatibility behavior for uncatalogued persisted attributes.
- Replaced the incomplete upstream refinement with an exact Reference-local result union and transport/re-read mapping, including `accepted-unconfirmed`/202.
- Added explicit US-003-US-006, FR-001-FR-004/FR-009-FR-013/FR-015-FR-017/FR-019-FR-022, and NFR-001-NFR-012 allocation, with NFR-006-NFR-008 retained as intent-exit verdicts.

## Review - Iteration 1

**Verdict: NOT-READY**

### Validation evidence

- Reviewed the four U02 artifacts as one contract against the answered Functional Design questions, U02 scope/story allocation, Requirements, all declared Application Design inputs, approved U01 Functional Design, the LinerCore master/session/Reference authorities, the approved Reference interaction specification, and the indexed/live Reference source.
- The deterministic `required-sections` sensor passes all four files with 13, 11, 19, and 13 H2 headings. The `upstream-coverage` script returns `pass` only because it resolves `consumes: []` (`reason: no upstream`), so that result is vacuous and was not treated as coverage evidence. Linter/type-check sensors are not applicable to these Markdown-only outputs.
- Source verification confirms provider POST `create` calls `ids.nextId()` and exposes no create idempotency/lookup token; provider PUT delegates an absent `id` with `version=0` to private `createWithId`; the current BFF update hard-codes `version=1`; `ReferenceMutationCommand` has no schema version; the controller has no field-schema route; BFF attributes accept an arbitrary `Record<string,string>`; and `ReferenceValidator` has hard-coded set checks rather than the claimed shared field catalog.
- UI governance is coherent: exactly one W2-02-owned `PlatformShell`, shared `@erp/ui`/tokens, feature-local Reference composition, explicit missing-primitive dependencies, and no local shell/theme/shared-component fork. The advisory marketing/palette/font/chart recommendations were correctly rejected.

### Blocking findings

1. **Unknown create outcome is required but deliberately left unrecoverable.** Q6/Q10, US-005/US-006, FR-011/FR-013, the scenario table, and the Completion Boundary require an observed unknown-outcome recovery with no duplicate or false success. The designed create path has no stable ID until provider POST returns, and the recovery algorithm admits that this branch cannot be authoritatively re-read or safely retried. That is not an implementable completion contract. A contract-faithful, no-new-persistence option exists in current source: the BFF can generate a stable create attempt ID while retaining browser-facing POST semantics and call the existing provider PUT-by-ID seam with `version=0`; re-read that exact ID before retry, treat matching persisted content as observed success, retry only after authoritative absence, and re-read after any race/conflict. If this option is chosen, specify and producer/consumer-test the exact request, same-ID race/different-content behavior, authorization, response, and recovery mapping; otherwise add an approved provider idempotency/lookup seam. The current artifacts instead reject the `version=0` seam and leave acceptance BLOCKED.

2. **The provider-owned field-schema contract is an unsupported and incomplete expansion.** U02 invents `GET /reference-sets/{set}/field-schema`, `ProviderFieldSchema`, a schema version on mutations, and a single catalog shared with validation, but none resolves in `component-methods.md`, `services.md`, the current controller/command, or source. The actual validator is not catalog-driven and does not reject arbitrary unknown attributes, while the BFF accepts `z.record(z.string())`. The artifacts also omit the exact per-set keys, requiredness, types, patterns, normalization, option-source calls, version-mismatch response, and compatibility rules a producer and consumer need. Move this additive public contract through the approved Application Design/change-control boundary and define its exact producer/consumer shapes and executable examples, or choose an upstream-approved existing-contract design; a developer cannot implement the claimed “same catalog” without inventing it.

3. **The declared mutation union cannot represent all designed terminal states.** `ReferenceMutationResult<T>` is described as upstream `MutationResult<T>` plus only `not-found` and `unexpected`; upstream `accepted` requires a `value: T`. U02 simultaneously requires `accepted-unconfirmed` when persistence is known but the authoritative re-read fails, where no authoritative detail `T` exists. No exact discriminator/payload/HTTP mapping is supplied for that state or for each post-acceptance re-read result, and `unexpected` remains ambiguously `500/502 according to boundary`. Define one concrete Reference result union and transport table covering accepted-confirmed, accepted-unconfirmed, validation, conflict, denied, not-found, unavailable-known, unavailable-unknown, and unexpected, with exhaustive reducer tests. Also complete explicit U02 allocation traceability for FR-010/FR-015/FR-016/FR-017 and NFR-006/NFR-007/NFR-008/NFR-010/NFR-011, which are assigned to U02 upstream but absent by ID from the four artifacts.

## Review - Iteration 2

**Verdict: READY**

### Validation evidence

- Reviewed the corrected four-artifact contract together against the approved U02 requirements, stories, Application Design, actual Reference controller/application/validator contracts, and LinerCore ownership authorities. All Iteration-1 blockers are resolved.
- Create now preserves browser-facing POST semantics while the BFF allocates a stable UUID and uses the existing provider PUT-by-ID `version=0` seam. Source confirms an absent ID at version zero delegates to `createWithId`, while authorization remains action-based through the command operation. Exact-ID re-read, same-ID content comparison, conflict/race handling, and retry only after authoritative absence make unknown outcomes recoverable without a second identity.
- The unsupported runtime schema endpoint and mutation `schemaVersion` are removed. The compile-time V1 BFF/provider fixture defines the exact supported sets, fields, normalization, constraints, option sources, unknown-key rejection, and compatibility behavior; those rules align with the current Equipment Type, Charge Code, Vessel/Voyage, Location, and Trade Lane validators.
- Update uses the authoritative current version rather than the current BFF's hard-coded `version=1`, and every accepted command is followed by authoritative `getRecord`. The Reference-local union and transport table exhaustively distinguish confirmed and unconfirmed acceptance, validation, conflict, denial, not found, known and unknown unavailability, and BFF/provider-protocol failures, including HTTP status, payload, re-read, and retry behavior.
- Traceability is explicit for US-003-US-006, all allocated FR-001-FR-004/FR-009-FR-013/FR-015-FR-017/FR-019-FR-022, and NFR-001-NFR-012. The required-sections sensor passes all four artifacts with 15, 11, 19, and 13 H2 headings and zero findings. Upstream-coverage reports pass only with `consumes: []`/`reason: no upstream`, so it remains vacuous rather than independent evidence; Markdown lint/type-check are not applicable.
- UI ownership remains coherent: one W2-02-owned `PlatformShell`, shared tokens and `@erp/ui` primitives, feature-local Reference composition, and explicit BLOCKED dependencies for missing shared primitives with no local shell, theme, or shared-component fork.

### Final finding

No blocking design finding remains. READY denotes implementable Functional Design; the explicitly BLOCKED live-stack, producer/consumer, concurrency, accessibility, performance, audit, and security evidence still must pass at construction and intent-exit gates.
