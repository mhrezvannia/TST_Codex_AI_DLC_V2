# Code Generation Plan - U01 Rate Authority

## Source Trace

This plan implements U01 from `unit-of-work.md`, `unit-of-work-story-map.md`,
`requirements.md`, `business-logic-model.md`, `business-rules.md`,
`domain-entities.md`, `performance-design.md`, `security-design.md`, and
`deployment-architecture.md`.

U01 decisively implements US-01 through US-03 and contributes the Rate-specific
parts of US-13 through US-15 and QC-01 through QC-03. The principal requirement
coverage is FR-001 through FR-004, FR-101 through FR-108, FR-601 through
FR-603, FR-606, FR-701 through FR-703, and NFR-001 through NFR-010 where those
requirements apply to Rate authority.

This is a brownfield, in-place change to the existing
`charge-agreement-service`, `apps/charge-agreements`, Identity authorization
catalog, and existing Wave A runtime definitions. It creates no new deployable,
does not implement agreement/pricing/manual-case behavior, does not redesign
the shared shell or `packages/ui`, does not target manager port 8088, and does
not rewrite the historical W1 blocked/waived evidence.

## Implementation Steps

- [x] Step 1: Establish the U01 brownfield baseline and executable contract fixtures.
  - Traceability: US-01-US-03; FR-001-FR-004, FR-101-FR-108; NFR-005, NFR-010.
  - Preserve the existing agreement, pricing-request, manual-case, outbox, module-info,
    health, and messaging behavior before extending the service.
  - Add Rate-specific test fixtures/builders for OFR/BASE, BAF/SURCHARGE, and
    THC/LOCAL without repurposing existing agreement models or repositories.
  - Record the existing Charge SQL catalog as the exact V1 comparison source and
    add regression assertions that old tables/columns remain present.

- [x] Step 2: Adopt Flyway and create the complete immutable V1-V4 Charge migration chain.
  - Traceability: QC-01; FR-101-FR-108, FR-201-FR-205 schema preparation,
    FR-404-FR-405 schema preparation, FR-701; NFR-002, NFR-003, NFR-005.
  - Add Flyway dependencies and explicit startup configuration to the existing
    Charge container; disable competing legacy SQL initialization after exact V1
    equivalence is proven.
  - Add `V1__charge_baseline.sql` as an exact catalog reproduction,
    `V2__versioned_rate_authority.sql` for Rate/RateVersion/activity,
    `V3__versioned_agreement_authority.sql` for the fully specified prepared
    agreement schema/backfill, and `V4__pricing_terminal_evidence.sql` for the fully
    specified prepared pricing/manual-case schema/backfill.
  - Implement the exact-catalog adoption guard: empty schemas migrate; schemas with
    history validate/migrate; nonempty schemas without history baseline at V1 only
    after exact comparison; drifted/partial catalogs fail readiness.
  - Add Testcontainers PostgreSQL migration tests covering empty install, exact
    baseline upgrade, V1-V4 order, constraints/indexes, deterministic V3/V4
    backfills, restart validation, drift rejection, and read-only validate mode.
  - U01 exposes no U03 agreement or U04 pricing/manual behavior and downstream units
    must consume, not rewrite, these applied files.

- [x] Step 3: Implement the Rate aggregate, immutable version model, and value objects.
  - Traceability: US-02-US-03; FR-101-FR-108; RATE-001-RATE-011,
    RATE-016-RATE-017; NFR-003.
  - Add stable `Rate`, immutable-identity `RateVersion`, `RateApplicability`,
    scale-two USD `Money`, `RateActivity`, lifecycle/category/basis enums, and
    presentation-state derivation in `domain-core`.
  - Enforce the category/code matrix, category-specific destination rules,
    non-negative two-decimal money, inclusive date windows, Draft-only mutation,
    immutable Approved versions, successor copy semantics, and explicit `asOf`
    derivation without using binary floating point.
  - Add 5-8 focused unit tests per domain component/value-object group, including
    date boundaries, invalid applicability, over-precision/negative money,
    Approved immutability, and byte-for-byte unchanged successor source.

