# Code Generation Plan — U03 Agreement Authority

## Status

**Approved 2026-07-28.** U03 product-code generation may proceed against this
plan. Approval selection: `Approve Plan (Recommended)`.

## Scope, sources, and traceability

U03 extends the existing `charge-agreement-service` and
`apps/charge-agreements` in place. It consumes:

- U03 Functional Design: `business-logic-model.md`, `business-rules.md`,
  `domain-entities.md`, and `frontend-components.md`;
- U03 NFR Design: `performance-design.md` and `security-design.md`;
- U03 Infrastructure Design: `deployment-architecture.md`;
- Inception: `unit-of-work.md`, `unit-of-work-story-map.md`,
  `requirements.md`, `stories.md`, and the approved Application Design
  component, method, dependency, service, and decision artifacts;
- the U01 Rate/Flyway implementation and U02 BFF, route-policy, correlation,
  capability, and subject-assertion seams already present in the dirty
  worktree; and
- the binding LinerCore master/session/Charge page contracts and the active
  **Standard** test strategy.

Primary story coverage is US-01, US-04, and US-05. U03 also implements the
Agreement-specific parts of US-13, US-14, and US-15. Principal requirement
coverage is FR-001–FR-004, FR-201–FR-205, FR-601, FR-602, FR-606,
FR-701/FR-702 support, and NFR-001–NFR-010 where they apply to Agreement
administration, persistence, compatibility, security, accessibility, and
evidence.

U03 does **not** implement pricing calculation, agreement-first pricing
resolution, tariff fallback, Booking persistence/UI, manual-case workflow,
U04/U05 behavior, D&D, commodity/weight authority, shared-shell/navigation
work, a new service, cloud infrastructure, or release acceptance. U06 retains
ownership of final live Compose, Playwright matrix, performance, preservation,
and audit evidence.

## Binding implementation decisions and approval-sensitive tradeoffs

1. **U01 owns every Charge migration file.** U03 consumes
   `V3__versioned_agreement_authority.sql` and must not edit, replace, reorder,
   or checksum-bypass V1–V4. The current V3 creates the discriminator,
   version/link structures, activity extensions, deterministic
   `av-` + `md5(id || ':' || version)` LEGACY backfill, one-Draft guard, and
   W2 authority indexes. U03 will add migration/catalog tests and runtime
   readiness checks, but no migration file.
2. **Prepared-schema drift is a hard stop, not a local workaround.** The
   current V3 does not contain the `charge_try_jsonb(text)` helper referenced by
   the final relay deployment design. If the bounded relay cannot implement the
   exact total `u03_owned` classifier safely on PostgreSQL 15 without that
   prepared contract, generation must leave the relay evidence blocked and
   request an owner-approved forward migration. It must not mutate V3, create
   schema objects at application startup, use an unsafe `snapshot::jsonb`
   predicate, or let two relays claim the same row.
3. **Legacy and W2 authority remain explicit dialects.** Default
   `application/json` preserves existing LEGACY request/response behavior and
   `/active-lookup`; vendor media
   `application/vnd.linercore.charge-agreement-v2+json` selects W2
   administration. The controller selects one adapter before parsing. No
   denial, validation, 404, or malformed request may fall through to the other
   adapter.
4. **The legacy one-row model is compatibility-only.** Existing
   `CustomerAgreement`, terms, and legacy repository behavior remain readable
   for `authority_model=LEGACY`. New W2 commands use a separate versioned
   aggregate/application/repository boundary. W2 stable-header projection
   columns are written once for V1 shape compatibility and are never read back
   as W2 commercial authority.
5. **U02 security is consumed, not reimplemented.** Agreement BFF policies keep
   the U02 fixed vendor media, capability, bounded-body, correlation,
   idempotency, origin, and `X-LinerCore-Subject-Assertion` pipeline. Java code
   reads only the subject verified by U02's filter/request attribute. Browser
   actor, service, assertion, capability, role, media, and correlation spoofing
   remains rejected. Rate/manual/other U02 policies and routes remain
   compatible.
