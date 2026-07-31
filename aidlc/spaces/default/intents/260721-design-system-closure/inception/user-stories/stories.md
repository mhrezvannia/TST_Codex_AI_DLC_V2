# User Stories — W2-02 Design-System Closure

## Story Map and Sources

The six stories form one non-separable **W2-02 Closure Epic**. They trace to `requirements.md`, use the actors and operational context from `business-overview.md`, respect the ownership seams in `component-inventory.md`, and apply the canonical-live/testing posture in `team-practices.md`. All are **Must Have**; no story may independently close W2-02.

| Journey order | Story | Persona | Primary requirement trace | Depends on |
|---|---|---|---|---|
| 1 | US-001 Shared-shell Booking list and states | Booking operator | FR-001–FR-004, FR-007; NFR-001–NFR-003 | US-003 |
| 2 | US-002 Keyboard create-to-confirm and recovery | Booking operator | FR-001–FR-007; NFR-001, NFR-004, NFR-005, NFR-009 | US-003 |
| 3 | US-003 Shared-package boundary and anti-drift | Frontend developer | FR-002, FR-003, FR-007, FR-008; NFR-006, NFR-007 | None |
| 4 | US-004 Reproducible live evidence matrix | Quality/release reviewer | FR-004–FR-010; NFR-001–NFR-003, NFR-007–NFR-009 | US-001, US-002, US-003, US-005 |
| 5 | US-005 Manager-demo safety | Manager-demo owner | FR-009, FR-012; NFR-008 | None; guards US-004 |
| 6 | US-006 Truthful audited closure | Quality/release reviewer | FR-010–FR-012; NFR-007, NFR-008 | US-001–US-005 |

## US-001 — Shared-Shell Booking List and States

**Priority:** Must Have  
**Story:** As a Booking operator, I want the Booking list and its operational states inside the existing authenticated shell, so that I can find work and recover from service conditions without learning a second interface.

### Acceptance Criteria

1. **Given** I am authenticated, **when** I open canonical `/booking`, **then** list content appears within the existing shell with one navigation model and no Booking-local chrome, palette, or theme.
2. **Given** Booking data is loading, **when** the list route renders, **then** stable-size shared Skeleton content appears without a blank page or layout shift.
3. **Given** populated or empty data, **when** the request completes, **then** a shared table/responsive record presentation or guided empty state appears with result context and a reachable primary action.
4. **Given** a documented controlled error, denied, or degraded condition on the running route, **when** loading completes, **then** the matching non-color-only state is announced and exposes a keyboard-reachable retry or safe navigation path.
5. **Given** either shared theme and a required viewport, **when** the list/state is captured, **then** primary actions remain visible and no clipped control, overlap, or page-level horizontal overflow is present.

### Relationships and INVEST

Depends on US-003’s shared presentation boundary and supplies list/state evidence to US-004. It is negotiable in component composition but fixed in observable outcome, estimable as a focused route family, valuable to Mina, and directly testable. Independence is intentionally bounded by the closure epic.

## US-002 — Keyboard Create-to-Confirm and Recovery

**Priority:** Must Have  
**Story:** As a Booking operator, I want to create, validate, price, confirm, and open a booking detail using only the keyboard, so that I can complete the real workflow efficiently and recover without losing valid work.

### Acceptance Criteria

1. **Given** I start at canonical `/booking`, **when** I navigate to create and complete labelled fields using only the keyboard, **then** focus order follows the visual workflow and every control has a visible shared focus indicator.
2. **Given** valid inputs and live reference/pricing services, **when** I validate, price, and confirm, **then** requests traverse the existing Booking BFF/backend path, pending and success updates are announced, duplicate submission is prevented, and detail opens inside the same shell.
3. **Given** validation or service failure, **when** the action returns, **then** specific feedback is associated with its cause, valid input remains, focus moves to a useful error or summary target, and retry is reachable.
4. **Given** denied or degraded behavior, **when** the step cannot continue, **then** the UI provides a non-color-only explanation and a keyboard-reachable safe path without an inaccessible dead end.
5. **Given** a dialog or overlay occurs, **when** it opens and closes, **then** focus is trapped while open, Escape works when safe, and focus returns to the trigger.
6. **Given** light/dark themes and widths 375, 768, 1024, and 1440, **when** the flow is replayed or its required screens are captured, **then** labels, commands, and lifecycle evidence remain usable without page-level horizontal overflow.

### Relationships and INVEST

Depends on US-003 and provides the real-backend happy path to US-004. It is a focused vertical journey for an existing workflow, valuable and testable through Playwright. Its dependency is explicit rather than hidden, and implementation details remain negotiable beneath the LinerCore contract.

## US-003 — Shared-Package Boundary and Anti-Drift

**Priority:** Must Have  
**Story:** As a frontend developer, I want applicable Booking presentation to consume `@erp/ui` with automated anti-drift checks, so that the reference module demonstrates one maintainable token, primitive, and shell contract.

### Acceptance Criteria

1. **Given** the Booking list/create/detail source, **when** shared-consumption inventory runs, **then** applicable controls, displays, feedback, overlays, and Skeleton states import and render `@erp/ui`.
2. **Given** a correct native semantic element has no appropriate wrapper benefit, **when** it remains, **then** its rationale and focused accessibility test are recorded; no blanket ban replaces native semantics.
3. **Given** canonical `/booking`, **when** DOM landmarks and computed styles are inspected, **then** no duplicate module shell, navigation, theme, or palette is active while existing BFF and form behavior remains intact.
4. **Given** applicable application TS, TSX, or CSS presentation source, **when** a hardcoded color literal or local `CSSProperties` style system is introduced by a non-writing negative probe, **then** lint fails with the expected rule and the worktree returns unchanged.
5. **Given** the owning `packages/ui` implementation, **when** enforcement runs, **then** shared token ownership remains permitted and application code cannot copy that local style system.
6. **Given** the focused changes, **when** lint, typecheck, tests, and production build run, **then** they pass without weakening existing gates or inventing a coverage percentage.

