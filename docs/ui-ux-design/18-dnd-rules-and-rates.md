# W3-01 D&D Rules and Rates - Design Candidate

**Status:** Approved on 2026-08-09 as binding page-level input for W3-01 Refined Mockups; routes, identifiers, APIs, providers, and implementation remain subject to Application Design  
**Prepared:** 2026-08-03  
**Reviewed:** 2026-08-09  
**Owning domain:** Charge Calculation and Customer Agreement  
**Primary persona:** Pricing Analyst  
**AI-DLC position:** Approved page-level input being converted into binding Refined Mockups 2.5 artifacts

## 1. Decision summary

This candidate defines Charge-owned administration for combined, versioned demurrage-and-detention rule/rate terms: one fixed rule type plus its applicability, flat daily rate, exact agreement-or-tariff basis, validity, and attributable evidence in each Draft. It remains inside the existing authenticated LinerCore shell and extends the current Charge Agreements workbench pattern. It does not create a second shell, local theme, component library, Booking workflow, Container Movement rule editor, or production route/API contract.

The approved W3-01 Requirements Analysis overrides stale wording in the source intent, prompt, and provisional rough flow:

- The MVP has exactly three rule types: `IMPORT_DEMURRAGE`, `IMPORT_DETENTION`, and `EXPORT_DETENTION`. There is no generic combined D&D rule.
- Each rule type has a fixed DCSA T&T v2.2 movement-code and load-state pair. Users do not author arbitrary movement pairs.
- The MVP has free days followed by one flat daily rate. Progressive bands are not designed.
- Counting uses port-local calendar-date boundaries. Weekends and holidays are ordinary days; there is no calendar editor or fallback to UTC.
- Evaluation validates the exact echoed booking-time pricing snapshot. It never reselects agreement versus tariff and never silently upgrades to a newer version.
- The required Charge UI covers one combined terms list, create/edit Draft, detail, approval/successor, agreement relationship, version, and audit evidence. Direct API/live acceptance proves calculation; no calculation-preview route, panel, or action is part of W3-01 UI scope.

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
| Mandatory calculation preview | Direct API is sufficient for W3-01 acceptance | Deferred; no W3-01 UI surface |
| Separate rule-definition and rate-version UI lifecycles | One combined rule/rate Draft and successor lifecycle | Rejected by review decision |
| Enterprise Gateway, hero, sales CTA, logo carousel | Authenticated operational workbench | Rejected |
| Replacement blue/amber palette and Source Sans 3, Inter, or Fira fonts | LinerCore tokens and IBM Plex Sans/system stack | Rejected |
| Chart-first dashboard and KPI cards | Lists, forms, definition lists, history tables, evidence | Rejected |
| Spinner-first loading | Stable LinerCore skeletons plus one live status | Rejected |
| Bulk editing and saved views | Not approved for W3-01 | Rejected |
| Server Actions as a blanket mutation rule | Existing authenticated BFF/API-core boundary | Advisory only; rejected as a default |

Adopted skill guidance is limited to dense scannable tables, server-backed filters, stable row links, blur validation, preserved values, explicit pending/success/error feedback, semantic HTML, keyboard order, visible focus, responsive table handling, reduced motion, and accessible async announcements.

### Review verdict - 2026-08-09

| Review area | Status | Evidence or blocker |
|---|---|---|
| Approved business rules and exact calculation semantics | PASS | The candidate matches FR-01 through FR-12 and US-01 through US-04 on fixed rule types, flat rates, port-local dates, immutable versions, exact echoed snapshots, errors, idempotency, and ownership. |
| W2-03 pricing/version compatibility | PASS | Inclusive windows, scale-two exact money, immutable Approved versions, successor lineage, and agreement-first/tariff-fallback evidence are preserved. |
| Shared shell, tokens, and domain ownership | PASS | The design reuses the authenticated Charge shell and source-verified `@erp/ui` exports; it proposes no local theme, shell, navigation, or shared-package change. |
| Rule/rate aggregate model | PASS | Review selected one combined versioned Draft containing the fixed type, applicability, commercial terms, exact basis, validity, and lineage. |
| Optional evaluation UI | NOT APPLICABLE | Review deferred the preview; direct API and live acceptance remain binding and no evaluation UI is designed for W3-01. |
| Route, identifier, provider, and reference contracts | BLOCKED | The routes are correctly provisional and may remain page-level design input; Application Design must resolve questions 3 through 7 before implementation. |
| Complete responsive route evidence | PASS | The combined list, form, detail, and agreement-relationship compositions are specified for desktop, tablet, and mobile; route spelling remains provisional. |
| Integrated visual, keyboard, and accessibility evidence | BLOCKED | No live browser surface was available; source inspection and design intent are not integrated PASS evidence. |