6. **Administrative idempotency is not overstated.** U02 may forward a derived
   client request key, but U03 has no persisted admin-command receipt.
   Optimistic versions, one-Draft uniqueness, advisory locks, and committed
   detail/activity reconciliation provide duplicate/concurrency safety; the UI
   must not promise replay-safe mutation after an uncertain response.
7. **LinerCore wins over generated UI advice.** Adopt dense labelled tables,
   URL state, stable skeletons, error summaries, keyboard/focus behavior,
   responsive overflow/compact records, and Server Components with focused
   client islands. Explicitly reject the skill's Enterprise Gateway hero,
   logo carousel, Contact Sales CTA, new palette, Fira/remote fonts, spinner,
   bulk edit, chart/KPI, generic Server Action replacement for the fixed BFF,
   local shell, and shared `packages/ui` redesign.
8. **No shared visual ownership changes.** U03 may extend existing
   Charge-local token-based styling only. It will not edit `packages/ui`,
   `PlatformShell`, shared navigation, palette, master/page override, or
   typography. DS-01/DS-02/DS-03 remain honest integrated-evidence
   dependencies.

## Sequenced implementation plan

### Step 1 — Freeze the brownfield Agreement, U01, and U02 compatibility baseline

- [x] Record the exact pre-U03 Agreement routes, legacy DTO fixtures, outbox
  event schemas, V1 catalog, V3 checksum/catalog, Rate API/repository contract,
  U02 Agreement policy table, signed assertion vectors, and dirty-worktree edit
  set before changing code.
- [x] Add `services/charge-agreement-service/dataaccess/src/test/java/com/linercore/platform/chargeagreement/dataaccess/AgreementPreparedSchemaContractTest.java`
  to prove the required V3 tables, columns, constraints, indexes, deterministic
  LEGACY backfill, nullable commodity projection, and activity extensions
  without editing V1–V4.
- [x] Add `apps/charge-agreements/test/fixtures/u03-agreement-preservation.json`
  plus a static ownership check covering U01 Rate URLs, U02 protected routing,
  default LEGACY paths/media, vendor media, migration checksums, nginx 18088,
  and forbidden manager 8088/shared-owner changes.
- [x] Fail generation/verification loudly if the prepared schema lacks a
  required contract; do not manufacture a PASS or silently revise an applied
  migration.

**Traceability:** US-01, US-13; FR-004, FR-201–FR-205, FR-701–FR-703;
NFR-003, NFR-005, NFR-010.

### Step 2 — Implement the pure versioned Agreement domain

- [x] Add a framework-free package at
  `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/agreement/`
  containing `Agreement`, `AgreementVersion`, `AgreementRateLink`,
  `AgreementActivity`, `AgreementId`, `AgreementVersionId`, `AgreementNumber`,
  `AgreementValidity`, `AgreementAuthorityModel`, `AgreementLifecycle`, and
  `AgreementActivityAction`.
- [x] Enforce distinct immutable stable/version identities, positive immutable
  version number, nonnegative optimistic row version, one Draft, inclusive
  window, five W2 match references, exactly three distinct category links, and
  Draft-only commercial mutation.
- [x] Implement Approved-source successor copy semantics; immutable Approved,
  Suspended, and Expired commercial snapshots/links; Approved-only
  suspend/expire; and terminal Suspended/Expired states.
- [x] Add
  `domain-core/src/test/java/com/linercore/platform/chargeagreement/domain/agreement/AgreementDomainTest.java`
  with 5–8 focused tests per aggregate/value-object group, including malformed
  identity/window, incomplete/duplicate links, stale Draft update,
  byte-for-byte source preservation, lifecycle matrix, and reason bounds.

**Traceability:** US-04, US-05; FR-201–FR-205; AGR-001–AGR-016;
NFR-003, NFR-010.

### Step 3 — Define W2 commands, views, ports, and typed failures

- [x] Add
  `application-service/.../applicationservice/agreement/AgreementCommands.java`,
  `AgreementSearchQuery.java`, `AgreementViews.java`, and
  `AgreementApplicationException.java` for create, complete Draft replacement,
  exact-version detail, successor, approval, suspend/expire, paged search,
  capabilities, links, and activity.