- [x] Step 4: Define Rate commands, queries, read models, ports, and typed failures.
  - Traceability: US-01-US-03, US-13; FR-001-FR-004, FR-101-FR-108;
    RATE-012-RATE-020; NFR-004, NFR-010.
  - Add Rate create, Draft update, approve, successor, list, detail, and history
    request/response models in the existing application/application-service
    boundaries.
  - Add dedicated Rate repository, activity, authorization, typed reference
    validation, clock, and ID ports so the permissive legacy agreement adapters
    cannot satisfy Rate constructors.
  - Add stable 400/401/403/404/409/422/503 failures for malformed input, denial,
    missing identities, optimistic conflicts, existing Draft, authority overlap,
    semantic validation, and unavailable reference/Identity dependencies.
  - Add application port/DTO serialization tests and architecture/dependency tests
    proving domain-core remains adapter-independent.

- [x] Step 5: Implement the transactional Rate application service.
  - Traceability: US-01-US-03, US-13; FR-001-FR-004, FR-103-FR-108;
    RATE-003-RATE-006, RATE-012-RATE-020; NFR-002-NFR-004.
  - Authorize at each query/command boundary before disclosure or persistence,
    validate exact active references at save and approval, and execute mutation
    plus `RateActivity` append atomically.
  - Implement create, Draft edit with expected row version, approve, successor,
    paged/filter search, detail/history, action projection, and echoed
    `evaluatedAsOf`.
  - Implement the specified history-aware summary selection so a Draft successor
    cannot hide an effective Approved version.
  - Add 5-8 unit tests per service command/query group covering allow/deny,
    reference mismatch/unavailability, optimistic conflicts, rollback on audit
    failure, list selection/order, and permitted actions.

- [x] Step 6: Implement PostgreSQL Rate persistence and concurrency guards.
  - Traceability: US-01-US-03; FR-102-FR-108; RATE-003-RATE-005,
    RATE-013-RATE-015, RATE-019; NFR-001-NFR-003.
  - Add parameterized JDBC adapters for stable Rate, version history, activity,
    paged/filter queries, optimistic Draft updates, and locked successor allocation.
  - Implement the canonical length-prefixed authority key,
    `pg_advisory_xact_lock(hashtextextended(..., 0))`, row reload/lock, and inclusive
    overlap predicate in the same approval transaction.
  - Translate database constraint failures to safe typed conflicts/validation
    results without returning SQL names or fragments.
  - Add Testcontainers repository/integration tests for round-trip fidelity,
    category-specific nullability, one-Draft uniqueness, list/history selection,
    concurrent overlapping approval with at most one winner, and immutable prior
    versions after successor creation.

- [x] Step 7: Implement fail-closed Identity authorization and Reference Data adapters.
  - Traceability: US-13; FR-001-FR-004; RATE-012, RATE-018-RATE-020;
    NFR-004, NFR-009.
  - Extend the existing Identity catalog with resource `charge-rates`, actions
    `read`, `create`, `update`, `approve`, and `create-successor`; grant all five
    to `PRICING` and only `read` to `FINANCE_READ`, with no new role.
  - Add the non-local Charge HTTP authorization adapter against
    `/internal/identity/authorize`, accepting only an exact echoed `ALLOW`, and an
    explicit local map for `local.pricing.analyst` and `local.charge.reader`.
  - Add the typed Reference Data adapter for `CHARGE_CODE`, `CURRENCY`, `LOCATION`,
    and `EQUIPMENT_TYPE`, checking canonical ID, active state, set, and expected
    OFR/BAF/THC/USD code.
  - Enforce the designed two-second deadline, fixed URLs, no redirects, bounded
    permits/body sizes, no retry/stale fallback, and typed 422 versus 503 outcomes.
  - Add adapter tests for exact allow/deny echo, malformed/unavailable Identity,
    inactive/mismatched references, deadlines/permit exhaustion, safe redaction,
    and proof that legacy permissive agreement beans cannot wire into Rate.

