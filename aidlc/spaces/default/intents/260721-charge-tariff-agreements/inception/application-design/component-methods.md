# Component Methods - W2-03 Charge Tariffs & Agreements

## Method Conventions

- Commands carry session/service-derived actor, correlation ID, idempotency key where applicable, and expected version for optimistic concurrency.
- Dates are explicit ISO business dates; pricing accepts only `requestedDepartureDate` and never substitutes the system date.
- Money uses `BigDecimal`, scale two, USD, and `RoundingMode.HALF_UP`; the existing v1 JSON `number` representation remains and is serialized directly from `BigDecimal` (never binary floating point).
- Query outputs are immutable records. Mutation methods return the committed aggregate/view or a typed error.
- `POST /api/bookings/{id}/price` remains the explicit first-price/reprice command; the existing reconfirm method is unchanged.

## Charge Domain Methods

| Component | Method | Input / output | Invariants and errors |
| --- | --- | --- | --- |
| `Rate` | `draft(id, versionId, command, actor, now)` | Creates stable aggregate/version | Known active references; category/charge-code pairing; dates; non-negative two-decimal USD. |
| `Rate` | `reviseDraft(versionId, expectedVersion, command, actor, now)` | Updated Draft | Draft only; optimistic conflict; immutable stable/version identities. |
| `Rate` | `approve(versionId, actor, now)` | Approved immutable version | Complete validity/applicability; repository overlap guard; valid state. |
| `Rate` | `successor(newVersionId, actor, now)` | New Draft version | Source Approved; prior version unchanged; monotonically increasing version number. |
| `RateVersion` | `matches(requestContext)` | boolean | OFR/BAF lane+equipment; THC origin+equipment only; inclusive window. |
| `Agreement` | `draft(id, versionId, command, actor, now)` | Draft agreement version | Known customer/matching references and inclusive validity. |
| `Agreement` | `linkRates(versionId, threeRateVersionIds, expectedVersion, actor, now)` | Updated Draft | Exactly one BASE, SURCHARGE, LOCAL; links Approved compatible covering versions. |
| `Agreement` | `approve(versionId, actor, now)` | Approved immutable version | Complete links; agreement overlap guard; all validations atomic. |
| `Agreement` | `successor(newVersionId, actor, now)` | New Draft | Prior immutable; copied links are explicit Draft inputs, not dynamic pointers. |
| `Agreement` | `suspend/expire(versionId, reason, actor, now)` | Lifecycle transition | Supported source state; excludes new pricing without deleting history. |
| `Money` | `multiply(quantity)` | rounded line Money | Quantity > 0; exact decimal; HALF_UP scale two. |
| `PricingCalculator` | `calculate(authority, request)` | `PricedResult` | Exactly three ordered lines; common USD; total is sum of rounded lines. |

## Charge Application Methods

| Method | Input | Output | Principal failure mapping |
| --- | --- | --- | --- |
| `createRate(CreateRateCommand)` | category, charge-code ID, unit rate, window, applicability | Rate detail | 400 malformed; 403 denied; 422 semantic validation. |
| `updateRateDraft(rateId, versionId, expectedVersion, command)` | Draft fields | Rate detail | 404 missing; 409 stale; 422 immutable/invalid. |
| `approveRate(rateId, versionId, command)` | actor context/reason | Rate detail | 409 stale version, existing/pre-committed overlap, or concurrent authority winner; 422 invalid lifecycle, applicability, or reference. |
| `createRateSuccessor(rateId, command)` | source version and optional Draft changes | Rate detail | 404; 409; 422 source not Approved. |
| `searchRates(RateSearchQuery)` | category/status/window/applicability/page | Rate page | 400 invalid query. |
| `rateDetail(rateId)` | stable ID | aggregate plus versions/audit | 404. |
| `createAgreement(CreateAgreementCommand)` | header, validity, exact links | Agreement detail | 400/403/422. |
| `updateAgreementDraft(agreementId, versionId, expectedVersion, command)` | Draft header/links | Agreement detail | 404/409/422. |
| `approveAgreement(agreementId, versionId, command)` | actor context/reason | Agreement detail | 409 concurrent overlap; 422 compatibility/coverage/state. |
| `createAgreementSuccessor(agreementId, command)` | source version and Draft values | Agreement detail | 404/409/422. |
| `suspendAgreement/expireAgreement(...)` | exact version, reason | Agreement detail | 404/409/422. |
| `searchAgreements(AgreementSearchQuery)` | customer/status/lane/date/page | Agreement page | 400. |
| `agreementDetail(agreementId)` | stable ID | versions, exact links, provenance | 404. |
| `requestPricing(PricingRequest, serviceActor)` | canonical request | itemised success or standard envelope | 404 `NO_RATE`; 422 `PRICING_VALIDATION`; 409 idempotency conflict/in-progress per contract; 403; 503. |
| `listManualCases(ManualCaseQuery)` | OPEN/reason/booking/date/page | evidence page | 403 or 400; no mutation methods in scope. |
| `manualCaseDetail(caseId)` | case ID | immutable request/outcome evidence | 403/404. |

