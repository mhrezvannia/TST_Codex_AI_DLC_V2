# W3-01 D&D Rules and Rates - Design Candidate

**Status:** Candidate for review; not approved and not implementation-binding  
**Prepared:** 2026-08-03  
**Owning domain:** Charge Calculation and Customer Agreement  
**Primary persona:** Pricing Analyst  
**AI-DLC position:** Design-only work while Refined Mockups 2.5 remains parked

## 1. Decision summary

This candidate defines Charge-owned administration for deterministic demurrage and detention rule types, flat daily rates, immutable commercial versions, agreement or tariff linkage, and version-attributable evidence. It remains inside the existing authenticated LinerCore shell and extends the current Charge Agreements workbench pattern. It does not create a second shell, local theme, component library, Booking workflow, Container Movement rule editor, or production route/API contract.

The approved W3-01 Requirements Analysis overrides stale wording in the source intent, prompt, and provisional rough flow:

- The MVP has exactly three rule types: `IMPORT_DEMURRAGE`, `IMPORT_DETENTION`, and `EXPORT_DETENTION`. There is no generic combined D&D rule.
- Each rule type has a fixed DCSA T&T v2.2 movement-code and load-state pair. Users do not author arbitrary movement pairs.
- The MVP has free days followed by one flat daily rate. Progressive bands are not designed.
- Counting uses port-local calendar-date boundaries. Weekends and holidays are ordinary days; there is no calendar editor or fallback to UTC.
- Evaluation validates the exact echoed booking-time pricing snapshot. It never reselects agreement versus tariff and never silently upgrades to a newer version.
- The required Charge UI covers list, create/edit Draft, detail, approval/successor, relationship, version, and audit evidence. A calculation-preview UI is not a release requirement; the optional bounded evaluation design in this document remains subject to review.

## 2. Authority map and conflict resolution

The candidate applies authority in this order:

1. Approved W3-01 Requirements Analysis and User Stories.
2. Active W3-01 intent record and its complete Context Pack.
3. Bilateral Booking-Charge pricing contract and approved W2-03 pricing/version contracts.
4. Security, accessibility, enterprise frontend, and BFF standards.
5. `design-system/linercore/MASTER.md` and executable `@erp/ui` behavior.
6. D&D, Charge Agreements, Reference Data, and Container Movement page contracts.
7. Approved W2-03 Charge interaction patterns.
8. Provisional W3-01 rough mockups.
9. UI/UX Pro Max recommendations.

### Recorded conflicts

| Source suggestion | Binding decision | Treatment |
|---|---|---|
| Generic combined D&D rule | Exactly three qualified bilateral rule types | Rejected |
| Progressive bands | One flat daily rate after free days | Rejected |
| Working-day or holiday calendar UI | Port-local calendar dates; weekends/holidays included | Rejected |
| Freely editable movement pair | Fixed rule-type pair and qualifiers | Rejected |
| Mandatory calculation preview | Direct API is sufficient for W3-01 acceptance | Optional candidate only |
| Enterprise Gateway, hero, sales CTA, logo carousel | Authenticated operational workbench | Rejected |
| Replacement blue/amber palette and Fira fonts | LinerCore tokens and IBM Plex Sans/system stack | Rejected |
| Chart-first dashboard and KPI cards | Lists, forms, definition lists, history tables, evidence | Rejected |
| Spinner-first loading | Stable LinerCore skeletons plus one live status | Rejected |
| Bulk editing and saved views | Not approved for W3-01 | Rejected |
| Server Actions as a blanket mutation rule | Existing authenticated BFF/API-core boundary | Advisory only; rejected as a default |

Adopted skill guidance is limited to dense scannable tables, server-backed filters, stable row links, blur validation, preserved values, explicit pending/success/error feedback, semantic HTML, keyboard order, visible focus, responsive table handling, reduced motion, and accessible async announcements.

## 3. Roles, tasks, and ownership boundaries

### Human role

The Pricing Analyst is the only W3-01 story persona and mutation actor. The analyst:

- creates a Draft instance of one of the three fixed rule types;
- defines exact applicability and a flat rate against an approved pricing-basis version;
- reviews and approves a Draft or creates a successor;
- inspects immutable history, agreement/tariff links, and attributable audit evidence;
- diagnoses validation, overlap, conflict, and no-applicable-rate outcomes.

An existing W2-03 authenticated Charge reader may encounter read-only presentation when the server grants read but not mutation capability. This is a reused authorization state, not a new W3-01 persona, permission model, or audit-retrieval journey.

### Product and technical ownership

| Concern | Owner | W3-01 boundary |
|---|---|---|
| D&D rule types, rates, evaluation, version evidence | Charge | Owns domain facts, commands, API, persistence, and page composition |
| Shared shell, global navigation, session presentation | `apps/shell` / UI platform | Reuse only; no redesign or local copy |
| Tokens and shared primitives | `packages/ui` / UI platform | Consume `@erp/ui`; do not edit or fork |
| Port, timezone, trade lane, equipment, currency, charge-code values | Reference Data | Use canonical identities and readable labels; no duplicated master data |
| Booking-time basis selection and stored snapshot | W2-03 Charge provider and future Booking consumer | W3-01 validates echoed evidence; it does not reselect it |
| D&D trigger and invoice | Booking, W3-02 | Out of scope |
| Movement facts | Container Movement through Booking in later intent | No Charge-CMM runtime coupling and no CMM rule editing |
| Contract fixtures | Charge provider plus Booking consumer | Additive, dual-signoff change only |

