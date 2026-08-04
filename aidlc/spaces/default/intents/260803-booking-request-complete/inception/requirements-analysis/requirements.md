<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces standards alignment + live-behavior acceptance. -->

# Requirements — W3-04 Booking Request Completeness

Traceability basis: `intent-statement.md`, `scope-document.md`, `business-overview.md`, `architecture.md`, `code-structure.md`, and `team-practices.md`. W3-04 is a Standard-depth brownfield feature spanning the canonical Booking UI/BFF, Booking domain/persistence, Reference Data authority, Charge pricing, and `booking.confirmed` consumption.

## Intent Analysis

W3-04 closes the gap between a thin operational Booking draft and a commercially complete request that a booking-desk or customer-service user can trust through confirmation. The user outcome is one authenticated shared-shell journey that captures canonical commercial facts, preserves them through correction and provider failures, obtains an authoritative voyage schedule and price, confirms without inventing a physical container identifier, and exposes the resulting operational record. The business outcome is a truthful Booking request spine that Charge can price and CMM can consume before later physical assignment. Success is observed only when the full create, reopen, correct, validate, price, confirm, consume, and inspect path plus its negative/degraded cases passes on the live Compose stack with contract, accessibility, migration, authorization, and audit evidence.

## Source Traceability

`Q1`–`Q12` below refer to the approved decisions in `requirements-analysis-questions.md`; every requirement is covered by one row.

| Requirement IDs | Originating need or decision |
|---|---|
| FR-001–FR-005 | `intent-statement.md` request completeness; `scope-document.md` minimum vertical slice; Q1 text normalization; Q2 numeric/unit envelope |
| FR-006–FR-007 | Live canonical-reference authority in `intent-statement.md`; Q3 package-type authority; Q11 minimum governed snapshot |
| FR-008–FR-010 | Trusted schedule outcome in `scope-document.md`; Q4 requested-departure semantics; Q5 confirmation-grade schedule |
| FR-011–FR-014 | Brownfield correction and migration boundaries from `architecture.md` and `code-structure.md`; Q6 compatibility policy |
| FR-015–FR-019 | Exact-price and guided-lifecycle outcomes in `intent-statement.md` and `scope-document.md`; Q12 timeout/idempotency evidence |
| FR-020–FR-023 | Confirmation/CMM/event seams from `architecture.md`; Q7 pending assignment; Q8 canonical channel; Q10 executable contracts |
| FR-024–FR-027 | One-shell operational journey in `scope-document.md`; Q9 canonical route/composition; LinerCore interaction contract approved at Rough Mockups |
| FR-028–FR-030 | Authorization, privacy, and observable-error boundaries from `intent-statement.md` and `team-practices.md`; Q11 access/snapshot policy |
| NFR-001 | Q12 local evidence posture and the existing 2.5-second BFF boundary recorded in `code-structure.md` |
| NFR-002 | Q12 bounded idempotent retries plus `team-practices.md` concurrency/evidence posture |
| NFR-003 | No fabricated or lost commercial facts in `intent-statement.md`; Q2 and Q6 |
| NFR-004 | Recoverable provider degradation in `scope-document.md`; Q5 and Q12 |
| NFR-005 | Q11 privacy/access policy and `team-practices.md` BLOCKED-not-PASS rule |
| NFR-006 | Correlation and evidence requirements in `team-practices.md`; Q12 |
| NFR-007 | LinerCore UI contract and `team-practices.md` live browser/a11y evidence requirement |
| NFR-008 | Brownfield boundaries in `architecture.md` and `code-structure.md`; Q6 and Q9 |
| NFR-009 | Tests-alongside and 80% changed executable-line practice in `team-practices.md`; Q10 and Q12 |
| NFR-010 | W3-specific live evidence and BLOCKED-not-PASS practice in `team-practices.md`; Q10 and Q12 |

## Functional Requirements

### Request capture and persistence