- [x] Add dedicated ports under
  `application-service/.../applicationservice/port/`:
  `W2AgreementRepository`, `AgreementAdminReadRepository`,
  `AgreementAuthorizationPort`, `AgreementReferenceValidationPort`, and
  `AgreementRateVersionPort`. Do not expose a generic `save` that could mutate
  Approved rows.
- [x] Make typed failures map safely to 400/403/404/409/422/503 with stable
  machine codes and field paths; authorize before protected lookup/not-found.
- [x] Add command/view/validation tests under
  `application-service/src/test/.../agreement/`, including unknown-field,
  pagination, date, reason, lifecycle, and correlation bounds.

**Traceability:** US-01, US-04, US-05, US-13; FR-001–FR-004,
FR-201–FR-205; NFR-004, NFR-005, NFR-010.

### Step 4 — Implement fail-closed authorization, references, and exact RateVersion validation

- [x] Reuse the established U01 HTTP transport patterns while adding
  Agreement-specific adapters:
  `container/.../integration/HttpAgreementAuthorizationAdapter.java` and
  `HttpAgreementReferenceValidationAdapter.java`.
- [x] Validate exact active `PARTY_CUSTOMER`, `TRADE_LANE`, origin/destination
  `LOCATION`, and `EQUIPMENT_TYPE` references with field paths and correlation;
  distinguish semantic failure from provider timeout/unavailable/malformed
  response.
- [x] Implement `dataaccess/.../jdbc/JdbcAgreementRateVersionAdapter.java` to
  load all three supplied U01 RateVersions in one bounded set query and verify
  distinct BASE/OFR, SURCHARGE/BAF, LOCAL/THC identities, Approved lifecycle,
  complete coverage, and category-specific applicability.
- [x] Extend
  `services/identity-service/domain-core/.../PermissionAction.java`,
  `MvpAuthorizationCatalog.java`, and authorization tests with exact
  `charge-agreements:{read,create,update,approve,create-successor,suspend,expire}`
  permissions/grants; update `apps/auth/lib/auth-server.ts` and its tests so
  signed local Pricing/reader sessions expose only their intended capabilities.
- [x] Remove the permissive Agreement authorization/reference beans from
  `ChargeAgreementServiceConfiguration.java`; local fixtures must be explicit
  profile-scoped maps, and non-local configuration must fail closed.

**Traceability:** US-04, US-05, US-13; FR-001–FR-004, FR-203;
NFR-004, NFR-009.

### Step 5 — Implement the transactional W2 Agreement application service

- [x] Add
  `application-service/.../agreement/AgreementApplicationService.java` with
  transactional create, update Draft, create successor, approve, suspend,
  expire, list, and detail operations.
- [x] Create commits the stable W2 header projection, Draft v1, exactly three
  links, CREATED activity, and one outbox event atomically. Update replaces the
  complete Draft/link set with exact expected row version and one increment.
- [x] Successor locks the stable header, rejects another Draft, allocates
  `max(version_no)+1`, copies an exact Approved source, applies a complete
  validated override, and never writes source rows/activity.
- [x] Approval delegates to repository authority locking, then revalidates
  references and RateVersions under the same transaction before freezing
  commercial snapshot/links and appending activity/outbox. Suspend/expire alter
  lifecycle/row version only.
- [x] Add
  `application-service/src/test/.../agreement/AgreementApplicationServiceTest.java`
  with 5–8 tests per command group for authorization ordering, rollback,
  stale/one-Draft conflicts, invalid links, successor preservation, terminal
  lifecycle, outbox failure, and safe reads.

**Traceability:** US-01, US-04, US-05, US-13; FR-002–FR-004,
FR-201–FR-205; NFR-002–NFR-004.

### Step 6 — Implement W2 JDBC authority and dual-read administration

- [x] Add `dataaccess/.../jdbc/JdbcW2AgreementRepository.java` for
  create/update/successor/transition and W2-only candidate access, and
  `JdbcAgreementAdminReadRepository.java` for bounded W2/LEGACY list/detail
  projections.
- [x] Approval must derive the canonical length-prefixed
  customer+lane+origin+destination+equipment key, acquire
  `pg_advisory_xact_lock(hashtextextended(key,0))`, lock/reload the Draft,
  verify expected row version, and reject inclusive overlap before the update.
