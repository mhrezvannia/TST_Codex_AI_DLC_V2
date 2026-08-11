# Domain Entities and Boundary Models - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

This model refines U04 in `unit-of-work.md`, its story allocation in `unit-of-work-story-map.md`, and `requirements.md`, against the approved `components.md`, `component-methods.md`, and `services.md`. The existing Container Movement service domain model remains authoritative. U04 adds one new frontend deployable and its request-scoped boundary models; it creates no aggregate, database, topic, or persisted second authority.

## Authority and Persistence Model

The CMM service owns Journey identity, Booking linkage, container identity, status, expected movements, accepted history, idempotency receipts, its outbox, and the computed `timelineV1`. Booking owns its own truth and its movement projection. Reference owns canonical active locations. Identity owns policy decisions. W2-02 owns shell, session presentation, and shared UI. The CMM BFF owns request parsing, assertion issuance, attempt-token issuance and verification, view models, and outcome mapping. The shell Booking adapter owns only the authorized relationship lookup. The browser owns transient interaction state only.

## Existing Provider Entities

| Entity | Identity / attributes | Owner | U04 use |
| --- | --- | --- | --- |
| Journey | stable `journeyId`, `bookingId`, `bookingRevision`, `containerId`, status, `updatedAt`, freshness, `dataUpdatedAt`, dependency, `checkedAt`, `captureEnabled`, optional `captureDisabledReason` | CMM service | Authoritative recent row and detail Summary |
| Expected movement | provider-owned expected sequence and location per stage | CMM service | Source of LOAD/DISC expected locations, inherited by GTOT/GTIN |
| Accepted movement history | event ID, event type, actual location, occurrence, correlation, validation outcome | CMM service | Retained in full; ordering basis for recorded timeline items |
| `timelineV1` | `schemaVersion`, ordered `JourneyTimelineItemV1[]` | CMM service | Rendered as provided; never recomposed downstream |
| Idempotency receipt | provider-owned key and applied outcome | CMM service | Makes an explicit retry duplicate-safe; surfaces as `duplicate` |
| CMM outbox record | `PENDING`, retryable delay, permanent failure | CMM service | Publication truth, distinct from persistence |
| Booking projection of movement status | durable event receipt, duplicate suppression, stale-sequence rules | Booking service | Application truth, distinct from delivery |
| Booking | stable `bookingId` | Booking service | Exact relationship target with independent authorization |
| Reference active location | active record ID, optional code, readable label | Reference service | Bounded canonical option for capture and labels |
| Policy decision | capability, resource, allowed / denied / unavailable | Identity | Current-request read and capture boundary |

`container-movement:read` and `container-movement:capture` are the proposed exact capabilities. They remain a named Identity dependency until registered and tested; no coarse or `local-user` substitute is modelled.

## Transient Boundary Models

