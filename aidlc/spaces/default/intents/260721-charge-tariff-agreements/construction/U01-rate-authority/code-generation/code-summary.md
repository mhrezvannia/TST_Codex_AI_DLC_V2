# Code Summary - U01 Rate Authority

## Outcome

U01 adds a versioned Rate authority to the existing Charge deployable and
Charge-owned frontend. It implements stable Rate identity, immutable version
history, Draft edit and successor flows, non-overlapping approval, attributable
activity, category-aware applicability, fail-closed authorization/reference
validation, additive REST/OpenAPI contracts, and the unified Rate
list/create/detail/edit UI.

The implementation remains inside the existing `charge-agreement-service`,
`apps/charge-agreements`, Identity catalog, Reference Data local identity seam,
and Wave A topology. It creates no new deployable, does not implement agreement
or pricing/manual-case behavior over the prepared downstream schema, does not
edit `packages/ui`, and does not target manager port 8088.

## Files Created

| Area | Files and responsibility |
| --- | --- |
| Rate domain | `domain-core/.../domain/rate/Rate*.java` - aggregate, immutable version, applicability, money, lifecycle, presentation state, identity and activity types |
| Rate application | `application-service/.../rate/RateApplicationService.java`, `RateCommands.java`, `RateSearchQuery.java`, `RateViews.java`, `RateApplicationException.java` |
| Rate ports | `RateRepository.java`, `RateRepositoryException.java`, `RateAuthorizationPort.java`, `RateReferenceValidationPort.java` |
| PostgreSQL adapter | `dataaccess/.../jdbc/JdbcRateRepository.java` |
| Migrations | `V1__charge_baseline.sql`, `V2__versioned_rate_authority.sql`, `V3__versioned_agreement_authority.sql`, `V4__pricing_terminal_evidence.sql` |
| Migration adoption | `container/.../ChargeFlywayMigrationStrategy.java` - exact-catalog probe and guarded baseline/migrate behavior |
| Service integrations | `RateServiceIdentityFilter.java`, `HttpRateAuthorizationAdapter.java`, `LocalRateAuthorizationAdapter.java`, `HttpRateReferenceValidationAdapter.java` |
| REST API | `container/.../api/RateApiController.java` and additive Rate operations in `contracts/openapi/charge-agreements.yaml` |
| Charge BFF | `app/api/rates/**/route.ts`, server-only `lib/rate-proxy.ts`, client-side `lib/rate-client.ts`, and strict `lib/rates.ts` schemas |
| Charge UI | `app/rates/RateList.tsx`, `RateForm.tsx`, `[rateId]/RateDetailView.tsx`, route pages, loading/error boundaries, and token-only `rates.css` |
| Runtime/evidence | `apps/charge-agreements/next.config.mjs` and `scripts/u01-rate-performance.mjs` |
| Tests | Rate domain, application-service, migration catalog/Testcontainers, adoption-guard drift, REST contract, adapter, BFF/schema, list, form, and detail test files |

## Files Modified

- `ChargeAgreementServiceConfiguration.java`, Charge container/dataaccess POMs,
  and `application-local.yaml` for Flyway, JDBC transactions, exact conditional
  Rate authorization beans, bounded Identity/Reference clients, and readiness
  configuration.
- Identity `MvpAuthorizationCatalog.java`, `PermissionAction.java`, and policy
  tests for `charge-rates` actions. `PRICING` receives all Rate actions and
  `FINANCE_READ` receives read only.
- Reference Data local identity configuration/filter/tests for a read-only
  `charge-agreement-service` caller.
- Auth session mapping/tests for pricing-analyst and Charge-reader Rate
  permissions.
- Charge app layout/workbench/package test configuration for the shared shell,
  base path, token stylesheet, and complete Charge test discovery.
- `compose.yaml`, `infrastructure/env/wave-a.env.example`, and
  `infrastructure/nginx/default.conf` for the existing Charge app/service mount,
  mandatory `identity-http` Wave A mode, separate local credentials, and nginx
  port 18088.

## Key Implementation Decisions

1. **Immutable authority model.** Stable Rate identity is separated from
   immutable RateVersion identity. Only a Draft may be edited; correction of an
   Approved version creates a successor Draft without mutating prior values or
   activity.
2. **Serialized approval.** Approval derives the canonical length-prefixed
   authority key, acquires a PostgreSQL transaction advisory lock, reloads the
   Draft under lock, and applies the inclusive overlap predicate before
   atomically approving and appending activity.