Review corrections applied to this document split unauthenticated and forbidden recovery, add the US-04 outcome-specific evidence contract, normalize component evidence to `PASS`/`BLOCKED`/`NOT APPLICABLE`, adopt the combined Draft lifecycle, remove the evaluation UI, and expand acceptance/release traceability. Downstream NFR-07 traceability uses US-02 AC5 plus RV-05; the approved stage 2.4 source artifact is not silently edited by this design-only review. No new API, permission, persona, or business capability was introduced.

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

The requested browser binding for `http://127.0.0.1` was unavailable during initial generation and again during the complete-task refresh on 2026-08-09; no browser surface was exposed. No live visual, keyboard, responsive, or accessibility claim is marked PASS. The later Refined Mockups/implementation gates must inspect the running integrated route when it exists and a browser surface is connected.

## 5. Information architecture and route proposal

Application Design owns final identifiers, route spelling, BFF endpoints, view models, and authorization mapping. The following proposal extends the existing Charge base path and preserves its module-local navigation.

| Proposed route or surface | Purpose | Current status |
|---|---|---|
| `/charge-agreements/dnd/terms` | Search, filter, sort, and paginate combined D&D rule/rate aggregates and versions | Proposed logical route; spelling is not binding |
| `/charge-agreements/dnd/terms/new` | Create one combined Draft with a fixed rule type, applicability, terms, basis, and validity | Proposed logical route; spelling is not binding |
| `/charge-agreements/dnd/terms/[dndTermId]` | Combined terms, applicability, status, exact links, versions, audit, and permitted lifecycle actions | Proposed logical route; spelling and identifier are not binding |
| `/charge-agreements/[agreementId]` D&D section/tab | Show D&D relationships for the selected exact agreement version | Existing route, proposed section |
| Existing Charge audit/evidence disclosure | Show attributable mutation/evaluation evidence within current authorization | Existing pattern, extended evidence |

All Charge administration routes pass `journeyStage=null`. They use the global Charge Agreements rail item and may expose module-local route links such as Agreements, Rate entries, Manual pricing, and D&D terms. Those links are ordinary route navigation, not a second sidebar or tab widget pretending to be navigation.

### URL state contract for lists

List state is server-backed and shareable through search parameters. Application Design confirms exact names, but the design needs these meanings:

- Combined terms list: query, rule type, pricing basis, exact basis reference/version, derived port side, port, trade lane, equipment type, lifecycle/effective state, effective-on date, agreement link, sort, page/cursor, and page size.
- Search applies on submit or a deliberately debounced server request; focusing a control never mutates results.
- Sorting is server-backed. The active sortable header exposes `aria-sort` and a named link/button.
- Back from detail restores filter, sort, and pagination state.
- No client-only fake pagination, bulk edit, saved view, or invented filter is shown.

## 6. Route-level design

### 6.1 Combined D&D terms list

#### Page anatomy

1. Breadcrumbs: Charge Agreements / D&D terms.
2. `PageHeader`: title `D&D terms`, concise scope description, primary `Create D&D terms` when permitted.
3. Charge module route links.
4. Server-backed search and filters with visible labels, Apply, and Clear.
5. Result count and active-filter chips.
6. Compact table at 768 px and above; semantic combined-term records at 375/390 px.
7. Pagination.
8. One status region for loading, filter result count, and scoped failures.

#### Table specification

| Column | Display |
|---|---|
| Terms | Stable aggregate identifier plus readable fixed rule-type label; stable row link |
| Bounding movement | `DISC - Discharge (Laden) -> GTOT - Gate out (Laden)`, equivalent fixed pair for selected type |
| Applicability | Derived `POD - import` or `POL - export`, UN/LOCODE, trade lane, and equipment type |
| Pricing basis | Agreement or Tariff, readable reference, exact basis version |
| Terms | Free calendar days and `USD n.nn / calendar day` |
| Lifecycle | Draft or Approved; text plus semantic badge |
| Effective window/state | Inclusive window plus Scheduled, Effective, or Expired when Approved |
| Version | `vN`, tabular |
| Updated | Locale-readable timestamp; exact time available in evidence |