- **FR-001 — Canonical request form.** The authenticated shared-shell `/booking` journey shall create one FCL-dry booking request containing booking customer, customer booking reference, required shipper, optional consignee, optional notify party, cargo description, canonical commodity, package count/type, gross weight/unit, optional volume/unit, POL/POD, POL-local requested departure, selected voyage, ISO equipment type, and positive equipment quantity.
- **FR-002 — Text normalization.** User-authored customer booking reference and cargo description shall be normalized to Unicode NFC, trimmed at outer whitespace, preserve case and meaningful internal whitespace, reject control characters, and enforce 1–64 and 1–500 characters respectively.
- **FR-003 — Numeric measures.** Package count shall be an integer 1–999,999; equipment quantity an integer 1–9,999; gross weight a positive decimal with storage precision 18,3 and unit `KGM`; optional volume, when present, a positive decimal with storage precision 18,3 and unit `MTQ`. The system shall perform no implicit unit conversion in W3-04.
- **FR-004 — Optional fields.** Consignee, notify party, and volume shall round-trip when supplied and shall not block confirmation when absent. A volume unit shall be absent when volume is absent and `MTQ` when volume is present.
- **FR-005 — Draft lifecycle.** The user shall explicitly save a draft, reopen it, and observe every accepted field unchanged in the canonical form and Booking detail. Initial draft creation and confirmation shall not require or fabricate `equipmentId`.

### Canonical reference and schedule authority

- **FR-006 — Live reference authority.** Booking customer, shipper, consignee, notify party, commodity, package type, POL/POD, voyage, and equipment type shall use active canonical Reference Data values. Typed but uncommitted free text shall never become a canonical value.
- **FR-007 — Role-aware validation.** Booking shall validate each party in its requested role, commodity/package/equipment codes in their sets, voyage route compatibility, and reference ID/version freshness. Optional blank party roles shall not be validated as missing.
- **FR-008 — Requested departure.** `requestedDepartureDate` shall remain the user’s POL-local calendar-date preference. A selected active route-compatible voyage may differ; the UI and detail shall show the variance without overwriting either value or applying an unapproved tolerance.
- **FR-009 — Voyage schedule completeness.** A confirmation-grade voyage shall provide carrier voyage number, ETD, ETA, cargo cutoff, and documentation deadline as timezone-aware instants, with `ETD < ETA` and each cutoff/deadline preceding ETD. Partial, stale, inactive, or route-incompatible schedule authority shall preserve draft work but block confirmation.
- **FR-010 — Provenance snapshot.** Booking shall store the selected voyage reference/version/source and the five derived schedule facts at confirmation. Derived values shall be read-only in Booking and visibly distinguished from requested departure.

### Completeness, correction, and migration

- **FR-011 — Completeness classification.** The server shall calculate completeness from required owned/reference/schedule/pricing facts and return stable missing/invalid reasons. UI validation may assist but shall not be the authority for confirmation.
- **FR-012 — Same-record correction.** `Correct booking` shall edit the existing record/revision and preserve every authoritative/user-entered fact. It shall not create a replacement draft or silently discard optional values.
- **FR-013 — Versioned brownfield evolution.** Booking shall introduce an additive snapshot version and projections. Readers shall accept old and new versions during rollout; upcast shall derive only authoritative facts, preserve unmapped legacy attributes, and classify unsupported required facts explicitly incomplete.
- **FR-014 — Migration operation.** Backfill shall be restartable and idempotent, record source/target version, outcome and safe reason in the migration ledger, reject unexpected baseline drift before mutation, and permit correction of incomplete records through FR-012.

### Pricing and lifecycle progression

- **FR-015 — One next action.** Booking detail shall expose exactly one authorized next lifecycle action using the precedence below. If the user lacks the selected action permission, the action is absent and the safe read-only inspection path remains; no lower-precedence mutation is substituted.