3. **Exact migration ownership.** V1 is byte-equivalent to the legacy SQL
   catalog modulo line endings. V2 implements Rate authority; V3/V4 prepare the
   complete downstream agreement and pricing/manual evidence contracts without
   exposing their behavior in U01.
4. **Guarded brownfield adoption.** A nonempty schema without Flyway history is
   compared against V1 built in a temporary PostgreSQL probe schema. The
   comparison covers tables, column types/nullability/defaults/identity,
   constraints, indexes, and sequences. Drift aborts before baseline.
5. **Authenticated Rate boundary and fail-closed dependencies.** Every Rate
   backend route authenticates the exact Charge BFF service credential before
   binding its actor assertion to a request attribute; controllers never read a
   raw actor header. Identity decisions must echo the exact subject, resource,
   action, scope, correlation and caller before `ALLOW` is accepted. Rate
   authorization cannot use the permissive legacy agreement bean. Reference
   checks validate canonical active IDs/set/code with bounded permits, bodies,
   and deadlines.
6. **Session-derived BFF authority.** Rate BFF routes derive actor and
   permissions from the signed session, reject spoofed actor headers, attach
   correlation/service credentials, stop streaming command bodies at 32 KiB,
   apply bounded timeouts, and preserve typed backend errors.
7. **One Rate UI.** A unified list and category-aware form cover BASE/OFR,
   SURCHARGE/BAF, and LOCAL/THC. Detail shows immutable history, activity,
   derived states, and independently authorized edit/approval/successor actions.
   Read-only users do not receive a Create command, while approval requires an
   evidence-bearing confirmation dialog.
8. **Selected-version SQL search.** The repository selects the commercially
   displayed Draft/effective/scheduled/expired version in PostgreSQL, applies
   applicability and text/category filters to that version, and performs stable
   count/order/limit/offset queries before loading a bounded result page.

## Story and Requirement Coverage

- US-01: Rate list, filters, detail, version history, activity and identities.
- US-02: category-aware Draft creation and optimistic Draft update.
- US-03: approval, inclusive-overlap/concurrency protection, immutability and
  successor history.
- US-13: Identity policy, local/non-local service authorization, signed-session
  BFF authority, reference validation, correlation and attributable activity.
- US-14/US-15 contribution: persistent labels, error summaries, live regions,
  pending/empty/error/read-only states, test IDs, token-based responsive layouts,
  and shared-shell composition.
- Primary functional coverage: FR-001-FR-004, FR-101-FR-108, FR-601-FR-603,
  FR-606 and U01's contribution to FR-701-FR-703.

## Test and Validation Summary

| Check | Result |
| --- | --- |
| Charge Maven reactor | PASS: Maven reported `BUILD SUCCESS`; 68 tests reported, 58 executed, 0 failures/errors |
| Charge PostgreSQL/Testcontainers | 10 tests compiled; skipped because Docker is unavailable, including 4 new repository concurrency/SQL tests |
| Identity reactor | PASS: 19/19 |
| Reference Data affected filter | PASS: 2/2 |
| Charge TypeScript type-check | PASS |
| Charge lint | PASS with zero warnings/errors |
| OpenAPI Rate contract assertions | PASS: exact `RateListItem`, `canCreate`, authenticated service security and actor parameters |
| Wave A rendered configuration | PASS: `linercore-wave-a`, `identity-http`, nginx `18088` |
| Diff/escaping/trailing whitespace | PASS |
| Performance script syntax | PASS |
| Charge frontend Vitest after UI refactor | BLOCKED: managed sandbox rejects esbuild child process with `spawn EPERM` |
| Charge production build after UI refactor | BLOCKED by the same `spawn EPERM` |
| `demo:guard` and live Compose/UI/PostgreSQL proof | BLOCKED: Docker child process denied/unavailable |

The last frontend run before the UI governance refactor was 17/17 green and its
production build completed, but those results are not presented as proof of the
post-refactor source.

## Deviations and Tradeoffs

- The enterprise standard mandates Tailwind/clsx and a callable
  `@erp/api-core` client, but neither capability exists in this repository and
  W2-02 owns shared frontend infrastructure. U01 therefore removes prohibited
  CSS Modules, uses Charge-local global CSS containing only existing `--erp-*`
  tokens, and isolates same-origin BFF calls behind app-local
  `lib/rate-client.ts`. This is a constrained brownfield fallback, not a claim
  of full paved-road convergence.