### Relationships and INVEST

Unblocks US-001 and US-002 and is proved live by US-004. The developer value is reduced drift and explicit ownership. The story is testable through inventory, negative probes, regression tests, and builds; the exact refactoring sequence remains negotiable.

## US-004 — Reproducible Live Evidence Matrix

**Priority:** Must Have  
**Story:** As a quality and release reviewer, I want a deterministic live evidence matrix for the canonical Booking journey, so that I can distinguish observed W2-02 completion from source-review or detached-mock claims.

### Acceptance Criteria

1. **Given** the pre-acceptance demo guard is green, **when** acceptance starts, **then** `scripts/wave-a-compose.mjs` operates only the `linercore-wave-a` project and records commit, environment, project, and command metadata.
2. **Given** the running canonical route, **when** Playwright executes the happy path, **then** it authenticates and completes create → validate → price → confirm → detail against the real BFF/backend path.
3. **Given** difficult loading, empty, error/retry, denied, validation, pending, success, and degraded variants, **when** they cannot be produced reliably from live data, **then** documented deterministic request interception or controlled service conditions produce them on the same running route.
4. **Given** every required state, **when** it is checked in both themes and at 375, 768, 1024, and 1440 pixels as applicable, **then** screenshots/assertions cover focus, announcements, contrast, overflow, overlap, and primary-action visibility.
5. **Given** static, focused, build, negative-lint, browser, and live results, **when** evidence is assembled, **then** `artifacts/w2-02-live/` maps each requirement to exact commands and durable results without detached-page substitution.

### Relationships and INVEST

Consumes US-001–US-003 under the protection of US-005 and feeds US-006. It is independently reviewable and reproducible even though it cannot close the epic alone. Its scope is limited to the agreed matrix, making it estimable and testable.

## US-005 — Manager-Demo Safety

**Priority:** Must Have  
**Story:** As the manager-demo owner, I want Wave A acceptance isolated from the protected demo, so that closure verification cannot interrupt the presentation at `http://127.0.0.1:8088`.

### Acceptance Criteria

1. **Given** acceptance has not started, **when** `npm run demo:guard` runs, **then** the protected manager demo is healthy before any Wave A stack action.
2. **Given** acceptance is running, **when** Compose operations are inspected, **then** no command targets, stops, reconfigures, or uses `linercore-shared-platform` as the test project.
3. **Given** all acceptance and cleanup actions have completed, **when** the final demo guard runs, **then** the manager demo remains healthy at port 8088 and both guard results are retained in `artifacts/w2-02-live/`.
4. **Given** either guard fails, **when** closure is evaluated, **then** W2-02 remains acceptance-pending and the failure is preserved rather than waived.

### Relationships and INVEST

This safeguard can be verified independently and gates US-004. It is small, valuable, estimable, and testable; the specific health internals remain owned by the existing guard.

## US-006 — Truthful Audited Closure

**Priority:** Must Have  
**Story:** As a quality and release reviewer, I want both closure audits and program status to reflect the complete live evidence, so that W2-02 closes only on a reproducible PASS and historical W1 waiver truth remains intact.

### Acceptance Criteria

1. **Given** US-001 through US-005 have green evidence, **when** `aidlc-audit` and `erp-fidelity-audit` run against the live package, **then** both complete green with unmasked exit status and retained outputs.
2. **Given** every gate is green, **when** the program backlog is updated, **then** W2-02 is marked closed and cites `artifacts/w2-02-live/`.
3. **Given** any guard, check, Playwright matrix item, build, or audit fails, **when** status is evaluated, **then** W2-02 remains acceptance-pending, failure evidence is retained, and only an in-scope cause may be corrected before rerun.
4. **Given** historical W1 evidence is reviewed, **when** this later live run is recorded, **then** the original W1 blocked/waived record remains unchanged and is never described as a real PASS.
5. **Given** a failed item is corrected, **when** acceptance resumes, **then** the affected proof, final demo guard, and both audits rerun before closure.

### Relationships and INVEST

This terminal story depends on US-001–US-005. It is valuable to release governance, testable from audit and backlog artifacts, and intentionally small because it changes status only after evidence exists. It cannot be released independently, matching the explicit vertical-closure constraint rather than hiding it.

## Epic Definition of Done

The W2-02 Closure Epic is complete only when all six Must stories pass together on the isolated live stack, the durable evidence package is complete, both audits are green, the final demo guard passes, the W1 blocked/waived record remains truthful, and the program backlog cites the evidence path.

## Review

**Verdict: READY**

- Execute is justified by the user-facing brownfield journey, four closure-critical personas, shared-package and shell coordination, and live acceptance complexity.
- The persona set matches the answered plan exactly. Exactly six Must stories form one explicitly non-separable W2-02 Closure Epic.
- Every story states actor value, requirement traceability, explicit dependencies, honest bounded-independence/INVEST notes, and 3–6 testable Given/When/Then criteria.
- The shared-shell and `packages/ui` ownership boundary, UI/accessibility contract, isolated live evidence, protected manager demo, unmasked hard-gate behavior, and unchanged W1 blocked/waived truth are preserved through the epic Definition of Done.

**Mandatory corrections:** None.