| Current record/provider condition, highest precedence first | One next action |
|---|---|
| Session denied or record unreadable | Sign in / return to Booking list; show no protected record facts |
| Confirmed or another terminal lifecycle state | Inspect |
| Save/price/confirm outcome unknown or provider operation pending | Refresh status using the existing operation identity; do not submit a retry |
| Provider explicitly reports unavailable/timeout with no accepted operation | Retry once using the same request identity under the bounded retry policy |
| Provider reports manual/no-rate or pricing validation | Correct the request; no automatic pricing retry |
| Provider returns a malformed response | Inspect the safe correlated contract error; price acceptance and confirmation remain blocked |
| Optimistic revision conflict or stale persisted view | Refresh latest revision |
| Legacy-incomplete, missing/invalid/stale required facts, or pricing-basis change | Correct |
| Complete but not currently validated | Validate |
| Currently validated but without an authoritative current price | Price |
| Complete, currently validated, and authoritatively priced at the current revision | Confirm |
- **FR-016 — Exact pricing basis.** Booking shall send Charge the exact current pricing-determining booking customer, commodity, POL/POD, equipment type, requested departure, quantity, currency, and any contract-required trade-lane authority. Missing authoritative values shall never fall back to `NA-EU`, `commodity-general`, or another guessed default.
- **FR-017 — Repricing.** A change to any pricing-determining fact shall invalidate the prior price and require a new pricing request/fingerprint before confirmation. Non-pricing optional display changes shall not silently alter the pricing basis.
- **FR-018 — Pricing outcomes.** Booking shall distinguish the outcomes below, preserve the request and UI context in every case, and display itemised quantity-scaled charges and authoritative total/basis only from an authoritative provider snapshot.

| Pricing outcome | Required recovery or terminal behavior |
|---|---|
| Priced | Persist/display the authoritative snapshot; next action follows FR-015 |
| Pending/in progress | Poll or user-refresh status with the same pricing request identity; do not issue a second commercial request |
| Manual/no-rate | Show the provider-supplied manual/no-rate reason and correlation/reference; the one next action is Correct; stop automatic retry |
| Validation | Link provider field/reason errors; the one next action is Correct, then Validate on the revised request before repricing |
| Denied | Show the safe permission/session boundary; do not retry automatically or reveal protected provider detail |
| Outcome unknown | The one next action is Refresh status with the same request identity; do not submit a retry while acceptance is unknown |
| Explicit unavailable/timeout with no accepted operation | The one next action is Retry once with the same request identity under the bounded retry policy |
| Malformed provider response | The one next action is Inspect the safe correlated contract error; record the contract failure and block price acceptance/confirmation |
| Conflict | The one next action is Refresh latest booking/pricing state; require explicit correction or retry only after that refresh |
| Replay | Return the previously recorded outcome for the same identity without a duplicate provider effect |
- **FR-019 — Confirmation preconditions.** Confirm shall require a current complete request, valid references, complete schedule snapshot, authoritative current price, authorization, expected revision, and idempotency identity. The impact dialog shall summarize booking, customer, route/schedule, equipment quantity/type without ID, revision, and pricing authority.

### Confirmation contract and downstream state

- **FR-020 — Canonical channel.** The canonical Kafka/AsyncAPI channel shall be `booking.confirmed`. Producer, consumer, Compose, Schema Registry verification, evidence scripts, and catalog shall migrate additively after consumer inventory; the system shall not dual-publish silently or indefinitely.
- **FR-021 — Compatible event.** The event shall remain BACKWARD-compatible within the current major, carry full current `routing[]` and `equipment[]` type/quantity, allow `equipmentId = null`, and exclude party/customer/cargo PII and commercial detail.
- **FR-022 — CMM pending assignment.** CMM shall accept an initial confirmed equipment line with quantity greater than one and null `equipmentId`, retain booking/requested count/type as pending assignment, create no synthetic equipment IDs or container journeys, and reconcile physical journeys only from later assignment events outside W3-04.
- **FR-023 — Atomic publication.** Booking confirmation state, revision/audit, idempotency disposition, confirmation snapshot, and outbox record shall commit atomically. Replays shall return the existing result without duplicate Activity records or downstream publication.

### Canonical UI and operational record