## 4. Current-state evidence and design assumptions

### Source-observed current surface

The indexed code graph shows an existing Next.js Charge app with list/detail/create/edit/successor patterns for agreements, `/charge-agreements/rates`, rate create/detail with `?mode=edit`, manual-pricing evidence, BFF route handlers, and service APIs for charge rates and agreements. The current OpenAPI exposes `/pricing-requests` and `ApplicableDndRuleType` trigger metadata. No source match was found for `/dnd-pricing-requests` or `/charge-agreements/dnd/*`; those are proposed W3-01 surfaces and require Application Design confirmation.

The current shared UI source includes `PageHeader`, `RecordHeader`, `RouteTabs`, `DefinitionList`, `FilterToolbar`, `FilterChip`, `Pagination`, `Table`, `Field`, `Input`, `Select`, `Combobox`, `Dialog`, `StatusStrip`, `Skeleton`, `EmptyState`, `FailureState`, `PartialDataNotice`, `ConflictStrip`, `TechnicalDetails`, `IdentifierValue`, `CopyButton`, `StatusBadge`, `Button`, `Stack`, and `Inline`.

Source inspection shows the current shared `Dialog` traps Tab focus and restores the previously focused element on close, the current `Combobox` exposes `aria-activedescendant`, and `PlatformShell` can suppress the workflow ribbon when `journeyStage=null`. These are source observations, not live accessibility PASS evidence.

### Live-demo limitation

The requested browser binding for `http://127.0.0.1` was unavailable in this session, with no browser surface exposed. No live visual, keyboard, responsive, or accessibility claim is marked PASS. The review and later Refined Mockups/implementation gates must inspect the running integrated route.

## 5. Information architecture and route proposal

Application Design owns final identifiers, route spelling, BFF endpoints, view models, and authorization mapping. The following proposal extends the existing Charge base path and preserves its module-local navigation.

| Proposed route or surface | Purpose | Current status |
|---|---|---|
| `/charge-agreements/dnd/rules` | Search, filter, sort, and paginate D&D rule-type aggregates | Proposed |
| `/charge-agreements/dnd/rules/new` | Create a Draft instance of one fixed rule type | Proposed |
| `/charge-agreements/dnd/rules/[ruleTypeId]` | Rule identity, fixed pair, status, rates, links, versions, audit, permitted actions | Proposed |
| `/charge-agreements/dnd/rates` | Search, filter, sort, and paginate exact D&D rate versions | Proposed |
| `/charge-agreements/dnd/rates/new` | Create a Draft flat rate against an exact pricing-basis version | Proposed |
| `/charge-agreements/dnd/rates/[dndRateId]` | Rate terms, applicability, effective state, links, history, optional evaluation action | Proposed |
| `/charge-agreements/[agreementId]` D&D section/tab | Show D&D relationships for the selected exact agreement version | Existing route, proposed section |
| Existing Charge audit/evidence disclosure | Show attributable mutation/evaluation evidence within current authorization | Existing pattern, extended evidence |

All Charge administration routes pass `journeyStage=null`. They use the global Charge Agreements rail item and may expose module-local route links such as Agreements, Rate entries, Manual pricing, D&D rules, and D&D rates. Those links are ordinary route navigation, not a second sidebar or tab widget pretending to be navigation.

### URL state contract for lists

List state is server-backed and shareable through search parameters. Application Design confirms exact names, but the design needs these meanings:

- Rule list: query, rule type, lifecycle/effective state, port side, port, trade lane, equipment type, sort, page/cursor, page size.
- Rate list: query, rule type, pricing basis, exact basis reference/version, port, trade lane, equipment type, lifecycle/effective state, effective-on date, agreement link, sort, page/cursor, page size.
- Search applies on submit or a deliberately debounced server request; focusing a control never mutates results.
- Sorting is server-backed. The active sortable header exposes `aria-sort` and a named link/button.
- Back from detail restores filter, sort, and pagination state.
- No client-only fake pagination, bulk edit, saved view, or invented filter is shown.

## 6. Route-level design

### 6.1 Rule-type list

#### Page anatomy

1. Breadcrumbs: Charge Agreements / D&D rules.
2. `PageHeader`: title `D&D rules`, concise scope description, primary `Create rule` when permitted.
3. Charge module route links.
4. Server-backed search and filters with visible labels, Apply, and Clear.
5. Result count and active-filter chips.
6. Compact table at 768 px and above; semantic record rows at 375/390 px.
7. Pagination.
8. One status region for loading, filter result count, and scoped failures.

#### Table specification

| Column | Display |
|---|---|
| Rule | Stable human identifier plus readable rule-type label; stable row link |
| Bounding movement | `DISC - Discharge (Laden) -> GTOT - Gate out (Laden)`, equivalent fixed pair for selected type |
| Port side | `POD - import` or `POL - export` derived from the type |
| Counting basis | `Port-local calendar days` |
| Lifecycle | Draft or Approved; text plus semantic badge |
| Effective summary | Effective-rate count and nearest/current window, if returned by the server |
| Version | `vN`, tabular |
| Updated | Locale-readable timestamp; exact time available in evidence |

Default sort is most recently updated, then stable identifier. Selecting a row link opens the stable detail; the row itself is not a click-only target.

### 6.2 Rule-type create and Draft edit

The form creates or edits a Draft instance. It does not allow the user to redefine bilateral semantics.

#### Field groups