- [x] Keep list ordering `agreementNumber, agreementId`, zero-based service
  paging size 1–100, Draft/greatest-W2 selection, `validOn`-aware Approved
  selection, bounded set-fetches for links/activity, and no N+1 queries.
- [x] Modify existing `JdbcAgreementRepository.java` and
  `InMemoryAgreementRepository.java` only as needed to enforce
  `authority_model=LEGACY`, mirror post-V3 legacy history deterministically,
  and exclude W2 headers from every legacy search/detail/active lookup.
- [x] Add `JdbcW2AgreementRepositoryPostgresTest.java`,
  `JdbcW2AgreementRepositoryConcurrencyPostgresTest.java`, and
  `AgreementAdminReadRepositoryPostgresTest.java` covering exact link
  atomicity, one-Draft races, same-key approval races, inclusive boundary
  overlap, stale mutation, rollback, legacy exclusion, deterministic backfill,
  list plans, and restart.

**Traceability:** US-01, US-04, US-05; FR-201–FR-205, FR-701;
NFR-001–NFR-003, NFR-005.

### Step 7 — Preserve the default-media LEGACY adapter byte-for-byte

- [x] Extract or retain explicit
  `container/.../api/LegacyAgreementApiAdapter.java` behavior behind the
  existing default JSON paths and old DTO grammar, including the exact
  `/{id}/approve|suspend|expire?version=` routes and `/active-lookup`.
- [x] Ignore legacy `actor` query/body values as authority/provenance and
  require the trusted internal subject; remove `local-user` and
  `local-correlation` mutation defaults.
- [x] Add checked-in pre-W2 request/response fixtures and
  `LegacyAgreementApiCompatibilityTest.java` for search/detail/active lookup,
  create/update/lifecycle bytes/semantics, actor spoofing, and W2-header
  exclusion.

**Traceability:** US-01, US-13; FR-002, FR-205, FR-701/FR-702;
NFR-004, NFR-005.

### Step 8 — Implement explicit W2 media routing, REST DTOs, and OpenAPI

- [x] Refactor `ChargeAgreementApiController.java` into an explicit media
  router plus `W2AgreementApiAdapter.java`; select the dialect before body/query
  parsing and return 406/415 for unsupported or mixed media.
- [x] Implement vendor routes for list/create, detail/update,
  `POST /{agreementId}/versions`,
  `POST /{agreementId}/versions/{versionId}/approve`, and preserved
  suspend/expire with exact version ID, expected row version, and reason.
- [x] Return discriminated W2/LEGACY administration views, exact links,
  history/activity/capability flags, stable typed errors, and the U02
  correlation. Vendor mutation against LEGACY returns
  `LEGACY_AGREEMENT_READ_ONLY`.
- [x] Extend `contracts/openapi/charge-agreements.yaml` additively with the
  vendor media schemas, commands, search/page/detail/error models, media
  responses, and compatibility notes while preserving Rate and default legacy
  definitions.
- [x] Add `W2AgreementApiControllerContractTest.java` and media-negotiation
  tests for every success/error route, query grammar separation, subject-first
  authorization, mixed payload rejection, and no adapter fallthrough.

**Traceability:** US-01, US-04, US-05, US-13; FR-201–FR-205,
FR-601/FR-602; NFR-004, NFR-005.

### Step 9 — Evolve lifecycle events and atomic outbox mapping

- [x] Extend all five `contracts/avro/charge-agreement.*.avsc` files from the
  retained 1.0.0 fields with nullable/default-null
  `agreementVersionId`, `agreementVersionNo`, `authorityModel`,
  `sourceAgreementVersionId`, and `lifecycleAction` for schema 1.1.0.
- [x] Update `AgreementOutboxEvent.java`, `OutboxRepository.java`,
  `JdbcOutboxRepository.java`, `KafkaAgreementEventPublisher.java`, and the W2
  application mapper so event IDs use reserved `w2agr-`, Kafka key remains
  stable agreement ID, and dedupe is
  `agreementId:agreementVersionId:rowVersion:eventType`.
