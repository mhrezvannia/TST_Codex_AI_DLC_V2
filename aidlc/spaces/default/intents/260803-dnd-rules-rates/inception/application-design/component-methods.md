# Component Methods - W3-01 D&D Rules and Rates

## Traceability basis

The signatures below realize [requirements.md](../requirements-analysis/requirements.md) and [stories.md](../user-stories/stories.md) within the Java/TypeScript boundaries documented by [architecture.md](../../../../codekb/TST_Codex_W3-01/architecture.md), [component-inventory.md](../../../../codekb/TST_Codex_W3-01/component-inventory.md), and [team-practices.md](../practices-discovery/team-practices.md). UI input/state contracts follow [interaction-spec.md](../refined-mockups/interaction-spec.md). Types are design-level contracts; Functional Design may refine record layout without changing ownership or observable behavior.

## Domain interfaces

```java
enum DndRuleType {
  IMPORT_DEMURRAGE, IMPORT_DETENTION, EXPORT_DETENTION
}

record DndMovementBounds(
  String startMoveTypeCode,
  EmptyIndicator startQualifier,
  String endMoveTypeCode,
  EmptyIndicator endQualifier,
  PortSide applicableSide
) {
  static DndMovementBounds forRuleType(DndRuleType ruleType);
}

final class DndTerms {
  static DndTerms firstDraft(DndTermsId id, DndTermsVersion firstVersion);
  DndTerms withRevisedDraft(DndTermsVersion revised);
  DndTerms withApprovedVersion(DndTermsVersion approved);
  DndTerms withSuccessor(DndTermsVersion successor);
  Optional<DndTermsVersion> draft();
  List<DndTermsVersion> versions();
}

record DndTermsVersion(/* ids, lifecycle, basis, applicability, money,
                          effective window, lineage, actor/time/correlation */) {
  DndTermsVersion reviseDraft(DndTermsDraft draft, long expectedRowVersion,
                              ActorContext actor);
  DndTermsVersion approve(long expectedRowVersion, ActorContext actor);
  DndTermsVersion successor(DndTermsVersionId id, DndTermsDraft overrides,
                            ActorContext actor);
}

interface DndCalculator {
  DndCalculation calculate(DndTermsVersion terms, ZoneId portZone,
                           QualifiedMovement start, QualifiedMovement end,
                           Instant calculatedAt);
}
```

Domain construction rejects unsupported rule types, negative free days/rates, invalid currencies, inverted effective windows, arbitrary movement bounds, and Draft/Approved lifecycle violations. `DndCalculator` rejects mismatched bounds, invalid qualifiers, and end-before-start inputs with typed semantic failures; it never silently normalizes them.

## D&D terms application interface

```java
interface DndTermsUseCases {
  DndTermsViews.Detail create(DndTermsCommands.Create command);
  DndTermsViews.Detail updateDraft(DndTermsCommands.UpdateDraft command);
  DndTermsViews.Detail approve(DndTermsCommands.Approve command);
  DndTermsViews.Detail createSuccessor(DndTermsCommands.CreateSuccessor command);
  DndTermsViews.Detail detail(String dndTermsId, String dndTermsVersionId,
                              String subjectId, String correlationId);
  DndTermsViews.Page search(DndTermsSearchQuery query);
}
```

Command rules:

- `Create` carries rule type, exact pricing basis/reference/version, port, trade lane, equipment type, free days, flat rate, currency, charge code, effective window, subject, and correlation. Movement bounds and port side are derived.
- `UpdateDraft` includes stable terms id, version id, expected row version, editable commercial fields, subject, and correlation.
- `Approve` includes stable terms id, Draft version id, expected row version, subject, and correlation. Approval performs the overlap check and activity append in one transaction.
- `CreateSuccessor` requires an Approved source id and creates a new Draft with explicit overrides; it never edits the source.
- `detail` accepts a nullable immutable `dndTermsVersionId`; null selects the latest presentation version. A supplied version must belong to the requested aggregate, and a missing/mismatched version is `404 DND_TERMS_VERSION_NOT_FOUND`.
- `search` supports rule type, lifecycle/presentation state, port, trade lane, equipment type, pricing basis/reference, effective-as-of, free text, page, and bounded size.

Admin error mapping follows existing Rate conventions: missing identity `401`, denied capability `403`, malformed identifiers/request `400`, missing terms/version `404`, optimistic/draft conflicts `409`, semantic/reference/overlap violations `422`, and unavailable identity/reference/persistence `503`. Field errors use stable field paths consumed by `DndTermsForm`.

