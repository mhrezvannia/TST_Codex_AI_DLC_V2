# Components - W3-01 D&D Rules and Rates

## Traceability basis

This design implements [requirements.md](../requirements-analysis/requirements.md) and [stories.md](../user-stories/stories.md), follows [team-practices.md](../practices-discovery/team-practices.md), and extends the brownfield seams recorded in [architecture.md](../../../../codekb/TST_Codex_W3-01/architecture.md) and [component-inventory.md](../../../../codekb/TST_Codex_W3-01/component-inventory.md). The approved Refined Mockups in [mockups.md](../refined-mockups/mockups.md), [interaction-spec.md](../refined-mockups/interaction-spec.md), and [design-system-mapping.md](../refined-mockups/design-system-mapping.md) are binding for UI composition. W2-03 pricing request/result contracts and behavior remain unchanged.

## System boundary

W3-01 is an additive vertical inside the existing Charge bounded context and `apps/charge-agreements`. It adds no deployable service, shared database, AWS resource, Booking runtime trigger, Container Movement consumer, shared-shell fork, or `@erp/ui` fork.

| Owner | Owns in W3-01 | Does not own |
| --- | --- | --- |
| Charge | D&D commercial terms, version lifecycle, exact-basis validation, port-local calculation, receipt/replay, provider API, Charge BFF and D&D pages | Movement recognition, invoice workflow, port master data |
| Reference Data | Active `LOCATION` records and validated IANA `timeZoneId` attribute | D&D rules, rates, or calculations |
| Booking | Future trigger and consumer fixture signoff | W3-01 runtime orchestration |
| Container Movement | Future movement facts through Booking | Direct Charge integration or a D&D ruleset |
| UI platform / W2-02 | Shared `PlatformShell`, rail, skip-link/main landmark, `Dialog`, status primitives, and `@erp/ui` evolution | Charge-local page behavior |

## Charge domain components

### `DndTerms` aggregate

`DndTerms` is a dedicated aggregate patterned after, but not derived from, the W2-03 `Rate` aggregate. Its stable identity is `DndTermsId`; its immutable commercial snapshots are `DndTermsVersion` values.

It owns:

- exactly one of `IMPORT_DEMURRAGE`, `IMPORT_DETENTION`, or `EXPORT_DETENTION`;
- the fixed DCSA start/end move codes and `LADEN`/`EMPTY` qualifiers derived from that rule type;
- pricing-basis lineage (`AGREEMENT` or `TARIFF`, reference, exact basis-version id);
- derived applicability side, UN/LOCODE port, trade lane, and equipment type;
- free days, one flat daily amount, ISO 4217 currency, and charge code;
- effective window, Draft/Approved lifecycle, predecessor/successor lineage, optimistic row version, and attributable audit facts.

Only Draft versions are mutable. Approval creates immutable authority and is performed under a repository lock that rejects an overlapping Approved window for the same basis version, rule type, derived side, port, trade lane, and equipment type. A successor is a new Draft version linked to an Approved predecessor; there is at most one Draft per aggregate.

### `DndMovementBounds`

A closed mapping from rule type to the approved DCSA pair:

| Rule type | Start | End | Side |
| --- | --- | --- | --- |
| `IMPORT_DEMURRAGE` | `DISC/LADEN` | `GTOT/LADEN` | POD |
| `IMPORT_DETENTION` | `GTOT/LADEN` | `GTIN/EMPTY` | POD |
| `EXPORT_DETENTION` | `GTOT/EMPTY` | `GTIN/LADEN` | POL |

The pair is never accepted as author-defined configuration. Both UI and API expose it as derived, read-only evidence.

### `DndCalculator`

A framework-free, side-effect-free domain service accepts a validated Approved `DndTermsVersion`, a validated IANA `ZoneId`, and two qualified movements. It converts timestamps to port-local dates and calculates:

```text
elapsedDays = max(0, endLocalDate.epochDay - startLocalDate.epochDay)
chargeableDays = max(0, elapsedDays - freeDays)
amount = flatDailyRate * chargeableDays
```

It returns an immutable `DndCalculation` including zero-valued lines. It does not perform rate selection, network calls, persistence, holiday lookup, tiering, rounding-policy discovery, or authorization.

## Charge application components