| Model | Key attributes | Owner / lifecycle |
| --- | --- | --- |
| `JourneyRecentQuery` | validated `limit` in {25, 50, 100} and bounded `focus`; no actor field exists | BFF request-scoped; rejects any other key |
| `JourneyRecentRowVm` | `journeyId`, `bookingId`, `containerId`, status, optional `latestAccepted`, freshness, `dataUpdatedAt` | BFF read result |
| `JourneyRecentVm` | rows, `returned`, `limit` | BFF read result; carries no total |
| `JourneyDetailVm` | `provider: JourneyProviderV2` (including `timelineV1`), optional `captureAttemptToken` | BFF read result |
| `JourneyTimelineItemV1` | order, canonical code, readable label, disposition, expected sequence, provider move code, source event type, expected and actual location, occurrence, event ID, correlation, validation outcome, ordering basis | CMM service-owned; rendered verbatim |
| `SubjectAssertion` | issuer, key ID, subject, method, normalized path, correlation, issued, expiry, nonce | BFF-issued per provider call; never browser-visible |
| `CaptureAttemptToken` | signed, short-lived; binds subject, `journeyId`, provider `updatedAt`, action, and a server-generated idempotency key | BFF-issued; browser echoes the opaque value only |
| `CaptureMovementInput` | `eventCode` in {GTOT, LOAD, DISC, GTIN}, `locationId`, `occurredAt`, `captureAttemptToken` | Client transient; container identity is not included |
| `CaptureDraft` | draft values, dirty and pending flags, field issues, active correlation or reference | Client transient for one focused task |
| `CmmMutationResult` | the exact discriminated union defined below | BFF terminal command result |
| `CaptureDisabledReason` | discriminated: `provider` (from `captureDisabledReason`) or `location-validation-unavailable` | BFF-derived; the two are never merged |
| `BookingJourneyRelationshipValue` | `present` with `journeyId`, `containerId`, `href`; or `not-created` | Shell Booking adapter read result |
| `CrossModuleOrigin` | `journey-detail` with `journeyId` and canonical href, or `booking-detail` with `bookingId` and canonical href | Signed bounded token payload |
| `CmmLocationOptionQuery` | exactly one `usage` (`capture` \| `label`) and optional trimmed `q` of at most 128 characters | BFF request-scoped; rejects duplicate and unknown keys |
| `CmmLocationOptionsVm` | at most 50 typed `{id, code?, label}` active-location options plus `returned` | BFF read result from `CmmReferenceLocationsPort` |
| `SafeReturnContext` | validated relative list path and optional `focus` | Shared navigation policy; CMM allow-list is `limit,focus` |
| `FieldIssue` | stable field path, code, safe message | BFF/provider result; transient |

## CMM-Specific Result Refinement

Application Design's generic `MutationResult<T>` cannot represent known acceptance without an authoritative `T`, and it collapses two rejections U04 must keep apart. U04 therefore defines one concrete local union, following the precedent approved for U02 and U03; it alters no other domain's contract.

| Discriminator | Required payload | HTTP |
| --- | --- | --- |
| `accepted-confirmed` | `value: JourneyDetailVm`, event ID, correlation, `reference` | 200 |
| `accepted-unconfirmed` | `journeyId`, `reference`, `recovery: REFETCH` | 202 |
| `validation` | stable `issues[]`, `reference`, `replacementAttemptToken` | 422 |
| `duplicate` | `journeyId`, the already-recorded movement's event ID, `reference` | 409 |
| `out-of-sequence` | `journeyId`, provider code, `currentLifecycle`, `requiredNextMove`, `reference`, `replacementAttemptToken` | 409 |
| `denied` | safe reason and `reference`, no capability detail | 403 |
| `not-found` | `journeyId`, safe recovery target, `reference` | 404 |
| `unavailable-known-no-mutation` | `reference`, `retry: RESUBMIT`, boundary | 503 before dispatch; 502 for known provider protocol failure |
| `unavailable-unknown-outcome` | `journeyId`, retained attempt token, `reference`, `recovery: REFETCH` | 503 / 504 |
| `unexpected` | `boundary: BFF \| PROVIDER_PROTOCOL`, `reference` | 500 BFF / 502 provider protocol |

All CMM API routes and reducers switch exhaustively over this union. `accepted-unconfirmed` never carries submitted input as provider truth. After acceptance, a re-read `ok` yields confirmed; read denial, Identity or provider outage, or temporary absence yields unconfirmed; invalid internal query construction yields BFF `unexpected`; a malformed provider response yields provider-protocol `unexpected`.

## Read Result and Region Model

Reads use the upstream `ReadResult<T>` discriminators, applied per declared seam:

| Region | Seam | Independence |
| --- | --- | --- |
| Summary and movement timeline | one atomic v2 `getJourney` read | Share one `ReadResult<JourneyDetailVm>`; they succeed or fail together |
| Booking relationship | `BookingJourneyRelationshipBff.resolveForBooking` (Booking side) / the Journey's own `bookingId` (CMM side) | Independent; four distinct outcomes |
| Location labels and options | `CmmReferenceLocationsPort` (`usage: "label"` / `"capture"`) | Independent; degrades to raw authorized ID with `Label unavailable`, and closes the capture location gate |