- **FR-024 — One Booking composition.** `/booking` inside the authenticated LinerCore shell shall be canonical. `/bookings` shall become a compatibility redirect or thin delegate that cannot evolve a second form/detail behavior.
- **FR-025 — Request composition.** The canonical create/correct UI shall use the approved five semantic groups: Booking and parties, Cargo, Route and schedule, Equipment request, Review and save. It shall preserve input across recoverable reference, validation, save, pricing, and conflict failures.
- **FR-026 — Operational detail.** Booking detail shall retain route-backed Overview, Charges, Journey, and Activity views. Overview shall show completeness, commercial request, requested/derived schedule provenance, equipment request, and reference status; Charges shall own detailed price evidence; diagnostics shall remain collapsed and privacy-safe.
- **FR-027 — Required UI states.** The canonical journey shall render every state below with the specified recovery or safe terminal path while preserving permitted request/tab/list context.

| UI state | Recovery or terminal path |
|---|---|
| Loading Skeleton | Await resolved content; announce completion without stealing focus |
| Empty/untouched | Begin required-field entry; no validation noise before interaction/save |
| Denied/session boundary | Sign in or return to Booking list; expose no protected record facts |
| Validation blocked | Focus/announce summary and linked fields; Correct, then Validate |
| Stale/degraded reference | Preserve input; refresh the affected canonical option or Correct it; block dependent action only |
| Save pending/outcome unknown | Disable duplicate submit; Refresh/Retry with the same command identity |
| Legacy incomplete | Show explicit missing facts; Correct the same record |
| Optimistic conflict | Refresh latest revision, show non-sensitive conflict context, then reapply explicitly |
| Pricing pending/manual/no-rate/validation/denied/outcome-unknown/unavailable/timeout/malformed/conflict/replay | Follow the single exact action or safe terminal behavior in the matching FR-018 row |
| Confirming | Disable duplicate confirm; Refresh status with the same confirmation identity if uncertain |
| Success | Move focus to confirmation/status summary; Inspect the persisted record |
| Service unavailable | Preserve permitted content; bounded Retry/Refresh with correlation |
| Not found | Return to Booking list; disclose no protected existence detail |

### Authorization, privacy, errors, and evidence

- **FR-028 — Action authorization.** Identity/Booking policy shall authorize read, create, correct, validate, request pricing, and confirm separately. Server authorization shall precede protected lookup/mutation, and changed permission/session state shall remove protected facts/actions.
- **FR-029 — Governed snapshot.** Booking may persist canonical IDs and the minimum confirmation-time code/display/version snapshot needed to explain the request and audit. It shall not copy full Reference Data party records; raw party/customer/cargo payloads shall not appear in logs, errors, events, or evidence.
- **FR-030 — Stable error vocabulary.** API/BFF/UI shall preserve field paths, recovery class, correlation reference, and stable codes including `BOOKING_INCOMPLETE`, `REFERENCE_INVALID`, `REFERENCE_STALE`, `REFERENCE_UNAVAILABLE`, `VOYAGE_ROUTE_MISMATCH`, `VOYAGE_SCHEDULE_INCOMPLETE`, `PRICING_PENDING`, `NO_RATE`, `MANUAL_PRICING_REQUIRED`, `PRICING_UNAVAILABLE`, `COMMAND_IN_PROGRESS`, `IDEMPOTENCY_CONFLICT`, `REVISION_CONFLICT`, and `ACCESS_DENIED`. Raw exception messages shall not cross the trusted boundary.

## Data & Standards Alignment