- [x] Keep legacy 1.0.0 production and old/new serde consumption compatible;
  update `KafkaAgreementEventPublisherSerdeTest.java` and add old/new schema
  registry compatibility fixtures. No commercial match/link/date/money payload
  may enter lifecycle events or logs.
- [x] Prove one committed W2 mutation creates exactly one pending outbox row and
  any enqueue failure rolls back header/version/link/activity writes.

**Traceability:** US-05, US-13; FR-004, FR-204/FR-205;
NFR-002, NFR-003, NFR-005, NFR-009.

### Step 10 — Implement or explicitly block the bounded U03 relay/runtime seam

- [ ] Extend `ChargeAgreementMessagingConfiguration.java`,
  `ChargeAgreementApplicationService` relay separation, and add
  `U03AgreementOutboxRelayCoordinator.java` only if the prepared database
  contract can express the exact disjoint/exhaustive `u03_owned` classifier.
- [ ] Implement batch 50, concurrency 10, poll 5 s, lease 30 s, ack 2 s,
  worker+claim fencing, typed retry/permanent classification, delays
  5/15/30/60/60/60/60 seconds, and failure-8 PERMANENT retention without
  holding a connection during broker acknowledgement.
- [ ] Keep the old relay on the exact complement, validate one immutable startup
  toggle, preserve quarantined ownership across forward repair, and allow
  rollback only when no active/terminal/quarantined `u03_owned` row exists.
- [ ] Add `JdbcOutboxOwnershipPostgresTest.java`,
  `U03AgreementOutboxRelayCoordinatorTest.java`, and configuration/readiness
  tests for valid/legacy/malformed/nested-marker/prefixed rows, complement
  exhaustiveness, retry exhaustion, stale-worker fencing, saturation,
  shutdown/restart, and rollback refusal.
- [ ] If the current V3 contract cannot satisfy these checks safely, keep this
  step unchecked/blocked, document the exact missing forward-migration
  requirement, and leave the existing relay unchanged.

**Traceability:** US-05, US-13; FR-004, FR-701/FR-702;
NFR-002, NFR-004, NFR-005, NFR-009.

### Step 11 — Align the U02 Agreement BFF policies without weakening its core

- [x] Update only Agreement entries in
  `apps/charge-agreements/lib/bff/policies.ts` and Agreement route handlers
  under `app/api/agreements/**` to the exact W2 backend paths, query keys, body
  allowlists, actions, version identifiers, and vendor media.
- [x] Preserve `proxy-charge.ts`, assertion issuer, header stripping, bounded
  parsing, capability checks, correlation, response normalization,
  cancellation/backpressure, Rate/manual policies, and all U02 preservation
  behavior.
- [x] Add nested approve routing where exact version identity belongs in the
  path; keep browser-facing compatibility only where it can delegate without
  guessing or rereading an unbounded body.
- [x] Extend `proxy-charge.test.ts`, `route-policy.test.ts`,
  `request-validation.test.ts`, dynamic route-error tests, and U02 preservation
  fixtures to prove vendor media, spoof rejection, safe exact paths, 409/422/503
  fidelity, no LEGACY fallback, and unchanged U01 Rate routing.

**Traceability:** US-01, US-04, US-05, US-13; FR-002–FR-004,
FR-601/FR-602; NFR-004, NFR-005, NFR-010.

### Step 12 — Add strict Agreement client schemas and server-side data seam

- [ ] Add `apps/charge-agreements/lib/agreements.ts`,
  `agreement-client.ts`, and `agreement-test-fixtures.ts` with strict Zod
  schemas for W2/LEGACY discriminated detail, versions, exact links, activity,
  capabilities, forms, pages, and safe errors.
- [x] Add typed `listAgreements`, `getAgreement`, create/update/successor/
  approve/suspend/expire methods that call only the same-origin BFF; components
  must not call `fetch` directly or construct service/actor headers.
- [x] Validate complete three-link forms, exact IDs, inclusive dates, expected
  row version, bounded reasons, safe URL/page conversion, and unknown-field
  rejection before forwarding.
- [ ] Add `agreements.test.ts` and client tests with 5–8 cases per schema/helper
  group, including partial/mixed LEGACY-W2 payloads, unsafe return URLs, and
  error preservation.