| Group | Fields and behavior |
|---|---|
| Rule identity | Stable display name/reference; rule type select limited to the three enum values; version and lifecycle shown read-only |
| Fixed movement contract | Start and end readable labels, DCSA codes, and `EMPTY`/`LADEN` qualifiers populated from rule type and locked |
| Derived applicability | Port side shown as POD for import types and POL for export detention; no user direction toggle |
| Counting basis | Read-only `Port-local calendar days`; `Weekends included`; `Holidays included`; no calendar selector |
| Commercial classification | Canonical Reference Data charge-code combobox with code plus label |
| Governance | Required change reason for update/approval/successor preparation; audit identity is server-derived |

Rules validate on blur after a field has been visited. Submit revalidates everything, preserves values, focuses a linked error summary, and moves through summary links to fields. Saving only produces/updates a Draft. Approval is a separate reviewed command from detail.

### 6.3 Rule detail and history

The header shows stable rule identity, readable type, lifecycle, selected version, and permitted actions. A Draft may expose `Edit Draft` and `Review and approve`; an Approved version exposes `Create successor` and never `Edit` or `Save`.

Sections:

- Summary: fixed movement pair, port side, counting basis, charge code.
- Rates: exact rate-version links and effective state.
- Agreements and tariffs: exact pricing-basis version relationships.
- Version history: predecessor/successor, version number, lifecycle, actor, time, reason.
- Audit evidence: collapsed `TechnicalDetails`, with correlation and stable IDs secondary to business facts.

History rows remain immutable and directly addressable. A selected historical version is visibly identified; current/effective and selected are not conflated.

### 6.4 D&D rate list

#### Table specification

| Column | Display |
|---|---|
| Rule | Readable rule type plus exact rule version |
| Pricing basis | Agreement or Tariff, human reference, exact basis version |
| Applicability | Derived POL/POD side, UN/LOCODE plus port label, trade lane, equipment type |
| Free time | Integer days, with `calendar days` basis |
| Daily rate | `USD 75.00 / calendar day`; currency and basis never implicit |
| Effective window | Inclusive from/to dates |
| Lifecycle/effective state | Draft or Approved plus Scheduled/Effective/Expired where applicable |
| Agreements | Count or concise linked references, if authorized |
| Version | Exact rate version and source/successor indicator |

Filters include rule type, exact basis type/version, port, trade lane, equipment type, lifecycle/effective state, effective-on date, and agreement link only when the real provider supports them.

### 6.5 D&D rate create and Draft edit

#### Field groups

| Group | Fields and behavior |
|---|---|
| Rule | Exact rule/rule-version selector; fixed movement pair and derived POL/POD side shown read-only |
| Pricing authority | `pricingBasis` Agreement/Tariff, `pricingRef`, and exact `pricingBasisVersionId`; selections use approved W2-03 authority only |
| Applicability | Canonical port combobox (UN/LOCODE plus name), trade lane, equipment type; side is derived and cannot conflict with rule type |
| Terms | Non-negative whole free days; one non-negative daily amount with at most two decimals; visible USD currency and per-calendar-day basis |
| Validity | Inclusive effective-from and effective-to dates; inline explanation of Scheduled/Effective/Expired derivation |
| Governance | Draft version, source version where successor, required change reason |

The form does not offer bands, working-day mode, holiday exclusion, customer override, destination/origin direction switch, arbitrary movement codes, or currency conversion.

Approval validation presents overlap against the exact matching key: pricing-basis version, rule type, derived side/port, trade lane, equipment type, and intersecting inclusive window. The conflict message names the existing version/window and offers `Open conflicting rate`; it never clears the Draft.

### 6.6 Rate detail

The detail header shows rule label, port, rate amount, selected version, lifecycle/effective state, and permitted commands. Body sections are:

- Terms: free days, flat daily amount, currency, charge code, effective window.
- Applicability: fixed pair/qualifiers, derived side, port and timezone, trade lane, equipment type.
- Pricing authority: basis, reference, exact basis version.
- Linked agreements: stable links to exact agreement versions.
- History: source/predecessor/successor and immutable values.
- Optional evaluation: bounded reviewed action described below.
- Audit: actor/time/reason/correlation in a collapsed disclosure.

### 6.7 Agreement D&D relationship view

The existing agreement detail may add a D&D section or in-route tab for the selected exact agreement version. It shows:

- agreement identity, selected version, validity, and lifecycle;
- linked D&D rule/rate versions grouped by rule type;
- fixed movement pair, port side/location, free days, daily rate/currency, and effective window;
- compatibility status such as `Covered`, `Scheduled`, `Expired`, or `Missing`, using text and semantic state;
- stable links to the owning rule and rate details.

The view is read-only relationship evidence. It does not edit D&D terms inline and does not add a second agreement approval workflow.

### 6.8 Optional bounded evaluation candidate

The approved requirements do not require a calculation-preview UI. This candidate documents the prompt-requested action for review without making it release scope. If accepted, it is an in-page section on rule/rate detail, not a general simulation route or Booking workflow.

#### Preconditions and inputs

- The selected detail supplies rule type, exact rule/rate version, port/location, trade lane, equipment type, and applicable timezone.
- The analyst supplies or reviews booking/equipment identity, closing movement event identity, exact echoed `pricingBasis`, `pricingRef`, `pricingBasisVersionId`, `pricingEffectiveDate`, and both movement event identities/timestamps.
- Start/end codes and load-state qualifiers are fixed by the selected rule type and displayed read-only.
- The exact idempotency-key composition is displayed as evidence, not freely edited.
- `Evaluate` remains disabled until every contract-required value is present and reviewed.