### Pricing authority pseudocode

```text
claim(request.idempotencyKey, canonicalBodyHash)
if replayable terminal receipt exists: return it
validate requestedDepartureDate, references, and positive quantity
agreement = resolve exactly one approved matching agreement version
if agreement exists: versions = agreement.exactLinkedRateVersions
else: versions = resolve exactly one approved OFR + BAF + POL-THC tariff version
if a category/authority is missing: atomically create-or-get OPEN case and complete NO_RATE receipt
if ambiguity remains: atomically create-or-get OPEN case and complete PRICING_VALIDATION receipt
result = calculate exactly three lines and total
atomically persist terminal result receipt
return result
```

`resolve agreement` distinguishes zero from multiple. Multiple never falls through to tariff. Tariff resolution distinguishes missing from multiple. No branch returns partial lines.

## Repository Ports

| Port method | Purpose |
| --- | --- |
| `RateRepository.save(rate)` / `findById(id)` / `search(query)` | Aggregate persistence/read models. |
| `RateRepository.findApprovedCandidates(context, date)` | Category-aware effective candidates; application/domain performs final matching. |
| `RateRepository.approveUnderLock(version)` | In one transaction, acquire `pg_advisory_xact_lock(hashtextextended(rateApprovalKey,0))`, query inclusive Approved overlaps, and update Draft to Approved or return 409. |
| `AgreementRepository.save/findById/search/findApprovedCandidates` | Version history and agreement-first resolution. |
| `AgreementRepository.approveUnderLock(version)` | Same advisory-lock transaction using the W2 customer/lane/origin/destination/equipment key; validates exact links before the state update. Legacy commodity is not a discriminator. |
| `PricingReceiptRepository.claim/replay/complete` | Idempotency key/body hash ownership and immutable terminal response. |
| `ManualPricingCaseRepository.createOrGetOpen(request, reason)` | One OPEN case per terminal request identity/reason. |
| `ReferenceValidationPort.validate(typedChecks, correlationId)` | Field path + exact Reference Data set + requested stable ID + optional expected code; active/exact match without copied authority; typed provider failures fail closed. |
| `AuthorizationPort.allowed(subject, resource, action, correlationId)` | Least-privilege human/service authorization. Rate uses resource `charge-rates` and exact actions `read`, `create`, `update`, `approve`, `create-successor`. Agreement uses resource `charge-agreements` and exact actions `read`, `create`, `update`, `approve`, `create-successor`, `suspend`, `expire`. |
| `AuditRepository.append(event)` | Safe attributable mutation/result evidence. |

## REST and Published Contract Methods

| HTTP method/path | Application method | Notes |
| --- | --- | --- |
| `GET/POST /api/rates` | `searchRates/createRate` | Unified categories. |
| `GET/PUT /api/rates/{rateId}` | `rateDetail/updateRateDraft` | PUT requires exact Draft version and expected version. |
| `POST /api/rates/{rateId}/versions` | `createRateSuccessor` | New immutable version identity. |
| `POST /api/rates/{rateId}/versions/{versionId}/approve` | `approveRate` | No approval side effects on failure. |
| `GET/POST /api/charge-agreements` | `searchAgreements/createAgreement` | Preserves existing root. Default `application/json` remains the LEGACY DTO/query dialect; vendor `application/vnd.linercore.charge-agreement-v2+json` selects W2. |
| `GET/PUT /api/charge-agreements/{agreementId}` | `agreementDetail/updateAgreementDraft` | Same media split; W2 carries exact version ID and expected row version in payload. No cross-model fallback. |
| `POST /api/charge-agreements/{id}/versions` | `createAgreementSuccessor` | Additive endpoint. |
| `POST /api/charge-agreements/{id}/versions/{versionId}/approve` | `approveAgreement` | Exact authority. |
| Existing suspend/expire paths | corresponding transition | Preserve brownfield paths where already published; do not duplicate. |
| `POST /pricing-requests` | `requestPricing` | Sole booking-time authority; existing media type; additive response only. |
| `GET /api/manual-pricing-cases` and `/{caseId}` | evidence queries | Read-only W2-03 surface. |

