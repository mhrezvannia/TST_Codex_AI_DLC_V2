# Code Generation Plan - booking-design-system-closure

## Unit Scope

This plan closes the unresolved W2-02 Definition-of-Done gaps in the existing brownfield implementation. It preserves baseline `c2f13dd`, the W0/W1/W2-01 integrations, the existing authenticated shell, the Booking BFF/service/data/event contracts, and the historical W1 live-proof status as **BLOCKED/waived**. It creates no second frontend, module-local theme, independent navigation, backend schema, service, API contract, cloud resource, or production deployment.

The active test strategy is **Standard**: changed components receive focused unit tests (targeting 5-8 requirement-driven cases where the component has that many distinct behaviors), key shell/BFF/redirect and evidence boundaries receive integration tests, and the explicit accessibility/live-evidence NFRs justify a focused Playwright E2E suite.

## Brownfield Baseline and Blast Radius

- Current branch is `intent/W2-02-design-system-closure`; `c2f13dd` is an ancestor of `HEAD`.
- Graph discovery confirms `apps/shell/app/booking/**` is the canonical Booking presentation, while `apps/booking/app/bookings/**` is a duplicate presentation above a retained BFF.
- `packages/ui` already owns the token and primitive vocabulary; implementation adds or corrects only proven generic gaps.
- The expected production-code blast radius is limited to `packages/ui/**`, `apps/shell/app/booking/**`, the minimum `apps/shell` shell/style/manifest seam, standalone `apps/booking` presentation redirect entries, and directly related adapters/tests.
- Root changes are limited to anti-drift/test/evidence configuration and scripts. Backend services, Compose definitions, other domain pages, and the manager-demo project are excluded.
- The repository currently lacks an installed `node_modules` tree, so executable baseline tests require the immutable Yarn install step after plan approval. This is an environment prerequisite, not evidence that the current implementation passes or fails.

## Plan Steps

- [x] **Step 1: Restore the executable test baseline and freeze the change inventory.** Run `corepack yarn install --immutable`, capture focused pre-change test/typecheck/lint outcomes for `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking`, and record exact existing failures without weakening gates. Reconfirm the branch/baseline ancestor and inventory only files within the Unit boundary. **Traceability:** US-003, US-006; FR-002, FR-008, FR-012; NFR-006-NFR-008.

- [x] **Step 2: Close shared UI foundation gaps without redesigning the shell.** Add/correct only domain-neutral `@erp/ui` behavior required by the canonical Booking states (DOM-prop/ref forwarding, busy/live semantics, table containment, status/error/skeleton behavior, focus/reduced-motion/theme tokens), retain existing public interfaces where compatible, and add focused package tests for both themes, semantics, keyboard/focus, and reduced motion. Do not move Booking vocabulary into `packages/ui`. **Traceability:** US-001-US-003; FR-002, FR-004, FR-005, FR-007; NFR-001-NFR-003, NFR-006.

- [x] **Step 3: Make shared-presentation ownership executable.** Declare `@erp/ui` for the shell, replace application hardcoded colors with `--erp-*` tokens, and implement a read-only anti-drift checker covering applicable `apps/**` TS/TSX/CSS for hardcoded color literals, application-local `CSSProperties` style systems, and app-to-app imports. Add deterministic non-writing negative-probe tests that prove the color/style rules reject violations and leave the worktree unchanged. Owning token definitions in `packages/ui` remain permitted. **Traceability:** US-003; FR-002, FR-003, FR-007, FR-008; NFR-003, NFR-006, NFR-007.

- [x] **Step 4: Consolidate Booking presentation routes while retaining the BFF.** Replace standalone `apps/booking/app/bookings/**` page implementations with permanent same-origin redirects to `/booking`, `/booking/new`, and `/booking/{bookingId}`. Implement/test the exact list query allow-list (`page`, `pageSize`, `sort`, `direction`, `status`, `q`), detail-only `created=1`, invalid-detail fallback, unsafe/unknown query removal, trusted canonical origin, and `/api/**` exclusion. Preserve every `apps/booking/app/api/**` route and existing auth/correlation/idempotency/size/2,500 ms timeout behavior. **Traceability:** US-001-US-003; FR-001, FR-003, FR-006; NFR-005, NFR-009; BR-001-BR-005, BR-016, BR-020B.

- [x] **Step 5: Migrate the canonical Booking list and route states to shared primitives.** Refactor `/booking` into a compact header/command bar, labelled URL-backed search/filter controls, bounded 25-row shared Table, status badges, contained table overflow, and explicit loading Skeleton, empty, populated, denied, degraded, and error/retry presentations inside the existing `ShellFrame`. Preserve session/cookie/correlation and server-oriented reads. Add route/component tests for state normalization, query continuity, row bound, semantic actions, denied/error handling, and no second shell. **Traceability:** US-001, US-003; FR-001-FR-004, FR-007; NFR-001-NFR-003, NFR-005, NFR-009; BR-006-BR-013.