Default sort is most recently updated, then stable identifier. Selecting a row link opens the stable detail; the row itself is not a click-only target.

### 6.2 Combined create and Draft edit

The form creates or edits one combined rule/rate Draft. Selecting one of the three fixed rule types derives the immutable bilateral movement semantics and POL/POD side; the same Draft carries applicability, exact pricing authority, flat terms, validity, charge classification, and change reason.

#### Field groups

| Group | Fields and behavior |
|---|---|
| Identity and rule | Stable aggregate display reference; rule type select limited to the three enum values; version and lifecycle shown read-only |
| Fixed movement contract | Start and end readable labels, DCSA codes, and `EMPTY`/`LADEN` qualifiers populated from rule type and locked |
| Derived applicability | Port side shown as POD for import types and POL for export detention; no user direction toggle |
| Counting basis | Read-only `Port-local calendar days`; `Weekends included`; `Holidays included`; no calendar selector |
| Pricing authority | `pricingBasis` Agreement/Tariff, `pricingRef`, and exact `pricingBasisVersionId`; options use approved W2-03 authority only |
| Applicability | Canonical UN/LOCODE port, trade lane, and equipment type; selected values use Reference Data code plus readable label |
| Commercial terms | Non-negative whole free days; one non-negative scale-two daily amount; read-only USD and per-calendar-day basis; canonical charge-code combobox |
| Validity | Inclusive effective-from and effective-to dates; Scheduled/Effective/Expired is derived only after approval |
| Governance | Required change reason for update/approval/successor preparation; audit identity is server-derived |

Rules validate on blur after a field has been visited. Submit revalidates everything, preserves values, focuses a linked error summary, and moves through summary links to fields. Saving only produces/updates a Draft. Approval is a separate reviewed command from detail.

### 6.3 Combined detail and history

The header shows stable D&D terms identity, readable fixed rule type, port, lifecycle/effective state, selected version, and permitted actions. A Draft may expose `Edit Draft` and `Review and approve`; an Approved version exposes `Create successor` and never `Edit` or `Save`.

Sections:

- Summary: fixed movement pair, derived port side, counting basis, free days, flat daily amount, currency, charge code, applicability, and validity.
- Pricing authority: exact AgreementVersion or tariff-composite basis/reference/version relationship.
- Agreement relationships: stable links to exact agreement versions when authorised.
- Version history: predecessor/successor, version number, lifecycle, actor, time, reason.
- Audit evidence: collapsed `TechnicalDetails`, with correlation and stable IDs secondary to business facts.

History rows remain immutable and directly addressable. A selected historical version is visibly identified; current/effective and selected are not conflated.

The form does not offer bands, working-day mode, holiday exclusion, customer override, destination/origin direction switch, arbitrary movement codes, or currency conversion.

Approval validation presents overlap against the exact matching key: pricing-basis version, rule type, derived side/port, trade lane, equipment type, and intersecting inclusive window. The conflict message names the existing version/window and offers `Open conflicting terms`; it never clears the Draft.

### 6.4 Agreement D&D relationship view

The existing agreement detail may add a D&D section or in-route tab for the selected exact agreement version. It shows:

- agreement identity, selected version, validity, and lifecycle;
- linked combined D&D rule/rate versions grouped by fixed rule type;
- fixed movement pair, port side/location, free days, daily rate/currency, and effective window;
- compatibility status such as `Covered`, `Scheduled`, `Expired`, or `Missing`, using text and semantic state;
- stable links to the owning combined D&D terms detail.

The view is read-only relationship evidence. It does not edit D&D terms inline and does not add a second agreement approval workflow.

### 6.5 Deferred evaluation UI boundary

W3-01 exposes no calculation-preview route, panel, form, or command. Direct API, contract, and live Compose evidence prove the provider calculation, exact echoed snapshot, zero/non-zero result, successor behavior, idempotency, and errors. Existing authorised audit evidence may show the outcome-specific facts defined in Section 10.1, but this does not create an analyst simulation workflow or new evidence-retrieval journey.

## 7. Desktop wireframes

### Combined terms list at 1440/1024

