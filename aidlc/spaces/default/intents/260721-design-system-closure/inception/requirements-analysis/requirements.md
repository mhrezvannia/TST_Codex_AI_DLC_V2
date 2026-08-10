# Requirements — W2-02 Design-System Closure

## Intent Analysis

This Standard-depth brownfield enhancement closes the acceptance gap on the existing W2-02 implementation. It does not redesign LinerCore. The required outcome is one canonical authenticated Booking journey whose applicable presentation consumes `@erp/ui`, whose difficult interface states remain observable and accessible, and whose live evidence allows a release reviewer to reproduce the Definition of Done without disturbing the manager demo.

The requirements reconcile six upstream sources: `intent-statement.md` defines the closure outcome and observed Definition of Done; `scope-document.md` fixes the vertical boundary; `business-overview.md` identifies the operator, developer, reviewer, and manager-demo outcomes; `architecture.md` fixes the shell/BFF/service topology; `code-structure.md` identifies the permitted change and evidence surfaces; and `team-practices.md` requires risk-based tests alongside changes plus canonical isolated live proof.

### Classification and completeness

- **Type:** focused enhancement and reference migration closure.
- **Scope:** one cross-layer vertical unit spanning `packages/ui`, applicable Booking presentation, the existing shell seam, enforcement, and live evidence.
- **Complexity:** Standard; the business workflow exists, but package adoption, shell reconciliation, deterministic state proof, and durable evidence cross several components.
- **Functional coverage:** shared-shell routing, package consumption, list/create/detail, create-to-confirm, state handling, themes, and evidence.
- **Non-functional coverage:** accessibility, responsiveness, security preservation, maintainability, reliability, reproducibility, and build quality.
- **Business coverage:** Booking operator usability, frontend reuse, auditable release decision, and manager-demo continuity.
- **Technical coverage:** existing nginx → shell → Booking BFF → Booking service path, shared workspace package, isolated Compose wrapper, and Playwright.

## Functional Requirements

All requirements below are **Must** priority because W2-02 remains acceptance-pending if any one is unmet.

| ID | Requirement | Source | Observable verification |
|---|---|---|---|
| FR-001 | The system shall serve the user-facing `/booking` list, create, and detail journey inside the existing authenticated `apps/shell` shell, without adding or replacing the W2-01 shell, navigation, frontend, or theme. | intent-statement.md; architecture.md; Q1 | Authenticated Playwright route inspection shows one shell and one navigation model on list, create, and detail. |
| FR-002 | Applicable Booking interactive controls, data displays, feedback, overlays, and loading surfaces shall import and render `@erp/ui` tokens or primitives. Correct native semantic elements may remain only when named, justified, and covered by a focused test. | intent-statement.md; scope-document.md; Q1/Q3 | Import/usage inventory, focused tests, and live DOM inspection show shared consumption; an exception register has no unexplained entry. |
| FR-003 | Duplicate Booking-local chrome, navigation, palette, typography, and theme behavior shall be removed or bypassed on the canonical route while preserving Booking BFF, form mapping, authentication metadata, and backend workflow behavior. | architecture.md; code-structure.md; Q1 | Canonical route has no duplicate landmarks/theme system; existing BFF/service contract tests remain green. |
| FR-004 | The Booking list shall provide observable loading Skeleton, populated, empty, error/retry, denied, and degraded presentations without losing access to the shared shell. | intent-statement.md; Q2 | Playwright captures each state on the running canonical route, using live data or a documented controlled condition. |
| FR-005 | The Booking create flow shall preserve entered data across validation, pricing, or confirmation failures; expose validation, pending, success, error, denied, and degraded feedback; and return focus to a useful target after each transition. | intent-statement.md; business-overview.md | Keyboard-only Playwright assertions inspect field persistence, feedback announcement, busy state, and post-transition focus. |
| FR-006 | The authenticated happy path shall complete create → validate → price → confirm → detail through the real Booking BFF/backend/reference/pricing path; a detached mock frontend shall not satisfy acceptance. | business-overview.md; architecture.md; team-practices.md; Q2 | Network trace and durable Playwright result identify the canonical edge route and successful backend lifecycle transitions. |
| FR-007 | The canonical Booking surfaces shall operate in the shared light and dark themes without introducing a module-local theme switch, palette, or default. | intent-statement.md; scope-document.md | Theme screenshots and computed-style/contrast checks pass on the running route. |
| FR-008 | Automated anti-drift checks shall reject hardcoded application color literals and local `CSSProperties`-based style systems across applicable `apps/**` TS, TSX, and CSS presentation sources, while excluding the owning `packages/ui` token implementation and documented semantic-native exceptions. | architecture.md; scope-document.md; Q3 | Positive lint passes; non-writing negative probes for a color literal and local style system fail with the expected rule and leave the worktree unchanged. |
| FR-009 | Acceptance shall be orchestrated only through `scripts/wave-a-compose.mjs` against Compose project `linercore-wave-a`; it shall run `npm run demo:guard` before and after and shall never target or reconfigure `linercore-shared-platform`. | intent-statement.md; scope-document.md; team-practices.md | Evidence records project names, wrapper commands, pre/post guard results, and an unchanged manager-demo endpoint at `http://127.0.0.1:8088`. |
| FR-010 | The run shall write a durable `artifacts/w2-02-live/` package containing environment metadata, commands, screenshots, Playwright results, responsive/theme/state coverage, lint rejection, relevant static/build checks, and demo-guard results. | intent-statement.md; scope-document.md | Evidence manifest resolves every required file and links each artifact to a requirement and run timestamp. |
| FR-011 | Closure shall run `aidlc-audit` and `erp-fidelity-audit` against the live evidence and shall update W2-02 to closed in `docs/intents/00-INTENT-BACKLOG.md` only after every requirement and audit is green. | intent-statement.md; team-practices.md; Q4 | Both audit outputs are green and the backlog closure entry cites `artifacts/w2-02-live/`; otherwise status stays acceptance-pending. |
| FR-012 | Any failed gate shall preserve its failure evidence, receive only an in-scope correction, and rerun the affected proof followed by the final demo guard and both audits; partial success and the historical W1 waiver shall never be reported as PASS. | intent-statement.md; scope-document.md; Q4 | Failure/retry records retain the original result; final report distinguishes W2-02 live proof from the immutable W1 blocked/waived record. |