- [x] Step 8: Expose the Rate REST API and standard error contract.
  - Traceability: US-01-US-03, US-13; FR-002-FR-004, FR-101-FR-108;
    FR-601-FR-603, FR-606.
  - Add Rate list/create/detail/history, Draft update, approve, and successor
    endpoints to the existing Charge container using stable Rate/version IDs,
    expected row version, explicit correlation, bounded pagination, and ISO `asOf`.
  - Map DTOs to typed application boundaries and preserve the established
    platform error envelope/media conventions.
  - Update the Charge-owned API contract/examples additively where a published
    Rate administration contract exists; do not modify the canonical
    booking-time `/pricing-requests` behavior in U01.
  - Add controller/contract tests for happy paths and every 400/401/403/404/409/
    422/503 classification, including SQL-injection-shaped values and no internal
    detail leakage.

- [x] Step 9: Wire configuration, readiness, and isolated runtime settings.
  - Traceability: US-13; FR-004, FR-701-FR-703; NFR-002, NFR-004, NFR-009.
  - Extend `ChargeAgreementServiceConfiguration` with exact typed Rate beans,
    transaction boundaries, Flyway/catalog guard, datasource pool bounds, and
    dedicated Identity/Reference clients.
  - Require `CHARGE_RATE_AUTHORIZATION_MODE=local-map|identity-http` with no default,
    prove exactly one Rate authorization bean, and make readiness false for invalid
    Flyway state, wiring, URL, or required non-local credential.
  - Update only existing Charge Docker/Compose/Wave A/nginx/config seams needed to
    mount the Rate capability; Wave A must pin `identity-http`, retain project
    `linercore-wave-a`, use nginx port 18088, and leave manager port 8088 untouched.
  - Add configuration/context/readiness tests for local-map, identity-http,
    missing/duplicate beans, invalid credentials/URLs, and degraded dependency
    behavior.

- [x] Step 10: Implement the Charge Rate client, BFF routes, and validation schemas.
  - Traceability: US-01-US-03, US-13; FR-002-FR-004, FR-601-FR-603,
    FR-606; NFR-004-NFR-007, NFR-010.
  - Extend `apps/charge-agreements` with strict TypeScript/Zod Rate DTOs, list
    filters, form parsing, error mapping, and the existing same-origin proxy/BFF
    pattern.
  - Add BFF handlers for Rate list/create/detail/update/approve/successor. Derive
    subject/capabilities from the signed server session, generate/propagate
    correlation, map browser page one to service page zero, and never accept a
    browser actor/role/capability as authority.
  - Preserve safe return queries and entered form values across 409/422/503; do
    not introduce Redux/RTK for route/query/form-local state.
  - Add Vitest tests for schemas, filter canonicalization, session/denied behavior,
    spoofed actor rejection, proxy status/error fidelity, correlation, and
    one-based/zero-based pagination mapping.

- [x] Step 11: Implement the three LinerCore Rate route patterns and interactions.
  - Traceability: US-01-US-03, US-14-US-15; FR-601-FR-603, FR-606;
    NFR-006, NFR-007, NFR-010.
  - Add `/charge-agreements/rates`, `/charge-agreements/rates/new`, and
    `/charge-agreements/rates/[rateId]`, with Draft edit represented by the
    canonical detail route's `?mode=edit` state.
  - Build one unified category-aware list, grouped create/edit form, read-only
    detail/history/activity evidence, approval confirmation, and successor action
    using existing `@erp/ui` primitives and LinerCore tokens.
  - Provide skeleton, empty, populated, denied/read-only, validation, conflict,
    command-pending, success, service-error/retry, long-content, and derived
    Draft/Scheduled/Effective/Expired states.
  - Preserve persistent labels, linked error summaries, focus movement/restoration,
    polite live announcements, non-color status, labelled table overflow, dirty
    state, and usable 375/768/1024/1440 layouts in both themes.
  - Add stable `data-testid` attributes to interactive controls and key status
    regions. Do not edit `packages/ui`, global shell/navigation, typography,
    palette, or claim DS-01/DS-02/DS-03 as passed without integrated evidence.
  - Add Testing Library/Vitest component and route tests (5-8 per page/form
    component group) for category form shape, list filters/history, lifecycle
    actions, focus/live-region behavior, duplicate-submit prevention, and
    responsive overflow semantics.
  - Constrained frontend deviation: this repository has no Tailwind/clsx
    installation or configuration and `@erp/api-core` exposes no callable HTTP
    client. U01 therefore uses Charge-local global CSS containing only existing
    `--erp-*` tokens and an app-local `lib/rate-client.ts` seam for same-origin
    BFF calls. Rate UI components contain no direct `fetch`; the server-only
    `lib/rate-proxy.ts` remains isolated. This is not a claim of full frontend
    standards convergence.