```text
+--------------------------------------------------------------------------------------+
| Shared LinerCore shell | Charge Agreements                                           |
+--------------------------------------------------------------------------------------+
| Charge Agreements / D&D terms                              [Create D&D terms]        |
| Agreements | Rate entries | Manual pricing | D&D terms                              |
| Search [________] Type [All] Port [All] State [All] [Apply] [Clear]                  |
| 8 terms                                                               Sort [Updated] |
+--------------------------------------------------------------------------------------+
| Terms / rule       Applicability        Basis/version   Terms          State    Ver. |
| Import demurrage  NLRTM/POD · 40HC     AGR-442 / v7    5d · USD75    Effective v4   |
| Import detention  NLRTM/POD · 40HC     AGR-442 / v7    3d · USD55    Draft     v2   |
| Export detention  SGSIN/POL · 40HC     Tariff / t9     4d · USD60    Scheduled v1   |
+--------------------------------------------------------------------------------------+
| Previous                         Page 1 of 1                                Next      |
+--------------------------------------------------------------------------------------+
```

Each rule label expands to the fixed readable DCSA pair in the accessible name or secondary row content; compact columns never hide currency, calendar-day basis, exact basis version, or lifecycle text.

### Combined detail at 1440/1024

```text
+--------------------------------------------------------------------------------------+
| < D&D terms  Import demurrage · NLRTM  [Approved] [Effective] v4 [Create successor] |
| DISC Discharge (Laden) -> GTOT Gate out (Laden) | POD | Europe/Amsterdam            |
+------------------------------------------------------+-------------------------------+
| Commercial terms                                     | Version evidence              |
| Free time                  5 calendar days           | Pricing basis  Agreement      |
| Daily rate                USD 75.00 / calendar day   | Reference      AGR-442        |
| Effective window          04 Aug 2026 - 31 Dec 2026  | Basis version  av-... / v7    |
| Weekends / holidays       Included / Included        | Terms version  ddt-... / v4   |
| Applicability                                        | [Open agreement v7]           |
| Port / side               NLRTM Rotterdam / POD      | [Show audit evidence]         |
| Trade lane                ASIA-NORTH-EUROPE           |                               |
| Equipment                 40HC                        |                               |
+------------------------------------------------------+-------------------------------+
| Agreement relationships | Version history                                            |
+--------------------------------------------------------------------------------------+
```

### Combined Draft form at 1024/1440

```text
+--------------------------------------------------------------------------------------+
| New D&D terms                                                        Draft           |
| Fields marked Required. Values are preserved if validation fails.                    |
+-------------------------------------------+------------------------------------------+
| Fixed rule and pricing basis              | Applicability                            |
| Rule type* [Import demurrage        v]    | Side         POD (derived)               |
| Pair       DISC/LADEN -> GTOT/LADEN       | Port*       [NLRTM - Rotterdam      v]   |
| Basis*     [Agreement               v]    | Trade lane* [Asia-North Europe      v]   |
| Reference* [AGR-442 / version 7      v]   | Equipment*  [40HC                   v]   |
+-------------------------------------------+------------------------------------------+
| Terms, classification, and validity                                                   |
| Free days* [5]  Daily amount* [75.00]  USD / calendar day  Charge code* [code v]     |
| Effective from* [2026-08-04]   Effective to* [2026-12-31] (inclusive)                |
| Change reason* [_______________________________________________________________]      |
|                                                              [Cancel] [Save Draft]    |
+--------------------------------------------------------------------------------------+
```

### Agreement relationship at 1024/1440

```text
+--------------------------------------------------------------------------------------+
| Agreement AGR-442 · version 7 · D&D terms                                            |
| Rule type           Port / scope              Terms                  State    Link    |
| Import demurrage    NLRTM/POD · 40HC          5d · USD75/day         Effective [Open] |
| Import detention    NLRTM/POD · 40HC          3d · USD55/day         Effective [Open] |
| Export detention    SGSIN/POL · 40HC          4d · USD60/day         Scheduled [Open] |
| Relationship evidence is read-only; agreement approval actions remain unchanged.     |
+--------------------------------------------------------------------------------------+
```

## 8. Mobile wireframes at 375/390

### Combined terms list

```text
+--------------------------------------+
| Shared shell mobile header           |
| Charge Agreements / D&D terms        |
| D&D terms                [Create]     |
| [Show filters (2 active)]             |
| 8 terms                               |
+--------------------------------------+
| Import demurrage          Effective   |
| DISC/LADEN -> GTOT/LADEN             |
| NLRTM · POD · 40HC                   |
| Agreement AGR-442 / v7               |
| 5 days · USD 75.00/calendar day      |
| Terms v4                   [Open]     |
+--------------------------------------+
| Import detention          Draft       |
| GTOT/LADEN -> GTIN/EMPTY              |
| NLRTM · POD · 40HC                   |
| 3 days · USD 55.00/calendar day      |
| Terms v2                   [Open]     |
+--------------------------------------+
| Previous | Page 1 of 1 | Next         |
+--------------------------------------+
```

