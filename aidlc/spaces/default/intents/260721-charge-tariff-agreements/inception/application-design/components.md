# Components - W2-03 Charge Tariffs & Agreements

## Design Context

This design consumes the approved W2-03 requirements, stories, refined mockups, brownfield architecture/component inventory, and team practices. It extends the existing `charge-agreement-service`, Booking pricing port/snapshot seam, and `apps/charge-agreements`; it does not create a generic pricing service, replace the shared shell, or redesign `packages/ui`.

The authoritative calculation sequence is: resolve one approved agreement version first; otherwise resolve one complete approved tariff basis; otherwise persist one idempotent OPEN manual-pricing case and return the contract-defined failure. `dates.requestedDepartureDate` is the only effective date.

## Component Inventory

| ID | Component | Location | Change | Responsibility |
| --- | --- | --- | --- | --- |
| C01 | Rate domain | `services/charge-agreement-service/domain-core` | Add | Stable Rate aggregate plus immutable RateVersion for BASE/OFR, SURCHARGE/BAF, and LOCAL/THC; approval, successor, overlap, applicability, validity, Money, and audit invariants. |
| C02 | Agreement-version domain | same module | Extend | Stable agreement identity, immutable AgreementVersion, exact approved rate-version links, approval/suspend/expire rules, and successor history. |
| C03 | Pricing authority resolver | `application-service` | Refactor existing seam | Agreement-first selection, complete-tariff fallback, uniqueness checks, and deterministic no-rate/ambiguity outcome; no clock fallback. |
| C04 | Pricing calculator | `domain-core`/`application-service` | Extend | Exactly three ordered lines, positive quantity, `HALF_UP` cents, USD total, basis/reference and source-version attribution. |
| C05 | Manual-case/idempotency application seam | `application-service` | Extend existing | Atomically records one OPEN case for no-rate/ambiguity and replays terminal outcomes without duplicate cases. |
| C06 | Charge repositories | `application-service/port`, `dataaccess` | Extend | Rate/version, agreement/version, pricing receipt, and manual-case persistence behind ports; stable IDs only for external references. |
| C07 | Charge REST and contract adapter | `container`, `contracts/openapi/pricing.v1.yaml` | Extend | Rate/agreement administration plus sole canonical `POST /pricing-requests`; exact additive itemised response and standard error mapping. |
| C08 | Charge migrations | `container/src/main/resources/db/migration` | Add | Adopt the exact current SQL-init catalog as Flyway V1, then ordered V2 rate, V3 agreement, and V4 receipt/manual-case migrations. |
| C09 | Booking pricing port adapter | `services/booking-service/application-service/.../pricing` | Extend existing | Maps Booking revision/date/quantity to Charge, preserves failure types, and consumes source-authoritative line/total/version fields. |
| C10 | Booking pricing snapshot/outage model and codec | Booking `domain-core`, `dataaccess` | Extend | Appends typed immutable snapshots, persists Booking-local outage/manual evidence, and retains legacy flattened snapshot decode/render support. |
| C11 | Booking pricing orchestration | `BookingApplicationService` and existing `POST /api/bookings/{id}/price` | Extend | Uses the existing explicit pricing command as Reprice when a pricing-affecting amendment has advanced the sequence; never conflates reconfirmation with repricing. |
| C12 | Charge App Router pages | `apps/charge-agreements/app` | Replace/extend Charge-owned pages | Eight stable route patterns, route loading/error boundaries, list/detail/forms/history, evidence-only manual queue. |
| C13 | Charge BFF/service clients/view models | `apps/charge-agreements/app/api`, `lib` | Extend | Session-derived subject, correlation/idempotency propagation, backend error normalization, reference labels, strict UI models. |
| C14 | Booking pricing region | `apps/booking` | Minimum seam extension | Ordered lines, totals, basis/ref/version attribution, prior/current selector, explicit Reprice, and `MANUAL_PRICING_REQUIRED` evidence. |
| C15 | Existing shared platform/UI and additive edge mount | `identity-service`, `reference-data-service`, `packages/ui`, shell, `infrastructure/nginx/default.conf`, `compose.yaml`, `scripts/wave-a-compose.mjs` | Consume shared UI unchanged; add route wiring | Identity/capabilities, stable references, tokens/primitives/shell, plus a regression-protected `/charge-agreements` mount on isolated nginx port 18088. |