Legacy agreement `actor` fields remain parseable for compatibility but never authorize; the trusted internal subject is required for both media dialects. V3 `authority_model` makes default-media readers LEGACY-only, lets vendor-media administrative reads expose LEGACY only as a discriminated noneligible history view, and keeps every vendor command/candidate W2-only. The existing `/active-lookup` remains default-media LEGACY behavior; U04 agreement-first pricing uses the internal W2 candidate port.

Agreement mutations retain the five existing lifecycle event types. The existing Avro record evolves additively to 1.1.0 with nullable/default-null `agreementVersionId`, `agreementVersionNo`, `authorityModel`, `sourceAgreementVersionId`, and `lifecycleAction`; topic/subjects and all 1.0.0 fields/types remain. State, activity, and existing outbox enqueue share one transaction-bound Charge datasource; publication occurs only in the post-commit relay.

### Exact canonical success shape

No existing v1 required field, enum value, or JSON type is removed or renamed. Additions are optional in OpenAPI for old-consumer validation, but a W2-03 provider 200 always emits the complete enriched set.

| Scope | Existing fields retained | Additive fields and W2-03 rule |
| --- | --- | --- |
| Request dates | required `effectiveDate`, required `requestedDepartureDate` | Resolution uses only requested departure. Effective date is deprecated compatibility input and must equal it; mismatch is 422 `PRICING_VALIDATION`. |
| Result | `bookingRef`, `pricingBasis`, `pricingRef`, `charges`, `applicableDndRuleTypes` | `total:number`, `currency`, `requestedDepartureDate`, `pricingRequestId`, `correlationId`, `pricedAt`, optional `agreementVersionId`. All except agreement ID are emitted on every W2-03 success. |
| Line | `chargeCode`, `category`, `amount:number`, `currency` | `rateCategory`, `basis`, `quantity`, `unitRate:number`, `sourceRateVersionId`; emitted on all three lines. |

OFR keeps legacy `category=FREIGHT` and adds `rateCategory=BASE`; BAF uses SURCHARGE for both; THC uses LOCAL for both. Numeric amounts stay `number`/`multipleOf: 0.01` backed by `BigDecimal`. Agreement `pricingRef` is its exact version ID. Tariff `pricingRef` is `TARIFF-` plus first 24 hex characters of SHA-256 over the three ordered source version IDs. Booking uses an enriched decoder only when every enriched field is present; absent means legacy decode, partial means malformed provider response. A divergent legacy quote endpoint receives no W2-03 behavior.

## Booking Methods

| Component | Method | W2-03 behavior |
| --- | --- | --- |
| `PricingPort` | existing `requestPricing(Booking, idempotencyKey, correlationId)` | Preserve the port; request includes requested departure date, amendment sequence and quantity; result becomes typed. |
| `ChargePricingPortAdapter` | existing `requestPricing(...)` | Stop flattening provider truth as the primary representation; map every line/total/source version and preserve typed failures. |
| `BookingApplicationService` | existing `requestPricing(id, actor, key, correlation)` | First price and explicit Reprice; enforce revision-aware key, append success snapshot, persist manual/failure evidence, never overwrite. |
| `Booking` | `pricingInputFingerprint()` | Stable fingerprint of every `pricing.request` field, excluding non-pricing amendments. |
| `Booking` | `amended(...)` | Advances amendment sequence and marks `REPRICE_REQUIRED` only when pricing fingerprint changes. |
| `Booking` | `appendPricingSnapshot(snapshot)` | Appends immutable typed snapshot and makes it current. |
| `Booking` | `manualPricing(evidence)` | Exact `MANUAL_PRICING_REQUIRED`; no total; blocks automatic confirmation. |
| `BookingSnapshotCodec` | `decode(payload)` / `encodeV2(snapshot)` | Decode legacy flattened rows; encode new typed itemisation without destructive rewrite. |
| `ChargePricingAvailabilityPolicy` | `executeSameRequest(call)` | Two-second timeout; Retry performs max 2 raw calls total for timeout/503 with same body/key; outer CircuitBreaker records one post-retry operation and opens after five consecutive failed operations (window 5, minimum 5, threshold 100%), then one half-open probe after 30s. |
| `Booking` | `recordOutageEvidence(reason, attempt, circuitState, request, correlation)` | Persist Booking-local manual-required outage after retry exhaustion or open circuit; no Charge OPEN case and no priced snapshot. |