| HTTP | Administration code |
| --- | --- |
| 400 | `DND_TERMS_BAD_REQUEST`, `DND_TERMS_ID_INVALID`, or existing filter `RATE_ACTOR_SPOOF_REJECTED` |
| 401 | existing filter `RATE_SERVICE_IDENTITY_REQUIRED` or `RATE_ACTOR_REQUIRED` |
| 403 | existing application `RATE_ACCESS_DENIED` |
| 404 | `DND_TERMS_NOT_FOUND` or `DND_TERMS_VERSION_NOT_FOUND` |
| 409 | `DND_TERMS_VERSION_CONFLICT` or `DND_TERMS_DRAFT_EXISTS` |
| 422 | `DND_TERMS_VALIDATION`, `DND_TERMS_REFERENCE_INVALID`, `DND_TERMS_OVERLAP`, or `DND_PORT_TIME_ZONE_REQUIRED` |
| 503 | `DND_TERMS_UNAVAILABLE`, `REFERENCE_DATA_UNAVAILABLE`, or `IDENTITY_UNAVAILABLE` |

## Repository and external ports

```java
interface DndTermsRepository {
  void create(DndTerms terms, DndTermsActivity activity);
  DndTerms updateDraft(DndTerms stable, DndTermsVersion revised,
                       DndTermsActivity activity);
  DndTerms approveUnderLock(DndTerms stable, DndTermsVersion approved,
                            DndTermsActivity activity);
  DndTerms createSuccessor(DndTerms stable, DndTermsVersion source,
                           DndTermsVersion successor, DndTermsActivity activity);
  Optional<DndTerms> findById(DndTermsId id);
  Optional<DndTermsVersion> findExactApproved(DndTermsMatch exactMatch);
  List<ApplicableDndRuleType> findApplicableTriggers(DndTriggerQuery query);
  List<DndTermsRelationshipItem> findByAgreementVersion(
      AgreementVersionId versionId, int limit);
  SearchPage search(SearchCriteria criteria);
  List<DndTermsActivity> activities(DndTermsId id);
}

interface DndReferenceValidationPort {
  List<Violation> validate(ReferenceValidationRequest request);
}

interface DndPricingBasisEvidencePort {
  Optional<ValidatedBookingPricingEvidence> validateExact(
      EchoedBookingPricingEvidence evidence,
      String bookingRef,
      String correlationId);
}

interface PortTimeZoneProvider {
  Optional<ZoneId> activeZoneFor(String portLocationCode, String correlationId);
}

// Existing RateAuthorizationPort protects D&D terms administration.
// Existing W2-03 AuthorizationPort protects provider pricing.
```

`findExactApproved` matches every applicability dimension and the echoed `pricingEffectiveDate`; it cannot choose nearest/latest. The adapter maps no match, inactive match, and mismatch to the same fail-closed `NO_RATE` disposition required by FR-04. `PortTimeZoneProvider` validates `ZoneId.of(timeZoneId)` at the adapter boundary.

`DndPricingBasisEvidencePort` does not reuse or rename the brownfield `PricingAuthoritySnapshotPort`. It loads the immutable `STANDARD_PRICING` terminal receipt by `pricingRequestId`, parses the exact stored `pricing.v1` success, and compares booking reference, basis, reference, basis-version id, effective date, and source RateVersion ids. The receipt also supplies immutable typed `pol`, `pod`, `tradeLane`, and `equipmentType` evidence saved from the original pricing request; D&D compares echoed port by derived side plus trade/equipment exactly. Agreement evidence requires the preserved exact AgreementVersion; Tariff evidence requires the preserved ordered BASE/SURCHARGE/LOCAL versions whose existing deterministic composite reference equals the echoed basis-version id. Missing/incomplete pre-W3 receipt evidence returns empty and maps to `404 NO_RATE`.

```java
interface DndTriggerMetadataResolver {
  PricingResult enrichFreshPricing(
      PricingResult priced,
      ResolvedPricingAuthority authority,
      PricingRequest request);
}

record ApplicableDndRuleType(
    DndRuleType ruleType,
    String startMoveTypeCode,
    EmptyIndicator startEmptyIndicatorCode,
    String endMoveTypeCode,
    EmptyIndicator endEmptyIndicatorCode) {}
```