## Domain Boundaries and Invariants

### Rate authority

- A stable Rate owns an ordered version history; only Draft is editable.
- Approval freezes commercial fields. Corrections create a successor Draft with a new immutable version identity/number.
- Approval rejects overlapping approved windows for the same category-specific matching key under a database-backed concurrency guard.
- OFR and BAF keys use origin, destination, and equipment; POL THC uses origin and equipment only.
- Money is decimal USD at scale two. Inputs are non-negative; pricing quantity is a positive integer.

### Agreement authority

- Each approved agreement version links exactly one approved compatible version in each required category.
- The linked rate versions cover the agreement validity and remain exact historical attribution; later rate successors do not mutate the agreement.
- Approved versions are immutable. Suspend/expire excludes new pricing while historical snapshots retain attribution.
- Concurrent approval yields at most one applicable approved agreement authority for a customer/match/date.

### Pricing and manual outcomes

- Agreement resolution precedes tariff resolution and uses only exact linked versions.
- Tariff resolution succeeds only with one unique applicable OFR, BAF, and THC version.
- Successful output has exactly three ordered lines and a sum of independently rounded line amounts.
- Missing authority returns HTTP 404 `NO_RATE`; residual ambiguity returns HTTP 422 `PRICING_VALIDATION`. Both create/replay an OPEN case and project Booking to `MANUAL_PRICING_REQUIRED` without a total.
- Timeout, 503, circuit-open, denied, malformed, validation, idempotency conflict, and in-progress outcomes remain distinct. Exhausted timeout/503 or circuit-open produces Booking-local `MANUAL_PRICING_REQUIRED` outage evidence, never a Charge OPEN rate case.

## Exact Pricing v1 Compatibility

The existing v1 required fields and JSON types remain unchanged. W2-03 adds optional schema properties so old consumers still validate; the W2-03 provider always emits the enriched set on a 200, while Booking treats an absent enriched set as a legacy result.

| Existing field | W2-03 treatment |
| --- | --- |
| `dates.effectiveDate` and `dates.requestedDepartureDate` | Both remain required by v1. Resolution uses only `requestedDepartureDate`. `effectiveDate` is deprecated compatibility input and must equal it; mismatch is explicit 422 `PRICING_VALIDATION`, never silent reinterpretation. |
| `charges[].category` enum `FREIGHT/SURCHARGE/LOCAL` | Preserved. OFR remains `FREIGHT`; additive `rateCategory` exposes `BASE/SURCHARGE/LOCAL`. |
| `charges[].amount` JSON number | Preserved as a `BigDecimal`-serialized number with `multipleOf: 0.01`; it does not become a string. |
| `pricingRef` | Agreement: exact `agreementVersionId`. Tariff: `TARIFF-` plus the first 24 lowercase hex characters of SHA-256 over `BASE-versionId|SURCHARGE-versionId|LOCAL-versionId`; exact IDs remain on lines. |

Additive optional schema properties are: line `rateCategory`, `basis`, `quantity`, `unitRate`, `sourceRateVersionId`; result `total`, `currency`, `agreementVersionId`, `requestedDepartureDate`, `pricingRequestId`, `correlationId`, and `pricedAt`. For every W2-03 success, Charge requires exactly three enriched lines and all result properties except `agreementVersionId` (tariff only); Booking's enriched decoder rejects partially enriched success as malformed rather than fabricating fields.

## Backend Responsibilities

Charge remains the commercial source of truth. Its application transaction claims the idempotency key, resolves authority, calculates or records the manual case, persists the terminal receipt, and commits once. Booking never reads the Charge database. Booking appends the received authoritative snapshot through its own transaction and retains prior snapshots.