## Non-Functional Requirements

| ID | Quality attribute | Requirement and measurable gate | Source |
|---|---|---|---|
| NFR-001 | Accessibility | All canonical Booking actions shall be keyboard reachable in logical order; focus shall be visibly indicated and restored after overlays/transitions; fields shall have programmatic labels; status/error updates shall be announced; state shall not rely on color alone; reduced-motion behavior shall be respected. The evidence matrix must pass WCAG 2.1 AA-oriented automated checks and the named manual assertions with zero critical or serious accessibility violations. | intent-statement.md; MASTER.md; SESSION-PROMPT.md |
| NFR-002 | Responsive usability | At viewport widths 375, 768, 1024, and 1440 CSS pixels, each required route/state shall retain its primary action, readable content, and coherent shell with no page-level horizontal overflow, clipped control, or overlapping interactive target. | intent-statement.md; MASTER.md |
| NFR-003 | Theme contrast | Required routes and states shall be captured in both shared themes; project contrast tests and live accessibility checks shall pass with no dark-default or Booking-local palette introduced. | intent-statement.md; MASTER.md |
| NFR-004 | Reliability | Failed validation, pricing, confirmation, or controlled network operations shall surface recoverable feedback, preserve operator input where retry is valid, avoid duplicate submission, and leave a reachable retry or navigation path. | intent-statement.md; business-overview.md |
| NFR-005 | Security preservation | The change shall preserve the existing authenticated shell, authorization/denied behavior, Booking BFF subject/correlation/idempotency/request-limit/timeout protections, and same-origin canonical path. No new auth bypass, detached acceptance host, or backend contract is permitted. | architecture.md; business-overview.md |
| NFR-006 | Maintainability | Presentation tokens and reusable primitives shall have one owning implementation in `packages/ui`; application code shall consume that boundary, and every approved native-semantic exception shall state rationale and test reference. | architecture.md; code-structure.md; Q3 |
| NFR-007 | Build quality | Relevant focused tests plus workspace lint, typecheck, tests, and production build shall pass without weakening existing gates. No percentage coverage claim is introduced; changed behavior must have direct regression coverage. | scope-document.md; team-practices.md |
| NFR-008 | Reproducibility | A reviewer following the evidence manifest on the documented isolated stack shall be able to identify the exact commit, Compose project, route, test command, viewport, theme, state-generation method, and result for every gate. | intent-statement.md; Q2/Q4 |
| NFR-009 | Performance and scale preservation | This closure introduces no new throughput or concurrency target. The canonical live journey must complete within the repository's existing BFF timeout and request-size controls, show a shared busy/Skeleton state during asynchronous work, and exhibit no acceptance-run timeout or unhandled browser error. | architecture.md; scope-document.md |

## User and System Scenarios

### Happy path

Given the manager demo guard is green and the isolated Wave A stack is running, when an authenticated Booking operator uses only the keyboard to open the canonical Booking list, create a booking, validate it, obtain pricing, confirm it, and open detail, then the journey remains inside one shell, renders applicable `@erp/ui` primitives, announces transitions, keeps visible focus, and completes through the real backend path.