### Combined Draft form

```text
+--------------------------------------+
| New D&D terms                        |
| Error summary (only when needed)     |
| Rule type*                           |
| [Import demurrage                v]  |
| Pair  DISC/LADEN -> GTOT/LADEN       |
| Pricing basis* [Agreement        v]  |
| Exact version*  [AGR-442 / v7    v]  |
| Side             POD (derived)       |
| Port*            [NLRTM          v]  |
| Trade lane*      [Asia-N Europe  v]  |
| Equipment*       [40HC           v]  |
| Free days*       [5]                 |
| Daily amount*    [75.00]             |
| USD / calendar day                   |
| Charge code*     [code + label   v]  |
| Effective from* [2026-08-04]         |
| Effective to*   [2026-12-31]         |
| Change reason*  [................]    |
| [Cancel]              [Save Draft]   |
+--------------------------------------+
```

### Combined detail and relationship

```text
+--------------------------------------+
| Import demurrage · NLRTM             |
| Approved · Effective · v4            |
| [Create successor]                   |
| DISC/LADEN -> GTOT/LADEN             |
| POD · Europe/Amsterdam               |
| Free time       5 calendar days      |
| Daily rate      USD 75.00/day        |
| Window          04 Aug - 31 Dec      |
| Agreement       AGR-442 / v7 [Open]  |
| [Version history]                    |
| [Show audit evidence]                |
+--------------------------------------+
```

Mobile detail uses one continuous page: identity, lifecycle/effective status, fixed rule semantics, terms, applicability, pricing authority, agreement relationships, history, then evidence. No page-level horizontal scroll or sticky overlay covers content. There is no evaluation panel or simulation action.

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
- A safe Retry is offered only for a retryable read or scoped evidence-provider failure. Validation, denied, conflict, and malformed outcomes do not masquerade as retryable outage.

### Tables and links

- Tables have a caption or labelled region, real column headers, stable column widths, and `aria-sort` on the active sortable column.
- Record identity is an explicit link. Row hover is supplementary and never the only interaction cue.
- Result count and pagination changes use one polite announcement.
- On narrow screens, combined D&D terms tables become semantic labelled record items. Version history may use a labelled inner overflow region when preserving column comparison is more useful.

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
| True empty | `No D&D terms yet`; Create when permitted | Create | Not used for filtered zero |
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
| Outcome evidence loading | Stable audit disclosure skeleton/status | Wait | No simulation form or guessed result |
| Zero-result evidence | Explicit zero line and full source versions in the existing authorised audit boundary | Inspect evidence | Never empty/no-rate; no new evaluation action |
| Positive-result evidence | Itemised calculation facts and exact source versions in the existing authorised audit boundary | Inspect evidence | Atomic persisted result only; no new evaluation action |
| `400 PRICING_BAD_REQUEST` | Integration/malformed message with correlation | Correct request | No retry or persisted result |
| `401` | Shared unauthenticated/session-expired state | Sign in or re-authenticate through the existing shell flow | Preserve only safe local form context; no commercial disclosure |
| `403` | Shared forbidden state with concise permission meaning | Return to a permitted module and follow the existing access-governance channel outside this page | No counts, terms, versions, request evidence, or invented access-request workflow |
| `404 NO_RATE` | Echoed authority/applicability could not be used | Review exact basis/port/lane/equipment | No fallback, reselect, rate, or partial calculation |
| Expired/inactive authority | Admin detail shows Expired; evaluation maps to `NO_RATE` | Open source version or use valid booking-time snapshot | No invented `RATE_EXPIRED` wire code |
| `409 IDEMPOTENCY_CONFLICT` | Key reused with different fingerprint | Review original/request identity | No automatic retry or second result |
| `409 PRICING_IN_PROGRESS` | Existing owner still processing with guidance | Retry only after approved guidance | No duplicate result |
| `422 PRICING_VALIDATION` | Exact pair/qualifier/order/semantic error | Correct input | No retry, result, or partial line |
| `503 PRICING_UNAVAILABLE` | Scoped unavailable state with correlation | Contract-safe Retry where permitted | Preserve reviewed inputs; no guessed charge |
| Degraded evidence | Calculation may be known but required lineage section unavailable | Retry evidence; keep acceptance blocked | Do not call full result/evidence PASS |