### `DndTermsApplicationService`

Owns the UI/admin use cases: create Draft, update Draft, approve, create successor, detail, and filtered search. It reuses the `charge-rates` capability family, validates reference identifiers, converts domain failures to stable application errors, and emits attributable activity records. It never mutates W2-03 Rate or Agreement aggregates.

### `DndPricingApplicationService`

Owns `POST /dnd-pricing-requests`. Its orchestration is deliberately synchronous:

1. authenticate and authorize evaluation;
2. validate request shape and derive the bilateral key from `bookingRef` (the current booking identity) + `equipmentId` + `endMovement.movementEventId` (the closing movement event id);
3. compute the canonical request fingerprint and claim a `DND_PRICING` receipt lease;
4. replay an identical terminal receipt, reject a different fingerprint, or reject a live owner;
5. load and validate the exact echoed W2-03 terminal receipt through `DndPricingBasisEvidencePort`, without invoking the current-authority selector;
6. resolve the exact Approved D&D version and validate all echoed applicability;
7. resolve the port `ZoneId` through `PortTimeZoneProvider`;
8. validate the fixed qualified movement pair and order;
9. invoke `DndCalculator`;
10. atomically persist the immutable terminal response and complete the owned receipt;
11. emit bounded audit and telemetry evidence.

Failures never persist a charge result. Only a successful terminal response is replayable as a result; conflict/in-progress and pre-calculation failures remain outcome evidence, not partial calculations.

### `DndTriggerMetadataResolver`

Fresh `POST /pricing-requests` execution is enriched before the W2 response is rendered and committed. The resolver receives the already selected `ResolvedPricingAuthority`, original booking-time request (`pol`, `pod`, trade lane, equipment type, requested departure date), and exact source versions. It queries `DndTermsRepository.findApplicableTriggers` once with:

- the selected basis and `pricingRef`;
- `pricingBasisVersionId` (`agreementVersionId` for Agreement, the existing deterministic tariff composite `pricingRef` for Tariff);
- `pricingEffectiveDate = requestedDepartureDate`;
- export port = POL and import port = POD;
- trade lane and equipment type.

It returns at most one structured `ApplicableDndRuleType` for each of the three fixed rule types, ordered `IMPORT_DEMURRAGE`, `IMPORT_DETENTION`, `EXPORT_DETENTION`. Each item carries only the rule type and its fixed start/end codes and qualifiers. No match returns an empty list. Repository unavailability or more than one applicable Approved version is `PRICING_UNAVAILABLE`, never an empty/partial metadata list.

`PricingResult`, `PricingApiController`, and `JacksonPricingTerminalRenderer` replace the current `List<String>` placeholder with that structured type and add `pricingBasisVersionId` plus `pricingEffectiveDate`. These fields are emitted on every fresh complete W2 success before receipt completion. Replays return the exact stored bytes and are never re-enriched after terms change. Existing W2 fields stay unchanged; the already-required OpenAPI `applicableDndRuleTypes` property remains required.

Once the existing `PricingApplicationService` owns a `STANDARD_PRICING` claim, any handled metadata-enrichment failure occurs before terminal completion and must call the additive owner-fenced `PricingRequestRepository.releaseOwned(idempotencyKey, ownerToken)`. The JDBC implementation deletes only that owner's `STANDARD_PRICING` row while it remains `IN_PROGRESS`. A successful release makes an immediate retry eligible to claim; if release loses the ownership race, the service classifies the winning receipt/claim before responding. A process crash still relies on the existing bounded lease and database-time takeover. This new release path is limited to W3 enrichment failures and does not change established W2 success, replay, conflict, or crash behavior.

### Application ports