| Canonical field | Requirement | Standard / authority | Persisted evidence |
|---|---|---|---|
| `bookingCustomerPartyId` | Required canonical party acting as booking customer | DCSA-aligned party role; Reference Data `PARTY_CUSTOMER` | ID + minimum code/display/version snapshot |
| `customerBookingReference` | Required user-authored 1–64 NFC string | Customer commercial reference; Booking-owned | Normalized value; masked by authorization where required |
| `shipperPartyId` | Required canonical shipper | DCSA-aligned `SHIPPER` role; Reference Data | ID + minimum code/display/version snapshot |
| `consigneePartyId` | Optional canonical consignee | DCSA-aligned `CONSIGNEE` role; Reference Data | Null or governed snapshot |
| `notifyPartyId` | Optional canonical notify party | DCSA-aligned `NOTIFY_PARTY` role; Reference Data | Null or governed snapshot |
| `cargoDescription` | Required 1–500 NFC string | Booking-owned commercial fact | Normalized value; Confidential |
| `commodityId`, `commodityCode` | Required canonical commodity | Reference Data Commodity; DCSA-aligned commodity concept | ID/code/version and minimum label snapshot |
| `packageCount` | Required integer 1–999,999 | DCSA cargo packaging quantity | Exact integer |
| `packageTypeId`, `packageTypeCode` | Required controlled package type | SMDG/UN-CEFACT-aligned Reference Data set | ID/code/version and minimum label snapshot |
| `grossWeight.value`, `.unit` | Required >0 decimal 18,3 / `KGM` | UN/CEFACT unit code; cargo gross weight, not later VGM | Exact decimal/unit |
| `volume.value`, `.unit` | Optional >0 decimal 18,3 / `MTQ` | UN/CEFACT unit code | Both null or exact decimal/unit |
| `portOfLoadingUnLocode`, `portOfDischargeUnLocode` | Required distinct active locations | UN/LOCODE; Reference Data | ID/code/version and label snapshot |
| `requestedDepartureDate` | Required POL-local calendar date | Booking/customer preference | ISO local date plus POL context |
| `voyageId`, `voyageVersion` | Required active route-compatible voyage | Reference Data Voyage | Stable ID/version/source |
| `carrierVoyageNumber` | Required derived display/business number | Carrier/Reference Data authority | Read-only confirmation snapshot |
| `estimatedDepartureAt`, `estimatedArrivalAt` | Required ordered instants | Reference Data Voyage | Timezone-aware instants |
| `cargoCutoffAt`, `documentationDeadlineAt` | Required instants before ETD | Reference Data Voyage | Timezone-aware instants |
| `equipmentTypeCode` | Required FCL-dry type | ISO 6346 size/type code; Reference Data | Code/version/label snapshot |
| `quantity` | Required integer 1–9,999 | DCSA-aligned requested equipment count | Exact integer |
| `equipmentId` | Null at initial W3 draft/confirmation | ISO 6346 equipment identifier only after physical assignment | Null; never placeholder |
| `currency` | Fixed `USD` | ISO 4217 | `USD` |

These canonical names are the requirements-to-domain/REST contract. Application Design may define representation wrappers but shall not rename concepts inconsistently across UI, BFF, REST, domain, snapshot, pricing fixtures, or confirmation mapping.

## Cross-Module Contracts

| Contract | Producer → consumer | Style | W3-04 obligation |
|---|---|---|---|
| Booking service OpenAPI | Canonical `/booking` BFF → Booking service | Sync REST, versioned current major | Cover create/read/correct/validate/price/confirm, canonical fields, stable errors, revision/idempotency and compatibility examples |
| Reference Data OHS/OpenAPI | Reference Data → Booking/BFF | Sync REST | Add role-aware party, Commodity, package type and full Voyage schedule projections; validate IDs/versions/active state/route; no copied masters |
| `pricing.request` / `POST /pricing-requests` | Booking → Charge | Sync REST, bilateral | Exact current customer/commodity/POL/POD/type/date/quantity/currency authority; canonical fingerprint/idempotency; real provider verification and full failure mapping |
| Pricing snapshot | Charge → Booking | Sync response captured immutably | Itemised quantity-scaled lines, authoritative total/basis/version/request identity; partial or guessed authority blocks confirmation |
| `booking.confirmed` | Booking → CMM | Async Kafka/Avro on canonical `booking.confirmed` channel | BACKWARD compatibility, full routing/equipment quantity, nullable ID, no party/cargo expansion, Schema Registry and real consumer proof |
| CMM pending assignment projection | CMM → Booking detail/Journey read | Existing approved read boundary | Represent requested count/type pending assignment without physical journey; later assignment owns container journeys |

