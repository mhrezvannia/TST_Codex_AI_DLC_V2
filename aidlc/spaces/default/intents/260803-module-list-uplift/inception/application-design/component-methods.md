# Component Methods - W4-01 Module List-Detail Uplift

## Sources and Contract Rule

These seams implement approved `requirements.md` and `stories.md`, preserve the brownfield boundaries in `architecture.md` and `component-inventory.md`, and follow `team-practices.md`. They are architectural contracts. Field-level provider payload schemas remain owned by their existing OpenAPI/media-type contracts; W4 does not create a universal result or DTO migration.

Every public BFF read returns `ReadResult<T>`. Every public BFF mutation returns `MutationResult<T>`. Trusted identity, correlation, and idempotency are separate from browser-editable data.

## Shared Type Catalog

```typescript
type IsoInstant = string;
type CorrelationId = string;
type StableId = string;
type PageNumber = number; // browser one-based; BFF converts to provider zero-based
type PageSize = 25 | 50 | 100;

type Capability =
  | "booking:read"
  | "reference-data:read" | "reference-data:create" | "reference-data:update"
  | "charge-agreements:read" | "charge-agreements:create" | "charge-agreements:update"
  | "charge-agreements:approve" | "charge-agreements:create-successor"
  | "charge-agreements:suspend" | "charge-agreements:expire"
  | "charge-rates:read" | "charge-rates:create" | "charge-rates:update"
  | "charge-rates:approve" | "charge-rates:create-successor"
  | "charge-manual-cases:read"
  | "container-movement:read" | "container-movement:capture";

interface AuthenticatedRequestContext {
  subjectId: string;
  sessionId: string;
  correlationId: CorrelationId;
}

type PolicyDecision =
  | { kind: "allowed"; capabilities: readonly Capability[] }
  | { kind: "denied"; reason: "EXPLICIT_DENY" }
  | { kind: "unavailable"; reason: "IDENTITY_UNAVAILABLE"; reference?: string };

type ReadResult<T> =
  | { kind: "ok"; value: T }
  | { kind: "invalid-query"; issues: readonly FieldIssue[] }
  | { kind: "not-found" }
  | { kind: "denied" }
  | { kind: "stale"; value: T; dataUpdatedAt: IsoInstant; dependency: string }
  | { kind: "unavailable"; retryable: boolean; reason: string; reference?: string };

interface FieldIssue { field: string; code: string; message: string }

type MutationResult<T> =
  | { kind: "accepted"; value: T }
  | { kind: "validation"; issues: readonly FieldIssue[]; replacementAttemptToken?: string }
  | { kind: "conflict"; code: string; currentLifecycle?: string; requiredNextMove?: string; reference?: string; replacementAttemptToken?: string }
  | { kind: "denied" }
  | { kind: "unavailable"; outcomeKnown: boolean; recovery: "RETRY" | "REFETCH"; reference?: string };

interface PageVm<T> {
  items: readonly T[];
  page: PageNumber;
  size: PageSize;
  returned: number;
  hasNext?: boolean;
}
```

`container-movement:read` and `container-movement:capture` are the proposed exact Identity capabilities. They remain a named Identity/platform dependency until registered and tested; no coarse or `local-user` substitute is allowed. The shell's existing Charge spelling mismatch (`charge-agreement:read`) must be removed in favor of the BFF resource contract `charge-agreements:read` during the shared registry change.

## Canonical Shell and Edge Contract

```typescript
type ModuleKey = "home" | "booking" | "reference-data" | "charge-agreements" | "container-movement";
type CanonicalPrefix = "/" | "/booking" | "/reference-data" | "/charge-agreements" | "/container-movement";

interface ShellRouteRegistration {
  module: ModuleKey;
  prefix: CanonicalPrefix;
  label: string;
  order: number;
  readCapability?: Capability;
  upstream: "apps-shell" | "apps-reference-data" | "apps-charge-agreements" | "apps-container-movement";
}

interface PlatformShellProps {
  session: { subject: string; displayName?: string; permissions: readonly Capability[] };
  activeModule: ModuleKey;
  breadcrumbs: readonly { label: string; href?: string }[];
  routes: readonly ShellRouteRegistration[];
  children: React.ReactNode;
}

interface ShellRouteRegistry {
  visibleRoutes(capabilities: readonly Capability[]): readonly ShellRouteRegistration[];
  resolve(pathname: string): ShellRouteRegistration | null;
}
```