| Port | Responsibility | Adapter |
| --- | --- | --- |
| `DndTermsRepository` | Aggregate persistence, locked approval/overlap check, search, activity | Charge JDBC/PostgreSQL |
| `DndPricingReceiptRepository` | Namespaced claim, lease takeover, terminal completion/replay | Shared Charge receipt-store implementation over `pricing_requests` |
| `PricingRequestRepository` | Existing Standard-pricing receipt lifecycle plus owner-fenced release for handled W3 enrichment failures | Existing Charge JDBC adapter, extended additively in `STANDARD_PRICING` |
| `DndPricingBasisEvidencePort` | Load the immutable `STANDARD_PRICING` terminal receipt by echoed `pricingRequestId` and validate exact basis/version/effective-date/source evidence | New read adapter over existing Charge receipt plus exact version tables |
| `PortTimeZoneProvider` | Return active LOCATION `timeZoneId` as a validated `ZoneId` | Charge HTTP client to Reference Data |
| `DndReferenceValidationPort` | Validate port, trade lane, equipment, currency, charge code | Existing Reference Data HTTP validation style |
| `RateAuthorizationPort` | D&D admin `charge-rates` read/create/update/approve/create-successor decisions | Existing local/HTTP rate identity adapters |
| `AuthorizationPort` | Provider `charge-agreement:price` service-subject decision | Existing W2-03 pricing identity adapter |
| `DndPricingTelemetry` | Bounded request/outcome/latency measures | Existing Micrometer pattern |
| `DndEvaluationEvidenceRepository` | Durable outcome-specific pricing-attempt evidence and authorised query | New Charge JDBC adapter/table; terms lifecycle continues in `dnd_terms_activity` |

`DndPricingBasisEvidencePort` is intentionally distinct from the existing `PricingAuthoritySnapshotPort`. The existing port remains the current Agreement-first/Tariff-fallback selector used only for fresh booking-time pricing. The D&D evidence adapter instead:

1. reads the immutable `STANDARD_PRICING` terminal receipt identified by echoed `pricingRequestId`;
2. requires a 200 `PRICED` `pricing.v1` receipt whose stored response matches booking reference, basis, reference, basis-version id, and effective date;
3. compares echoed port (POL for export, POD for imports), trade lane, and equipment type to immutable typed booking-request evidence stored on that receipt;
4. for Agreement, verifies the preserved exact AgreementVersion id and its stored source RateVersion ids;
5. for Tariff, verifies the exact ordered BASE/SURCHARGE/LOCAL source RateVersion ids whose existing deterministic composite id equals `pricingBasisVersionId`;
6. rejects pre-W3 receipts that lack complete basis-version/effective-date/applicability evidence with `404 NO_RATE` rather than reconstructing or selecting current authority.

## Persistence components

The existing Charge PostgreSQL schema receives additive Flyway migrations for:

- `dnd_terms`, `dnd_terms_versions`, and `dnd_terms_activity`;
- constraints for non-negative free days/rate, effective-window order, unique version numbers, one Draft per aggregate, immutable Approved rows, and predecessor linkage;
- an approval-time transaction-scoped PostgreSQL advisory lock derived from the full canonical applicability key, followed by an inclusive `daterange(..., '[]')` overlap query;
- an explicit `operation_namespace` on `pricing_requests`, defaulting existing rows and W2-03 writes to `STANDARD_PRICING` and qualifying D&D rows as `DND_PRICING`;
- nullable D&D-only identity columns for equipment and closing movement event; `amendment_seq` becomes nullable only for D&D rows, with namespace-specific check constraints;
- nullable immutable Standard-pricing evidence columns `pricing_pol`, `pricing_pod`, `pricing_trade_lane`, `pricing_equipment_type`, and `pricing_effective_date`; every fresh W3-era W2 success populates them before completion, while legacy rows remain readable but cannot evidence D&D;
- a composite namespace/idempotency identity, a partial W2-03 `(booking_ref, amendment_seq)` uniqueness rule for `STANDARD_PRICING`, and a D&D tuple uniqueness rule for `DND_PRICING`.

Existing W2-03 repository method signatures and request/response serialization remain unchanged; `PricingRequestRepository` receives only the additive `releaseOwned` operation for the new enrichment-failure path. Existing JDBC statements are made explicit about `STANDARD_PRICING` so a coincident external key cannot select a D&D row. The D&D adapter qualifies every receipt query and mutation by `DND_PRICING` and uses the same database-time lease and owner-token fence pattern.