The existing Booking `POST /api/bookings/{id}/price` remains the explicit pricing command. The UI labels it **Reprice** when a prior snapshot exists and pricing inputs changed. `POST /reconfirm` remains lifecycle-only and must not be reused as a pricing command.

## Frontend Responsibilities

Charge owns these route patterns only:

| Route | Page component responsibility |
| --- | --- |
| `/charge-agreements` | Agreement filters, result table, stable URL state, create entry. |
| `/charge-agreements/new` | Draft agreement header and exact approved-rate selection. |
| `/charge-agreements/[agreementId]` | Version detail/history, provenance, applicable-rate visibility, permitted lifecycle actions. |
| `/charge-agreements/[agreementId]/edit` | Draft/successor edit with guarded transitions. |
| `/charge-agreements/rates` | Unified BASE/SURCHARGE/LOCAL filters and applicability-aware rows. |
| `/charge-agreements/rates/new` | Category-adaptive Draft rate form. |
| `/charge-agreements/rates/[rateId]` with `?mode=edit` | Version detail/history; full-page Draft edit state uses the approved query contract, then removes `mode` on save/cancel. |
| `/charge-agreements/manual-pricing` | OPEN evidence queue/detail only; no assignment, quote, resolution, approval, or closure controls. |

Pages compose existing `@erp/ui` primitives and LinerCore tokens. RTK is not present in this app and the approved frontend standards prohibit introducing Redux Toolkit for this slice; state remains route/query/form-local through existing patterns. BFF route handlers remain authoritative over advisory Server Action suggestions because they preserve the current session, correlation, idempotency, and error-normalization seam.

Named shared dependencies remain explicit:

- DS-01: a Charge-local dialog focus wrapper may add Tab trapping/trigger restoration without changing the shared `Dialog`.
- DS-02: accessible async combobox active-descendant behavior remains a W2-02 shared dependency; W2-03 must not claim the gap as passed.
- DS-03: route-metadata ribbon suppression remains a W2-02 shell dependency; no Charge CSS or shell fork is permitted.

## Persistence Ownership

| Owner | Data |
| --- | --- |
| Charge DB | Stable rates, immutable rate versions, stable agreements, immutable agreement versions, exact rate links, pricing receipts, OPEN manual cases, commercial audit metadata. |
| Booking DB | Booking revision/amendment sequence, immutable typed pricing snapshots, failure/manual evidence, legacy snapshot payloads. |
| Reference Data | Customer/party, charge code, currency, trade lane, location, equipment identities and active status. |
| Identity | Human/service subjects and capabilities. |

No cross-database joins or copied master-data authority are allowed. Migrations are ordered and additive; existing rows receive deterministic version/backfill identities. Restore is forward-repair/backup based, not destructive reset.

### Concrete Charge schema and adoption