`enrichFreshPricing` sets structured trigger items, `pricingBasisVersionId`, and `pricingEffectiveDate` before `JacksonPricingTerminalRenderer.renderSuccess` and receipt completion. It orders rule types deterministically and treats duplicate applicable versions or repository failure as `PRICING_UNAVAILABLE`. A stored replay bypasses this method and returns its original bytes.

## Pricing use-case and receipt interfaces

```java
interface DndPricingUseCase {
  DndPricingTerminal evaluate(DndPricingCommand command);
}

record DndPricingCommand(
  String bookingRef,
  String equipmentId,
  String equipmentType,
  EchoedBookingPricingEvidence pricingEvidence,
  DndRuleType dndRuleType,
  String portLocationCode,
  String tradeLane,
  QualifiedMovement startMovement,
  QualifiedMovement endMovement,
  String serviceSubject,
  String correlationId
) {
  DndIdempotencyKey bilateralKey();
  String canonicalFingerprint();
}

record EchoedBookingPricingEvidence(
  String pricingRequestId,
  PricingBasis pricingBasis,
  String pricingRef,
  String pricingBasisVersionId,
  LocalDate pricingEffectiveDate) {}

record QualifiedMovement(
  String movementEventId,
  String moveTypeCode,
  EmptyIndicator emptyIndicatorCode,
  Instant eventDateTime) {}

interface DndPricingReceiptRepository {
  Optional<DndStoredReceipt> find(DndIdempotencyKey key);
  boolean insertClaim(DndPricingClaim claim, Duration lease);
  boolean takeOverExpiredClaim(DndIdempotencyKey key, String ownerToken,
                               Duration lease);
  CompletionResult completeOwned(DndOwnedCompletion completion);
  boolean releaseOwned(DndIdempotencyKey key, String ownerToken);
}

interface PricingRequestRepository {
  // Existing W2 methods remain unchanged.
  boolean releaseOwned(String idempotencyKey, String ownerToken);
}
```

The repository always uses operation namespace `DND_PRICING`. `completeOwned` uses database time and an owner-token compare-and-set in the same transaction as the immutable response snapshot and success evidence. Its result is either `completed(receipt)` or `staleOwner`; it cannot return a partially written line. `releaseOwned` deletes only the matching namespace/key/owner row in `IN_PROGRESS`. Every handled post-claim error records attempt evidence and releases before response; a stale release reclassifies the winner.

The additive `PricingRequestRepository.releaseOwned` method is distinct and always qualifies `STANDARD_PRICING`. `PricingApplicationService` calls it only when fresh W3 trigger enrichment fails after the existing Standard claim is owned and before terminal rendering/completion. A false result requires winner reclassification; a true result permits immediate retry. Crashes retain the bounded lease/takeover behavior.

## Exact D&D provider schema

The media type is `application/vnd.api.v1+json`. Required transport headers are:

- `Idempotency-Key` (1..512 safe visible characters);
- `X-Correlation-Id` (1..128 safe visible characters);
- existing `X-LinerCore-Service-Id` and `X-LinerCore-Service-Token` pricing boundary headers.

The bilateral tuple uses `bookingRef` as the current platform booking identity. Its exact header encoding is unambiguous and length-prefixed:

```text
dnd:v1|<bookingRef UTF-8 byte length>:<bookingRef>|
       <equipmentId UTF-8 byte length>:<equipmentId>|
       <endMovement.movementEventId UTF-8 byte length>:<endMovement.movementEventId>
```

The actual value is one line with no whitespace/newline. The provider derives it and requires byte-for-byte equality with `Idempotency-Key`; mismatch is `400 PRICING_BAD_REQUEST`. Each identifier is nonblank, control-character-free, and at most 128 UTF-8 bytes.

`DndPricingRequest` has `additionalProperties: false` and requires exactly:

| Field | Constraint |
| --- | --- |
| `bookingRef`, `equipmentId`, `equipmentType` | nonblank, max 128; equipment id is the platform/ISO 6346 identity where applicable |
| `pricingRequestId` | exact W2 terminal receipt/idempotency identity, max 160 |
| `pricingBasis` | `AGREEMENT` or `TARIFF` |
| `pricingRef`, `pricingBasisVersionId` | nonblank, max 128; echoed from fresh `pricing.result` |
| `pricingEffectiveDate` | ISO local date echoed from fresh `pricing.result` |
| `dndRuleType` | one of the three fixed values |
| `portLocationCode` | uppercase UN/LOCODE pattern `^[A-Z]{2}[A-Z0-9]{3}$` |
| `tradeLane` | nonblank canonical Reference Data code, max 128 |
| `startMovement`, `endMovement` | `movementEventId`, enumerated code, required EMPTY/LADEN qualifier, RFC 3339 instant; end id is the closing event id |

