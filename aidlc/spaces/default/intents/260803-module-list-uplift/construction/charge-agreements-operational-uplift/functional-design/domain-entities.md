# Domain Entities and Boundary Models - U03 Charge Agreements Operational Uplift

## Source Alignment

This model refines U03 in `unit-of-work.md`, its story allocation in `unit-of-work-story-map.md`, and `requirements.md`, against the approved `components.md`, `component-methods.md`, and `services.md`. The existing Charge service domain model remains authoritative. U03 adds transient list, detail, tab, action, reconciliation, and option boundary models only, consistent with the answered Q2 selection of no new persistence and no shared aggregate.

## Authority and Persistence Model

U03 creates no business aggregate and no persistence. The Charge service owns Agreement identity, versions, immutable rate-version bindings, commercial terms, lifecycle status, validity, activity and history, and manual-pricing evidence. The Reference service owns canonical active options. Identity owns policy decisions. W2-02 owns shell, session presentation, and shared UI. The Charge BFF owns request-scoped parsing, adaptation, authorization, view models, and outcome mapping. The browser owns transient interaction state only.

## Existing Provider Entities

| Entity | Identity / attributes | Owner | U03 use |
| --- | --- | --- | --- |
| Agreement | stable `agreementId`, agreement number, customer, trade lane, commodity, validity, lifecycle status, current version, row version | Charge service | Authoritative list row and detail Summary |
| Agreement version | version identity, commercial terms, validity, lifecycle state, approval evidence | Charge service | Version evidence; approved versions immutable |
| Rate version | stable rate ID plus version, category, scope, amount, ISO 4217 currency, basis, lifecycle, validity | Charge service | Exact bound Rates evidence and supporting rate navigation |
| Agreement activity / status history | ordered lifecycle, version, and approval events with actor, time, reason | Charge service | Status history tab, ordered by provider |
| Manual-pricing case | case identity, `bookingRef`, `reasonCode`, `openedAt`, OPEN state | Charge service | Read-only OPEN evidence list |
| Approval candidate | Draft/pending Agreement or rate identity, status, canonical href | Charge service | Independently admitted queue segment rows |
| Reference option | active record ID, optional code, readable label | Reference service | Bounded typed option for labels and canonical binding |
| Policy decision | capability, resource, allowed / denied / unavailable | Identity | Current-request read and command boundary |

Nothing in this table is mirrored, cached, or re-derived by U03. `D&D terms` is deliberately absent from the table: while W3-01 is open, no D&D entity is available to model, and none is synthesized.

## Transient Boundary Models