**Traceability:** US-01, US-04, US-05, US-13; FR-201–FR-205,
FR-601/FR-602/FR-606; NFR-004, NFR-005, NFR-010.

### Step 13 — Implement the LinerCore Agreement list/create/edit/detail UI

- [ ] Replace the disabled/root workbench with stable routes:
  `app/page.tsx`, `app/new/page.tsx`,
  `app/[agreementId]/page.tsx`, and
  `app/[agreementId]/edit/page.tsx`, with route-local `loading.tsx`,
  `error.tsx`, and safe not-found/denied/read-only states.
- [ ] Add Charge-local components `AgreementList`, `AgreementForm`,
  `AgreementDetailView`, `AgreementVersionHistory`,
  `AgreementRateLinks`, and `AgreementLifecycleDialog`, using Server
  Components by default and minimal client islands for forms, async options,
  dirty state, live announcements, and focus management.
- [ ] Preserve list filters/paging in canonical URLs; render a labelled desktop
  table and compact/labelled overflow at 375 px; show selected Draft/greatest
  version and separate Approved authority; keep exact version selection in
  `?version=`.
- [ ] Create/edit must preserve entered values after 400/409/422/503, invalidate
  incompatible links when match/window changes, focus a linked error summary,
  prevent duplicate submission, and reconcile uncertain outcomes through
  detail before retry.
- [x] Detail must show stable/version identity, lifecycle, match fields, three
  exact linked RateVersions, immutable history, collapsed activity, and only
  permitted actions. LEGACY is visibly read-only/noneligible with no W2 links.
- [x] Extend the existing Charge-local token CSS (or approved Tailwind seam if
  available) with no CSS Modules, raw palette, local shell, page-level overflow,
  spinner, hidden focus, or shared-owner edit. Add stable `data-testid` and
  accessible-name hooks for interactive evidence.

**Traceability:** US-01, US-04, US-05, US-14, US-15;
FR-601/FR-602/FR-606; NFR-006, NFR-007, NFR-010.

### Step 14 — Add Standard-strategy UI, security, and contract tests

- [ ] Add `AgreementList.test.tsx`, `AgreementForm.test.tsx`,
  `AgreementDetailView.test.tsx`, and
  `AgreementLifecycleDialog.test.tsx`, targeting 5–8 focused tests per
  component group.
- [ ] Cover loading/empty/populated/error/retry/denied/read-only, URL state,
  field labels/errors, incompatible-link invalidation, pending/duplicate
  suppression, 409 reload recovery, long identifiers, non-color status,
  live-region updates, dialog trap/Escape/restore, and reduced motion.
- [x] Add shared-vector TypeScript/Java security tests for exact subject,
  method/path/correlation binding, duplicate/folded/spoofed headers, missing
  secret, expiry/replay/capacity, authorize-before-lookup, redaction, and
  non-local fail-closed configuration.
- [x] Add OpenAPI/controller/BFF provider-contract tests proving default legacy
  compatibility, vendor-media W2 completeness, and unchanged Rate schemas.
- [ ] Keep DS-01/DS-02/DS-03 and live WCAG/browser evidence explicitly pending
  until the real integrated stack proves them.

**Traceability:** US-01, US-04, US-05, US-13–US-15;
FR-002–FR-004, FR-201–FR-205, FR-601/FR-602/FR-606;
NFR-004–NFR-008.

### Step 15 — Add E2E, performance, rollback, and preservation harnesses

- [x] Add `tests/e2e/u03-agreement-authority.spec.ts` for direct URL/reload/
  back-forward, read-only/denied, real create/edit/approve/successor/
  suspend-or-expire history, stale conflict recovery, keyboard-only workflow,
  and 375/768/1024/1440 light/dark assertions.
- [x] Add `scripts/u03-agreement-performance.mjs` and deterministic tests for
  the fixed per-operation workload, separate healthy/domain-failure and
  dependency-fault samples, raw timings, percentile calculation, bounded
  queries, contention, pool saturation, and environment metadata.