The SHA-256 fingerprint is over a version tag plus every required body field in the table above, in schema order, using the same UTF-8 byte-length-prefix encoding; enums are their uppercase wire values, the date is ISO `yyyy-MM-dd`, and instants are parsed then rendered with `Instant.toString()`. It excludes idempotency/correlation/service headers. Semantically identical timestamp offsets therefore hash identically; any business-field change conflicts.

`DndPricingResult` has `additionalProperties: false` and requires:

- `dndPricingRequestId`, `bookingRef`, `equipmentId`, and closing movement event id;
- `pricingBasis`, `pricingRef`, `pricingBasisVersionId`, `pricingEffectiveDate`;
- `dndRuleType`, `portLocationCode`, `portTimeZoneId`;
- exact `dndTermsId`, `dndTermsVersionId`, predecessor/source basis version evidence;
- `calculatedAt`, `correlationId`;
- exactly one `charges` item with `chargeCode`, `currency`, `freeDays`, `elapsedDays`, `chargeableDays`, `flatDailyRate`, and `amount` (two-decimal non-negative money).

The zero-within-free-time response retains the one item with `chargeableDays=0` and `amount=0.00`. Agreement and Tariff both use the unified `pricingBasisVersionId`; no inapplicable source id is fabricated.

`evaluate` returns or throws only the provider outcomes below:

| HTTP | Code | Application condition |
| --- | --- | --- |
| 200 | `DND_PRICED` | New or replayed immutable zero/non-zero result |
| 400 | `PRICING_BAD_REQUEST` | Malformed/unsupported request shape or missing required identity field |
| 401 | approved W2-03 authentication code | No valid identity |
| 403 | approved W2-03 denial code | Existing `charge-agreement:price` provider decision denied |
| 404 | `NO_RATE` | Unknown, inactive, mismatched, or inapplicable exact basis/rate evidence |
| 409 | `IDEMPOTENCY_CONFLICT` | Same bilateral key, different canonical fingerprint |
| 409 | `PRICING_IN_PROGRESS` | A non-expired owner holds the claim |
| 422 | `PRICING_VALIDATION` | Invalid fixed pair, qualifier, timestamp order, or semantic value |
| 503 | `PRICING_UNAVAILABLE` | Required provider, persistence, identity, or reference authority unavailable |

Concrete identity codes are `401 PRICING_SERVICE_IDENTITY_REQUIRED` and `403 PRICING_FORBIDDEN`. Deterministic precedence follows the implementable servlet chain exactly: the extended `PricingServiceIdentityFilter` first rejects legacy actor/subject assertion spoofing (`400 PRICING_IDENTITY_SPOOF_REJECTED`), then missing/wrong trusted service id or token (`401 PRICING_SERVICE_IDENTITY_REQUIRED`), then missing/unsafe `X-Correlation-Id` (`400 PRICING_CORRELATION_INVALID`). Only after the filter succeeds may controller negotiation/validation reject media type, `Idempotency-Key`, or JSON/schema shape (400), followed by application `charge-agreement:price` authorization (`403 PRICING_FORBIDDEN`), idempotency replay/conflict/in-progress (200/409), exact receipt/basis/rate/applicability evidence (404), pair/qualifier/order semantics (422), dependency/persistence/audit unavailability (503), and success (200). Media-type or body validation never precedes the security filter. All branches expose bounded correlation/attempt evidence where available and persist no failed `DndCalculation`.

## REST surface

```text
GET    /api/charge-dnd-terms
POST   /api/charge-dnd-terms
GET    /api/charge-dnd-terms/{dndTermsId}?version={dndTermsVersionId}
PUT    /api/charge-dnd-terms/{dndTermsId}/versions/{versionId}
POST   /api/charge-dnd-terms/{dndTermsId}/versions/{versionId}/approve
POST   /api/charge-dnd-terms/{dndTermsId}/versions/{versionId}/successor
GET    /api/charge-dnd-terms/relationships/agreement-versions/{agreementVersionId}
GET    /api/charge-dnd-terms/{dndTermsId}/audit
GET    /api/charge-dnd-terms/audit?attemptId={attemptId}&correlationId={correlationId}&...
POST   /dnd-pricing-requests
```