W2-02 owns one `PlatformShell` implementation and registry contract in `@erp/ui`/platform configuration. `apps/shell`, Reference, Charge, and CMM each render that same shared component at their root layout; none implements rail, top bar, mobile navigation, skip link, theme root, or auth chrome locally. Edge routing chooses the Next.js app; it does not attempt to wrap remote HTML.

All three domain apps use `basePath` equal to the canonical prefix, and Nginx preserves the full URI. Next assets therefore remain under `/<module>/_next/*`. Direct load and refresh return a complete document with the one shared shell implementation. Session cookies remain host-wide with `Path=/`.

Every public Nginx location includes one platform-owned executable header policy. It clears this exact inbound set with `proxy_set_header <name> ""`: `Authorization`, `Idempotency-Key`, `X-Actor-Subject`, `X-Actor-Subject-Id`, `X-Correlation-Id`, `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-LinerCore-Service-Id`, `X-LinerCore-Service-Token`, and `X-LinerCore-Subject-Assertion`. It then sets `Host $http_host`, `X-Forwarded-Host $http_host`, `X-Forwarded-Proto $scheme`, `X-Forwarded-For $proxy_add_x_forwarded_for`, and `X-Correlation-Id $request_id`. Cookie and ordinary browser representation headers use normal Nginx proxy forwarding. Internal BFF-to-service calls do not traverse these public locations and create their own trusted headers.

## Safe Return Contract

```typescript
interface SafeReturnContext { returnTo: string; focus?: string }
type CrossModuleOrigin =
  | { kind: "booking-detail"; bookingId: StableId; href: string }
  | { kind: "journey-detail"; journeyId: StableId; href: string };

interface SafeReturnPolicy {
  parseListReturn(raw: string | null, module: "reference" | "charge" | "cmm" | "booking", fallback: string): SafeReturnContext;
  issueOrigin(context: AuthenticatedRequestContext, origin: CrossModuleOrigin, target: "booking" | "cmm"): string;
  parseOrigin(context: AuthenticatedRequestContext, token: string | null, expectedTarget: "booking" | "cmm"): CrossModuleOrigin | null;
}
```

Decoded `returnTo` is at most 2,048 characters and must be relative, same-shell, and under the invoking module's canonical list prefix. Schemes, hosts, protocol-relative paths, backslashes, control characters, encoded separators, traversal segments, duplicate keys, and unknown query keys are rejected. Allow-lists are: Reference `setCode,includeInactive,page,size,focus`; Charge `customerId,tradeLaneId,commodityId,status,validOn,includeInactive,page,size,focus`; CMM `limit,focus`; Booking has no W4 list-query keys beyond `focus`.

Cross-module Booking/Journey links do not carry arbitrary `returnTo`. The source BFF issues a signed, URL-safe origin token capped at 512 characters and ten minutes, bound to session subject, exact source kind/record ID/canonical href, and expected target module. Journey-to-Booking uses `{kind:"journey-detail", journeyId, href:"/container-movement/journeys/<id>"}`; Booking-to-Journey uses `{kind:"booking-detail", bookingId, href:"/booking/<id>"}`. The target BFF verifies the token before rendering a Back link; missing, invalid, or expired tokens fall back to the target canonical root. This covers Booking-origin context for US-012 and US-014 without accepting a cross-module open redirect.

## Identity Policy Adapter

```typescript
interface IdentityPolicyPort {
  authorize(context: AuthenticatedRequestContext, capability: Capability, resourceId?: StableId): Promise<PolicyDecision>;
}
```

The adapter distinguishes deny from Identity outage, but both prevent provider access. Mutation authorization is independent of read authorization and is repeated server-side on every command.

## Reference Data BFF

```typescript
interface ReferenceSetRowVm { setCode: string; label: string; description?: string }
interface ReferenceRecordRowVm { id: StableId; code?: string; displayName: string; status: string; version: number }
interface ReferenceRecordDetailVm extends ReferenceRecordRowVm { setCode: string; attributes: readonly { name: string; value: string }[]; history: readonly { action: string; occurredAt: IsoInstant; actor?: string }[] }
type ReferenceSetListVm = { items: readonly ReferenceSetRowVm[] };
type ReferenceRecordPageVm = PageVm<ReferenceRecordRowVm>;
interface ReferenceRecordQuery { setCode: string; includeInactive: boolean; page: PageNumber; size: PageSize; returnContext?: SafeReturnContext }
interface CreateReferenceRecordInput { setCode: string; code?: string; displayName: string; attributes: Readonly<Record<string, string>> }
interface UpdateReferenceRecordInput extends CreateReferenceRecordInput { version: number }

interface ReferenceDataBff {
  listSets(context: AuthenticatedRequestContext): Promise<ReadResult<ReferenceSetListVm>>;
  listRecords(context: AuthenticatedRequestContext, query: ReferenceRecordQuery): Promise<ReadResult<ReferenceRecordPageVm>>;
  getRecord(context: AuthenticatedRequestContext, setCode: string, recordId: StableId): Promise<ReadResult<ReferenceRecordDetailVm>>;
  createRecord(context: AuthenticatedRequestContext, input: CreateReferenceRecordInput): Promise<MutationResult<ReferenceRecordDetailVm>>;
  updateRecord(context: AuthenticatedRequestContext, recordId: StableId, input: UpdateReferenceRecordInput): Promise<MutationResult<ReferenceRecordDetailVm>>;
}
```