The migration runs under an access-exclusive table lock in one Flyway transaction: add/backfill namespace and D&D identity columns; drop `pricing_requests_pkey`, `pricing_requests_booking_ref_amendment_seq_key`, `ck_pricing_requests_terminal_shape`, and `uq_pricing_requests_terminal_request`; relax `amendment_seq`; then add the composite primary key `(operation_namespace, idempotency_key)`, namespace/identity checks, partial W2 and D&D tuple unique indexes, namespace-aware terminal-shape check, and namespace-qualified terminal-request unique index. `STANDARD_PRICING` retains `PRICED`/`pricing.v1` and the existing manual case branch. `DND_PRICING` permits only 200 `DND_PRICED`/`pricing.dnd.v1` completion with no manual case. The idempotency column expands to 512 characters.

`DndPricingReceiptRepository.releaseOwned` deletes only the caller's `DND_PRICING`/`IN_PROGRESS` row by namespace, key, owner token. Every 400/404/422/503 discovered after a claim records attempt evidence and releases the claim before emitting the response. If release loses the owner race, the service classifies the winner and never emits stale work. A process crash leaves the bounded lease for takeover; a handled 503 leaves no live claim, so an immediate retry does not receive a false `PRICING_IN_PROGRESS`.

`dnd_pricing_attempts` stores one durable bounded record per provider attempt: attempt/result identity, outcome/code/status, correlation, request fingerprint, replay flag, booking/equipment/closing-event identity, echoed basis fields, source ids and calculation fields only when they exist, and timestamp. It stores no service token or raw payload. `dndTermsId` is nullable because malformed transport, authentication, idempotency, conflict, and no-rate dispositions can occur before terms resolution. Every row remains retrievable by unique `attemptId`, and bounded authorised search supports correlation, booking/equipment/closing-event identity, outcome/time, or terms id without fabricating missing source ids. New success completion and its evidence insert are one database transaction; replay/rejection evidence is inserted before response. Evidence-store failure converts application outcomes to `503 PRICING_UNAVAILABLE`; security-filter rejections retain their required 400/401 response and emit a bounded high-severity fallback log if durable audit is unavailable. No W3-01 purge job is added; Compose retains evidence with Charge business records pending a later retention policy.

## Provider and contract components

### Charge REST adapters

- `DndTermsApiController`: additive admin endpoints for list, create, detail/version selection, AgreementVersion relationship, audit, Draft update, approve, and successor creation under `/api/charge-dnd-terms`.
- `DndPricingApiController`: additive `POST /dnd-pricing-requests` defined by `contracts/openapi/pricing.v1.yaml`.
- `DndErrorMapper`: exact FR-06 status/code envelope with correlation evidence and field errors where applicable.

The existing `/pricing-requests` contract is not renamed. Its already-required `applicableDndRuleTypes` array receives structured trigger items, while additive basis-version/effective-date evidence remains backward compatible for consumers; no free days or daily rates are exposed there.

### Reference Data extension

The existing `LOCATION` record `attributes` map is the authority for optional `timeZoneId`. When present, Reference Data validates it with `ZoneId.of` and returns `422 REFERENCE_ATTRIBUTE_INVALID` at field `attributes.timeZoneId` when malformed. Legacy LOCATION records without the attribute remain valid and unrelated updates do not become breaking. W3-01 seed/backfill adds `SGSIN=Asia/Singapore` and `NLRTM=Europe/Amsterdam`, the accepted live trade-lane ports. D&D terms approval requires the selected port to have an active valid timezone and maps absence to field-level `422 DND_PORT_TIME_ZONE_REQUIRED`; evaluation maps missing/malformed configuration to `503 PRICING_UNAVAILABLE` and a mismatched/inactive echoed port to `404 NO_RATE`.

Charge consumes the existing Reference Data service contract using the current service-id/token and correlation headers, a 250 ms connect timeout, 500 ms response timeout, and no automatic request retry. It does not query Reference Data storage or cache/guess a timezone. These budgets are verified against the provisional warm-local p99.

## Charge web components

### Route compositions

`apps/charge-agreements` owns these approved routes:

- `/charge-agreements/dnd/terms`
- `/charge-agreements/dnd/terms/new`
- `/charge-agreements/dnd/terms/[dndTermsId]`
- `/charge-agreements/dnd/terms/[dndTermsId]?version=<dndTermsVersionId>` for directly addressable immutable history
- `/charge-agreements/dnd/terms/[dndTermsId]?mode=edit` for the current Draft only
- `/charge-agreements/dnd/terms/[dndTermsId]/successor`