Admin endpoints carry expected row version on Draft mutations and preserve the established Charge error envelope. `POST /dnd-pricing-requests` uses the additive `pricing.dnd-request` and `pricing.dnd-result` schemas. The existing `/pricing-requests` methods and required fields are unchanged.

## Web/BFF interfaces

```ts
type DndTermsActions = {
  canEdit: boolean;
  canApprove: boolean;
  canCreateSuccessor: boolean;
};

type DndTermsListQuery = {
  q?: string;
  ruleType?: "IMPORT_DEMURRAGE" | "IMPORT_DETENTION" | "EXPORT_DETENTION";
  port?: string;
  lifecycle?: "DRAFT" | "APPROVED";
  effectiveState?: "SCHEDULED" | "EFFECTIVE" | "EXPIRED";
  sort: "updatedAt:desc" | "updatedAt:asc";
  page: number; // one-based
  size: 25 | 50;
};

async function listDndTerms(query: DndTermsListQuery): Promise<DndTermsPage>;
async function getDndTerms(id: string, version?: string): Promise<DndTermsDetailComposition>;
async function getAgreementVersionDndTerms(
  agreementId: string,
  agreementVersionId: string
): Promise<DndAgreementRelationshipState>;
async function createDndTerms(input: DndTermsDraftInput): Promise<MutationResult>;
async function updateDndTermsDraft(id: string, input: DndTermsDraftInput,
                                   expectedRowVersion: number): Promise<MutationResult>;
async function approveDndTerms(id: string, versionId: string,
                               expectedRowVersion: number): Promise<MutationResult>;
async function createDndTermsSuccessor(id: string, sourceVersionId: string,
                                       input: DndTermsDraftInput): Promise<MutationResult>;
```

List defaults are `sort=updatedAt:desc&page=1&size=25`; the provider tie-breaker is always `dndTermsId ASC`. `version` directly selects an immutable historical version; edit mode is valid only for the current Draft. The selected existing AgreementVersion route is `/charge-agreements/agreements/[agreementId]?version=<agreementVersionId>`; omitting `version` uses the current presentation version. `DndTermsDetailComposition` carries required core detail plus discriminated `pricingAuthority` and `audit` states (`ready`, `denied`, `unavailable`) so a scoped failure does not erase known terms. `DndAgreementRelationshipState` is exactly `ready(items)`, `empty`, `denied` (no count/data), or `unavailable(correlationId)`.

The BFF forwards the authenticated server session and correlation header, applies bounded timeouts, never exposes service credentials, and preserves field-error paths. UI forms validate on blur and submit, retain entered values after rejection, disable duplicate submission while pending, announce success/error, and restore focus. The shared `Dialog` dependency must be delivered by the UI platform before integration; no local fork is allowed.

## Observability methods

```java
interface DndPricingTelemetry {
  Timer.Sample start();
  void record(Timer.Sample sample, DndOutcome outcome);
}

interface DndEvaluationEvidenceRepository {
  void append(DndEvaluationEvidence evidence);
  Optional<DndEvaluationEvidenceView> findByAttemptId(
      String attemptId, ActorContext actor);
  Page<DndEvaluationEvidenceView> findByTermsId(
      DndTermsId termsId, int page, int size, ActorContext actor);
  Page<DndEvaluationEvidenceView> search(
      DndEvaluationEvidenceQuery query, ActorContext actor);
}
```

`DndEvaluationEvidenceQuery` accepts one or more bounded filters: `attemptId`, `correlationId`, `bookingRef`, `equipmentId`, `closingMovementEventId`, `dndTermsId`, `outcome`, `from`, `to`, `page`, and `size`; at least one selective identity or a bounded time range is required. Attempt id is unique. The persistence design indexes correlation/time, booking/equipment/closing-event/time, outcome/time, and nullable terms-id/time. Terms lifecycle activity is persisted transactionally in `dnd_terms_activity`. Evaluation evidence is persisted in `dnd_pricing_attempts`; new success evidence commits with receipt completion, while replay/rejected outcomes append before response. Read access requires `charge-rates:read` and never leaks denied counts. Malformed, authentication, idempotency, conflict, and no-rate attempts remain queryable even when no terms id was resolved. No W3-01 deletion/purge method exists. Labels are bounded to operation, rule type, replay/new, and outcome category. Booking ids, equipment ids, movement event ids, pricing references, raw payloads, and idempotency keys are not metric labels. Audit evidence is disposition-specific as defined by US-04 AC3 and excludes secrets and unnecessary commercial payloads; absent source ids remain absent.