#### Result presentation

The result is a calculation sequence, not a KPI card:

1. Applicable port and timezone.
2. Start event timestamp -> start port-local date.
3. End event timestamp -> end port-local date.
4. `elapsedDays = max(0, endEpochDay - startEpochDay)`.
5. `chargeableDays = max(0, elapsedDays - freeDays)`.
6. `chargeableDays x dailyRate = amount`.
7. Currency, charge code, exact rule/rate version, exact agreement/tariff version, pricing reference, correlation, and calculation time.

Zero within free time is a successful result with an explicit zero line and the same source evidence. It is not an empty or no-rate state.

Evaluation failure never displays guessed values or a partial result. An expired/inactive or mismatched echoed authority uses the approved `404 NO_RATE` meaning; no new `RATE_EXPIRED` error code is invented.

## 7. Desktop wireframes

### Rule list at 1440/1024

```text
+--------------------------------------------------------------------------------------+
| Shared LinerCore shell | Charge Agreements                                           |
+--------------------------------------------------------------------------------------+
| Charge Agreements / D&D rules                                      [Create rule]    |
| Agreements | Rate entries | Manual pricing | D&D rules | D&D rates                  |
| Search [________________] Type [All] Port [All] State [All] [Apply] [Clear]           |
| 3 rules                                                               Sort [Updated] |
+--------------------------------------------------------------------------------------+
| Rule             Bounding movement                     Side  Basis       State  Ver. |
| Import demurrage DISC - Discharge (Laden) -> GTOT ...  POD   Port-local  Approved v3 |
| Import detention GTOT - Gate out (Laden) -> GTIN ...   POD   Port-local  Draft    v2 |
| Export detention GTOT - Gate out (Empty) -> GTIN ...   POL   Port-local  Approved v1 |
+--------------------------------------------------------------------------------------+
| Previous                         Page 1 of 1                                Next      |
+--------------------------------------------------------------------------------------+
```

### Rate detail at 1440/1024

```text
+--------------------------------------------------------------------------------------+
| < D&D rates  Import demurrage - NLRTM  [Approved] [Effective]  v4 [Create successor] |
| DISC Discharge (Laden) -> GTOT Gate out (Laden) | POD | Europe/Amsterdam            |
+------------------------------------------------------+-------------------------------+
| Terms                                                | Version evidence              |
| Free time                  5 calendar days           | Pricing basis  Agreement      |
| Daily rate                USD 75.00 / calendar day   | Reference      AGR-442        |
| Effective window          04 Aug 2026 - 31 Dec 2026  | Basis version  av-... / v7    |
| Weekends / holidays       Included / Included        | Rule version   drv-... / v3   |
|                                                      | Rate version   ddrv-... / v4  |
| Applicability                                        | [Open agreement v7]           |
| Port / side               NLRTM Rotterdam / POD      | [Show audit evidence]         |
| Trade lane                ASIA-NORTH-EUROPE           |                               |
| Equipment                 40HC                        |                               |
+------------------------------------------------------+-------------------------------+
| Linked agreements | Version history | Optional evaluation (review-dependent)        |
+--------------------------------------------------------------------------------------+
```

### Rate form at 1024/1440

```text
+--------------------------------------------------------------------------------------+
| New D&D rate                                                          Draft         |
| Fields marked Required. Values are preserved if validation fails.                    |
+-------------------------------------------+------------------------------------------+
| Rule and basis                            | Applicability                            |
| Rule type* [Import demurrage        v]    | Side         POD (derived)               |
| Pair       DISC/LADEN -> GTOT/LADEN       | Port*       [NLRTM - Rotterdam      v]   |
| Basis*     [Agreement               v]    | Trade lane* [Asia-North Europe      v]   |
| Reference* [AGR-442 / version 7      v]   | Equipment*  [40HC                   v]   |
+-------------------------------------------+------------------------------------------+
| Terms and validity                                                                    |
| Free days* [5]  Daily amount* [75.00]  Currency USD  Basis Per calendar day          |
| Effective from* [2026-08-04]   Effective to* [2026-12-31] (inclusive)                |
| Change reason* [_______________________________________________________________]      |
|                                                              [Cancel] [Save Draft]    |
+--------------------------------------------------------------------------------------+
```

### Optional evaluation and result at 1024/1440

```text
+--------------------------------------------------------------------------------------+
| Evaluate exact pricing snapshot (optional candidate)                                 |
| Agreement AGR-442 / v7 | Rate v4 | Import demurrage | NLRTM | 40HC                  |
| Booking* [BKG-...] Equipment* [MSCU...] Closing event* [EVT-...]                    |
| Start  DISC / LADEN [2026-08-04T18:00:00Z]                                           |
| End    GTOT / LADEN [2026-08-14T18:00:00Z]                             [Evaluate]    |
+--------------------------------------------------------------------------------------+
| Calculated successfully                                                              |
| Europe/Amsterdam: 04 Aug 2026 -> 14 Aug 2026                                         |
| Elapsed 10 days - Free 5 days = Chargeable 5 days                                    |
| 5 x USD 75.00 = USD 375.00                                                           |
| Rule v3 | Rate v4 | Agreement v7 | Correlation ...               [Copy evidence]    |
+--------------------------------------------------------------------------------------+
```

## 8. Mobile wireframes at 375/390

### Rule list