- [x] **Step 6: Migrate create and lifecycle interactions with typed recovery.** Rework the existing create form and detail actions to consume shared Field/Input/Select-or-Combobox/Button/StatusStrip/Badge/Card-or-Panel primitives while preserving field names, payload mapping, reference lookup, returned Booking truth, and one-command-in-flight behavior. Implement explicit pending, success, validation-blocked, recoverable-error, denied, degraded, and fatal-error behavior with value retention, error-summary focus, live announcements, safe retry, and stable `data-testid` hooks only where semantic locators are insufficient. Add focused tests for validation, duplicate prevention, retained input, lookup/pricing/confirm failures, focus, announcements, and safe navigation. **Traceability:** US-002, US-003; FR-002, FR-005-FR-007; NFR-001, NFR-004-NFR-006, NFR-009; BR-014-BR-020A.

- [x] **Step 7: Complete canonical detail and compatibility regression coverage.** Present identity, readable status, summary facts, permitted lifecycle actions, pricing/source evidence, and a collapsed safe audit disclosure in the shared shell. Preserve async downstream truth and ensure reliable Booking content survives scoped degradation. Reconcile or remove tests for duplicate standalone components only after equivalent canonical tests exist. **Traceability:** US-002-US-004; FR-001-FR-007; NFR-001-NFR-006; BR-019, BR-020.

- [x] **Step 8: Add the root W2-02 Playwright/accessibility/evidence harness and test configuration.** Add a root Playwright config and requirement-indexed specs/helpers for authenticated canonical routes, the real create-to-confirm journey, controlled difficult states on the same running route, keyboard/focus/announcement/reduced-motion checks, light/dark themes, and widths 375/768/1024/1440. If no installed severity-capable checker exists, add a pinned dev-only `@axe-core/playwright` dependency. Add secret-safe evidence manifest/result writers, gitignored raw-trace staging, parse/redact/rebuild/rescan/replay validation, failure retention, and focused Node tests for sanitization/manifest truth. Production code must not import harness helpers or expose test-state controls. **Traceability:** US-004-US-006; FR-004-FR-012; NFR-001-NFR-003, NFR-007-NFR-009; SEC-008-SEC-010, REL-009-REL-014.

- [x] **Step 9: Wire deterministic commands without claiming live completion.** Add root scripts for the anti-drift gate, focused W2-02 tests, Playwright execution, evidence validation, and trace sanitization. Update the existing CI workflow only where runner capabilities support deterministic static/focused checks; keep live Compose, demo guards, and audits as explicit local release evidence unless executable CI support is proven. Preserve W1 as **BLOCKED/waived** in every handoff. **Traceability:** US-003-US-006; FR-008-FR-012; NFR-007, NFR-008.

- [x] **Step 10: Run code-generation verification and document the implementation.** Run the anti-drift positive/negative tests, focused package/shell/Booking/redirect/BFF/evidence tests, lint, typecheck, relevant workspace tests, and production builds. Run stage linter/type-check sensors on changed TS/TSX outputs. Record files created/modified, requirement/story coverage, test results, and any deviations in `code-summary.md`; do not label Compose/Playwright/audit closure PASS until the later Build and Test/Operation stages observe it live. **Traceability:** all US-001-US-006; FR-001-FR-012; NFR-001-NFR-009.

## Test Files and Configuration

Planned test work includes focused additions/updates in:

- `packages/ui/src/**/*.test.tsx` and existing contrast tests for changed shared primitives/tokens.
- `apps/shell/app/booking/**/*.test.tsx`, shell client/compat tests, and route-state tests.
- `apps/booking/lib/*redirect*.test.ts` plus retained BFF/security regression tests.
- `scripts/*w2-02*.test.mjs` for anti-drift, evidence manifest, guard-input assertions, and trace sanitization.
- Root `playwright.config.ts` and W2-02 specs/helpers under a dedicated test-only directory.
- Existing Vitest/root test configuration will be reused and changed only if executable discovery proves a gap.

## Planned Verification Commands

| Layer | Planned command or gate |
|---|---|
| Immutable dependencies | `corepack yarn install --immutable` |
| Shared UI | `corepack yarn workspace @erp/ui test`, `typecheck`, `lint` |
| Canonical shell | `corepack yarn workspace @erp/app-shell test`, `typecheck`, `lint`, `build` |
| Retained Booking BFF/redirects | `corepack yarn workspace @erp/app-booking test`, `typecheck`, `lint`, `build` |
| Anti-drift/evidence scripts | Focused `node --test` commands plus positive and non-writing negative probes |
| Workspace regression | `corepack yarn lint`, `typecheck`, `test`, `build` as proportionate after focused gates |
| Live acceptance (later stage) | pre/post `npm run demo:guard`; only `scripts/wave-a-compose.mjs` / `linercore-wave-a`; Playwright canonical proof |
| Final closure (later stage) | direct `aidlc-audit` and `erp-fidelity-audit` exits against `artifacts/w2-02-live/` |

## Explicit Non-Goals

- No backend repository/data-access work, database migration, schema change, service API/event change, or new domain model.
- No new deployable service, Compose project, AWS/IaC resource, production environment, monitoring platform, or deployment pipeline.
- No replacement shell, second frontend, module-local navigation/theme/palette, remote font, marketing composition, or broad migration of another domain.
- No operation against `linercore-shared-platform`; the manager demo is observed only through the exact pre/post guard contract.
- No conversion of historical W1 **BLOCKED/waived** evidence into a PASS.