| Model | Key attributes | Owner / lifecycle |
| --- | --- | --- |
| `AgreementListQuery` | validated `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, `includeInactive`, one-based `page`, `size`, bounded `focus` | BFF request-scoped; rejects duplicate and unknown keys |
| `AgreementPageVm` | typed rows (agreement number, customer, coverage, status, version, validity), page, size, returned, provider total evidence | BFF read result |
| `AgreementDetailVm` | agreement number, `agreementId`, current version, row version, Summary facts, available tabs, bound rate-version IDs | BFF read result |
| `AgreementTabState` | URL-backed `summary` \| `rates` \| `dnd` \| `history`; unsupported values normalize to `summary` | Route presentation state |
| `RateEvidenceVm` | exact bound rate ID and version, category, scope, amount, currency, basis, lifecycle, validity | BFF read result; never a Rate Authority workbench |
| `DndRegionState` | `not-integrated` with owner and evidence path | BFF-declared; no value fields exist while W3-01 is open |
| `StatusHistoryVm` | provider-ordered events with actor, time, reason, reference when supplied; optional partial-evidence marker | Projection of the same `getAgreement` payload as Summary; not separately fetched |
| `AgreementCommandDraft` | command kind, `agreementId`, expected version, row version, allow-listed input fields, dirty and pending flags | Client transient for one focused task |
| `AgreementCommandAttempt` | command kind, target identity, server-derived replay key, submitted snapshot, correlation and reference, `startedAt` | BFF/client transient; never persisted |
| `ChargeMutationResult` | the exact discriminated union defined below | BFF terminal command result |
| `ReconciliationContext` | expected version, current version and lifecycle, required next state, retained draft, current authoritative summary, reference | BFF/client reconciliation state |
| `AuthoritativePostCommandDetail` | provider-confirmed Agreement detail plus read timestamp | Built only from an `ok` re-read after acceptance |
| `ChargeReferenceOptionsVm` | at most 50 typed `{id, code?, label}` options plus `returned` | BFF read result from the bounded port |
| `QueueSegmentAdmission` | segment kind, admitted boolean, owner, evidence path | Build/contract-time fact surfaced as read state |
| `SafeReturnContext` | validated Charge-relative list path and optional `focus` | Shared navigation policy |
| `FieldIssue` | stable field path, code, safe message | BFF/provider result; transient |

## Charge-Specific Result Refinement

Application Design's generic `MutationResult<T>` cannot represent known acceptance without an authoritative `T`. U03 therefore defines one concrete local union, following the precedent already approved for U02; it alters no other domain's contract.

| Discriminator | Required payload | HTTP |
| --- | --- | --- |
| `accepted-confirmed` | `value: AgreementDetailVm`, `agreementId`, new `version`, `reference` | 200 |
| `accepted-unconfirmed` | `agreementId`, optional `persistedVersion`, `reference`, `recovery: REFETCH` | 202 |
| `validation` | stable `issues[]`, `reference`, optional replacement replay key | 422 |
| `conflict` | `agreementId`, `expectedVersion`, `currentVersion`, `currentLifecycle`, optional `requiredNextState`, provider code, `reference` | 409 |
| `denied` | safe reason and `reference`, no capability detail | 403 |
| `not-found` | Agreement or version identity, safe recovery target, `reference` | 404 |
| `unavailable-known-no-mutation` | `reference`, `retry: RESUBMIT`, boundary | 503 before dispatch; 502 for known provider protocol failure |
| `unavailable-unknown-outcome` | `agreementId`, `expectedVersion`, `reference`, `recovery: REFETCH` | 503 / 504 |
| `unexpected` | `boundary: BFF \| PROVIDER_PROTOCOL`, `reference` | 500 BFF / 502 provider protocol |

All Charge API routes and reducers switch exhaustively over this union. `accepted-unconfirmed` never carries submitted draft values as provider truth. After provider acceptance, a re-read `ok` yields confirmed; read denial, Identity or provider outage, or temporary absence yields unconfirmed; invalid internal query construction yields BFF `unexpected`; a malformed provider response yields provider-protocol `unexpected`.

## Read Result and Region Model

Reads use the upstream `ReadResult<T>` discriminators `ok`, `invalid-query`, `not-found`, `denied`, `stale`, and `unavailable`, applied per declared seam rather than per page. Region independence follows the seams that exist, not a wished-for decomposition:

| Region | Seam | Independence |
| --- | --- | --- |
| Summary and Status history | one atomic `getAgreement` read | Share one `ReadResult<AgreementDetailVm>`; they succeed or fail together |
| Rates | one `getRateVersion` per bound rate version | Independent; a rate-version failure is scoped to its row |
| Reference labels | `ChargeReferenceOptionsPort.listActiveOptions` | Independent; degrades to raw authorized ID with `Label unavailable` |
| D&D | none while W3-01 is open | No read occurs; the region is statically not-integrated |

`StatusHistoryVm` is therefore a projection of the same detail payload, not a separately fetched resource. Incomplete or absent provider `activity` evidence is a provider-signalled partial-history condition carried inside an otherwise `ok` detail — it is not a second transport result and does not imply an independent history endpoint. A `stale` region carries the provider's `dataUpdatedAt`, source, and dependency, and disables every freshness-dependent command while it is shown.

## Command State Machine

`initializing -> ready-clean -> ready-dirty -> validating -> confirming -> pending -> terminal`.

`confirming` exists only for approve, suspend, and expire, where a consequence-specific confirmation and any provider-required reason are captured before dispatch. Terminal branches are exactly the nine dispositions above. `accepted-confirmed` transitions to authoritative detail; `accepted-unconfirmed` transitions to re-read recovery; `validation` returns to dirty with linked issues; `conflict` retains the draft alongside current truth; `unavailable-unknown-outcome` requires verification before any retry. No terminal branch clears the draft automatically, and no branch advances lifecycle in the client.

Cancel from clean returns immediately. Cancel or navigation from dirty enters confirmation and either restores the task unchanged or discards and follows the safe target. A pending task rejects duplicate submission.

## Version and Successor Transitions

An edit draft opens against a Draft Agreement version and captures that exact `version` plus row version as its expected evidence. Approve, suspend, and expire carry the same evidence and a provider-validated precondition set. `createSuccessor` reads the current version, then produces a new Draft version; the source version's approved state, terms, and history are unchanged.

Conflict does not modify the draft or its expected version. An explicit Review current action reauthorizes and re-reads authoritative detail, producing `ReconciliationContext`. Only a user-confirmed reapply produces a new draft snapshot, a new expected version, and a newly authorized submit. There is no silent overwrite, automatic merge, or automatic resubmit.

## Relationships and Invariants

1. One Agreement has many versions; approved versions are immutable and are never edited, reopened, or rewritten.
2. One Agreement version binds exact immutable rate versions; a newer current rate is never substituted for a bound version.
3. `agreementId`, current `version`, and row version are three distinct facts; `agreementVersionId` is never treated as `agreementId`.
4. A policy decision authorizes one current request and can never be stored with a draft as future authority.
5. Provider acceptance and authoritative detail are separate facts; confirmed success requires both.
6. Conflict holds retained intent and current truth side by side without merging them.
7. A stale read value requires current authorization plus provider source and time, and can never enable a mutation.
8. A Reference option is a bounded, request-scoped read; it is never cached as authority and never accepted from a free-text label.
9. A queue segment's admission is a contract-test fact, never a client-side capability inference; an unadmitted segment has no rows at all.
10. Manual-pricing evidence has no command model in U03; `MANUAL_PRICING_REQUIRED` is evidence, never a price.
11. Agreement-to-Booking has no model, href, or placeholder while its Cross-Link Direction Matrix exit is open.
12. No U03 model is persisted, shared across apps, or imported by another domain app.

## Validation Boundaries

The edge validates trust headers; the root and session boundary authenticates; Identity authorizes; the route parser validates identifiers, query keys, and return context; the BFF adapts `status`, converts paging, and validates command shape, allow-listed fields, and exact version evidence; the Charge provider enforces lifecycle preconditions, version concurrency, and domain rules; the outcome adapter translates transport and domain results into exactly one disposition. A failure never borrows authority from a later boundary, and no boundary is skipped because an earlier one appeared to succeed.

## View-State Derivation

Read page state derives exhaustively from each seam's `ReadResult<T>`. Detail page state derives from the one atomic `getAgreement` result — which carries both Summary truth and the `StatusHistoryVm` projection — plus the independently resolved bound rate versions and Reference labels, and the statically not-integrated D&D region. Form and dialog state derives from authoritative detail plus transient draft state. A mutation disposition never becomes an Agreement record directly; `AuthoritativePostCommandDetail` is constructed only from an `ok` re-read after acceptance. Stale is a provider-owned value plus evidence, never a browser cache flag.

## Ubiquitous Language

- **Authoritative detail**: an Agreement returned by a provider read, never a submitted draft projection.
- **Expected version**: the exact provider version and row version captured when a draft is opened.
- **Bound rate version**: the immutable rate identity and version attached to the Agreement version being viewed.
- **Replay key**: the server-derived idempotency value bound to one command attempt; never browser-supplied.
- **Known no mutation**: failure evidence establishes that the provider did not accept the command.
- **Unknown outcome**: dispatch may have reached the provider, so neither success nor safe retry is established.
- **Segment admission**: the contract-test fact that a queue segment's server filter and bounded pagination exist and pass.
- **Not integrated**: a region whose owning provider contract does not yet exist, rendered honestly with owner and evidence path rather than synthesized.

## Entities & Aggregates

The only business aggregates are the existing provider-owned Agreement (with its versions), the provider-owned rate version, and the provider-owned manual-pricing case. U03 creates no aggregate. Query, view-model, draft, attempt, reconciliation, result, option, admission, and safe-return types are request or session boundary models with no repository lifecycle.

## Field-Level Schema (canonical names)

| Field | Type / value object | Canonical source name | Standard / owner | Notes |
| --- | --- | --- | --- | --- |
| Agreement identity | `StableId` | `agreementId` / route `[agreementId]` | Charge provider | Provider-stable; never derived from a version ID |
| Agreement number | readable string | `agreementNumber` | Charge provider | Primary list and detail identity label |
| Agreement version | positive integer | `version` | Charge provider | Optimistic-concurrency and evidence token |
| Row version | provider concurrency token | provider row version | Charge provider | Distinct from `version`; carried on every command |
| Customer identity | `StableId` | `customerId` | Reference / Charge providers | Label resolved through the bounded option port |
| Trade lane identity | `StableId` | `tradeLaneId` | Reference provider | Same label resolution and fallback rules |
| Commodity identity | `StableId` | `commodityId` | Reference provider | Same label resolution and fallback rules |
| Lifecycle status | Charge lifecycle value | browser `status`; provider vocabulary | Charge provider | Adapted by an explicit contract-tested BFF mapping |
| Validity | ISO dates | `validFrom`, `validTo`, query `validOn` | Charge provider | Read-only truth; `validOn` is a supported filter |
| Rate identity | `StableId` plus version | `rateId`, rate `version` | Charge provider | Exact immutable binding for supporting navigation |
| Rate validity | ISO dates | `effectiveFrom`, `effectiveTo` | Charge provider | Rate-side spelling; distinct from the Agreement-side `validFrom`/`validTo` |
| Unit rate and currency | decimal string plus ISO 4217 code | `unitRate`, `currency`, `currencyId` | Charge provider | Never recomputed, rounded, or zero-defaulted in the UI |
| Rate basis | provider-defined value | `basis` | Charge provider | Labelled, never inferred |
| Rate scope | three provider identifiers | `originLocationId`, `destinationLocationId` (nullable), `equipmentTypeId` | Charge provider | Displayed as a rendered scope label; no stored `scope` field exists |
| Manual case evidence | case identity, `bookingRef`, `reasonCode`, `openedAt` | provider manual-case fields | Charge provider | Read-only; `MANUAL_PRICING_REQUIRED` stays evidence |
| Reference option | `{id, code?, label}` | bounded port result | Reference provider | At most 50 ACTIVE options per request |
| Correlation evidence | `CorrelationId` | trusted correlation header / response reference | BFF and edge | Not browser-editable authority |
| Replay key | opaque server value | derived from validated client request ID | Charge BFF and service | Never rendered, never browser-supplied |

Actor, capability, lifecycle authority, correlation authority, replay key, and provider version are not browser-editable fields.

## Contract Fidelity Check

- `ChargeAgreementsBff.listAgreements`, `getAgreement`, `createAgreement`, `updateDraft`, `createSuccessor`, `executeLifecycle`, `listRates`, `getRateVersion`, `listApprovalCandidates`, and `listManualPricingEvidence` remain the browser-facing seams declared in `component-methods.md`.
- `ChargeReferenceOptionsPort.listActiveOptions` is used exactly as declared: single `domain`, single `kind`, optional bounded `q`, active page 0 / size 50, at most 50 typed options, distinct failure mapping.
- `AgreementQuery` in `component-methods.md` already declares the approved key set; U03 corrects the current source's `lifecycle` key to that contract rather than aliasing it.
- Browser one-based pagination, the exact capability names, the safe-return grammar, current-request policy, and provider-owned persistence are unchanged.
- The view models declared in `component-methods.md` are minimal illustrative shapes and do not yet carry every labelled fact U03's approved list and detail composition requires. U03 extends exactly these four, additively, and nothing else:
Every added field below uses the canonical source name exactly as the live Charge schemas spell it (`apps/charge-agreements/lib/agreements.ts`, `apps/charge-agreements/lib/rates.ts`); no field is renamed.
  - `AgreementRowVm` adds `tradeLaneId`, nullable `commodityId`, `validFrom`, and `validTo`. The `coverage` column is a rendering of the trade-lane and commodity labels, not a stored provider field.
  - `AgreementDetailVm` adds the same validity fields plus the provider `rowVersion` token and the `StatusHistoryVm` projection carried in the same payload.
  - `RateRowVm` adds `unitRate`, `currency` (ISO 4217, with `currencyId`), `basis`, and the scope identifiers `originLocationId`, nullable `destinationLocationId`, and `equipmentTypeId`. The `scope` label is a rendering of those three identifiers — like `coverage`, it is displayed, not stored.
  - `RateDetailVm` adds the same fields plus `effectiveFrom` and `effectiveTo`. Rate validity is spelled `effectiveFrom`/`effectiveTo`; the Agreement-side `validFrom`/`validTo` names are not reused for rates.
  Every added field is already owned and supplied by the Charge provider per the `requirements.md` Data & Standards Alignment row for Charge Agreements. These are BFF view-model extensions inside the existing `ChargeAgreementsBff` seams — no provider contract, endpoint, media type, or persistence changes, and no field is renamed, recomputed, defaulted, or derived in the UI.
- Actual source gaps — the `lifecycle` query key, the absent `listApprovalCandidates` implementation, and the non-exhaustive result mapping — are recorded as corrections this unit owns, not claimed as current behaviour.
- No D&D field is modelled while W3-01 is open; the region's contract seam is left in place so a later integration is additive rather than a redesign.

## Invariants & Validation

All entries under `Relationships and Invariants` apply. Structurally, the route and BFF reject unknown query and body fields, missing or non-positive versions, and browser-supplied authority. Semantically, the Charge provider enforces lifecycle preconditions, version concurrency, and domain rules, and the Reference provider bounds active options. Failure at either boundary prevents persistence and can never become accepted client state.

## Lifecycle / State

The command lifecycle is initialize, edit, validate, confirm where required, pending, then exactly one terminal disposition. Only `accepted-confirmed` transitions into authoritative detail success. `accepted-unconfirmed` requires re-read; `conflict` requires explicit reconciliation; `unavailable-unknown-outcome` requires verification before retry. Read regions carry independent lifecycles so a degraded region never terminates the record's.

## Open Questions

No user decision remains after the guided `All A` selections and the consolidated confirmation. Two implementation dependencies stay open and are recorded rather than resolved by inference: whether W3-01 closes within this intent's Construction window, and whether the Charge provider's Draft/pending filters exist to admit either queue segment. Both remain BLOCKED with owner and evidence path until executable tests and live evidence exist.

## Verification Mapping

Model tests prove query-key rejection, the `status` adaptation table, one-based to zero-based paging, distinct agreement/version/row-version propagation, exhaustive disposition and view mapping, and command-state transitions. Policy tests prove DENY and Identity outage make zero provider calls. Contract tests prove the bounded Reference option query, authorization, cardinality, and four-way failure mapping; exact version and replay-key propagation; every result-to-HTTP mapping; the authoritative post-acceptance re-read; and independent queue-segment admission. Concurrency tests prove stale versions cannot overwrite and that a retry cannot duplicate. Architecture tests prove no new route, persistence, cache, app import, or shared-component fork. Live evidence proves the same models through US-007, US-008, US-009, US-010, and US-015; FR-001, FR-002, FR-005, FR-006, FR-009 through FR-017, FR-019 through FR-022; and NFR-001 through NFR-005 and NFR-009 through NFR-012. NFR-006, NFR-007, and NFR-008 are combined intent-exit verdicts.