- [x] Step 12: Add security, migration, and performance verification seams.
  - Traceability: US-13-US-15; QC-01-QC-03; FR-701-FR-705;
    NFR-001-NFR-009.
  - Add executable redaction checks for logs/evidence, authorization/reference
    failure cells, SQL/input hardening, Approved immutability hashes, restart
    identity preservation, and deterministic migration/catalog hashes.
  - Add a Rate list/approval performance fixture and raw-timing harness compatible
    with U06's post-warm-up 100+ sample p99 evidence; do not claim a production SLO.
  - Integrate report-first Semgrep, Trivy, secret scan, and Yarn audit outputs with
    the existing closed-waiver verifier as the sole High/Critical policy exit;
    tool/config/report failures and verified secrets remain immediate failures.
  - Add integration/browser stubs and selectors needed by U06 for API/database/UI
    correlation and the required width/theme/keyboard matrix, without running or
    mutating the manager stack.

- [ ] Step 13: Verify test configuration, execute the Standard strategy, and close the plan.
  - Traceability: all U01 stories and requirements above; NFR-005, NFR-008,
    NFR-010.
  - Keep the existing Maven multi-module/JUnit configuration and root
    Vitest/Testing Library setup; add Testcontainers/Flyway test dependencies and
    broaden the Charge app test script/config only where required to discover all
    new test files. Do not create a duplicate test runner configuration.
  - Run targeted domain, application-service, JDBC/Testcontainers,
    container/controller, Identity-catalog, Charge app unit/component, lint,
    type-check, and production-build commands.
  - Run relevant preservation regressions and `npm run demo:guard` before and after
    any isolated Compose verification. Use only `scripts/wave-a-compose.mjs` and
    project `linercore-wave-a` for live checks; do not target port 8088.
  - Capture exact commands/results and unresolved DS dependencies in
    `code-summary.md`; mark each checkbox only after its implementation and tests
    complete.
  - Environment note: the Java/unit/config/lint/type-check checks completed.
    Docker-unavailable Testcontainers cases are skipped by their explicit guards;
    no live PostgreSQL/Compose/UI proof is claimed. Post-refactor Vitest and
    production build retries were blocked by the managed Windows sandbox denying
    Node child-process launch (`spawn EPERM` for esbuild), and `demo:guard` was
    likewise blocked at `spawnSync docker EPERM`. The last pre-refactor frontend
    run remains 17/17 green, but it is not presented as post-refactor proof.

## Test Strategy

The active strategy is Standard. U01 will create unit tests alongside every
domain, application, adapter, BFF, and UI component group, targeting 5-8 focused
tests per component group. It will also create integration tests or executable
stubs for PostgreSQL/Flyway, repository concurrency, HTTP authorization/reference
adapters, Spring configuration/controller boundaries, and frontend BFF routes.

Core test files and test-runner configuration are part of Code Generation and
will not be deferred to Build and Test. U06 retains ownership of integrated
Wave A acceptance, the complete responsive/theme browser matrix, measured p99,
manager-protection evidence, and final audits.

## Planned Validation Commands

- Maven unit/integration tests for `charge-agreement-service` and affected
  `identity-service` modules.
- Charge frontend `test`, `typecheck`, `lint`, and `build` scripts.
- Targeted migration/catalog validation against test-owned PostgreSQL.
- Existing repository lint/type-check/build/test commands affected by shared
  contracts or runtime configuration.
- `npm run demo:guard` around any permitted isolated Wave A verification.

## Approval

This plan is ready for user review. Application code generation must not begin
until the user approves it.