`timelineV1` is a projection of the same detail payload, not a separately fetched resource; U04 claims no independent timeline failure state and adds no separate timeline endpoint. A `stale` region carries provider source, `dataUpdatedAt`, and dependency, and disables every freshness-dependent action while shown.

## Four Separate Event Truths

| Truth | Evidence owner | Model |
| --- | --- | --- |
| Journey persisted | CMM aggregate via authoritative re-read | The only truth an accepted capture establishes |
| Published to outbox | CMM outbox record disposition | Modelled but not rendered absent an approved public contract |
| Delivered by broker | Kafka delivery | Not modelled in the UI at all |
| Applied to Booking projection | Booking projection evidence | Rendered only from Booking's own authorized read |

No derived aggregate or roll-up status exists across these four; a roll-up would re-introduce the inference the design forbids. The missing listener poison, bounded-retry, DLQ, and replay controls are a BLOCKED dependency with owner and evidence path, not an existing pass.

## Capture State Machine

`initializing -> ready-clean -> ready-dirty -> validating -> pending -> terminal`.

Terminal branches are exactly the ten dispositions above. `accepted-confirmed` transitions to authoritative detail; `accepted-unconfirmed` transitions to re-read recovery; `validation`, `duplicate`, and `out-of-sequence` return to a retained draft with their own guidance; `unavailable-unknown-outcome` requires verification before any retry. No terminal branch clears the draft automatically, and no branch advances journey status, timeline, or next-move expectation in the client.

Capture availability is computed from two independent gates: the current-request capture capability combined with provider `captureEnabled`, and the availability of canonical active-location validation. Either gate closing disables capture, and each reports its own reason.

## Relationships and Invariants

1. One Journey belongs to exactly one Booking by verified stable `bookingId`; the reverse lookup is by that same exact identifier.
2. One Journey has one provider-computed `timelineV1`; there is no second timeline authority anywhere.
3. Expected and accepted evidence are distinct dispositions within the timeline and are never reconciled downstream.
4. A repeated legacy record is its own entry; equality of code does not imply duplication.
5. One capture attempt binds one token, one idempotency key, one subject, one journey, and one provider `updatedAt`.
6. A policy decision authorizes one current request and can never be stored with a draft as future authority.
7. Provider acceptance and authoritative detail are separate facts; confirmed success requires both.
8. Persistence, publication, delivery, and application are four facts; none implies another.
9. A cross-module origin token binds subject, source record, canonical href, and expected target; it is not a general return URL.
10. An absent `bookingId` is a provider contract failure, never a prompt to search.
11. A stale read requires provider source and time and can never enable capture.
12. No U04 model is persisted, shared across apps, or imported by another domain app.

## Validation Boundaries

The edge validates trust headers; the root and session boundary authenticates; Identity authorizes; the route parser validates `journeyId`, the bounded `limit`, and return context; the BFF issues and verifies the assertion and attempt token, validates command shape and allow-listed fields, and rejects browser-supplied authority; the CMM v2 controller verifies the assertion and rejects actor fields; the CMM service enforces sequence, idempotency, and domain rules; the outcome adapter translates transport and domain results into exactly one disposition. A failure never borrows authority from a later boundary.

## View-State Derivation

Recent-list state derives exhaustively from `ReadResult<JourneyRecentVm>`. Detail state derives from the one atomic v2 read — carrying Summary and the provider-computed timeline together — plus the independently resolved Booking relationship and location labels. Capture form state derives from authoritative detail, the two availability gates, and transient draft state. A mutation disposition never becomes a Journey record directly; confirmed detail is constructed only from an authoritative re-read after acceptance.

## Ubiquitous Language