- DS-01, DS-02 and DS-03 remain shared W2-02 dependencies. U01 does not claim
  focus-trap/combobox/ribbon acceptance from source or component tests.
- Integrated browser evidence at 375/768/1024/1440, light/dark, keyboard/focus,
  and real Wave A data remains U06 acceptance work and is not claimed here.

## Plan Status and Open Verification

Approved plan Steps 1-12 are implemented. Step 13 remains unchecked because the
managed environment prevented post-refactor frontend tests/build and
Docker-backed checks. Build and Test must rerun those commands in an environment
that permits esbuild and Docker before treating U01 as release-ready.

## Iteration 1 Remediation

All four blocking Iteration 1 findings have source and executable-test
remediation:

1. Rate routes now fail closed at an inbound Charge BFF identity filter. The
   authenticated actor is request-bound only after exact service authentication,
   and downstream Identity response binding covers subject, resource, action,
   scope, correlation and caller. Direct, wrong-service, wrong-token, legacy
   actor-spoof and downstream echo-mismatch tests are present and green.
2. OpenAPI now references the exact `RateListItem` schema, exposes page-level
   `canCreate`, applies a Rate service-token security scheme, and documents the
   authenticated Charge BFF service/actor assertion contract on every Rate
   operation.
3. Selected-summary semantics, filtering, stable ordering, total count and
   pagination moved into bounded PostgreSQL SQL. Application tests prove that a
   successor with changed applicability is not matched when a different
   effective version is selected; a PostgreSQL test repeats the case and proves
   SQL count/limit/offset behavior.
4. PostgreSQL tests now drive concurrent same-authority approvals, Draft
   update/approval and duplicate-successor races. They assert one winner,
   atomic activity and `RATE_AUTHORITY_CONFLICT`/`RATE_VERSION_CONFLICT`.

The non-blocking findings are also addressed: mutation actions are authorized
independently, read-only users do not see Create, approval uses a scoped
evidence-bearing dialog with local Tab containment and trigger restoration, and
the BFF stops reading once the 32 KiB streaming limit is exceeded.

The four new PostgreSQL tests compile but remain Docker-skipped in this
environment, so their runtime assertions are not claimed as executed. Frontend
Vitest remains blocked at startup by the managed sandbox's esbuild `spawn EPERM`;
TypeScript type-check and lint pass after the remediation. The existing live
Compose/browser limitations remain unchanged.

## Review

### Iteration 1

**Verdict: NOT-READY**

#### Blocking findings

1. **The Rate backend does not authenticate its caller or bind the asserted actor
   to an authenticated service request.** The BFF sends
   `X-LinerCore-Service-Id` and `X-LinerCore-Service-Token`, but no Charge filter
   or controller consumes either header; `RateApiController` trusts the
   caller-supplied `X-Actor-Subject` directly. Because Compose also publishes the
   Charge service port, a client can bypass the signed-session BFF and submit a
   known Pricing subject identifier to the backend. The downstream Identity call
   does not repair this trust break: `HttpRateAuthorizationAdapter` accepts an
   `ALLOW` after checking only echoed resource and action, not subject,
   correlation, scope, or caller. Add fail-closed BFF service authentication and
   actor binding at the Charge boundary, then test direct/spoofed calls.
2. **The published OpenAPI contract is not implementable for the primary list
   operation.** `RatePage.items` is declared as an array of unconstrained
   `object` values even though the controller and strict BFF schema require the
   full `RateListItemResponse` shape. The contract also publishes
   `X-Actor-Subject` as the authority input while omitting the service-authentication
   boundary that the implementation claims. Define and reference the exact list
   item schema and document the authenticated caller/actor contract consistently.
3. **List filtering can return the wrong commercial authority and does not
   paginate in the database.** `matchesApplicability` accepts a Rate when any
   historical version matches, but `selectSummary` may display a different
   Draft/effective/scheduled version with different applicability. In addition,
   `findAll()` loads every stable Rate and performs a version query per Rate
   before filtering and paging in memory. Correct selection/filter semantics and
   move filtering, ordering, and pagination into bounded SQL; cover a successor
   whose applicability differs from its source.