### 10.1 Outcome-specific audit evidence contract

This uses the existing authorised Charge audit/evidence boundary. It does not create a new auditor persona, permission, queue, or evidence-retrieval route. Primary workflow content stays business-readable; identifiers and diagnostics remain in `TechnicalDetails`.

| Evaluation disposition | Evidence that may be shown to an authorised viewer | Evidence that must be absent |
|---|---|---|
| Success | Request identity, immutable result identity, exact rule/rate and agreement-or-tariff versions, calculation facts, actor/service identity, timestamp, correlation | Secrets, raw payload as primary content, unrelated commercial data |
| Idempotent replay | Original immutable result identity and source versions, replay disposition, safe request fingerprint, timestamp, correlation | A second result or suggestion that a new charge was created |
| `400 PRICING_BAD_REQUEST`, `401`, `403`, or `422 PRICING_VALIDATION` | Safe request identity where available, exact outcome code/category, actor/service context appropriate to the outcome, timestamp, correlation | Nonexistent source versions, calculation, amount, or result identity |
| `404 NO_RATE` | Echoed basis/applicability dimensions that the viewer is authorised to see, reason category, timestamp, correlation | Rate version, calculation, amount, guessed fallback, or result identity |
| `409 IDEMPOTENCY_CONFLICT` or `PRICING_IN_PROGRESS` | Safe key fingerprint, ownership/disposition category, timestamp, correlation, original result identity only when the contract authorises it | Duplicate result, raw secret key material, guessed calculation |
| `503 PRICING_UNAVAILABLE` | Attempt identity, unavailable disposition, timestamp, correlation, approved recovery ownership | Result identity, source versions, calculation, amount, or fabricated provider detail |

## 11. Responsive contract

| Width | Required behavior |
|---|---|
| 375 and 390 px | Shared mobile shell; one-column forms; commands wrap; filters use an in-flow disclosure; list tables become record items; evidence follows the primary task; no page overflow |
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
- One polite region announces list count, save/approval progress, and scoped evidence loading/result once. Validation summaries use assertive announcement.
- Toasts may supplement but never replace persistent state.
- `prefers-reduced-motion` removes nonessential transitions; no scale hover or animated calculation.

### Tables and evidence

- Table captions/labels, scoped headers, named sort controls, keyboard-reachable row links, and named overflow regions.
- Mobile record rows preserve the same information and link name as desktop.
- Itemised calculation evidence, when shown through the existing authorised audit boundary, uses an ordered semantic sequence or definition list. Screen-reader order matches the visible formula.
- Status, errors, zero-result evidence, and effective state always have non-color text.

## 13. `@erp/ui` mapping and platform dependencies

| Surface/behavior | Shared primitive/token | Charge-owned composition | Status |
|---|---|---|---|
| Page/list header | `PageHeader`, `Breadcrumbs`, `Button`, `Stack` | D&D identity, count, and primary command | PASS |
| Detail identity/actions | `RecordHeader`, `StatusBadge`, `Button` | Combined terms version header and action policy | PASS |
| Module routes | `RouteTabs` or ordinary links | Agreements/rates/D&D links with route semantics | PASS |
| Search/filter | `FilterToolbar`, `Field`, `Input`, `Select`, `Combobox`, `FilterChip` | URL-backed server query and domain options | BLOCKED pending provider/query confirmation |
| Lists/history/links | `Table`, `Pagination`, `EmptyState`, `Skeleton` | Sort headers, stable row links, mobile records | PASS |
| Forms | `Field`, `Input`, `Select`, `Combobox`, `StatusStrip`, `Button` | Fixed-rule derivation, flat-rate terms, error summary | PASS |
| Approval/dirty guard | `Dialog`, `Button`, `StatusStrip` | Exact version review and command state | BLOCKED pending live keyboard proof |
| Detail facts | `DefinitionList`, `IdentifierValue`, `StatusBadge` | Terms, applicability, lineage | PASS |
| Conflict/degraded/error | `ConflictStrip`, `PartialDataNotice`, `FailureState`, `StatusStrip` | Exact recovery ownership | PASS |
| Technical evidence | `TechnicalDetails`, `CopyButton` | Correlation, request/result/version evidence | PASS |
| Shared shell/ribbon | `PlatformShell`, `--erp-*` tokens | Charge page passes no journey stage | BLOCKED pending integrated live route proof |