Set list has no query controls. Record list permits only `includeInactive`, page, and size. Search/selectable sort and deactivate/reactivate remain absent until exact provider and action-policy contracts pass.

## Charge Agreements BFF

```typescript
type AgreementTab = "summary" | "rates" | "dnd" | "history";
interface AgreementQuery { customerId?: StableId; tradeLaneId?: StableId; commodityId?: StableId; status?: string; validOn?: string; includeInactive?: boolean; page: PageNumber; size: PageSize }
interface RateQuery { q?: string; category?: string; lifecycle?: string; asOf?: string; originId?: StableId; destinationId?: StableId; equipmentTypeId?: StableId; page: PageNumber; size: PageSize }
interface ApprovalQuery { page: PageNumber; size: PageSize }
interface ManualPricingQuery { reasonCode?: string; bookingRef?: string; openedFrom?: string; openedTo?: string; page: PageNumber; size: 25 }
interface AgreementRowVm { id: StableId; agreementNumber: string; customerId: StableId; status: string; version: number }
interface AgreementDetailVm extends AgreementRowVm { tabs: readonly AgreementTab[]; rateVersionIds: readonly StableId[] }
interface RateRowVm { id: StableId; version: number; category: string; lifecycle: string }
interface RateDetailVm extends RateRowVm { agreementId?: StableId; history: readonly { action: string; occurredAt: IsoInstant }[] }
interface ApprovalCandidateVm { id: StableId; kind: "agreement" | "rate"; status: string; href: string }
interface ManualPricingEvidenceVm { id: StableId; bookingRef: string; reasonCode: string; openedAt: IsoInstant }
type AgreementPageVm = PageVm<AgreementRowVm>;
type RatePageVm = PageVm<RateRowVm>;
type ApprovalPageVm = PageVm<ApprovalCandidateVm>;
type ManualPricingPageVm = PageVm<ManualPricingEvidenceVm>;
interface AgreementDraftInput { customerId: StableId; tradeLaneId: StableId; commodityId: StableId; validFrom: string; validTo?: string; commercialTerms: Readonly<Record<string, string | number | boolean>> }
type AgreementLifecycleCommand = { action: "approve" | "suspend" | "expire"; version: number };

interface ChargeAgreementsBff {
  listAgreements(context: AuthenticatedRequestContext, query: AgreementQuery): Promise<ReadResult<AgreementPageVm>>;
  getAgreement(context: AuthenticatedRequestContext, agreementId: StableId, tab: AgreementTab): Promise<ReadResult<AgreementDetailVm>>;
  createAgreement(context: AuthenticatedRequestContext, input: AgreementDraftInput): Promise<MutationResult<AgreementDetailVm>>;
  updateDraft(context: AuthenticatedRequestContext, agreementId: StableId, version: number, input: AgreementDraftInput): Promise<MutationResult<AgreementDetailVm>>;
  createSuccessor(context: AuthenticatedRequestContext, agreementId: StableId, version: number): Promise<MutationResult<AgreementDetailVm>>;
  executeLifecycle(context: AuthenticatedRequestContext, agreementId: StableId, command: AgreementLifecycleCommand): Promise<MutationResult<AgreementDetailVm>>;
  listRates(context: AuthenticatedRequestContext, query: RateQuery): Promise<ReadResult<RatePageVm>>;
  getRateVersion(context: AuthenticatedRequestContext, rateId: StableId, version?: number): Promise<ReadResult<RateDetailVm>>;
  listApprovalCandidates(context: AuthenticatedRequestContext, kind: "agreements" | "rates", query: ApprovalQuery): Promise<ReadResult<ApprovalPageVm>>;
  listManualPricingEvidence(context: AuthenticatedRequestContext, query: ManualPricingQuery): Promise<ReadResult<ManualPricingPageVm>>;
}
```