```text
+--------------------------------------+
| Shared shell mobile header           |
| Charge Agreements / D&D rules        |
| D&D rules                [Create]     |
| [Show filters (2 active)]             |
| 3 rules                               |
+--------------------------------------+
| Import demurrage          Approved    |
| DISC Discharge (Laden)                |
| to GTOT Gate out (Laden)              |
| POD | Port-local days | v3            |
| [Open rule]                          |
+--------------------------------------+
| Import detention          Draft       |
| GTOT Gate out (Laden)                 |
| to GTIN Gate in (Empty)               |
| POD | Port-local days | v2            |
| [Open rule]                          |
+--------------------------------------+
| Previous | Page 1 of 1 | Next         |
+--------------------------------------+
```

### Rate form

```text
+--------------------------------------+
| New D&D rate                         |
| Error summary (only when needed)     |
| Rule type*                           |
| [Import demurrage                v]  |
| Pair                                 |
| DISC/LADEN -> GTOT/LADEN             |
| Pricing basis* [Agreement        v]  |
| Exact version*  [AGR-442 / v7    v]  |
| Side             POD (derived)       |
| Port*            [NLRTM          v]  |
| Trade lane*      [Asia-N Europe  v]  |
| Equipment*       [40HC           v]  |
| Free days*       [5]                 |
| Daily amount*    [75.00]             |
| USD / calendar day                   |
| Effective from* [2026-08-04]         |
| Effective to*   [2026-12-31]         |
| Change reason*  [................]    |
| [Cancel]              [Save Draft]   |
+--------------------------------------+
```

### Optional evaluation result

```text
+--------------------------------------+
| Evaluation result                    |
| Calculated successfully              |
| Port timezone                        |
| Europe/Amsterdam                     |
| Start local date       04 Aug 2026   |
| End local date         14 Aug 2026   |
| Elapsed days           10            |
| Free days              5             |
| Chargeable days        5             |
| Daily rate             USD 75.00     |
| Total                  USD 375.00    |
| Rule v3 | Rate v4 | Agreement v7    |
| [Show technical evidence]            |
+--------------------------------------+
```

Mobile detail uses one continuous page: identity, status, terms, applicability, relationships, history, then evidence. No page-level horizontal scroll, sticky overlay over content, or modal is required for evaluation.

## 9. High-fidelity interaction rules

### Commands and immutability

- `Save Draft` updates only a Draft with an expected row version.
- `Review and approve` opens a focused `Dialog` that names the exact record/version, applicability, window, flat terms, linked basis, change reason, overlap status, and immutability consequence.
- `Approving...`, `Saving...`, `Creating successor...`, and `Evaluating...` retain stable dimensions and block duplicate submission.
- Approval success returns to detail, updates lifecycle/history, focuses the stable detail heading or status region, and announces the exact version once.
- Approved commercial fields render as text/definition data, never disabled-looking editable inputs.
- `Create successor` copies the approved source into a new Draft and preserves the source link; it never mutates or relabels history.
- Dirty navigation uses the shared `Dialog`; Cancel/Escape restores the initiating control and Leave names the unsaved scope.

### Validation and recovery

- Validate visited fields on blur; do not validate untouched fields on initial render.
- Invalid submit focuses an assertive error summary. Each link moves focus to a persistent labelled field and the inline error remains associated with `aria-describedby` and `aria-invalid`.
- Service and version conflicts preserve every entered value and selected reference.
- A conflict names current versus expected version and offers `Review current version` and `Reload`; it never silently overwrites.
- An overlap error names the matching dimensions and existing effective window without exposing unauthorized commercial data.
- A safe Retry is offered only for a retryable read/evaluation failure. Validation, denied, conflict, and malformed outcomes do not masquerade as retryable outage.

### Tables and links

- Tables have a caption or labelled region, real column headers, stable column widths, and `aria-sort` on the active sortable column.
- Record identity is an explicit link. Row hover is supplementary and never the only interaction cue.
- Result count and pagination changes use one polite announcement.
- On narrow screens, rule/rate tables become semantic labelled record items. Version history may use a labelled inner overflow region when preserving column comparison is more useful.

### Content format

- DCSA codes always appear with readable movement labels and load state.
- Money always includes ISO currency, decimal amount, and per-calendar-day basis.
- Dates are locale-readable with the ISO value available where precision matters.
- Versions and identifiers use tabular numerals/mono selectively; primary business labels remain in the interface font.
- Status always combines text and semantic icon/tone. `Draft`, `Approved`, `Scheduled`, `Effective`, `Expired`, `Read-only`, and failure codes are not color-only.
- Correlation IDs, request fingerprints, and raw diagnostic details remain in collapsed technical evidence.

## 10. State and recovery matrix