- **Authoritative detail**: a Journey returned by an authorized v2 read, never a submitted input projection.
- **Capture attempt token**: the signed short-lived binding of subject, journey, provider `updatedAt`, action, and a server-generated idempotency key.
- **Subject assertion**: the short-lived HMAC proof of authenticated subject bound to method, path, and correlation.
- **Recorded / planned**: a timeline item backed by accepted history, versus one emitted only because its canonical stage has none.
- **Legacy accepted**: a retained historical record whose type predates the canonical set; never deduplicated, never next-move authority.
- **Known no mutation**: failure evidence establishes that the provider did not accept the command.
- **Unknown outcome**: dispatch may have reached the provider, so neither success nor safe retry is established.
- **Four truths**: persisted, published, delivered, applied — each rendered only from its own evidence.

## Entities & Aggregates

The only business aggregates are the existing provider-owned Journey and the Booking aggregate. U04 creates none. Query, view-model, assertion, attempt-token, draft, result, relationship, origin-token, options, and safe-return types are request or session boundary models with no repository lifecycle.

## Field-Level Schema (canonical names)

| Field | Type / value object | Canonical source name | Standard / owner | Notes |
| --- | --- | --- | --- | --- |
| Journey identity | `StableId` | `journeyId` / route `[journeyId]` | CMM provider | Provider-stable; never inferred |
| Booking identity | `StableId` | `bookingId` | CMM and Booking providers | Exact relationship key in both directions |
| Booking revision | integer | `bookingRevision` | CMM provider | Reconciliation evidence; not a UI status |
| Container identity | `StableId` | `containerId` | CMM provider | ISO 6346 where present; read-only, never a capture input |
| Journey status | provider value | `status` | CMM provider | Never recomputed or aggregated |
| Provider concurrency | `IsoInstant` | `updatedAt` | CMM provider | Bound into the capture attempt token |
| Freshness evidence | value plus instants | `freshness`, `dataUpdatedAt`, `dependency`, `checkedAt` | CMM provider | Required before any last-known rendering |
| Capture availability | boolean plus reason | `captureEnabled`, `captureDisabledReason` | CMM provider | One of two independent disable gates |
| Movement event code | canonical enum | `eventCode`; timeline `canonicalCode` | DCSA-aligned, CMM provider | Exactly GTOT, LOAD, DISC, GTIN; `OTHER` is display-only |
| Movement location | `StableId` | `locationId`; timeline `expectedLocationId` / `actualLocationId` | Reference and CMM providers | Bounded active option; raw ID fallback on label outage |
| Occurrence | `IsoInstant` | `occurredAt` | CMM provider | User-supplied on capture; provider-owned thereafter |
| Received time and source | absent | `receivedAt`, `source` | Not owned in W4 | Deliberately absent; never rendered as value or as unavailable value |
| Timeline ordering | enum | `orderingBasis`, `disposition`, `validationOutcome` | CMM provider | Rendered as provided; never recomputed |
| Event identity | `StableId` | `eventId` | CMM provider | Evidence for accepted and duplicate outcomes |
| Correlation evidence | `CorrelationId` | trusted correlation header / response reference | BFF and edge | Not browser-editable authority |
| Idempotency key | opaque server value | embedded in the attempt token, sent as `Idempotency-Key` | CMM BFF and service | Never rendered, never browser-supplied |

Actor subject, capability, idempotency key, correlation authority, source, classifier, publication status, correction, and Journey creation are not browser-editable fields.

## Contract Fidelity Check