`PASS` in this table means the named export was observed in the current shared source and the candidate maps to it without inventing a local primitive. It is not an integrated route, interaction, visual, or accessibility PASS. `BLOCKED` rows retain their provider or live-evidence dependency.

### Missing or unresolved shared capability

1. The shared `Combobox` has active-descendant behavior but no explicit async loading/error API. Use surrounding shared states and mount settled options; do not fork a local combobox. If real server-backed option volume requires async paging within the popup, record a UI-platform dependency.
2. No dedicated Drawer is required by this candidate. Mobile filters expand in flow, avoiding a new shared primitive.
3. No D&D-specific calculation component belongs in `packages/ui`; any authorised audit calculation evidence is a Charge-domain composition of existing layout/definition primitives.
4. Sortable server-backed table headers may be composed from native links/buttons and `Table`. If three or more domains need identical behavior, propose a UI-platform primitive through normal ownership, not W3-01.

No candidate gap authorizes edits to `packages/ui`, `apps/shell`, the LinerCore master, tokens, or navigation.

## 14. Requirements and story traceability

| Design surface | Requirements/stories | Design evidence |
|---|---|---|
| Fixed rule/rate authoring and overlap | FR-01, FR-02, FR-09; AC-01, AC-02, AC-10; US-01 | Fixed pair, derived side, canonical references, exact overlap message, preserved Draft |
| Flat rate and port-local applicability | FR-02, FR-05; AC-01, AC-02, AC-03, AC-04, AC-05; US-01, US-03 | Flat terms, no bands/calendar editor, port/timezone basis, zero and positive calculation sequence |
| Immutable lifecycle and successor | FR-03, FR-10, FR-12; AC-01, AC-08, AC-10; US-02 | Approval review, read-only Approved history, successor flow, version/audit evidence |
| Trigger metadata | FR-11; AC-11; US-02 AC5; RV-05 | Metadata-only `applicableDndRuleTypes`; free days/rates remain Charge-internal |
| Exact echoed evaluation | FR-04, FR-05, FR-07, FR-10; AC-03, AC-04, AC-05, AC-07, AC-08; US-03 | Direct API/contract/live acceptance plus authorised outcome-evidence semantics; no evaluation UI, reselection, or upgrade |
| Safe errors, replay, and concurrency | FR-06, FR-08, FR-12; AC-06, AC-09; US-04 | Exact state matrix and outcome-specific audit evidence; no duplicate, partial, or guessed result |
| Authorization and audit | FR-12; NFR-03, NFR-04; AC-06, AC-10; US-01, US-04 | Server-derived capabilities, distinct 401/403/no-disclosure states, collapsed authorised evidence |
| Accessibility and responsive behavior | FR-09; NFR-06; AC-10; US-01 AC4; RV-02 | 375/390/768/1024/1440 specification, focus, errors, announcements, contrast, live checklist |
| W2-03 compatibility | FR-03, FR-04, FR-10, FR-11; NFR-07; AC-07, AC-08, AC-11; RV-05 | Exact basis/version links, no reselection, no contract rename/replacement |
| Non-UI release verification | NFR-01, NFR-02, NFR-05; AC-11; US-03 AC5; RV-01, RV-03, RV-04, RV-05 | NOT APPLICABLE to page-level design; retained as later performance, coverage, security, contract, audit, and live-release gates |

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

### Deferred evaluation UI and provider acceptance boundary

- [ ] No calculation-preview route, panel, form, or `Evaluate` command renders in the W3-01 UI.
- [ ] Direct API/contract/live evidence proves same-local-date and five-day zero results with full source evidence.
- [ ] Direct API/contract/live evidence proves 04 Aug to 14 Aug, five free days, USD 75/day yields elapsed 10, chargeable 5, and USD 375.00.
- [ ] UTC/local-midnight counterexamples use the port timezone and identify the timezone basis.
- [ ] Old echoed snapshots stay on historical versions; successor snapshots use the successor.
- [ ] Malformed/auth/no-rate/conflict/in-progress/validation/unavailable outcomes keep exact HTTP/code meaning, create no partial result, and expose appropriate authorised evidence only.
- [ ] Same key/fingerprint replay returns the immutable result; different fingerprint never duplicates the charge.

### Keyboard and accessibility