| Surface/state | Primary presentation | Allowed recovery | Data preservation / prohibition |
|---|---|---|---|
| List loading | Stable header/filter/table skeleton; one loading status | Wait | No spinner-only blank page |
| True empty | `No D&D rules yet` or `No D&D rates yet`; Create when permitted | Create | Not used for filtered zero |
| Filtered empty | `No results match these filters` plus active filters | Clear/edit filters | Keep URL/filter state |
| Populated | Result count, rows, sort, pagination | Open stable record | Server data only |
| Read-only | Inline status naming read capability; mutation commands absent | Continue reading | No disabled fake commands |
| Denied | Shared denied route/state | Return to permitted module | No count, row, terms, or evidence disclosure |
| Not found | Named missing/stale record state | Back to preserved list | No generic empty state |
| Partial/degraded read | Available business facts plus `PartialDataNotice`; affected section named | Retry affected section | Do not replace known facts with guesses |
| Draft validation blocked | Summary plus field errors | Correct fields | Preserve all entered values |
| Reference loading/error | Stable control skeleton/status; no half-ready combobox | Retry reference source | Never invent local options |
| Save pending | `Saving...`, one in-flight command | Wait | Preserve form; block duplicate |
| Save success | Persistent Draft detail plus concise toast/live message | Continue/review | Toast is not sole evidence |
| Approval pending | Dialog remains in context with `Approving...` | Wait | Block duplicate/close during commit if unsafe |
| Version conflict | `ConflictStrip` with expected/current version | Review/Reload | Preserve Draft and reason |
| Overlapping authority | Field/summary error naming exact key/window | Open conflict, revise window | No partial approval |
| Approved history | Read-only terms and source links | Create successor | No edit/delete affordance |
| Evaluation pending | Preserve reviewed inputs; stable result skeleton/status | Wait | One idempotency key; no duplicate |
| Evaluation zero success | Explicit zero line and full versions | Copy evidence | Never empty/no-rate |
| Evaluation positive success | Calculation sequence and exact source versions | Copy evidence | Atomic result only |
| `400 PRICING_BAD_REQUEST` | Integration/malformed message with correlation | Correct request | No retry or persisted result |
| `401` / `403` | Identity/permission state | Sign in or request access through existing ownership | No commercial disclosure |
| `404 NO_RATE` | Echoed authority/applicability could not be used | Review exact basis/port/lane/equipment | No fallback, reselect, rate, or partial calculation |
| Expired/inactive authority | Admin detail shows Expired; evaluation maps to `NO_RATE` | Open source version or use valid booking-time snapshot | No invented `RATE_EXPIRED` wire code |
| `409 IDEMPOTENCY_CONFLICT` | Key reused with different fingerprint | Review original/request identity | No automatic retry or second result |
| `409 PRICING_IN_PROGRESS` | Existing owner still processing with guidance | Retry only after approved guidance | No duplicate result |
| `422 PRICING_VALIDATION` | Exact pair/qualifier/order/semantic error | Correct input | No retry, result, or partial line |
| `503 PRICING_UNAVAILABLE` | Scoped unavailable state with correlation | Contract-safe Retry where permitted | Preserve reviewed inputs; no guessed charge |
| Degraded evidence | Calculation may be known but required lineage section unavailable | Retry evidence; keep acceptance blocked | Do not call full result/evidence PASS |

## 11. Responsive contract

| Width | Required behavior |
|---|---|
| 375 and 390 px | Shared mobile shell; one-column forms; commands wrap; filters use an in-flow disclosure; list tables become record items; evaluation becomes in-flow; evidence follows the primary task; no page overflow |
| 768 px | Two-column filters only when labels remain readable; tables use labelled inner overflow; detail rail moves below content or into an accessible disclosure; form stays one column where needed |
| 1024 px | Compact list table; detail uses main content plus a narrow evidence/action rail; no nested-card grid; primary action remains visible without overlay |
| 1440 px | Full compact columns and evidence rail with controlled line length; whitespace improves grouping rather than producing oversized cards |

At every width, test long identifiers, long port/trade labels, three-digit free days, large money values, localized dates, zero/one/many linked agreements, long validation messages, 200% zoom, light theme, and dark theme. Typography does not scale with viewport width.

## 12. Accessibility contract

WCAG 2.2 AA is the design target and satisfies the project's WCAG 2.1 AA floor.

### Structure and navigation

- One routed `main`, one visible `h1`, sequential `h2`/`h3`, and the shared skip link.
- Shared module navigation identifies Charge Agreements; route links use `aria-current=page`.
- Keyboard order follows visual order: heading, primary command, route links, filters, results, pagination, then secondary evidence.
- Stable object links, buttons, native disclosures, form controls, and tables are used before ARIA substitutes.

### Forms and errors

- Persistent visible labels; placeholders are examples only.
- Required/optional meaning, hint, and error are programmatically associated.
- Numeric fields use suitable `inputMode`; daily amount remains decimal, free days whole-number.
- The error summary receives focus after invalid submit and names the error count; field links work.
- Dynamic rule selection announces the derived movement pair and port side politely without moving focus.
- Reference comboboxes expose expanded state, active descendant, selected option, no matches, and errors. Async loading/error remains a surrounding `Skeleton`/`StatusStrip` responsibility unless the shared primitive adds a contract.

### Dialog, focus, and announcements

- Approval and dirty-state dialogs have labelled title/description, focus containment, safe Escape behavior, and trigger restoration.
- Pending commands retain focus unless navigation succeeds. Success navigation focuses the new detail heading; inline success does not steal focus.
- One polite region announces list count, save/approval/evaluation progress, and terminal result once. Validation summaries use assertive announcement.
- Toasts may supplement but never replace persistent state.
- `prefers-reduced-motion` removes nonessential transitions; no scale hover or animated calculation.

### Tables and calculation

- Table captions/labels, scoped headers, named sort controls, keyboard-reachable row links, and named overflow regions.
- Mobile record rows preserve the same information and link name as desktop.
- Calculation uses an ordered semantic sequence/definition list. Screen-reader order matches the visible formula.
- Status, errors, zero result, and effective state always have non-color text.

## 13. `@erp/ui` mapping and platform dependencies