Idempotency remains `bookingRef:amendmentSeq`; identical body replays, changed body conflicts. Existing `reconfirm(...)` remains lifecycle-only and never calls Charge implicitly.

## Charge BFF and UI Methods

| Method | Purpose |
| --- | --- |
| `listRates/searchAgreements/listManualCases(searchParams, session)` | Stable URL-driven query, session-derived subject, normalized paging/errors. |
| `create/update/approve/successor/suspend/expire(..., session)` | Validate form schema, generate/propagate correlation and idempotency, return field/global status. |
| `getRate/getAgreement/getManualCase(id, session)` | Route detail and audit/provenance view model. |
| `loadReferenceOptions(kind, query, session)` | Existing BFF/reference-data seam; async state and error conveyed accessibly. |
| `RateForm` / `AgreementForm` | Category/link-aware validation; Draft only; focus first error after failed submission. |
| `VersionHistory` | Stable prior/current selection without mutating labels/values. |
| `ManualPricingEvidence` | Read-only request, reason, correlation, timestamps; no workflow buttons. |

## Booking Frontend and BFF

The existing Booking price BFF proxies the explicit command with session/correlation/idempotency controls. `BookingPricingBreakdown` renders ordered line description/category, quantity, unit rate, line amount, USD total, basis/ref and source versions. It exposes current/prior snapshots and an explicit Reprice action only when pricing inputs changed. Manual/no-rate displays reason/request/correlation evidence and no numeric total.

## Error and Interaction Semantics

| Condition | Charge HTTP/code | Booking projection | UI behavior |
| --- | --- | --- | --- |
| Missing authority/category | 404 `NO_RATE` | `MANUAL_PRICING_REQUIRED` | Read-only manual evidence; no total. |
| Residual ambiguity | 422 `PRICING_VALIDATION` + reason | `MANUAL_PRICING_REQUIRED` | Distinct ambiguity copy; no total. |
| Denied | 403 standard code | denied | Keep entered data where safe; focus alert. |
| Malformed/semantic invalid | 400/422 | validation failure | Field/global mapping. |
| Idempotency conflict | 409 | conflict | Do not retry silently. |
| In progress | existing retry guidance | pending | Polite live status and allowed retry behavior. |
| First timeout/503 | preserved transient reason | one automatic idempotent retry using the identical key/body | Keep current view pending; no new snapshot. |
| Retry exhausted: timeout | no new Charge response | Booking `MANUAL_PRICING_REQUIRED`, reason `PRICING_TIMEOUT`, origin `BOOKING_OUTAGE` | Persist request/correlation/attempt evidence; block confirmation; no Charge case/price. |
| Retry exhausted: 503 | 503 `PRICING_UNAVAILABLE` | Booking `MANUAL_PRICING_REQUIRED`, origin `BOOKING_OUTAGE` | Same evidence rules; no Charge case/price. |
| Circuit open | call skipped until 30s half-open probe | Booking `MANUAL_PRICING_REQUIRED`, reason `PRICING_CIRCUIT_OPEN` | Persist circuit/opened-at/next-probe evidence; explicit later Reprice may probe. |

## Upstream Trace

Methods cover FR-101-FR-205 (versioned authority), FR-301-FR-307 (resolution/calculation), FR-401-FR-407 (contract/failures), FR-501-FR-507 (Booking snapshot/reprice), FR-601-FR-606 (UI), and NFR-002-NFR-005/NFR-009-NFR-010. Their acceptance behavior is expressed by US-02-US-13 and QC-01.