- [ ] Shared skip link, headings, landmarks, route links, filters, table links, forms, history, and disclosures follow logical order.
- [ ] Visible focus is never clipped or removed.
- [ ] Error summary receives focus and every link reaches its field.
- [ ] Combobox arrow, Enter, Escape, active descendant, selection, no-match, loading, and error behavior pass with real reference data.
- [ ] Approval/dirty dialogs trap focus, handle safe Escape, prevent duplicate submit, and restore focus.
- [ ] Async list/save/approval and scoped evidence states announce once with correct politeness.
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

The review resolved the prior aggregate, evaluation-UI, and traceability decisions: use one combined rule/rate Draft lifecycle; defer calculation preview to direct API/live acceptance; and map downstream NFR-07 evidence to US-02 AC5 plus RV-05. The approved 2.4 source artifact remains unchanged in this design-only review.

1. **Application Design carry-forward - final route and identifier contract:** Confirm the proposed `/charge-agreements/dnd/terms` spelling, stable `dndTermId`, legacy alias/redirect policy, and whether Draft edit uses `?mode=edit` like W2-03.
2. **Application Design carry-forward - administration API shape:** The current OpenAPI has trigger metadata but no `/dnd-pricing-requests` or D&D administration schemas. Confirm additive combined-term read/write view models, server-side filter/sort/pagination capabilities, concurrency tokens, and exact error envelopes before the routes become binding.
3. **Application Design carry-forward - pricing-basis linkage:** Confirm how the administration UI searches and distinguishes exact AgreementVersion versus tariff-composite version references, including what readable label can be shown without leaking unauthorized commercial detail.
4. **Application Design carry-forward - port timezone reference:** Confirm the canonical Reference Data field/API that supplies port timezone and how missing/invalid timezone is represented. The UI must block or show a scoped provider error; it cannot default to browser timezone or UTC.
5. **Application Design carry-forward - charge-code labels:** Confirm the active charge-code records used for the three rule types. The design intentionally does not invent DEM/DET codes absent from approved Reference Data evidence.
6. **Integrated evidence carry-forward - live visual baseline:** Re-run the approved candidate against the integrated `http://127.0.0.1` Charge routes when they exist and a browser surface is available; record screenshots, responsive behavior, keyboard operation, and accessibility evidence before implementation/live acceptance is called PASS.

## 17. Review checklist

- [x] Approved Requirements Analysis and User Stories remain the business authority.
- [x] Exactly three fixed rule types and qualifiers are represented; generic combined and arbitrary pairs are absent.
- [x] Free days plus one flat daily rate is used everywhere; progressive bands and calendar editors are absent.
- [x] Port-local formula, weekend/holiday inclusion, and zero-result meaning are explicit.
- [x] W2-03 agreement-first/tariff-fallback evidence, immutable versions, and additive pricing v1 behavior are preserved.
- [x] `applicableDndRuleTypes` remains trigger metadata only, with no free days or rates.
- [x] Charge, Booking, Container Movement, Reference Data, shell, and UI-platform ownership boundaries are correct.
- [x] Proposed routes and APIs are labelled provisional and reserved for Application Design confirmation.
- [x] List/search/filter/sort/pagination behavior is specified as server-backed and includes loading, true empty, and filtered-empty states; provider capability remains blocked.
- [x] Draft, Approved, Scheduled, Effective, Expired, read-only, distinct unauthenticated/denied, conflict, no-rate, unavailable, degraded, and recovery states are specified.
- [x] Approved history is visibly immutable and only successors can change commercial terms.
- [x] Evaluation UI is explicitly deferred; exact echoed-snapshot behavior remains direct API/contract/live acceptance scope without reselection.
- [x] Desktop and 375/390 mobile wireframes cover the combined list, detail, Draft form, and agreement relationship without a simulation surface.
- [x] WCAG 2.2 AA design behavior covers labels, errors, keyboard order, focus trap/restore, announcements, contrast, reduced motion, and non-color status.
- [x] Responsive behavior is defined for 375, 390, 768, 1024, and 1440 px in light and dark themes.
- [x] Every surface maps to source-observed `@erp/ui` primitives or an explicit platform dependency; no local design system is introduced.
- [x] UI/UX Pro Max marketing, replacement palette/font, chart-first, bulk-edit, spinner-first, and blanket Server Action suggestions are rejected.
- [x] Live browser evidence remains honestly unverified and is not represented as PASS.
- [x] This review modified only this design document; no production code, route, API, test, package, infrastructure, page contract, or AI-DLC state was modified.