| Surface/behavior | Shared primitive/token | Charge-owned composition | Status |
|---|---|---|---|
| Page/list header | `PageHeader`, `Breadcrumbs`, `Button`, `Stack` | D&D identity, count, and primary command | PASS for design mapping only |
| Detail identity/actions | `RecordHeader`, `StatusBadge`, `Button` | Rule/rate version header and action policy | PASS for design mapping only |
| Module routes | `RouteTabs` or ordinary links | Agreements/rates/D&D links with route semantics | PASS for design mapping only |
| Search/filter | `FilterToolbar`, `Field`, `Input`, `Select`, `Combobox`, `FilterChip` | URL-backed server query and domain options | BLOCKED pending provider/query confirmation |
| Lists/history/links | `Table`, `Pagination`, `EmptyState`, `Skeleton` | Sort headers, stable row links, mobile records | PASS for design mapping only |
| Forms | `Field`, `Input`, `Select`, `Combobox`, `StatusStrip`, `Button` | Fixed-rule derivation, flat-rate terms, error summary | PASS for design mapping only |
| Approval/dirty guard | `Dialog`, `Button`, `StatusStrip` | Exact version review and command state | BLOCKED pending live keyboard proof |
| Detail facts | `DefinitionList`, `IdentifierValue`, `StatusBadge` | Terms, applicability, lineage | PASS for design mapping only |
| Conflict/degraded/error | `ConflictStrip`, `PartialDataNotice`, `FailureState`, `StatusStrip` | Exact recovery ownership | PASS for design mapping only |
| Technical evidence | `TechnicalDetails`, `CopyButton` | Correlation, request/result/version evidence | PASS for design mapping only |
| Shared shell/ribbon | `PlatformShell`, `--erp-*` tokens | Charge page passes no journey stage | BLOCKED pending integrated live route proof |

`PASS for design mapping only` means an existing shared primitive is identified; it is not an observed implementation or accessibility PASS.

### Missing or unresolved shared capability

1. The shared `Combobox` has active-descendant behavior but no explicit async loading/error API. Use surrounding shared states and mount settled options; do not fork a local combobox. If real server-backed option volume requires async paging within the popup, record a UI-platform dependency.
2. No dedicated Drawer is required by this candidate. Mobile filters and optional evaluation expand in flow, avoiding a new shared primitive.
3. No D&D-specific calculation component belongs in `packages/ui`; the ordered calculation is a Charge-domain composition of existing layout/definition primitives.
4. Sortable server-backed table headers may be composed from native links/buttons and `Table`. If three or more domains need identical behavior, propose a UI-platform primitive through normal ownership, not W3-01.

No candidate gap authorizes edits to `packages/ui`, `apps/shell`, the LinerCore master, tokens, or navigation.

## 14. Requirements and story traceability

| Design surface | Requirements/stories | Design evidence |
|---|---|---|
| Fixed rule authoring | FR-01, FR-02, FR-09; US-01 | Rule list/form/detail, fixed pair, derived side, canonical references |
| Flat rate/applicability | FR-02, FR-05; US-01 | Rate form/detail, no bands/calendar editor, port-local basis |
| Immutable lifecycle | FR-03, FR-10, FR-12; US-02 | Approval review, read-only Approved history, successor flow, audit |
| Trigger metadata | FR-11; US-02 AC5 | Agreement/rule evidence acknowledges metadata-only `applicableDndRuleTypes`; no free days/rates exposed there |
| Exact echoed evaluation | FR-04, FR-05, FR-07, FR-10; US-03 | Optional bounded input review and exact calculation/version sequence |
| Safe outcomes | FR-06, FR-08, FR-12; US-04 | Error/idempotency/atomicity state matrix and outcome-specific evidence |
| Authorization/audit | FR-12; NFR-03/NFR-04 | Server-derived capabilities, denied/no-disclosure state, collapsed evidence |
| Accessibility/responsive | FR-09; NFR-06 | 375/390/768/1024/1440 behavior, focus/errors/announcements/contrast |
| W2-03 compatibility | FR-03, FR-04, FR-10, FR-11; NFR-07 | Exact basis/version links, no reselection, no contract rename/replacement |

## 15. Playwright and visual-regression acceptance checklist

These are required future observations, not results from this design-only run.

### Routes and server behavior

- [ ] Direct navigation, reload, back, and forward work for every approved D&D route.
- [ ] Rule and rate searches, filters, sorting, pagination, result counts, and row links are server-backed.
- [ ] Filter state survives detail round-trip; no client-only fake row or result exists.
- [ ] Charge pages render inside the shared authenticated shell with the Charge module active and no journey ribbon.
- [ ] Denied and read-only states derive from real server capability, with no unauthorized evidence disclosure.

### Authoring and lifecycle

- [ ] Each fixed rule type shows the exact DCSA pair and qualifiers and cannot be arbitrarily changed.
- [ ] Draft save preserves exact references, flat terms, validity, reason, and entered values after validation/service failure.
- [ ] Overlap approval is blocked with field-specific existing-version/window evidence.
- [ ] Approval review names exact version/terms/links and produces immutable history.
- [ ] Approved detail has no edit/save control; successor creates a distinct Draft and leaves source bytes unchanged.
- [ ] Agreement D&D relationship links exact versions and never edits inline.

### Optional evaluation, if approved

- [ ] Same-local-date and five-day cases return explicit zero results with full source evidence.
- [ ] 04 Aug to 14 Aug, five free days, USD 75/day returns elapsed 10, chargeable 5, USD 375.00.
- [ ] UTC/local-midnight counterexamples use the port timezone and display local dates/timezone.
- [ ] Old echoed snapshots stay on historical versions; successor snapshots use the successor.
- [ ] Malformed/auth/no-rate/conflict/in-progress/validation/unavailable outcomes keep exact HTTP/code meaning, create no partial result, and expose appropriate evidence only.
- [ ] Same key/fingerprint replay returns the immutable result; different fingerprint never duplicates the charge.