- [x] Add `scripts/u03-agreement-preservation.mjs` with tests for V1/V3
  baseline upgrade/backfill/restart, legacy default-media bytes, Rate/U02 route
  preservation, migration checksums, forward-repair/rollback eligibility,
  manager 8088 exclusion, and honest blocked evidence when Docker is absent.
- [x] Wire focused U03 commands into `scripts/run-quality-gates.mjs` and root
  package scripts without weakening existing gates. U03 harnesses may prepare
  U06 evidence seams but must not claim final live/audit release acceptance.

**Traceability:** US-13–US-15; FR-701–FR-705; QC-01–QC-03 support;
NFR-001–NFR-009.

### Step 16 — Update configuration and technical documentation, then verify

- [x] Update `ChargeAgreementServiceConfiguration.java`,
  `application-local.yaml`, `compose.yaml`,
  `infrastructure/env/wave-a.env.example`, and health/readiness only for the
  Agreement authorization/reference/outbox settings already approved; preserve
  nginx base path, loopback 18088, U02 assertion secret/KID, service-owned DB,
  one Hikari pool, and all unrelated services.
- [x] Update `docs/u03-agreement-authority.md`,
  OpenAPI/Avro README/catalog metadata, and operator notes with media
  negotiation, lifecycle/concurrency, legacy adoption, event compatibility,
  configuration, rollback/forward-repair, and evidence limitations.
- [x] Mark plan checkboxes complete only after the applicable commands below
  pass. Record Docker/Testcontainers, browser, manager-guard, or process-spawn
  limitations as blocked/not-run evidence; never convert a prior, stale, or
  source-only result into PASS.

**Traceability:** all U03 stories and requirements; NFR-001–NFR-010.

## Exact verification commands

Run from the repository root. A command that cannot execute in the current
environment remains explicitly blocked with its stderr/exit code.

```powershell
# Source hygiene and migration ownership
git diff --check
git diff --name-only -- services/charge-agreement-service/dataaccess/src/main/resources/db/migration
node scripts/u03-agreement-preservation.test.mjs

# Charge domain/application/dataaccess/container/messaging, including Testcontainers
mvn -f services/charge-agreement-service/pom.xml test
mvn -f services/charge-agreement-service/pom.xml -DskipTests package

# Identity catalog/action changes
mvn -f services/identity-service/pom.xml test

# Charge BFF/UI unit, contract, type, lint, and production build
yarn workspace @erp/app-charge-agreements test
yarn workspace @erp/app-charge-agreements typecheck
yarn workspace @erp/app-charge-agreements lint
yarn workspace @erp/app-charge-agreements build

# Repository contract/quality integration
yarn contracts:validate
yarn contracts:verify
node scripts/u02-route-preservation.test.mjs
node scripts/run-u02-security-gates.mjs
node scripts/u03-agreement-performance.test.mjs
node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/u03-evidence.json

# Isolated runtime evidence; never target manager port 8088
yarn demo:guard
node scripts/wave-a-compose.mjs config
node scripts/wave-a-compose.mjs up -d --build
npx playwright test tests/e2e/u03-agreement-authority.spec.ts
node scripts/u03-agreement-performance.mjs --evidence artifacts/u03/performance.json
node scripts/u03-agreement-preservation.mjs --evidence artifacts/u03/preservation.json
node scripts/wave-a-compose.mjs stop
yarn demo:guard
```

Final U06-owned `aidlc-audit` and `erp-fidelity-audit` remain release blockers
and are not claimed by this U03 code-generation plan.

## Completion criteria

- [ ] Every implementation step is checked with current evidence.
- [ ] Approved W2 commercial fields/links and LEGACY history remain immutable
  and separately eligible.
- [ ] One concurrent approval winner exists per overlapping authority key/window.
- [ ] Every successful mutation has matching activity and outbox evidence;
  failed mutations leave none.
- [ ] U02 assertion/capability/media boundaries and U01 Rate behavior remain
  green.
- [ ] No migration file, `packages/ui`, shell/navigation, master/page override,
  palette, Booking/U04 code, manager project, or port 8088 is changed.
- [ ] Any missing prepared-schema, Docker, DS-01/02/03, Playwright, performance,
  rollback, or audit evidence remains visibly blocked rather than reported as
  passed.