Contract rollout shall inventory known producers/consumers, update catalog/AsyncAPI/OpenAPI/Avro/examples/config/Compose/evidence together, deploy tolerant readers before enriched writers, and prove old/new compatibility. Static fixture equality alone is insufficient.

## Non-Functional Requirements

- **NFR-001 — Local performance evidence.** Requirements Analysis defines no production availability or latency SLO. The current 2.5-second BFF command timeout remains a behavior boundary; local acceptance shall record create/read/validate/price/confirm durations, provider timeouts, and UI recovery without representing them as production capacity.
- **NFR-002 — Idempotency and concurrency.** Duplicate click/Enter/touch/retry shall produce zero duplicate drafts, prices, confirmations, audit transitions, or events. State-changing commands shall bind to operation, normalized payload/current pricing basis and expected revision; uncertain outcomes reuse the same identity.
- **NFR-003 — Data integrity.** Live proof shall observe zero fabricated required facts, zero lost accepted fields, exact decimal/unit/quantity round-trip, exact pricing basis, and null initial equipment ID through persistence and downstream contract.
- **NFR-004 — Availability and degradation.** Failure of one Reference Data set or Charge shall not clear unrelated user input or make the existing record unreadable when authorization remains valid. Dependent lifecycle actions shall block truthfully with bounded retry/manual recovery.
- **NFR-005 — Security/privacy.** Existing OIDC/BFF/service-identity controls, separate action authorization, TLS/encrypted storage expectations, redaction and least-data event boundaries apply. Missing security scanner/toolchain evidence is BLOCKED, not PASS; retention inherits program policy and no duration is invented here.
- **NFR-006 — Observability.** Every command and cross-module request/event shall carry a correlation reference; logs/metrics/traces shall expose safe state, latency, retry, conflict, migration and provider outcomes without party/cargo payloads or secrets.
- **NFR-007 — Accessibility/usability.** WCAG 2.1 AA shall hold in light/dark themes; all functions keyboard-operable with visible focus, persistent labels, linked/announced errors, controlled live regions, dialog focus restoration, reduced motion, and non-color status. Required visual/reflow evidence: 375, 390, 768, 1024 and 1440 px, plus 200% zoom.
- **NFR-008 — Maintainability.** Changes shall preserve service-owned persistence, established hexagonal dependency direction, additive migrations, strict TypeScript/no `any`, shared BFF security/error behavior, `@erp/ui`, and one canonical Booking composition. No new universal formatter/architecture tool is required by W3-04.
- **NFR-009 — Testability.** Tests shall be written alongside changes and evidence at least 80% line coverage of changed executable production lines in every W3-touched module. Required coverage includes domain rules, mappings, migrations/restart, contracts/compatibility, authorization/privacy, idempotency/conflict, provider degradation, browser/a11y/responsive and live Compose journey.
- **NFR-010 — Evidence freshness.** W3-04 shall generate its own tagged evidence manifest and shall not reuse another intent’s PASS. Required live/security/contract/browser/audit prerequisites that are skipped or unavailable are BLOCKED.

## Acceptance Criteria (live behavior)