### Keyboard and accessibility

- [ ] Shared skip link, headings, landmarks, route links, filters, table links, forms, history, and disclosures follow logical order.
- [ ] Visible focus is never clipped or removed.
- [ ] Error summary receives focus and every link reaches its field.
- [ ] Combobox arrow, Enter, Escape, active descendant, selection, no-match, loading, and error behavior pass with real reference data.
- [ ] Approval/dirty dialogs trap focus, handle safe Escape, prevent duplicate submit, and restore focus.
- [ ] Async list/save/approval/evaluation states announce once with correct politeness.
- [ ] Status, sort, errors, zero amount, and selected/current versions do not rely on color.
- [ ] Automated accessibility checks report no critical or serious violations; keyboard/focus receives manual review.

### Visual and responsive

- [ ] Screenshots and bounding-box/scroll assertions pass at 375, 390, 768, 1024, and 1440 px.
- [ ] Light and dark themes pass contrast and focus checks.
- [ ] No page-level horizontal scroll; labelled inner table overflow is intentional where used.
- [ ] Long identifiers, labels, dates, reasons, money, and zero/one/many rows do not overlap or hide primary actions.
- [ ] 200% zoom and reduced-motion emulation pass.
- [ ] Skeletons reserve stable dimensions and do not become spinner-only blank screens.

## 16. Unresolved questions

1. **Optional evaluation UI:** Should the bounded evaluation section become approved W3-01 UI scope, or should implementation defer it and prove evaluation only through direct API/live acceptance as FR-09 permits? Recommendation: defer it as a mandatory UI surface; retain this design for a later explicit decision.
2. **Rule aggregate semantics:** Does `Create rule` create one configured aggregate instance per fixed rule type and applicability, or are the three rule types seeded catalogue records with only rates versioned beneath them? Application Design must choose without allowing arbitrary movement pairs.
3. **Final route and identifier contract:** Confirm `ruleTypeId`, `dndRateId`, nested `/charge-agreements/dnd/*` spelling, legacy alias/redirect policy, and whether Draft rate edit uses `?mode=edit` like W2-03.
4. **Administration API shape:** The current OpenAPI has trigger metadata but no `/dnd-pricing-requests` or D&D administration schemas. Confirm additive read/write view models, server-side filter/sort/pagination capabilities, concurrency tokens, and exact error envelopes before the routes become binding.
5. **Pricing-basis linkage:** Confirm how the administration UI searches and distinguishes exact AgreementVersion versus tariff-composite version references, including what readable label can be shown without leaking unauthorized commercial detail.
6. **Port timezone reference:** Confirm the canonical Reference Data field/API that supplies port timezone and how missing/invalid timezone is represented. The UI must block or show a scoped provider error; it cannot default to browser timezone or UTC.
7. **Charge-code labels:** Confirm the active charge-code records used for the three rule types. The design intentionally does not invent DEM/DET codes absent from approved Reference Data evidence.
8. **Live visual baseline:** Re-run this candidate against the integrated `http://127.0.0.1` Charge routes when a browser surface is available and record screenshots/keyboard evidence before design approval.

## 17. Review checklist

- [ ] Approved Requirements Analysis and User Stories remain the business authority.
- [ ] Exactly three fixed rule types and qualifiers are represented; generic combined and arbitrary pairs are absent.
- [ ] Free days plus one flat daily rate is used everywhere; progressive bands and calendar editors are absent.
- [ ] Port-local formula, weekend/holiday inclusion, and zero-result meaning are explicit.
- [ ] W2-03 agreement-first/tariff-fallback evidence, immutable versions, and additive pricing v1 behavior are preserved.
- [ ] `applicableDndRuleTypes` remains trigger metadata only, with no free days or rates.
- [ ] Charge, Booking, Container Movement, Reference Data, shell, and UI-platform ownership boundaries are correct.
- [ ] Proposed routes and APIs are labelled provisional and reserved for Application Design confirmation.
- [ ] List/search/filter/sort/pagination behavior is server-backed and includes loading, true empty, and filtered-empty states.
- [ ] Draft, Approved, Scheduled, Effective, Expired, read-only, denied, conflict, no-rate, unavailable, degraded, and recovery states are complete.
- [ ] Approved history is visibly immutable and only successors can change commercial terms.
- [ ] Evaluation is clearly optional pending review and, if accepted, validates the exact echoed snapshot without reselection.
- [ ] Desktop and 375/390 mobile wireframes cover list, detail, forms, relationships, and optional evaluation.
- [ ] WCAG 2.2 AA behavior covers labels, errors, keyboard order, focus trap/restore, announcements, contrast, reduced motion, and non-color status.
- [ ] Responsive behavior is defined for 375, 390, 768, 1024, and 1440 px in light and dark themes.
- [ ] Every surface maps to existing `@erp/ui` primitives or an explicit platform dependency; no local design system is introduced.
- [ ] UI/UX Pro Max marketing, replacement palette/font, chart-first, bulk-edit, spinner-first, and blanket Server Action suggestions are rejected.
- [ ] Live browser evidence remains honestly unverified and is not represented as PASS.
- [ ] No production code, routes, APIs, tests, packages, infrastructure, page contract, or AI-DLC state was modified.