4. **The concurrency guarantee has no repository-level executable proof.**
   The advisory-lock/overlap algorithm is directionally coherent, but the
   Testcontainers suite exercises migrations and adoption drift only; no test
   drives two `JdbcRateRepository` approvals for the same authority key or the
   update/approve and duplicate-successor races. Add PostgreSQL integration tests
   that prove one winner, atomic activity, and the published conflict codes.

#### Non-blocking findings

- `RateViews.Actions` derives edit, approve, and successor visibility from only
  the `update` authorization decision. Mutations are re-authorized server-side,
  but independently granted actions will be displayed incorrectly. Evaluate
  each action explicitly.
- The list always renders `Create rate` for a read-only Charge user, and approval
  uses `window.confirm` instead of the required evidence-bearing confirmation
  dialog. Align command visibility and confirmation behavior with the Charge
  page contract before UI acceptance.
- The BFF reads the complete request with `request.text()` before enforcing its
  32 KiB limit. Enforce the limit while streaming or at the ingress/runtime so
  the stated body bound is real.

#### Validation performed

- Inspected the U01 implementation across Rate domain/application/JDBC,
  Flyway V1-V4 and adoption strategy, REST/OpenAPI, Identity/Reference Data,
  BFF/UI, Compose/nginx/env, and the associated tests. No generation plan or
  `memory.md` was read.
- `npm --workspace @erp/app-charge-agreements run typecheck`: **PASS**.
- `npm --workspace @erp/app-charge-agreements run lint`: **PASS**, zero
  warnings/errors (the command reports the existing `next lint` deprecation and
  missing Next ESLint plugin notice).
- Normalized V1 migration versus the legacy catalog SQL: **PASS**, exact modulo
  line endings.
- Recorded Maven evidence in this summary (58 tests, Identity 12/12, Reference
  Data 2/2) was considered but not represented as a fresh reviewer run.
- Docker/Testcontainers, live Compose/PostgreSQL/browser evidence, frontend
  Vitest, and the post-refactor production build remain **NOT RUN / ENVIRONMENT
  BLOCKED** as already recorded; no pass is inferred. The persistent code graph
  was stale for the untracked U01 files, so findings were verified from the
  actual workspace source instead.

### Iteration 2

**Verdict: READY**

#### Findings

- All four Iteration 1 blockers are remediated in source. Rate routes now
  authenticate the exact BFF credential and consume only the request-bound actor;
  downstream `ALLOW` acceptance checks subject, resource, action, scope,
  correlation, and caller echoes. The strict service/actor boundary is covered by
  direct, wrong-credential, and legacy-spoof tests.
- OpenAPI now defines and references the exact `RateListItem`, page-level
  `canCreate`, service-token security, service identity, and authenticated actor
  assertion on every Rate operation.
- Search selects the displayed lifecycle version in SQL, applies applicability
  filters to that same row, and performs count/order/limit/offset before loading
  a maximum 100 Rates. Application and PostgreSQL test source covers changed
  successor applicability and stable page/count behavior.
- Four PostgreSQL tests now cover same-authority approval, update/approval,
  duplicate-successor, and selected-version SQL races/semantics, including winner
  count, activity atomicity, and published conflict codes. They compile but were
  Docker-skipped here; this is an environment evidence gap, not a missing source
  implementation or missing test.
- The feasible non-blocking findings are addressed: action capabilities are
  evaluated independently, read-only users do not receive Create, approval uses
  an evidence-bearing dialog with local focus containment/restoration, and the
  BFF stops consuming the request stream after 32 KiB.

#### Validation performed

- `mvn -f services/charge-agreement-service/pom.xml test`: **BUILD SUCCESS**;
  68 tests reported, 58 executed, 0 failures/errors, 10 Docker-dependent tests
  skipped. The four new repository race/SQL tests are among the skipped tests and
  are not claimed as runtime passes.
- `npm --workspace @erp/app-charge-agreements run typecheck`: **PASS**.
- `npm --workspace @erp/app-charge-agreements run lint`: **PASS**, zero
  lint warnings/errors; the existing `next lint` deprecation and missing Next
  ESLint plugin notices remain non-blocking maintenance items.
- Frontend Vitest, production build, live Compose/PostgreSQL, responsive/browser,
  focus, and accessibility evidence remain **NOT RUN / ENVIRONMENT BLOCKED** by
  the recorded esbuild `spawn EPERM` and unavailable Docker. Those checks remain
  mandatory for Build and Test/release acceptance; no pass is inferred here.