- **AC-001 (FR-001–FR-005).** Given an authorized Booking user and live canonical options, when the user creates a request with quantity `3`, KGM weight, optional MTQ volume and no equipment ID, then the running Booking stack returns a draft that reopens in `/booking` with every accepted required/optional value exactly preserved.
- **AC-002 (FR-002–FR-004).** Given boundary and invalid text/numeric inputs, when the user saves, then valid maximum values round-trip exactly while controls, over-length values, zero/negative/non-integer counts, excessive precision, unit/value mismatch and unsupported units receive stable linked field errors without losing other inputs.
- **AC-003 (FR-006–FR-007).** Given canonical and stale/inactive party, commodity, package, location, voyage and equipment references, when validation runs against the live Reference Data OHS, then valid roles/versions pass; invalid/stale facts show the exact field/reason, preserve the draft, and block confirmation.
- **AC-004 (FR-008–FR-010).** Given requested departure and a route-compatible voyage with a different ETD-local date, when selected, then `/booking` shows both values and the variance plus read-only carrier number/ETD/ETA/cutoff/deadline; after confirmation/reload the snapshot matches the selected live voyage version.
- **AC-005 (FR-009).** Given absent, partial, stale, route-incompatible or temporally inconsistent voyage enrichment, when the user saves and later confirms, then draft recovery remains possible but confirmation returns `VOYAGE_SCHEDULE_INCOMPLETE`, `REFERENCE_STALE`, or `VOYAGE_ROUTE_MISMATCH` with no guessed value.
- **AC-006 (FR-011–FR-014).** Given representative pre-W3 snapshots, when the additive migration runs twice and the service restarts, then authoritative facts are preserved, unsupported facts are explicitly incomplete, ledger outcomes are stable/idempotent, no default is invented, and the same record becomes valid only after user correction.
- **AC-007 (FR-015–FR-018).** Given a complete validated request, when pricing runs, then the captured live Charge request exactly matches customer/commodity/POL/POD/type/requested date/quantity/currency, contains no fallback default, and the itemised response scales by quantity and is stored with immutable authority.
- **AC-008 (FR-018).** Given provider pending, no-rate/manual, explicit timeout/unavailable with no accepted operation, outcome-unknown, denied, validation, malformed, conflict and replay responses, when each is exercised, then Booking exposes exactly the corresponding FR-018 behavior: Refresh status for pending/unknown; Correct for no-rate/manual/validation; Retry once for explicit unavailable/timeout; no protected retry for denied; Inspect the correlated block for malformed; Refresh latest for conflict; and the recorded prior outcome for replay. Each Retry/Refresh reuses the existing identity, every case preserves request/tab/list context, no duplicate commercial request occurs, and no guessed total appears.
- **AC-009 (FR-019–FR-023).** Given a complete priced revision with quantity `3` and no equipment ID, when the user confirms once or repeats the same command after an uncertain response, then exactly one confirmation/outbox/event occurs on `booking.confirmed`, the Avro record is schema-valid with null ID, and CMM records pending requested count/type without synthetic IDs or journeys.
- **AC-010 (FR-020–FR-022).** Given the inventoried legacy/current producer-consumer configurations, when the channel migration is deployed in the approved order, then tolerant consumers operate through the transition, the catalog/AsyncAPI/Compose/runtime converge on `booking.confirmed`, and no indefinite dual publication or unrecognized consumer break occurs.
- **AC-011 (FR-024–FR-027).** Given `/booking` and a legacy `/bookings` link at each required viewport, when the user creates, corrects, validates, prices, confirms and navigates detail views, then one shared-shell composition owns behavior, the compatibility route does not expose a second form, FR-015 selects exactly one authorized next action, and every FR-027 state exposes exactly its mapped recovery or safe terminal path.
- **AC-012 (FR-028–FR-030).** Given users with read-only, create, correct, validate, price and confirm permission combinations, when each protected route/action is attempted independently, then the server enforces that specific permission, denied users receive no protected existence/payload hints, visible errors carry safe codes/correlation, and logs/events/evidence contain no raw party/customer/cargo values.
- **AC-013 (NFR-002–NFR-010).** Given the isolated live Compose acceptance run, when the full create→reopen→invalidate/correct→price→confirm→consume/detail journey and negative matrix execute, then duplicate effects and lost/fabricated facts are zero, correlation spans the seams, 80% changed-line evidence is recorded, accessibility/responsive checks pass, and contract/migration/security/`aidlc-audit`/`erp-fidelity-audit` gates are green rather than skipped.
- **AC-014 (NFR-001).** Given the isolated live Compose acceptance run and its declared environment metadata, when create, read, validate, price, confirm, provider-timeout and UI-recovery paths execute, then the evidence manifest records the observed duration of each operation, identifies any 2.5-second BFF timeout outcome, and labels every measurement local/non-production without asserting an availability, capacity, percentile, or production SLO.

## Assumptions & Constraints