```typescript
type ReferenceOptionKind =
  | "customer" | "trade-lane" | "commodity" | "location"
  | "equipment-type" | "charge-code";
interface ChargeReferenceOptionQuery {
  domain: "agreements" | "rates";
  kind: ReferenceOptionKind;
  q?: string;
}
interface ChargeReferenceOptionVm { id: StableId; code?: string; label: string }
interface ChargeReferenceOptionsVm { options: readonly ChargeReferenceOptionVm[]; returned: number }

interface ChargeReferenceOptionsPort {
  listActiveOptions(
    context: AuthenticatedRequestContext,
    query: ChargeReferenceOptionQuery
  ): Promise<ReadResult<ChargeReferenceOptionsVm>>;
}
```

The browser calls `GET /charge-agreements/api/reference-options` with exactly one `domain`, one `kind`, and optionally one `q`; duplicate or unknown keys return `invalid-query`/HTTP 400. The trimmed `q` is at most 128 characters. The Charge BFF first requires `charge-agreements:read` or `charge-rates:read` according to `domain`, then calls `GET /reference-sets/{mappedSet}/records?includeInactive=false&page=0&size=50` with the existing fixed Reference service ID/token and correlation header. The result is at most 50 ACTIVE `{id,code?,label}` options; malformed payload or provider failure maps to `unavailable`, deny to `denied`, and no match is a successful empty list. No app import, broad client merge, or mutation exists.

Approval Queue admission is conditional: both Agreement Draft/pending and Rate Draft/pending filters plus bounded pagination must be provider-tested. If either is absent, the corresponding segment returns `unavailable` and no client merge occurs. The Charge BFF's Reference option call is an explicit service-to-service contract using existing service credentials and bounded active-record lookup.

## Container Movement V2 Provider Contract

Existing default JSON remains unchanged. W4 adds opt-in media type `application/vnd.linercore.container-journey-v2+json` on the same GET endpoints and `application/vnd.linercore.container-movement-command-v2+json` on capture. V2 reads require a verified `X-LinerCore-Subject-Assertion`; v2 capture accepts `Idempotency-Key` and `X-Correlation-Id` headers. The v2 JSON body contains only `eventCode`, `locationId`, and `occurredAt`; it has no actor, idempotency, correlation, container, or lifecycle field.

```typescript
type CanonicalMove = "GTOT" | "LOAD" | "DISC" | "GTIN" | "OTHER";
type TimelineDisposition = "PLANNED" | "RECORDED";

interface JourneyTimelineItemV1 {
  order: number;
  canonicalCode: CanonicalMove;
  readableLabel: string;
  disposition: TimelineDisposition;
  expectedSequence?: string;
  providerMoveCode?: string;
  sourceEventType?: string;
  expectedLocationId?: StableId;
  actualLocationId?: StableId;
  occurredAt?: IsoInstant;
  receivedAt?: IsoInstant; // null/absent in W4 because current Journey state has no authority
  source?: string;         // null/absent in W4 for the same reason
  eventId?: StableId;
  correlationId?: CorrelationId;
  validationOutcome: "NOT_APPLICABLE" | "ACCEPTED" | "LEGACY_ACCEPTED";
  orderingBasis: "CANONICAL_STAGE_ORDER" | "ACCEPTED_HISTORY_POSITION" | "LEGACY_HISTORY_POSITION";
}

interface JourneyTimelineV1 { schemaVersion: "journey-timeline-v1"; items: readonly JourneyTimelineItemV1[] }
interface JourneyProviderV2 {
  id: StableId; bookingId: StableId; bookingRevision: number; containerId: StableId; status: string;
  expectedMovements: readonly unknown[]; history: readonly unknown[]; updatedAt: IsoInstant;
  freshness: string; dataUpdatedAt: IsoInstant; captureDisabledReason?: string; captureEnabled: boolean;
  dependency: string; checkedAt: IsoInstant; timelineV1: JourneyTimelineV1;
}
```

Provider merge rules are deterministic:

1. Canonical stage order is GTOT, LOAD, DISC, GTIN. `GTOT` and `ACT_GTOT` map to GTOT; `ACT_LOAD`, `ACT_DISC`, and `ACT_GTIN` map to LOAD, DISC, and GTIN.
2. LOAD/DISC expected locations come from current expected movements. GTOT inherits LOAD's expected location; GTIN inherits DISC's. Missing expected location stays absent and is never guessed in the BFF.
3. Every accepted history record is retained. Current canonical events occupy their canonical stage in accepted-history order. A planned item is emitted only when that canonical stage has no accepted record.
4. Repeated legacy records are not silently deduplicated. They remain separate `LEGACY_ACCEPTED` records. Unsupported legacy event types become `OTHER`, are labelled by a producer allow-list, and follow the four canonical stages in original history order; they never advance next-move truth.
5. Recorded items carry actual location, occurrence, event ID, and correlation from history. Planned items carry expected location/sequence only. `receivedAt` and `source` are deliberately absent until the provider owns those facts. UI must not label them unavailable facts as values.
6. Provider tests assert stable ordering, all-history retention, missing expected evidence, repeated legacy evidence, and compatibility. BFF/browser tests assert no local merge, dedupe, next-move, or lifecycle calculation.

## Container Movement BFF and Capture Attempt

```typescript
interface JourneyRecentRowVm { journeyId: StableId; bookingId: StableId; containerId: StableId; status: string; latestAccepted?: JourneyTimelineItemV1; freshness: string; dataUpdatedAt: IsoInstant }
interface JourneyRecentVm { items: readonly JourneyRecentRowVm[]; returned: number; limit: 25 | 50 | 100 }
interface JourneyDetailVm { provider: JourneyProviderV2; captureAttemptToken?: string }
interface CaptureMovementInput { eventCode: "GTOT" | "LOAD" | "DISC" | "GTIN"; locationId: StableId; occurredAt: IsoInstant; captureAttemptToken: string }

interface ContainerMovementBff {
  listRecent(context: AuthenticatedRequestContext, limit: 25 | 50 | 100): Promise<ReadResult<JourneyRecentVm>>;
  getJourney(context: AuthenticatedRequestContext, journeyId: StableId): Promise<ReadResult<JourneyDetailVm>>;
  captureMovement(context: AuthenticatedRequestContext, journeyId: StableId, input: CaptureMovementInput): Promise<MutationResult<JourneyDetailVm>>;
}
```

After read and action ALLOW, the BFF issues a short-lived signed `captureAttemptToken` bound to subject, journey ID, provider `updatedAt`, action, and a server-generated random idempotency key. The browser may only echo the opaque token. The BFF verifies signature, expiry, subject, journey, and action, then forwards its embedded key as `Idempotency-Key`, derives correlation from request context, and issues a 30-second method/path/correlation-bound subject assertion using the existing Charge-style assertion pattern. Definitive validation/conflict returns a replacement token; an unknown outcome retains the original token and requires authoritative refetch before any retry. No cache or BFF database is added.

The internal service is not exposed directly by Nginx. V2 controller mapping verifies the assertion and maps its subject plus trusted headers into the existing application command. Existing v1 actor-shaped contracts remain only for current internal compatibility and are not callable from the W4 browser route.

## Booking Journey Relationship

```typescript
type BookingJourneyRelationshipValue =
  | { kind: "present"; journeyId: StableId; containerId: StableId; href: string }
  | { kind: "not-created" };

interface BookingJourneyRelationshipBff {
  resolveForBooking(context: AuthenticatedRequestContext, bookingId: StableId): Promise<ReadResult<BookingJourneyRelationshipValue>>;
}
```

This adapter lives beside `apps/shell/app/booking/[bookingId]/page.tsx` and its shell Booking client. It calls the authorized CMM v2 lookup with exact `bookingId`; it does not move the canonical Booking page into `apps/booking` or infer a Journey ID from projected statuses.

## Transport Mapping

| Result | HTTP | Route behavior |
| --- | --- | --- |
| read `ok` / `stale` | 200 | Render truth; stale includes source/time and disables freshness-dependent action |
| `invalid-query` | 400 | Show or canonicalize supported controls; provider is not called |
| `denied` | 403 | Shared denied state, no provider data flash |
| `not-found` | 404 | Route-owned not-found |
| validation | 422 | Retain values, linked errors, replacement attempt token |
| duplicate/out-of-sequence/conflict | 409 | Provider code/current lifecycle/required next/reference; no advancement |
| unavailable, known no mutation | 502/503/504 | Safe Retry according to dependency classification |
| unavailable, unknown mutation outcome | 503/504 | Re-fetch Journey, retain attempt token, never automatic success/replay |

## Verification and Traceability

Contract tests cover exact query/body/header allow-lists, capabilities, safe return paths, media negotiation, assertion verification, actor overwrite, attempt-token retry behavior, additive timeline compatibility, repeated legacy events, Charge-to-Reference options, Approval Queue segment admission, and Booking lookup outcomes. These methods are the executable seams referenced by the per-item trace matrix in `components.md`.