- `V1__charge_baseline.sql` is the current `charge-agreement-schema.sql` catalog verbatim. `ChargeFlywayMigrationStrategy` mirrors Booking's fail-closed strategy: empty schema migrates; a schema with history validates/migrates; a non-empty schema without history is baselined at V1 only after exact table/column/constraint/index/default comparison; any partial/drifted catalog aborts startup. The SQL initializer is disabled after adoption.
- `V2__versioned_rate_authority.sql` creates `charge_rates` and `charge_rate_versions`; primary keys are stable/version IDs, `(rate_id, version_no)` is unique, and checks enforce category/code/basis/currency/scale/window/status.
- `V3__versioned_agreement_authority.sql` marks every existing V1 compatibility header `authority_model=LEGACY`, makes its deferred `commodity_id` nullable for new W2 stable identities, and creates `charge_agreement_versions`, `charge_agreement_rate_links`, and append-only `charge_agreement_activity`; `(agreement_id, version_no)` is unique and link primary key is `(agreement_version_id, rate_category)`. V3 backfills each legacy `charge_agreements` row to version ID `av-` + `md5(id || ':' || version)`, marks that version `LEGACY`/not W2-authority-eligible, and leaves every existing value/read intact. New headers explicitly use `W2_VERSIONED`, allowing legacy readers to exclude them rather than expose stale projection columns. Legacy terms are not invented as approved standalone rates; U01 functional design owns the complete physical column/constraint/index contract.
- Approval uses one transaction plus PostgreSQL `pg_advisory_xact_lock(hashtextextended(normalizedApprovalKey,0))`, then an inclusive-overlap query and state update. Rate keys are category + charge code + origin + destination-or-empty + equipment; W2 agreement keys are customer + lane + origin + destination + equipment. Legacy commodity fields remain readable/validated where present but are not a W2 match or uniqueness discriminator. The same key serializes competing approvals without requiring a new extension.
- `V4__pricing_terminal_evidence.sql` adds terminal HTTP/schema/manual-case references to `pricing_requests`, adds status/booking/request-hash/dedupe columns to `manual_pricing_cases`, and creates a unique dedupe key. Existing duplicate rows are retained with `legacy:<caseId>` keys; the earliest row receives the canonical request+reason key used by new `createOrGetOpen` calls.
- Booking adds its next ordered migration creating `booking_pricing_snapshots(booking_id, pricing_request_id, amendment_seq, booking_revision, schema_version, snapshot, correlation_id, created_at)` with primary key `(booking_id, pricing_request_id)` and an index on `(booking_id, amendment_seq)`. Existing flattened payloads remain in `booking_records.snapshot` and dual-read through the legacy codec.

### Stable edge mount

`apps/charge-agreements/next.config.mjs` sets `basePath: "/charge-agreements"`. Nginx adds an exact `/charge-agreements` redirect and a preserving `location /charge-agreements/ { proxy_pass http://apps-charge-agreements:3000; ... }`; it does not strip the base path. Compose adds the Charge-app healthcheck at `/charge-agreements/api/health` and retains nginx's existing dependency. The Wave A wrapper maps nginx to 18088 from `wave-a.env.example`; port 8088 and the manager project remain untouched. Proxy regression tests cover existing `/auth`, `/reference-data`, `/booking(s)` and shell `/` routes plus Charge HTML, assets, BFF, direct deep links and reloads.

## Security, Reliability, and Observability

- Charge BFF derives human identity from the signed session; browser actor fields are ignored/rejected.
- Service-to-service authorization retains the existing Booking service identity boundary.
- Every mutation and pricing outcome records correlation ID, actor/service identity, affected stable/version IDs, timestamp, and safe outcome metadata.
- Commercial amounts/customer payloads are excluded from logs and metric labels.
- Metrics cover latency, basis, terminal outcome, and manual-fallback count. The 800 ms p99 is a provisional isolated-local acceptance target only.
- Transactional/idempotent terminal completion prevents partial prices and duplicate snapshots/cases across replay/restart.

## Upstream Trace

| Design area | Requirements | Stories/constraints |
| --- | --- | --- |
| C01-C08 Charge commercial authority | FR-001-FR-004, FR-101-FR-407 | US-01-US-07, US-10-US-13, QC-01 |
| C09-C11 Booking consumption/reprice | FR-401-FR-507 | US-06-US-11, QC-01 |
| C12-C14 changed UI | FR-601-FR-606 | US-01-US-05, US-08-US-10, US-12, US-14-US-15 |
| C15 preservation/runtime | FR-701-FR-706 | QC-02-QC-03 |
| Cross-cutting | NFR-001-NFR-010 | US-13-US-15, QC-01-QC-03 |

## Source Register

- `inception/requirements-analysis/requirements.md`
- `inception/user-stories/stories.md`
- `inception/refined-mockups/{mockups,interaction-spec,design-system-mapping,accessibility-checklist}.md`
- `aidlc/spaces/default/codekb/TST_Codex_W2-03/{architecture,component-inventory}.md`
- `inception/practices-discovery/team-practices.md`
- `design-system/linercore/{MASTER,SESSION-PROMPT}.md`
- `design-system/linercore/pages/charge-and-agreements.md`