- `ContainerMovementBff.listRecent`, `getJourney`, and `captureMovement` remain the browser-facing seams declared in `component-methods.md`, and `BookingJourneyRelationshipBff.resolveForBooking` remains the shell-side seam.
- `JourneyProviderV2` and `JourneyTimelineV1` are consumed exactly as declared, including the deliberate absence of `receivedAt` and `source`.
- `SafeReturnPolicy.issueOrigin` / `parseOrigin` and the `CrossModuleOrigin` union are used exactly as declared for both directions, with the CMM list allow-list `limit,focus`.
- The v2 media types, assertion, and `Idempotency-Key` / `X-Correlation-Id` header contract are used as declared; the existing default JSON and internal actor-shaped v1 are untouched and remain non-public.
- `BookingJourneyRelationshipValue.href` is constrained here to the canonical `/container-movement/journeys/<journeyId>` form built from the provider ID, closing the unconstrained-string gap noted in the Application Design review.
- `CmmMutationResult` splits the declared `conflict` branch into `duplicate` and `out-of-sequence` and adds `accepted-unconfirmed`, `not-found`, and `unexpected`. This is a BFF-local refinement inside the existing seam; it changes no provider contract and no other domain.
- `CaptureDisabledReason` is a new BFF-local discriminator making the two independent disable gates distinguishable; the underlying provider field `captureDisabledReason` is consumed unchanged.
- **`CmmReferenceLocationsPort` is specified by this design because Application Design left it unspecified.** `services.md` names a CMM-to-Reference "active location options" seam, but no capability, route, request/response shape, cardinality, or failure mapping was ever declared for it — the same gap that `components.md`'s own Iteration-2 review caught and closed for the analogous Charge port, which was never applied to CMM. U04 declares the exact query, result, port method, browser and provider endpoints, capability, credential and correlation rules, 50-item bound, and four-way failure mapping, mirroring the approved `ChargeReferenceOptionsPort`. This is an **additive public contract requiring producer and consumer sign-off**, not a silent extension: until its executable contract tests pass it is BLOCKED with owner and evidence path, and the capture location gate stays closed. It adds no Reference app import, shared SQL, cache authority, or mutation.
- Identity capability registration, the W2-02 shared shell release, and the listener poison/replay ownership evidence are named blockers, not assumed capabilities.

## Invariants & Validation

All entries under `Relationships and Invariants` apply. Structurally, the route and BFF reject unknown query and body fields, any actor field, browser-supplied idempotency or correlation authority, and an unverified or expired attempt token. Semantically, the CMM service enforces sequence and idempotency rules and the Reference provider bounds active locations. Failure at either boundary prevents persistence and can never become accepted client state.

## Lifecycle / State

The capture lifecycle is initialize, edit, validate, pending, then exactly one terminal disposition. Only `accepted-confirmed` transitions into authoritative detail success. `accepted-unconfirmed` requires re-read; `duplicate` and `out-of-sequence` require user correction against current truth; `unavailable-unknown-outcome` requires verification before retry. Read regions carry independent lifecycles where independent seams exist, so a degraded relationship or label region never terminates the record's.

## Open Questions

No user decision remains after the guided `All A` selections. Two implementation dependencies stay open and are recorded rather than resolved by inference: Identity registration of the two exact capabilities with executable policy tests, and ownership evidence for the listener poison, bounded-retry, DLQ, and replay controls. The second is a hard completion condition — U04 and the intent remain not done while it is open.

## Verification Mapping

Model tests prove bounded-`limit` parsing and actor-field rejection, exhaustive disposition and view mapping, the two independent capture-disable gates, and capture state transitions. Policy tests prove DENY and Identity outage make zero provider calls. Contract tests prove assertion issuance and verification including spoof rejection, attempt-token issuance, verification, replacement, and retention, `Idempotency-Key` forwarding, media negotiation and additive v1 compatibility, every result-to-HTTP mapping, the authoritative post-acceptance re-read, exact `bookingId` lookup across four outcomes, and origin-token issuance, verification, expiry, and fallback in both directions. Provider tests prove stable timeline ordering, all-history retention, missing expected evidence, and repeated legacy evidence. Architecture tests prove no new backend service, database, topic, cache, app import, or shared-component fork. Live evidence proves the same models through US-011 through US-014; FR-001, FR-002, FR-007 through FR-016, FR-018 through FR-022; and NFR-001 through NFR-005 and NFR-009 through NFR-012. NFR-006, NFR-007, and NFR-008 are combined intent-exit verdicts.
