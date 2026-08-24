# Unit of Work - W3-01 D&D Rules and Rates

## Source authority and decomposition rules

This topology derives from approved `requirements.md`, `stories.md`, and Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`. Those artifacts remain authoritative when a shorter unit description omits detail.

The nine units are architecture-aligned, independently testable delivery boundaries. They do not create new runtime services, databases, shells, themes, APIs beyond the approved contracts, or Booking/CMM runtime wiring. A unit may be embedded in an existing deployable or package and still be independently testable. Unit dependencies are defined separately in `unit-of-work-dependency.md`; this artifact does not choose a Bolt sequence.

## Unit catalog

| Unit | Primary owner/target | Deployment model | Complexity | Primary coverage |
| --- | --- | --- | --- | --- |
| `pricing-contract-evolution` | Charge + Booking contract owners; `contracts/openapi/pricing.v1.yaml` | Shared generated contract, no deployable | M | US-02, US-03, US-04; FR-04, FR-06, FR-07, FR-11, FR-12 |
| `charge-dnd-persistence-foundation` | Charge service PostgreSQL/JDBC | Embedded in existing Charge deployable/database | XL | US-01-US-04; FR-02-FR-04, FR-06, FR-08, FR-12 |
| `reference-location-timezones` | Reference Data service + Charge adapter boundary | Embedded in existing Reference Data and Charge deployables | M | US-01, US-03; FR-02, FR-05 |
| `ui-platform-prerequisites` | W2-02 `packages/ui` owner | Shared package, no separate application | M | US-01, US-02; FR-09; NFR-06 |
| `dnd-terms-administration` | Charge domain/application/API | Embedded in existing Charge deployable | XL | US-01, US-02; FR-01-FR-03, FR-09, FR-10, FR-12 |
| `dnd-pricing-provider` | Charge provider/API | Embedded in existing Charge deployable | XL | US-03, US-04; FR-04-FR-08, FR-10, FR-12 |
| `standard-pricing-dnd-enrichment` | Existing Charge Standard pricing path | Embedded in existing Charge deployable | L | US-02, US-03; FR-04, FR-10, FR-11; NFR-07 |
| `charge-dnd-ui-bff` | Charge web/BFF | Embedded in existing Charge web application | XL | US-01, US-02; FR-01-FR-03, FR-09, FR-12 |
| `w3-01-live-acceptance` | Cross-module W3-01 release owners | Verification-only; existing isolated Compose stack | XL | US-01-US-04; AC-01-AC-11; RV-01-RV-05 |

Complexity is relative within W3-01: M = bounded contract/package or service change, L = multi-component existing-path integration, XL = broad domain/persistence/UI/provider or cross-stack verification surface.

## Unit definitions

### `pricing-contract-evolution`

**Purpose:** Establish the additive bilateral source of truth without changing approved W2-03 semantics.

**Owns and delivers:**

- exact `pricing.dnd-request`, `pricing.dnd-result`, error, header, idempotency-key and fingerprint contracts for `POST /dnd-pricing-requests`;
- structured `applicableDndRuleTypes` runtime alignment and additive `pricingBasisVersionId`/`pricingEffectiveDate` evidence on existing `/pricing-requests` results;
- regenerated Charge provider and Booking consumer models/fixtures, including exact error precedence and metadata-only trigger content;
- sole ownership of the signed fixture manifest and contract-level backward-compatibility checks for all W2-03 required fields and fixtures.

**Boundary constraints:** No Booking runtime trigger, no CMM edge, no rate/free-day leakage in trigger metadata, no v2 replacement, and no renaming/removal of W2-03 fields.

**Independent proof:** OpenAPI validation, generated-model compile, provider/consumer fixture tests, W2-03 compatibility suite, and signed fixture manifest.

### `charge-dnd-persistence-foundation`

**Purpose:** Provide the durable, namespaced, concurrency-safe storage contracts required by every Charge D&D runtime capability.

**Owns and delivers:**

- additive Flyway migration for `dnd_terms`, immutable versions, lifecycle activity, and append-only `dnd_pricing_attempts`;
- atomic namespace migration of `pricing_requests` to `STANDARD_PRICING` and `DND_PRICING`, including composite keys, namespace-specific terminal shapes and uniqueness;
- typed immutable Standard receipt evidence (`pol`, `pod`, trade lane, equipment type, pricing effective date) and exact historical basis-version lookup support;
- repositories for D&D aggregate lifecycle, exact Approved lookup, namespaced D&D claims/replay/completion/release, additive Standard owner-fenced release, and authorised attempt queries;
- full-applicability transaction advisory lock plus inclusive overlap lookup, owner-token fencing, database-time leases, and audit indexes.

**Boundary constraints:** Existing W2 method behavior and terminal bytes remain unchanged; all SQL is namespace-qualified; handled failures release only the owned in-progress row; crashes use lease takeover; no purge job or external audit store is introduced.

**Independent proof:** Migration-upgrade tests with legacy Standard rows, database constraints, repository integration tests, overlap races, stale-owner fencing, immediate retry after handled release, restart/replay, audit lookup without terms id, and Standard-row migration compatibility cases. Contract fixtures remain owned by `pricing-contract-evolution`.

### `reference-location-timezones`

**Purpose:** Keep port timezone authority in Reference Data while making D&D calendar-day evaluation fail closed and deterministic.

**Owns and delivers:**

- optional legacy-compatible `LOCATION.attributes.timeZoneId` schema/validation with IANA semantics and field-level `422 REFERENCE_ATTRIBUTE_INVALID`;
- deterministic W3-01 data backfill for `SGSIN=Asia/Singapore` and `NLRTM=Europe/Amsterdam`;
- Charge `PortTimeZoneProvider`/reference-validation adapter behavior with existing service identity and correlation;
- approved timeout posture: 250 ms connect, 500 ms response, no automatic retry, cache guess, or direct Reference Data database read.

**Boundary constraints:** W4-01 retains Reference Data page ownership only; this unit changes the approved Reference Data attribute/service contract, not the shared shell or `packages/ui`. D&D approval without timezone is `422 DND_PORT_TIME_ZONE_REQUIRED`; provider unavailability is 503; inactive/mismatched echoed applicability remains `404 NO_RATE`.

**Independent proof:** schema/validation tests, legacy LOCATION compatibility, backfill verification, Charge adapter contract tests, timeout/unavailable tests, and port-local date boundary fixtures.

### `ui-platform-prerequisites`

**Purpose:** Deliver the two approved shared accessibility/shell seams before Charge UI integration without creating a local fork.

**Owns and delivers:**

- W2-02-owned `PlatformShell` explicit active-module metadata, canonical rail, shared skip link, and main-landmark seam;
- W2-02-owned `Dialog` description/`aria-describedby` seam with accessible name, description, focus entry, focus trap, escape, and focus return behavior;
- `packages/ui` package tests and a merged workspace revision consumable by W3-01.

**Boundary constraints:** W2-02 is the exclusive `packages/ui`/shared-shell owner. W3-01 may not create a Charge-only shell, Dialog, token, font, color, or navigation substitute. No marketing/hero composition or shell redesign is permitted.

**Independent proof:** package unit/component tests for rail/landmark/keyboard and Dialog name/description/focus contracts, plus version/revision evidence.

### `dnd-terms-administration`

**Purpose:** Deliver the authoritative versioned D&D terms lifecycle and administration/relationship APIs inside Charge.

**Owns and delivers:**

- `DndTerms` aggregate, three fixed rule types and derived DCSA movement bounds/port side;
- Draft create/update, immutable approval, successor creation, exact lineage, optimistic versioning, and full-key overlap rejection;
- `charge-rates` read/create/update/approve/create-successor authorization and attributable lifecycle activity;
- stable list/detail/version/history, AgreementVersion relationship, reference-option, and terms-specific audit query endpoints;
- exact application errors, field paths, list encoding, latest-presentation versus immutable-version selection, and no-disclosure denial states.

**Boundary constraints:** No Rate or Agreement aggregate mutation, no arbitrary movement bounds, no approved-row edit, no calculation-preview action, and no invented `charge-rates:evaluate` capability.

**Independent proof:** domain tests for lifecycle/invariants, application authorization tests, overlap concurrency tests, API/BFF contract tests, AgreementVersion relationship states, version selection, field-error mapping, and lifecycle audit persistence.

### `dnd-pricing-provider`

**Purpose:** Calculate a deterministic itemised D&D result from exact preserved pricing evidence and qualified movements.

**Owns and delivers:**

- protected `POST /dnd-pricing-requests` with exact filter-first identity/correlation precedence, media/idempotency/schema validation and `charge-agreement:price` authorization;
- distinct `DndPricingBasisEvidencePort` validation of the immutable Standard receipt and preserved Agreement/Rate versions without current-authority selection;
- exact Approved D&D version/applicability lookup, port-local pure calendar calculation, zero-line and non-zero itemised result rendering;
- D&D namespaced replay/conflict/in-progress/takeover/completion/release, disposition-specific durable attempt evidence and bounded audit search;
- bounded metrics/logs, correlation/attempt evidence, exact 400/401/403/404/409/422/503 mappings, and no persisted failed calculation.

**Boundary constraints:** No Agreement-first re-selection, latest-version fallback, inferred applicability, working-day/holiday logic, CMM call, partial line, guessed timezone/rate, raw-payload audit, unbounded metric labels, or stale-owner publication.

**Independent proof:** pure calculator fixtures, exact evidence/historical-version tests, provider contract/error precedence, idempotency/concurrency/takeover/release, audit dispositions including null terms ids, timezone failures, restart/replay, and warm-local performance harness.

### `standard-pricing-dnd-enrichment`

**Purpose:** Extend only fresh Standard pricing completion with immutable D&D trigger/version evidence while preserving exact replay.

**Owns and delivers:**

- `DndTriggerMetadataResolver` against already selected `ResolvedPricingAuthority` and original booking request facts;
- deterministic structured rule metadata ordering, exact Agreement/Tariff basis-version id, and pricing-effective-date emission before terminal rendering;
- typed Standard receipt evidence required by later D&D historical validation;
- owner-fenced `STANDARD_PRICING` claim release on handled enrichment failure and winner reclassification on a lost release;
- consumption of the generated/signed contract fixtures owned by `pricing-contract-evolution`, plus runtime regression tests proving unchanged established Standard-pricing success/replay/conflict/crash semantics.

**Boundary constraints:** Replay never re-enriches; no free days/rates enter trigger metadata; no Booking trigger is added; no failure leaves a false live claim; pre-W3 incomplete evidence is not reconstructed.

**Independent proof:** fresh match/no-match/duplicate/unavailable tests, exact byte replay after terms changes, Standard release/immediate retry and crash takeover tests, Agreement/Tariff runtime evidence cases, and the existing `/pricing-requests` runtime/replay regression suite executed against contract-evolution's generated fixtures. This unit neither regenerates fixtures nor records bilateral signoff.

### `charge-dnd-ui-bff`

**Purpose:** Deliver the reviewed LinerCore administration experience through existing Charge routes and server trust boundaries.

**Owns and delivers:**

- binding `/charge-agreements/dnd/terms` list, `/new`, `/[dndTermsId]`, `/[dndTermsId]?version=<dndTermsVersionId>`, current-Draft `?mode=edit`, and `/[dndTermsId]/successor` route family, plus the read-only D&D section on existing AgreementVersion detail;
- Charge-local server BFF compositions for list filters, detail/history, reference options, mutations, server-derived actions and discriminated ready/empty/denied/unavailable scoped states;
- feature-local list/form/detail/history/approval compositions using `@erp/ui`, the shared `PlatformShell`, approved status meanings and non-color cues;
- blur/submit validation, retained inputs, duplicate-submit prevention, focus restoration, announced feedback, keyboard operation, responsive table/list transformations and light/dark evidence.

**Boundary constraints:** Consume the merged W2-02 package revision; do not modify the shared shell locally; no new colors/fonts/tokens, marketing composition, unsupported actions, calculation preview, invented data/API, or client-side permission inference.

**Independent proof:** BFF unit/contract tests, route/component tests, Playwright at 375/768/1024/1440 in light/dark, WCAG 2.1 AA keyboard/focus/announcement/contrast checks, denied no-disclosure, scoped-error preservation, and AgreementVersion section states.

### `w3-01-live-acceptance`

**Purpose:** Prove the complete vertical intent on the isolated live Compose stack and retain release evidence.

**Owns and delivers:**

- direct live rule creation, overlap rejection, approval, successor and immutable historical detail flows;
- direct zero, within-free-time, non-zero, timezone-boundary, historical/successor, exact no-rate/error and idempotency/concurrency provider flows;
- verification and collection of the signed fixture manifest produced by `pricing-contract-evolution`, existing W2-03 contract/runtime/migration regression outputs from their primary units, changed-line coverage at or above 80%, and required security-gate resolution;
- warm-local p99 evidence with host/build/concurrency/sample/distribution and owner acceptance or recorded revision;
- live UI/a11y/responsive evidence plus green `aidlc-audit` and `erp-fidelity-audit` results.

**Boundary constraints:** This unit creates no new production component, fixture, or owner signoff. It assembles and verifies attributable evidence and cannot report unavailable scanners, failed audits, missing signed manifest, failed W2 regression, or unobserved Compose behavior as green.

**Independent proof:** A versioned acceptance evidence pack covering requirements AC-01-AC-11 and story release verifications RV-01-RV-05.

## Cross-unit constraints

1. The approved W2-03 contract and runtime behavior are protected across contract, persistence, enrichment, provider and acceptance units.
2. Charge owns D&D business data; Reference Data owns timezone attributes; W2-02 owns `packages/ui`; Booking is a fixture consumer only; CMM has no W3-01 runtime edge.
3. Provider and administration authorization remain `charge-agreement:price` and `charge-rates`, respectively.
4. Exact immutable snapshot validation, pure port-local calendar calculation, owner fencing and disposition-specific audit evidence are indivisible acceptance constraints even when implemented by separate units.
5. UI work follows `AGENTS.md`, LinerCore `MASTER.md`, `SESSION-PROMPT.md`, the D&D page contract/runbook and the approved Refined Mockups; shared dependencies must merge before consumption.
6. Delivery Planning may bundle these units into Bolts only when every declared hard dependency is respected and each unit's independent proof remains attributable.

## Completeness check

All nine units have assigned stories/intent verification, a named owner/target, an embedded/shared/verification deployment model, a relative complexity estimate, explicit exclusions and an independent test boundary. Every production change described in the approved Application Design is owned by exactly one primary unit. In particular, `pricing-contract-evolution` exclusively owns schemas, generated fixtures, contract compatibility and bilateral signoff; enrichment consumes those artifacts and owns runtime/replay regression evidence; live acceptance only verifies and collects the signed/evaluated outputs. Cross-unit behavior is joined only through the dependency and story maps.