- Scope remains one FCL-dry route, one requested equipment line, USD, non-reefer, non-DG, and no initial physical assignment.
- Shared Platform owns additive party/package/voyage Reference Data contracts; Charge owns pricing provider authority; CMM owns pending-assignment consumption; Booking remains the Driver and owns request/completeness/persistence/UI composition.
- Existing on-premises PostgreSQL/Kafka/Schema Registry/Keycloak/Nginx/observability/Compose topology is reused. No AWS account, region, service, cost or cloud deployment is introduced.
- `booking.confirmed` channel migration requires consumer inventory and an approved rolling sequence; Requirements do not assume an undiscovered consumer is safe.
- The canonical `/booking` route decision does not authorize W3-04 to redesign shared shell/tokens or independently change `packages/ui`; shared changes follow LinerCore/W2-02 ownership.
- Program trade footprint, residency/retention duration, production SLO/capacity/DR, branch protection, budget, hard deadline and named staffing remain outside this requirements decision and shall not be invented.
- Physical assignment/reconciliation events and physical container journeys remain owned by later W3-03 behavior; W3-04 defines only the pending-assignment acceptance seam required for truthful initial confirmation.

## Out of Scope

| Excluded capability or change | Owner / boundary |
|---|---|
| Physical container assignment, amendment, and reconfirmation | W3-03 |
| Cancellation | P2-03 |
| Multi-leg or transshipment routing | P2-04 |
| Reefer/DG entry, rules, and surcharges | P2-06 |
| Multi-currency | P3-02 |
| Special-equipment and full reefer depth | P3-03 |
| Shipping instructions, Bill of Lading, and eBL issuance | P3-04 or documentation track |
| Rolls, splits, capacity-allocation policy, and CMM allocation | Later Booking/CMM intent |
| External shipper portal or cross-carrier marketplace | Later customer-self-service intent |
| New public cloud/AWS service, account, or region | On-premises platform remains binding |
| Program trade footprint, residency/retention duration, DR site, and FMC decision | Program-level decision, not Booking-local |
| Local theme, second Booking frontend, copied reference lists, guessed schedule facts, fabricated container IDs, or weakened live gates | Forbidden by LinerCore, scope, and affirmed practices |

## Open Questions

1. Any requirement blocked on a deferred enterprise decision?
   - A. None — all product/contract authority required for Requirements and User Stories is resolved (recommended)
   - B. Yes (list the blocking decisions and who owns them)
   - X. Other
   - `[Answer]: A — No product requirement remains blocked. Consumer inventory, exact rollout tasks, permission names, error copy, coverage tooling and component allocation are design/planning elaborations within the approved boundaries.`

No unresolved ambiguity permits scope or authority to change silently. If design discovers an incompatible external consumer, unavailable Shared/CMM contribution, or contradictory enterprise policy, the workflow shall return to a user approval gate with affected requirements and DoD.

## Review

**Verdict: NOT-READY**

- The prior review findings are resolved, but the new executable mappings conflict on the single next action after pricing failures. A manual/no-rate result remains validated and unpriced, so FR-015 selects `Price`, while FR-018 stops automatic retry and allows `Correct`. For unavailable/timeout/outcome-unknown states, FR-015 selects `Refresh status` only for an unknown/pending operation, while FR-018 and FR-027 permit `Retry/Refresh`; AC-008 repeats that choice even though AC-011 requires exactly one action. Define one deterministic action per distinct pricing/provider state, including whether retry reuses the existing identity, then align all four references so engineering and QA do not choose different behaviors.
- Both declared sensors passed for both produced artifacts: `required-sections` and `upstream-coverage`.

## Review Resolution

After the second and final reviewer iteration, the builder resolved the reported conflict by assigning exactly one action to every distinct pricing state and aligning FR-015, FR-018, FR-027, AC-008, and AC-011: pending/outcome-unknown → Refresh status; explicit unavailable/timeout with no accepted operation → Retry once with the same identity; manual/no-rate/validation → Correct; malformed → Inspect the correlated block; conflict → Refresh latest. The reviewer iteration cap prevents a third independent verdict, so this post-review correction is presented transparently for the human gate.