The existing Agreement detail route `/charge-agreements/agreements/[agreementId]?version=<agreementVersionId>` renders the binding read-only `D&D terms` section for its selected AgreementVersion; omission selects the current presentation version. Its Charge BFF calls `/api/charge-dnd-terms/relationships/agreement-versions/{agreementVersionId}`. The service authorizes `charge-rates:read` before querying. Denial returns a no-disclosure 403 with no count or identifiers; empty, ready, and unavailable are distinct scoped view states and known Agreement facts remain visible.

The binding list URL parameters are `q`, `ruleType`, `port`, `lifecycle`, `effectiveState`, `sort`, `page`, and `size`. `page` is one-based, `size` defaults to 25 and is restricted to 25/50, and `sort` is `updatedAt:desc` or `updatedAt:asc`. Default ordering is `updatedAt DESC, dndTermsId ASC`; ascending uses `updatedAt ASC, dndTermsId ASC`. Unknown/duplicate parameters return the safe defaults in the BFF and are not forwarded. Detail view models accept optional `version`; missing means the latest presentation version.

Server route compositions load authorised data through Charge-local BFF modules. Client components are limited to forms, filters, confirmation state, and announced feedback. There is no calculation-preview page.

### Feature-local UI components

| Component | Responsibility | Shared reuse |
| --- | --- | --- |
| `DndTermsListPage` | Filters, responsive records/table, empty/denied/error/loading/success states | `PlatformShell`, page/header/filter primitives, explicit-tone `Badge` |
| `DndTermsForm` | Combined rule/rate Draft authoring, derived read-only bounds, blur/submit validation | shared form controls, buttons, notices |
| `DndTermsDetailPage` | Immutable version, applicability, basis lineage, audit and actions | shared detail/card/table primitives |
| `DndApprovalDialog` | Summary and approval confirmation | shared `Dialog` only after its description seam exists |
| `DndVersionHistory` | Predecessor/successor and actor/time evidence | shared responsive table/list primitives |
| `DndStatusStrip` | Non-color status label plus explanatory text | generic shared status/notice primitives, no unsupported D&D `StatusBadge` fallback |
| `AgreementVersionDndTermsSection` | Read-only ready/empty/denied/unavailable relationship state without hiding Agreement facts | `StatusStrip`, `Skeleton`, `Button`, section-safe headings/markup |

Generic `StatusStrip`, explicit-tone `Badge`, and section-safe semantic markup are already sufficient and are feature-local compositions, not platform blockers. `PartialDataNotice`, `StatusBadge`, and scoped `FailureState` are not used.

Two genuine shared dependencies remain owned exclusively by W2-02 in `packages/ui`, governed by `design-system/linercore/MASTER.md` and `design-system/linercore/pages/dnd-rules-and-rates.md` at the W3-01 delivery baseline. W4-01 retains ownership only of its Reference Data page work and is not a shared-shell or `packages/ui` owner:

1. `PlatformShell` must accept explicit active-module metadata, expose the shared skip-link/main landmark, and render the canonical rail including Container Movement in approved order. Package-level keyboard/landmark/rail tests must pass before the W3-01 frontend Bolt starts.
2. `Dialog` must accept a description/`aria-describedby` seam while retaining focus trap, Escape, and trigger restoration. Package-level accessible-name/description/focus tests must pass before approval-dialog integration.

Delivery Planning must schedule those UI-platform Bolt(s) before the dependent Charge frontend Bolt and record the exact merged commit/package workspace revision. W3-01 then runs route-level Playwright tests for rail/skip/main and dialog name/description/focus at all four breakpoints. No Charge-local shell or dialog fork is permitted.

## Boundary verification

- FR-01 through FR-03 and US-01/US-02 map to `DndTerms`, its application service, JDBC adapter, and Charge UI.
- FR-04 through FR-08 and US-03/US-04 map to `DndPricingApplicationService`, its ports, `DndCalculator`, receipt store, and additive provider contract.
- FR-09/NFR-06 map to the approved route compositions and LinerCore components.
- FR-10/FR-11/NFR-07 are protected by exact-version lookup, additive schemas, and mandatory W2-03 regression fixtures.
- FR-12/NFR-03/NFR-04 are enforced at authorization, correlation, audit, and telemetry ports.