### Failure and recovery path

Given the running canonical route and a documented controlled validation, authorization, pricing, confirmation, or network failure, when the operator reaches the affected step, then the UI exposes the matching error, denied, pending, or degraded state; preserves valid input; prevents duplicate action; announces the outcome; and offers a keyboard-reachable recovery path.

### Responsive and theme path

Given each required route/state, when Playwright visits it at 375, 768, 1024, and 1440 pixels in both shared themes, then the shell remains coherent, primary actions remain reachable, and the page has no clipped controls, overlap, page-level horizontal overflow, or project contrast failure.

### Acceptance failure path

Given any static, live, guard, Playwright, build, or audit gate fails, when the acceptance run is evaluated, then W2-02 remains acceptance-pending, the failure artifact is retained, the historical W1 blocked/waived evidence remains unchanged, and no backlog closure is written.

## Constraints

- Preserve git baseline `c2f13dd`, based on `c96b5b3`; do not reset, replace, or reclassify it.
- Preserve merged W0-01, W0-02, W1-01, W2-01, and existing W2-02 behavior except for the smallest traced W2-02 compatibility correction.
- W2-02 exclusively owns `packages/ui`, shared tokens/primitives, the Booking reference migration, and the design-system master.
- Use one existing authenticated shell and navigation; no second frontend, module-local theme, or independent navigation.
- Use only `scripts/wave-a-compose.mjs` and `linercore-wave-a` for live verification.
- Never stop, reconfigure, or target the manager-demo `linercore-shared-platform` project.
- Retain existing Booking domain vocabulary and producer/consumer contracts.
- Treat ui-ux-pro-max output as advisory beneath the active intent, enterprise standards, and LinerCore master.

## Assumptions

| ID | Assumption | Rationale | Validation owner and point |
|---|---|---|---|
| A-001 | Existing Booking APIs and lifecycle transitions are sufficient for create-to-confirm proof. | Reverse engineering found the full BFF/service path; backend redesign is out of scope. | Developer verifies focused contract tests before live acceptance. |
| A-002 | Existing `@erp/ui` primitives, including Skeleton, cover most migration needs. | Reverse engineering found exports already present. | Developer records any genuinely missing primitive before adding the smallest reusable implementation. |
| A-003 | Rare UI states can be produced with deterministic interception or controlled service conditions without detaching from the running route. | User selected Q2 option A. | Quality reviewer documents the mechanism and inspects the canonical URL/network trace. |
| A-004 | Existing performance and scale expectations remain unchanged. | No source supplies a new numeric target and this intent changes presentation, not service capacity. | Acceptance records BFF/browser timeouts and any observed regression rather than inventing a target. |

## Out of Scope

- Greenfield redesign, rebranding, marketing/hero patterns, remote fonts, alternate palette, or dark-default conversion.
- A new frontend, shell, navigation model, local component library, or module-local theme.
- Broad migration of Charge Agreements, Reference Data, Container Movement, Auth, Shell, or later-wave modules.
- Backend business rules, APIs, messaging contracts, persistence, cloud infrastructure, production deployment, or formal compliance certification.
- Advanced data-grid virtualization, saved views, or generic component expansion not required by the Booking closure.
- Rewriting historical W1 blocked/waived proof as a pass.

## Traceability and Open Questions

The next stages shall trace every story, design element, implementation unit, test, and evidence item to the requirement IDs above. `FR-001` through `FR-012` and `NFR-001` through `NFR-009` form one acceptance boundary; none may independently close W2-02.

There are no unresolved requirements-analysis questions. The four decisions are recorded in `requirements-analysis-questions.md`; later discovery may refine implementation detail but may not relax a named gate without explicit user change approval.

## Review

**Verdict: READY**

- Completeness: functional and non-functional requirements, user and failure scenarios, business context, technical constraints, and quality attributes cover all six required dimensions.
- Testability and traceability: every numbered requirement has an observable gate and named source; the artifact explicitly reconciles all six consumed upstream artifacts and the four answered decisions.
- Scope and ownership: the requirements preserve the existing baseline and prior work, constrain changes to the W2-02 closure boundary, retain the existing authenticated shell, and keep `packages/ui`, shared tokens/primitives, Booking reference migration, and the design-system master under W2-02 ownership.
- Acceptance integrity: the isolated `linercore-wave-a` route, wrapper-only Compose operation, pre/post demo guards, durable Playwright evidence, production/static gates, and both closure audits are mandatory; partial or failed evidence cannot close the intent.
- Historical truth: the W1 blocked/waived record is explicitly immutable and is never represented as a PASS.
- Targets: no unsupported throughput, concurrency, coverage-percentage, compliance, or deployment target is invented; performance is correctly framed as preservation under existing controls.

Mandatory corrections: none.
